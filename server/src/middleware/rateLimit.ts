import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const generalLimiter = rateLimit({
	windowMs: config.rateLimitWindowMs,
	limit: config.rateLimitMax,
	standardHeaders: 'draft-8', // RateLimit-* headers
	legacyHeaders: false, // drop X-RateLimit-*
	message: { error: 'Too many requests, try again later.' },
});

export const shortenLinkLimiter = rateLimit({
	windowMs: config.shortenRateLimitWindowMs,
	limit: config.shortenRateLimitMax,
	standardHeaders: 'draft-8', // RateLimit-* headers
	legacyHeaders: false, // drop X-RateLimit-*
	message: { error: 'Too many requests, try again later.' },
});
