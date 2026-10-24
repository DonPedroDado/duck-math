import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { bentPoint, radianCopies, R_COPY, COPY_LENGTHS } from './radian.ts';

const len = (pts: [number, number][]) =>
	pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

describe('bentPoint', () => {
	it('is straight at k = 0', () => {
		expect(bentPoint(0.5, 0)).toEqual([0.5, 0]);
	});
	it('is continuous as k -> 0', () => {
		const a = bentPoint(0.5, 1e-9);
		expect(Math.hypot(a[0] - 0.5, a[1])).toBeLessThan(1e-6);
		const b = bentPoint(0.5, 1e-4);
		expect(Math.hypot(b[0] - 0.5, b[1])).toBeLessThan(1e-4);
	});
	it('matches the unit circle at k = 1', () => {
		for (const s of [0, 0.3, 1]) {
			const [x, y] = bentPoint(s, 1);
			expect(x).toBeCloseTo(Math.sin(s), 12);
			expect(y).toBeCloseTo(1 - Math.cos(s), 12);
		}
	});
});

describe('radianCopies', () => {
	it('has no copies at pr = 0', () => {
		expect(radianCopies(0, 0)).toEqual([]);
	});
	it('lands four copies on the circle at pr = 1', () => {
		const c = radianCopies(1, 0);
		expect(c).toHaveLength(4);
		c.forEach((cp, j) => {
			expect(cp.landed).toBe(true);
			expect(cp.points).toHaveLength(33);
			for (const p of cp.points) expect(Math.abs(Math.hypot(p[0], p[1]) - R_COPY)).toBeLessThan(1e-9);
			const a0 = Math.atan2(cp.points[0][1], cp.points[0][0]);
			expect(a0).toBeCloseTo(j, 6);
			expect(cp.endAngle).toBeCloseTo(+(j + COPY_LENGTHS[j]).toFixed(3), 3);
			expect(Math.abs(len(cp.points) - COPY_LENGTHS[j] * R_COPY)).toBeLessThan(1e-3);
		});
		expect(c[3].endAngle).toBeCloseTo(3.142, 3);
	});
	it('starts as the x-axis segment', () => {
		const c = radianCopies(0.001, 0);
		expect(c).toHaveLength(1);
		const last = c[0].points[32];
		expect(last[0]).toBeCloseTo(R_COPY, 3);
		expect(Math.abs(last[1])).toBeLessThan(0.01);
		expect(c[0].points[0]).toEqual([0, 0]);
	});
	it('has copy 0 landed and copy 1 in flight at pr = 0.5', () => {
		const c = radianCopies(0.5, 0);
		expect(c).toHaveLength(2);
		expect(c.filter((x) => x.landed)).toHaveLength(1);
		expect(c[0].landed).toBe(true);
	});
	it('landed count is monotone', () => {
		let prev = 0;
		for (let i = 0; i <= 200; i++) {
			const n = radianCopies(i / 200, 0).filter((c) => c.landed).length;
			expect(n).toBeGreaterThanOrEqual(prev);
			prev = n;
		}
	});
	it('is deterministic', () => {
		expect(radianCopies(0.37, 0.5)).toEqual(radianCopies(0.37, 0.5));
	});
	it('dims to 40%', () => {
		expect(radianCopies(1, 1)[0].opacity).toBeCloseTo(0.4, 9);
	});
	it('has no theta dependency (PD-3)', () => {
		expect(readFileSync(new URL('./radian.ts', import.meta.url), 'utf8')).not.toContain('theta');
	});
});
