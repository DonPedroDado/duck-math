import { describe, it, expect } from 'vitest';
import { tail } from './trail.ts';

describe('tail', () => {
	it('is empty at 0', () => expect(tail(0)).toEqual([]));
	it('clamps the start at 0', () => {
		const t = tail(Math.PI / 4);
		expect(t[0].s0).toBe(0);
		expect(t[t.length - 1].s1).toBeCloseTo(Math.PI / 4, 12);
	});
	it('spans a quarter turn with 24 segments', () => {
		const t = tail(3 * Math.PI);
		expect(t).toHaveLength(24);
		expect(t[0].s0).toBeCloseTo(3 * Math.PI - Math.PI / 2, 12);
		expect(t[23].s1).toBeCloseTo(3 * Math.PI, 12);
	});
	it('opacity increases toward the head', () => {
		const t = tail(3);
		expect(t[t.length - 1].o).toBe(1);
		expect(t[0].o).toBeGreaterThan(0);
		expect(t[0].o).toBeLessThan(0.1);
		for (let k = 1; k < t.length; k++) expect(t[k].o).toBeGreaterThan(t[k - 1].o);
	});
	it('is scrub-exact (pure)', () => expect(tail(2.2)).toEqual(tail(2.2)));
});
