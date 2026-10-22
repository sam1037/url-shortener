import { app } from './app.js';
import { config } from './config.js';
import { checkDb, initSchema } from './db/index.js';
import { redis } from './db/redis.js';

await checkDb();
await initSchema();
// Redis is only a cache: don't block startup on it. The client keeps
// reconnecting in the background, and resolveLink falls back to Postgres.
redis
	.connect()
	.catch((err) =>
		console.error('redis connect failed, using Postgres only', err),
	);

app.listen(config.port, () => {
	console.log(`Example app listening on port ${config.port}`);
});
