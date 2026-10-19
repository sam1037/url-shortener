import { generateCode } from "../utils/base62.js"
import { config } from "../config.js";
import { pool } from "../db/index.js";
import { isUniqueViolation } from "../db/error.js";

interface UrlStatRow {
  long_url: string;
  clicks: number;
}

// todo later add interface for stat?
export async function getLinkStats(code: string): Promise<{ longURL: string; clicks: number } | null> {
    const result = await pool.query<UrlStatRow>(
      'SELECT long_url, clicks FROM urls WHERE code = $1',
      [code]
    );

    const row = result.rows[0];
	if (row === undefined) return null;

    return {longURL: row.long_url, clicks: row.clicks};
}


/**
 * Create shortenURL code and update db/ redis
 * @param longURL 
 * @returns 
 */
export async function createLink(longURL: string): Promise<string> {
    const maxTries = 5
	for (let i = 0; i < maxTries; i++) {
		try {
			const code = generateCode(config.codeLength);
			await pool.query(
				'INSERT INTO urls (code, long_url) VALUES ($1, $2)',
				[code, longURL]
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
// TODO use redis
export async function resolveLink(code: string): Promise<string | null> {
    const results = await pool.query<{long_url: string}>(
		'UPDATE urls SET clicks = clicks + 1 WHERE code = $1 RETURNING long_url',
		[code]
	);

	const longUrl = results.rows[0]?.long_url;
	if (longUrl === undefined) {
		return null;
	}
    return longUrl;
}