import { Route, Routes } from 'react-router';
import { HomePage } from './pages/HomePage';
import { ResultPage } from './pages/Result';
import { StatsPage } from './pages/StatsPage';

function App() {
	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route path="/result" element={<ResultPage />} />
			<Route path="/:code/stat" element={<StatsPage />} />
		</Routes>
	);
}

export default App;
