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

	if (error) return <p className="error">{error}</p>;
	if (urlStats === null) return <p className="muted">Loading…</p>;
	return (
		<div>
			<h1>Total clicks</h1>
			<p className="big-number">{urlStats.clicks}</p>
			<p className="muted">
				<a href={urlStats.longURL}>{urlStats.longURL}</a>
			</p>
			<nav className="links">
				<Link to="/">Shorten another</Link>
			</nav>
		</div>
	);
}
