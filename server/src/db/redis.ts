import { createClient } from 'redis';
import { config } from '../config.js';

export const redis = createClient({
	url: config.redisUrl,
	disableOfflineQueue: true,
});
redis.on('error', (err) => {
	console.error('redis error', err);
});
