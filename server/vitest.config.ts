import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
		setupFiles: ['tests/setup.ts'],
		// all files share one test DB and TRUNCATE it, so run them one at a time
		fileParallelism: false,
	},
});
