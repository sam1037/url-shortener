import { Link, Route, Routes } from 'react-router';
import { HomePage } from './pages/HomePage';
import { ResultPage } from './pages/Result';
import { StatsPage } from './pages/StatsPage';

function App() {
	return (
		<main className="card">
			<p className="brand">
				<Link to="/">URL Shortener</Link>
			</p>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/result" element={<ResultPage />} />
				<Route path="/:code/stat" element={<StatsPage />} />
			</Routes>
		</main>
	);
}

export default App;
