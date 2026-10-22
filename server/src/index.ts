import { app } from './app.js';
import { config } from './config.js';
import { checkDb, initSchema } from './db/index.js';
import { redis } from './db/redis.js';

await checkDb();
await initSchema();
await redis.connect();

app.listen(config.port, () => {
	console.log(`Example app listening on port ${config.port}`);
});
