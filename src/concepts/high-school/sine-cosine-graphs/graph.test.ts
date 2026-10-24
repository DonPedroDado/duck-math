import { describe, expect, it } from 'vitest';
import { curvePoints, ticks } from './graph.ts';

const gx = (u: number) => 10 + u * 20;
const gy = (v: number) => 100 - v * 30;

describe('graph', () => {
	it('curvePoints samples n+1 points', () => {
		const p = curvePoints(Math.sin, 0, 2 * Math.PI, gx, gy, 240);
		expect(p).toHaveLength(241);
		expect(p[0][0]).toBe(gx(0));
		expect(p[240][0]).toBeCloseTo(gx(2 * Math.PI), 9);
	});
	it('empty when degenerate', () => {
		expect(curvePoints(Math.sin, 1, 1, gx, gy)).toEqual([]);
	});
	it('ticks', () => {
		expect(ticks(2 * Math.PI).map((t) => t.label)).toEqual(['π/2', 'π', '3π/2', '2π']);
		const t4 = ticks(4 * Math.PI);
		expect(t4).toHaveLength(8);
		expect(t4[7].label).toBe('4π');
	});
});
