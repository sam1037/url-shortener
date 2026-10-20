import express, { type Express, type Request, type Response } from 'express';
import { linksRouter } from './routes/links.route.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter, shortenLinkLimiter } from './middleware/rateLimit.js';

export const app: Express = express();

app.use(logger);
app.use(generalLimiter);
app.use('/api/v1/shorten', shortenLinkLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
	res.send('Hello World!');
});

app.get('/health', (_req: Request, res: Response) => {
	res.json({
		status: 'ok',
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
