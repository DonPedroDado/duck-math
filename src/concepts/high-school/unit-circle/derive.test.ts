import { describe, it, expect } from 'vitest';
import { TAU, norm, derive, angleFromPoint, keyStep } from './derive';

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

describe('norm keyboard wrap', () => {
	const d = Math.PI / 180;
	it('wraps below 0 and above 2pi', () => {
		expect(norm(0 - d)).toBeCloseTo(359 * d, 12);
		expect(norm(TAU - d / 2 + d)).toBeCloseTo(d / 2, 12);
		expect(norm(-61 * d + Math.PI / 3)).toBeCloseTo(359 * d, 12);
		for (const a of [-7, -0.001, 0, 3, TAU, 20]) {
			expect(norm(a)).toBeGreaterThanOrEqual(0);
			expect(norm(a)).toBeLessThan(TAU);
		}
	});
});

describe('norm tolerance snap', () => {
	it('snaps near TAU and near 0 to exactly 0', () => {
		expect(norm(TAU - 1e-14)).toBe(0);
		expect(norm(TAU - 5.3e-15)).toBe(0);
		expect(norm(-1e-14)).toBe(0);
		expect(norm(1e-12)).toBe(0);
		expect(norm(TAU)).toBe(0);
	});
	it('does not over-snap', () => {
		expect(norm(TAU - 1e-6)).toBeCloseTo(TAU - 1e-6, 12);
		expect(norm(TAU - 1e-6)).toBeGreaterThan(0);
		expect(norm(1e-6)).toBeCloseTo(1e-6, 12);
		expect(norm(1e-6)).toBeGreaterThan(0);
	});
});

describe('keyStep stepping up through 360', () => {
	const r = (deg: number) => (deg * Math.PI) / 180;
	it('20x +15 from 60 deg lands on exactly 0, every step on the grid', () => {
		let t = Math.PI / 3;
		for (let i = 1; i <= 20; i++) {
			t = keyStep(t, 15);
			expect(t).toBe(r((60 + 15 * i) % 360));
		}
		expect(t).toBe(0);
	});
	it('300x +1 from 60 deg lands on exactly 0', () => {
		let t = Math.PI / 3;
		for (let i = 0; i < 300; i++) t = keyStep(t, 1);
		expect(t).toBe(0);
	});
	it('wraps down and recovers drifted values', () => {
		expect(keyStep(0, -1)).toBe(r(359));
		expect(keyStep(0, -15)).toBe(r(345));
		expect(keyStep(r(359), 1)).toBe(0);
		expect(keyStep(TAU - 5.3e-15, 1)).toBe(r(1));
		expect(keyStep(r(134.6), 1)).toBe(r(135));
		expect(keyStep(r(134.6), -1)).toBe(r(134));
		expect(keyStep(r(134.4), 1)).toBe(r(135));
		expect(keyStep(r(134.4), -1)).toBe(r(134));
		expect(keyStep(r(359.6), 1)).toBe(0);
		expect(keyStep(r(0.4), -1)).toBe(0);
	});
});
