import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
	const val = process.env[key];
	if (val === undefined || val === '') {
		throw new Error(`Missing env var: ${key}`);
	}
	return val;
}

// todo handle parseint nan
export const config: Config = {
	port: parseInt(requireEnv('PORT')),
	baseUrl: requireEnv('PUBLIC_BASE_URL'),
	codeLength: parseInt(requireEnv('CODE_LENGTH')),
	databaseUrl: requireEnv('DATABASE_URL'),
	redisUrl: requireEnv('REDIS_URL'),
	defaultTTL: parseInt(requireEnv('DEFAULT_TTL')), // seconds
	// optional, on unless set to "false"; off lets benchmarks compare against Postgres only
	cacheEnabled: process.env.CACHE_ENABLED !== 'false',
	rateLimitWindowMs: parseInt(requireEnv('RATE_LIMIT_WINDOW_MS')),
	rateLimitMax: parseInt(requireEnv('RATE_LIMIT_MAX')),
	shortenRateLimitWindowMs: parseInt(
		requireEnv('SHORTEN_RATE_LIMIT_WINDOW_MS'),
	),
	shortenRateLimitMax: parseInt(requireEnv('SHORTEN_RATE_LIMIT_MAX')),
};

export interface Config {
	port: number;
	baseUrl: string;
	codeLength: number;
	databaseUrl: string;
	redisUrl: string;
	defaultTTL: number;
	cacheEnabled: boolean;
	rateLimitWindowMs: number;
	rateLimitMax: number;
	shortenRateLimitWindowMs: number;
	shortenRateLimitMax: number;
}
