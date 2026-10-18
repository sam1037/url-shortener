import type {Request, Response, NextFunction } from "express"

interface HttpError { status: number }

function hasStatus(err: unknown): err is HttpError {
  return typeof err === "object" && err !== null && "status" in err
      && typeof (err as HttpError).status === "number";
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const status = hasStatus(err) && err.status >= 400 && err.status < 600 ? err.status : 500;
    const message = status < 500 ? "Bad request" : "Internal server error";

    res.status(status).json({ error: message});
}