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

async function shorten(longURL: string): Promise<string> {
	const res = await request(server)
		.post('/api/v1/shorten')
		.send({ longURL })
		.expect(201);
	return codeFrom(res.body.shortenURL);
}

describe('POST /api/v1/shorten', () => {
	it('201 with a shortenURL under PUBLIC_BASE_URL', async () => {
		const res = await request(server)
			.post('/api/v1/shorten')
			.send({ longURL: 'https://example.com/a' });

		expect(res.status).toBe(201);
		expect(res.body.shortenURL).toMatch(
			new RegExp(`^${config.baseUrl}/[0-9A-Za-z]{${config.codeLength}}$`),
		);
	});

	it.each([
		['missing body', undefined],
		['missing longURL', {}],
		['non-string longURL', { longURL: 123 }],
		['not a URL', { longURL: 'not a url' }],
		['non-http scheme', { longURL: 'ftp://example.com' }],
	])('400 on %s', async (_name, body) => {
		const res = await request(server).post('/api/v1/shorten').send(body);

		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('error');
	});
});

describe('GET /:code', () => {
	it('302 to the long URL with no-cache headers', async () => {
		const code = await shorten('https://example.com/b');

		const res = await request(server).get(`/${code}`);

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('https://example.com/b');
		expect(res.headers['cache-control']).toContain('no-store');
	});

	it('404 on unknown code', async () => {
		await request(server).get('/zzzzzz').expect(404);
	});
});

describe('GET /api/v1/:code/stat', () => {
	it('starts at 0 clicks and counts each redirect', async () => {
		const code = await shorten('https://example.com/c');

		const res = await request(server).get(`/api/v1/${code}/stat`);
		expect(res.body).toEqual({
			longURL: 'https://example.com/c',
			clicks: 0,
		});

		await request(server).get(`/${code}`);
		await request(server).get(`/${code}`);

		// the 2nd redirect may be a cache hit, which counts its click
		// fire-and-forget: retry until the count settles
		await expect
			.poll(async () => {
				const stat = await request(server).get(`/api/v1/${code}/stat`);
				return stat.body.clicks;
			})
			.toBe(2);
	});

	it('404 on unknown code', async () => {
		await request(server).get('/api/v1/zzzzzz/stat').expect(404);
	});
});
