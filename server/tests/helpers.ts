import type { Express } from 'express';
import type { Server } from 'node:http';

// One real server per file. Without it, supertest starts a new server per
// request, which is wasteful for 100+ parallel requests.
export function listen(app: Express): Promise<Server> {
	return new Promise((resolve) => {
		const server = app.listen(0, () => resolve(server));
	});
}

export function codeFrom(shortenURL: string): string {
	if (!URL.canParse(shortenURL)) {
		throw new Error(
			`shortenURL is not a URL: ${JSON.stringify(shortenURL)}`,
		);
	}
	return new URL(shortenURL).pathname.slice(1);
}
