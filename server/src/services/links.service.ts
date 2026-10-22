import { generateCode } from '../utils/base62.js';
import { config } from '../config.js';
import { pool } from '../db/index.js';
import { isUniqueViolation } from '../db/error.js';
import { redis } from '../db/redis.js';

interface UrlStatRow {
	long_url: string;
	clicks: number;
}

export async function getLinkStats(
	code: string,
): Promise<{ longURL: string; clicks: number } | null> {
	const result = await pool.query<UrlStatRow>(
		'SELECT long_url, clicks FROM urls WHERE code = $1',
		[code],
	);

	const row = result.rows[0];
	if (row === undefined) return null;

	return { longURL: row.long_url, clicks: row.clicks };
}

/**
 * Create shortenURL code and update db/ redis
 * @param longURL
 * @returns
 */
export async function createLink(longURL: string): Promise<string> {
	const maxTries = 5;
	for (let i = 0; i < maxTries; i++) {
		try {
			const code = generateCode(config.codeLength);
			await pool.query(
				'INSERT INTO urls (code, long_url) VALUES ($1, $2)',
				[code, longURL],
			);
			return code;
		} catch (err) {
			if (isUniqueViolation(err)) continue;
			throw err;
		}
	}

	throw new Error(`Failed to generate unique code after ${maxTries} tries`);
}

/**
 * return longURL, and increment click stat by 1
 */
export async function resolveLink(code: string): Promise<string | null> {
	// see if cache hit
	const key = 'url:' + code;
	let cached: string | null = null;
	if (config.cacheEnabled) {
		try {
			cached = await redis.get(key);
		} catch (err) {
			console.error(`redis GET ${key} failed, falling back to DB`, err);
		}
	}
	if (cached !== null) {
		void pool
			.query('UPDATE urls SET clicks = clicks + 1 WHERE code = $1', [
				code,
			])
			.catch((err) =>
				console.error(`click count for ${code} not recorded`, err),
			);
		return cached;
	}
	// cache miss
	const results = await pool.query<{ long_url: string }>(
		'UPDATE urls SET clicks = clicks + 1 WHERE code = $1 RETURNING long_url',
		[code],
	);

	const longUrl = results.rows[0]?.long_url;
	if (longUrl === undefined) {
		return null;
	}
	if (config.cacheEnabled) {
		void redis
			.set(key, longUrl, { EX: config.defaultTTL })
			.catch((err) => console.error(`redis SET ${key} failed`, err));
	}
	return longUrl;
}
