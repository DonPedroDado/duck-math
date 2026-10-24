import { describe, it, expect } from 'vitest';
import { TAU, norm, derive, angleFromPoint } from './derive';

describe('norm', () => {
	it('wraps into [0, TAU)', () => {
		expect(norm(-0.1)).toBeCloseTo(TAU - 0.1, 12);
		expect(norm(7)).toBeCloseTo(7 - TAU, 12);
		expect(norm(TAU)).toBe(0);
	});
});

describe('derive', () => {
	it('axis angles are snapped exactly', () => {
		const d0 = derive(0);
		expect([d0.cos, d0.sin, d0.quadrant, d0.deg]).toEqual([1, 0, 0, 0]);
		const d90 = derive(Math.PI / 2);
		expect(d90.cos).toBe(0);
		expect(Object.is(d90.cos, -0)).toBe(false);
		expect(d90.sin).toBe(1);
		expect(d90.quadrant).toBe(0);
		const d180 = derive(Math.PI);
		expect(d180.cos).toBe(-1);
		expect(Object.is(d180.sin, -0)).toBe(false);
		expect(d180.sin).toBe(0);
		const d270 = derive(3 * Math.PI / 2);
		expect(d270.cos).toBe(0);
		expect(d270.sin).toBe(-1);
		expect(derive(2 * Math.PI).theta).toBe(0);
	});
	it('60 degrees', () => {
		const d = derive(Math.PI / 3);
		expect(d.cos).toBeCloseTo(0.5, 12);
		expect(d.sin).toBeCloseTo(0.8660254, 7);
		expect(d.quadrant).toBe(1);
		expect(d.deg).toBeCloseTo(60, 9);
	});
	it('quadrants', () => {
		expect(derive(2.5).quadrant).toBe(2);
		expect(derive(4).quadrant).toBe(3);
		expect(derive(5.5).quadrant).toBe(4);
	});
});

describe('angleFromPoint', () => {
	it('cardinal directions', () => {
		expect(angleFromPoint(0, 1)).toBeCloseTo(Math.PI / 2, 12);
		expect(angleFromPoint(-1, 0)).toBeCloseTo(Math.PI, 12);
		expect(angleFromPoint(0, -1)).toBeCloseTo(3 * Math.PI / 2, 12);
	});
	it('stays in [0, TAU)', () => {
		const a = angleFromPoint(1, -1e-9);
		expect(a).toBeGreaterThanOrEqual(0);
		expect(a).toBeLessThan(TAU);
	});
});
