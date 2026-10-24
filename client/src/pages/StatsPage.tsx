import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getURLStats, type URLStats } from '../api';

export function StatsPage() {
	const { code } = useParams();
	const [urlStats, setUrlStats] = useState<URLStats | null>(null);
	const [error, setError] = useState<string | null>(null);

	// fetch stats from api.ts with useEffect
	useEffect(() => {
		if (!code) return;
		let ignore = false;
		async function load(code: string) {
			try {
				const u = await getURLStats(code);
				if (!ignore) setUrlStats(u);
			} catch (err) {
				if (!ignore) {
					setError(
						err instanceof Error ? err.message : 'Unknown error',
					);
				}
			}
		}
		void load(code);
		return () => {
			ignore = true;
		};
	}, [code]);

	if (error) return <p>{error}</p>;
	if (urlStats === null) return <p>Loading…</p>;
	return (
		<div>
			<h1>Total URL Clicks</h1>
			<a href={urlStats.longURL}>{code}</a>
			<p>{`${urlStats.clicks}`}</p>
			<p>
				<Link to="/">Shorten another</Link>
			</p>
		</div>
	);
}
