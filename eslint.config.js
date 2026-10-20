import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['**/dist', 'docs', 'example', 'prototype']),
	{
		files: ['**/*.{js,ts,tsx}'],
		extends: [js.configs.recommended, tseslint.configs.recommended],
	},
	{
		files: ['client/**/*.{ts,tsx}'],
		extends: [
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: { globals: globals.browser },
	},
	{
		files: ['server/**/*.ts', '*.js'],
		languageOptions: { globals: globals.node },
	},
	// last: turns off rules that conflict with Prettier
	prettier,
]);
