import { describe, it, expect } from 'vitest';
import { formulaLines } from './formulas.ts';

const roles = (s: string) => [...s.matchAll(/link-(\w)/g)].map((m) => m[1]);

describe('shifts formulas', () => {
	it('vertical shows only d', () => {
		const [sym, live] = formulaLines('vertical', 0, 2, 'en');
		expect(roles(sym)).toEqual(['d']);
		expect(live).toBe('g(x) = f(x) + \\htmlClass{t-d link-d}{2}');
	});
	it('lookup ties f(x + 2) to a negative c', () => {
		const s = formulaLines('lookup', -2, 0, 'en').join(' ');
		expect(s).toContain('f(x + \\htmlClass{t-c link-c}{2})');
		expect(s).toContain('f(x - (\\htmlClass{t-c link-c}{-2}))');
	});
	it('both shows c and d with natural signs and German decimals', () => {
		const live = formulaLines('both', -1.5, -0.5, 'de')[1];
		expect(live).toBe('g(x) = f(x + \\htmlClass{t-c link-c}{1{,}5}) - \\htmlClass{t-d link-d}{0{,}5}');
	});
});
