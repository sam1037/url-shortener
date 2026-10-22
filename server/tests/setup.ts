import dotenv from 'dotenv';

// Runs before each test file, before src/config.ts is imported.
// No override, so env vars set by CI win over .env.test.
dotenv.config({ path: '.env.test', quiet: true });

// Tests TRUNCATE tables: refuse to run against a non-test DB.
const dbName = new URL(process.env.DATABASE_URL ?? 'postgres://x/none')
	.pathname;
if (!dbName.endsWith('_test')) {
	throw new Error(
		`Refusing to run tests: DATABASE_URL points at "${dbName}", expected a *_test DB`,
	);
}

// Tests FLUSHDB: refuse to run against the dev cache in db 0.
const redisDb = new URL(process.env.REDIS_URL ?? 'redis://x').pathname;
if (redisDb === '' || redisDb === '/' || redisDb === '/0') {
	throw new Error(
		`Refusing to run tests: REDIS_URL uses db 0, expected a separate db like /1`,
	);
}
