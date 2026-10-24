import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';

export function ResultPage() {
	// router state is typed `any`; it's also null after a refresh or direct visit
	const state = useLocation().state as { shortenURL?: string } | null;
	const [copied, setCopied] = useState(false);

	if (!state?.shortenURL) return <Navigate to="/" replace />;
	const { shortenURL } = state;
	const code = new URL(shortenURL).pathname.slice(1); //temp solution

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(shortenURL);
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		} catch (e) {
			console.error('Copy failed', e);
		}
	}

	return (
		<div>
			<h1>Your shortened URL</h1>
			<a href={shortenURL}>{shortenURL}</a>
			<button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
			<p>
				<Link to="/">Shorten another</Link>
			</p>
			<p>
				<Link to={`/${code}/stat`}>View number of clicks</Link>
			</p>
		</div>
	);
}
