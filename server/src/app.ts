import express, { type Express, type Request, type Response } from 'express';
import { linksRouter } from './routes/links.route.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, shortenLinkLimiter } from './middleware/rateLimit.js';
import { checkDb } from './db/index.js';
import { redis } from './db/redis.js';

export const app: Express = express();

app.use(logger);
app.use(generalLimiter);
app.use('/api/v1/shorten', shortenLinkLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
	res.send('Hello World!');
});

// Postgres down → 503 (can't serve anything). Redis down → 200 "degraded"
// (redirects still work from Postgres, just slower).
app.get('/health', async (_req: Request, res: Response) => {
	let db = true;
	try {
		await checkDb();
	} catch {
		db = false;
	}
	const cache = redis.isReady;

	res.status(db ? 200 : 503).json({
		status: !db ? 'down' : cache ? 'ok' : 'degraded',
		db: db ? 'ok' : 'down',
		redis: cache ? 'ok' : 'down',
	});
});

app.post('/echo', (req, res) => {
	if (!req.body || Object.keys(req.body).length === 0) {
		return res.status(400).json({
			error: 'Bad Request',
			message: 'Request body cannot be empty',
		});
	}
	res.status(200).json(req.body);
});

app.use(linksRouter);
app.use(errorHandler);
