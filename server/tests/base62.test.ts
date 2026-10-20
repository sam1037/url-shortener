import { describe, expect, it } from 'vitest';
import { generateCode } from '../src/utils/base62.js';

describe('generateCode', () => {
	it('returns a base62 string of the requested length', () => {
		const code = generateCode(6);
		expect(code).toMatch(/^[0-9A-Za-z]{6}$/);
	});

	it('returns an empty string for length 0', () => {
		expect(generateCode(0)).toBe('');
	});
});
