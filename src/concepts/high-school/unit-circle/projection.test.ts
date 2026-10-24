import { describe, it, expect } from 'vitest';
import { projection } from './projection.ts';

describe('projection', () => {
	it('60deg', () => {
		const p = projection(Math.PI / 3);
		expect(p.showCos && p.showSin && p.cosLabelBelow && p.sinLabelLeft).toBe(true);
	});
	it('90deg hides cos', () => expect(projection(Math.PI / 2).showCos).toBe(false));
	it('270deg', () => {
		const p = projection((3 * Math.PI) / 2);
		expect(p.showCos).toBe(false);
		expect(p.sin).toBeCloseTo(-1);
	});
	it('Q3 flips labels', () => {
		const p = projection(4);
		expect(p.cosLabelBelow).toBe(false);
		expect(p.sinLabelLeft).toBe(false);
	});
	it('0deg hides sin', () => expect(projection(0).showSin).toBe(false));
});
