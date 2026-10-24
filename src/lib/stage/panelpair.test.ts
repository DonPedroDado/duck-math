import { describe, expect, it } from 'vitest';
import { gxOf, gyOf, pairLayout } from './panelpair.ts';

describe('pairLayout', () => {
	it('row mode shares one axis line', () => {
		const L = pairLayout(960, 900);
		expect(L.mode).toBe('row');
		expect(L.H).toBe(400);
		expect(L.circle.cy).toBe(L.graph.axisY);
		expect(L.circle.R).toBe(L.graph.gR);
		expect(L.graph.x0).toBe(400 + 24);
		expect(L.graph.x1).toBe(944);
	});
	it.each([
		[390, 844],
		[320, 640]
	])('column mode on phone %i x %i', (w, vh) => {
		const L = pairLayout(w, vh);
		expect(L.mode).toBe('column');
		expect(L.graph.axisY).toBeGreaterThan(L.circle.cy + L.circle.R);
		expect(L.H).toBeLessThanOrEqual(0.76 * vh - 64 + 1e-9);
		expect(L.graph.x1).toBeLessThanOrEqual(L.W);
	});
	it('stays finite for zero input', () => {
		const L = pairLayout(0, 0);
		const nums = [L.W, L.H, L.circle.cx, L.circle.cy, L.circle.R, L.graph.x0, L.graph.x1, L.graph.axisY, L.graph.gR];
		for (const n of nums) expect(Number.isFinite(n)).toBe(true);
	});
	it('scale helpers', () => {
		const L = pairLayout(960, 900);
		const gx = gxOf(L, [0, 2 * Math.PI]);
		expect(gx(0)).toBe(L.graph.x0);
		expect(gx(2 * Math.PI)).toBeCloseTo(L.graph.x1, 9);
		expect(gyOf(L)(1)).toBe(L.graph.axisY - L.graph.gR);
	});
});
