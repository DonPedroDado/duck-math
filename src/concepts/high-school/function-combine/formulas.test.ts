import { describe, it, expect } from 'vitest';
import { formulaLines } from './formulas.ts';

const roles = (s: string) => [...s.matchAll(/link-(\w)/g)].map((m) => m[1]);

describe('combine formulas', () => {
	it('each build step adds its term', () => {
		const at = (id: 'build-c' | 'build-b' | 'build-a' | 'build-d') =>
			roles(formulaLines(id, { a: -1.5, b: 2, c: 2, d: 1 }, 'en', 'f')[1]);
		expect(at('build-c')).toEqual(['c']);
		expect(at('build-b')).toEqual(['b', 'c']);
		expect(at('build-a')).toEqual(['a', 'b', 'c']);
		expect(at('build-d')).toEqual(['a', 'b', 'c', 'd']);
	});
	it('the full build reads −1.5·f(2(x − 2)) + 1', () => {
		expect(formulaLines('build-d', { a: -1.5, b: 2, c: 2, d: 1 }, 'en', 'f')[1]).toBe(
			'g(x) = \\htmlClass{t-a link-a}{-1.5}\\cdot f(\\htmlClass{t-b link-b}{2}(x - \\htmlClass{t-c link-c}{2})) + \\htmlClass{t-d link-d}{1}'
		);
	});
	it('order: the question, then f(2x − 1) = f(2(x − ½))', () => {
		expect(formulaLines('order', { a: 1, b: 2, c: 1, d: 0 }, 'en', 'f', false)).toHaveLength(1);
		expect(formulaLines('order', { a: 1, b: 2, c: 0.5, d: 0 }, 'en', 'f')[0]).toContain('\\tfrac{1}{2}');
	});
	it('explore names the base graph', () => {
		expect(formulaLines('explore', { a: 1, b: 1, c: 0, d: 0 }, 'en', 'sqrt')).toContain('f(x) = \\sqrt{x}');
		expect(formulaLines('explore', { a: 1, b: 1, c: 0, d: 0 }, 'en', 'f')).toHaveLength(2);
	});
});

describe('combine explore formula', () => {
	it('hides identity terms', () => {
		expect(formulaLines('explore', { a: 1, b: 1, c: -2, d: 0 }, 'en', 'f')[1]).toBe('g(x) = f(x + \\htmlClass{t-c link-c}{2})');
	});
});
