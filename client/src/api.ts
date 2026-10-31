export async function createShortenURL(longURL: string): Promise<string> {
	// fetch
	const res = await fetch('/api/v1/shorten', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ longURL }),
	});

	//check res and send back
	const data = await res.json();
	if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
	return data.shortenURL;
}

export type URLStats = { longURL: string; clicks: number };

export async function getURLStats(code: string): Promise<URLStats> {
	const res = await fetch(`/api/v1/${encodeURIComponent(code)}/stat`);

	const data = await res.json();
	if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
	return { longURL: data.longURL, clicks: data.clicks };
}
