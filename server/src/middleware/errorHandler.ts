import type {Request, Response, NextFunction } from "express"

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    // todo log to a file, use logger lib
    res.status(500).json({ error: err.message });
}