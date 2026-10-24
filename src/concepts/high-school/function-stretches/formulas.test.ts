import { describe, it, expect } from 'vitest';
import { formulaLines } from './formulas.ts';

describe('stretches formulas', () => {
	it('vertical shows a with its number', () => {
		expect(formulaLines('vertical', 2, 1, 'en')[1]).toBe('g(x) = \\htmlClass{t-a link-a}{2}\\cdot f(x)');
	});
	it('the question is f(2x) until revealed', () => {
		expect(formulaLines('horizontal', 1, 1, 'en', false)).toEqual(['g(x) = f(\\htmlClass{t-b link-b}{2}x)']);
		expect(formulaLines('horizontal', 1, 2, 'en')[1]).toBe('g(x) = f(\\htmlClass{t-b link-b}{2}x)');
	});
	it('names −f(x) and f(−x) at −1', () => {
		expect(formulaLines('reflect-x', -1, 1, 'en')[1]).toBe('g(x) = \\htmlClass{t-a link-a}{-}f(x)');
		expect(formulaLines('reflect-y', 1, -1, 'en')[1]).toBe('g(x) = f(\\htmlClass{t-b link-b}{-}x)');
	});
	it('German decimals', () => {
		expect(formulaLines('explore', 1.5, -0.5, 'de')[1]).toContain('1{,}5');
	});
});
