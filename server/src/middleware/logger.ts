import type { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
	const start = performance.now();

	// todo log to a file, use logger lib
	res.on('finish', () => {
		const ms = (performance.now() - start).toFixed(1);
		console.log(
			`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`,
		);
	});

	next();
}
