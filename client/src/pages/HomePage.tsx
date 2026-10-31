import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createShortenURL } from '../api';

export function HomePage() {
	const navigate = useNavigate();
	const [longURL, setLongURL] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const shortenURL = await createShortenURL(longURL);
			void navigate('/result', { state: { shortenURL } });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div>
			<h1>Paste the URL to be Shortened</h1>
			<form className="row" onSubmit={handleSubmit}>
				<input
					type="url"
					required
					placeholder="https://example.com/a/very/long/link"
					value={longURL}
					onChange={(e) => setLongURL(e.target.value)}
				/>
				<button disabled={loading}>
					{loading ? 'Shortening…' : 'Shorten URL'}
				</button>
			</form>
			{error && <p className="error">{error}</p>}
		</div>
	);
}
