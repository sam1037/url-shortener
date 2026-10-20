import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { listen } from './helpers.js';

// The limiters read config once at import time, so set the env var first and
// import the app dynamically (a static import would be hoisted above this).
// Vitest isolates modules per file, so other files keep the high limits.
const MAX = 5;
process.env.SHORTEN_RATE_LIMIT_MAX = String(MAX);
const { app } = await import('../src/app.js');
const { initSchema, pool } = await import('../src/db/index.js');

let server: Server;

beforeAll(async () => {
	await initSchema();
	await pool.query('TRUNCATE urls');
	server = await listen(app);
});
afterAll(async () => {
	server.close();
	await pool.end();
});

describe('shorten rate limit', () => {
	it(`lets exactly ${MAX} parallel creates through, then 429 with JSON + RateLimit header`, async () => {
		const results = await Promise.all(
			Array.from({ length: MAX * 2 }, () =>
				request(server)
					.post('/api/v1/shorten')
					.send({ longURL: 'https://example.com' }),
			),
		);

		const ok = results.filter((r) => r.status === 201);
		const limited = results.filter((r) => r.status === 429);
		expect(ok).toHaveLength(MAX);
		expect(limited).toHaveLength(MAX);
		expect(limited[0]?.body).toHaveProperty('error');
		expect(limited[0]?.headers).toHaveProperty('ratelimit');
	});

	it('only limits /api/v1/shorten, not other routes', async () => {
		await request(server).get('/health').expect(200);
	});
});
