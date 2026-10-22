import type { Server } from 'node:http';
import request from 'supertest';
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from 'vitest';
import { app } from '../src/app.js';
import { config } from '../src/config.js';
import { initSchema, pool } from '../src/db/index.js';
import { redis } from '../src/db/redis.js';
import { codeFrom, listen } from './helpers.js';

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
afterEach(async () => {
	// the "Redis down" test closes the client; reopen it for the next test
	if (!redis.isOpen) await redis.connect();
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

// The miss path SETs the cache fire-and-forget, so the key may land just
// after the redirect returns: wait for it instead of reading it right away.
async function waitForCached(code: string, longURL: string): Promise<void> {
	await expect.poll(() => redis.get(`url:${code}`)).toBe(longURL);
}

describe('redirect cache', () => {
	it('a miss caches code → longURL with a TTL', async () => {
		const code = await shorten('https://example.com/a');

		await request(server).get(`/${code}`).expect(302);

		await waitForCached(code, 'https://example.com/a');
		const ttl = await redis.ttl(`url:${code}`);
		expect(ttl).toBeGreaterThan(0);
		expect(ttl).toBeLessThanOrEqual(config.defaultTTL);
	});

	it('a hit is served from Redis without reading Postgres', async () => {
		const code = await shorten('https://example.com/b');
		await request(server).get(`/${code}`).expect(302);
		await waitForCached(code, 'https://example.com/b');

		// the row is gone, so only the cache can answer
		await pool.query('TRUNCATE urls');

		const res = await request(server).get(`/${code}`);
		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('https://example.com/b');
	});

	it('hits still count clicks', async () => {
		const code = await shorten('https://example.com/c');
		await request(server).get(`/${code}`).expect(302); // miss
		await waitForCached(code, 'https://example.com/c');

		await request(server).get(`/${code}`).expect(302); // hit
		await request(server).get(`/${code}`).expect(302); // hit

		// hits count clicks fire-and-forget: retry until the count settles
		await expect
			.poll(async () => {
				const stat = await request(server).get(`/api/v1/${code}/stat`);
				return stat.body.clicks;
			})
			.toBe(3);
	});

	it('an unknown code is not cached', async () => {
		await request(server).get('/zzzzzz').expect(404);

		expect(await redis.exists('url:zzzzzz')).toBe(0);
	});

	it('Redis down: redirect falls back to Postgres', async () => {
		const code = await shorten('https://example.com/d');
		await redis.close();

		const res = await request(server).get(`/${code}`);
		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('https://example.com/d');
	});
});

describe('GET /health', () => {
	it('200 ok when Postgres and Redis are up', async () => {
		const res = await request(server).get('/health').expect(200);
		expect(res.body).toEqual({ status: 'ok', db: 'ok', redis: 'ok' });
	});

	it('200 degraded when Redis is down (redirects still work)', async () => {
		await redis.close();

		const res = await request(server).get('/health').expect(200);
		expect(res.body).toEqual({
			status: 'degraded',
			db: 'ok',
			redis: 'down',
		});
	});
});
