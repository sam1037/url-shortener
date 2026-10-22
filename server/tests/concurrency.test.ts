import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { config } from '../src/config.js';
import { initSchema, pool } from '../src/db/index.js';
import { codeFrom, listen } from './helpers.js';
import { redis } from '../src/db/redis.js';

let server: Server;

beforeAll(async () => {
	await initSchema();
	await redis.connect();
	server = await listen(app);
});
beforeEach(async () => {
	await pool.query('TRUNCATE urls');
	await redis.flushDb();
});
afterAll(async () => {
	server.close();
	await redis.close();
	await pool.end();
});

function shortenMany(n: number) {
	return Promise.all(
		Array.from({ length: n }, (_, i) =>
			request(server)
				.post('/api/v1/shorten')
				.send({ longURL: `https://example.com/${i}` }),
		),
	);
}

describe('concurrent creates', () => {
	it('N parallel creates all succeed, with unique codes that each resolve to their own URL', async () => {
		const N = 100;
		const results = await shortenMany(N);

		expect(results.map((r) => r.status)).toEqual(Array(N).fill(201));
		const codes = results.map((r) => codeFrom(r.body.shortenURL));
		expect(new Set(codes).size).toBe(N);

		const redirects = await Promise.all(
			codes.map((c) => request(server).get(`/${c}`)),
		);
		redirects.forEach((r, i) => {
			expect(r.headers.location).toBe(`https://example.com/${i}`);
		});
	});

	// With 6-char codes (56.8B) collisions basically never happen, so the test
	// above passes even if retry is broken. 2-char codes (3844) make ~5
	// collisions in 200 creates (birthday paradox), forcing the retry path.
	it('retries on code collision (CODE_LENGTH=2)', async () => {
		const original = config.codeLength;
		config.codeLength = 2;
		try {
			const N = 200;
			const results = await shortenMany(N);

			expect(results.map((r) => r.status)).toEqual(Array(N).fill(201));
			const { rows } = await pool.query<{ n: number }>(
				'SELECT count(DISTINCT code)::int AS n FROM urls',
			);
			expect(rows[0]?.n).toBe(N);
		} finally {
			config.codeLength = original;
		}
	});
});

describe('concurrent redirects', () => {
	// Large N so requests overlap: a read-then-write bug would lose clicks
	// here, while N = 2 would usually pass by luck.
	it('N parallel redirects count every click (no lost updates)', async () => {
		const N = 100;
		const created = await request(server)
			.post('/api/v1/shorten')
			.send({ longURL: 'https://example.com/hot' })
			.expect(201);
		const code = codeFrom(created.body.shortenURL);

		await Promise.all(
			Array.from({ length: N }, () =>
				request(server).get(`/${code}`).expect(302),
			),
		);

		// cache hits count clicks fire-and-forget, so the last UPDATEs may
		// land after the redirects return: retry until the count settles
		await expect
			.poll(
				async () => {
					const stat = await request(server).get(
						`/api/v1/${code}/stat`,
					);
					return stat.body.clicks;
				},
				{ timeout: 5000 },
			)
			.toBe(N);
	});
});
