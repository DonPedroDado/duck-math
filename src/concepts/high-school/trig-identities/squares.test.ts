import { describe, it, expect } from 'vitest';
import { squares, areaTerms, visible } from './squares';

const rad = (d: number) => (d * Math.PI) / 180;
const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('squares', () => {
	it('areas add up and every polygon is a square, no NaN', () => {
		for (let d = 0; d <= 360; d += 0.5) {
			const q = squares(rad(d));
			expect(Math.abs(q.cos2.side ** 2 + q.sin2.side ** 2 - 1)).toBeLessThan(1e-12);
			expect(q.one.side).toBe(1);
			for (const sq of [q.cos2, q.sin2, q.one]) {
				expect(sq.pts.flat().every(Number.isFinite)).toBe(true);
				const [a, b, c, e] = sq.pts;
				for (const [u, w] of [
					[a, b],
					[b, c],
					[c, e],
					[e, a]
				] as [number, number][][])
					expect(Math.abs(dist(u, w) - sq.side)).toBeLessThan(1e-9);
				const dot = (b[0] - a[0]) * (e[0] - a[0]) + (b[1] - a[1]) * (e[1] - a[1]);
				expect(Math.abs(dot)).toBeLessThan(1e-9);
			}
		}
	});
	it('points outward', () => {
		const t = rad(50);
		const q = squares(t);
		const c = Math.cos(t);
		expect(q.cos2.pts.every((p) => p[1] <= 1e-12)).toBe(true);
		expect(q.sin2.pts.every((p) => p[0] >= c - 1e-12)).toBe(true);
		const e = q.one.pts[3]; // O + n
		expect(e[0] * (c / 2) + e[1] * (-Math.sin(t) / 2)).toBeLessThan(0);
		const q2 = squares(rad(130));
		const c2 = Math.cos(rad(130));
		expect(q2.sin2.pts.every((p) => p[0] <= c2 + 1e-12)).toBe(true);
	});
	it('fades near flips', () => {
		expect(squares(rad(90)).sin2.fade).toBe(0);
		expect(squares(rad(270)).sin2.fade).toBe(0);
		expect(squares(rad(88)).sin2.fade).toBeCloseTo(1, 9);
		expect(squares(rad(92)).sin2.fade).toBeCloseTo(1, 9);
		expect(squares(rad(89)).sin2.fade).toBeCloseTo(0.5, 9);
		expect(squares(0).cos2.fade).toBe(0);
		expect(squares(rad(180)).cos2.fade).toBeCloseTo(0, 9);
		for (const d of [0, 90, 180, 270]) expect(squares(rad(d)).one.fade).toBeCloseTo(0, 9);
	});
	it('visible', () => {
		expect(visible(0.001, 200)).toBe(false);
		expect(visible(0.5, 200)).toBe(true);
	});
});

describe('areaTerms', () => {
	it('displayed terms sum to exactly 1', () => {
		for (let d = 0; d <= 360; d += 0.1) {
			const t = areaTerms(rad(d), 'de');
			const a = Number(t.a.replace(',', '.'));
			const b = Number(t.b.replace(',', '.'));
			expect(Math.round((a + b) * 100) / 100).toBe(1);
			expect(t.sum).toBe('1,00');
		}
		expect(areaTerms(rad(30), 'en').a).toBe('0.75');
		expect(areaTerms(rad(30), 'en').sum).toBe('1.00');
	});
});
