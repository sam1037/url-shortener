import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	if (command === 'serve' && !env.SERVER_BASE_URL) {
		throw new Error('Missing env var: SERVER_BASE_URL');
	}
	return {
		plugins: [react()],
		server: {
			proxy: {
				'/api': env.SERVER_BASE_URL,
			},
		},
	};
});
