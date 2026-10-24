import { describe, it, expect } from 'vitest';
import { distToPoleDeg, ratio, fmtRatio } from './ratios';

const rad = (d: number) => (d * Math.PI) / 180;

describe('ratio', () => {
	it('distToPoleDeg', () => {
		expect(distToPoleDeg('tan', rad(89.5))).toBeCloseTo(0.5, 9);
		expect(distToPoleDeg('csc', rad(180.25))).toBeCloseTo(0.25, 9);
	});
	it('poles are undefined by angle', () => {
		for (const [fn, d] of [
			['tan', 90],
			['tan', 89.6],
			['tan', 270],
			['sec', 90],
			['csc', 0],
			['cot', 180],
			['cot', 360]
		] as const)
			expect(ratio(fn, rad(d)).kind, `${fn}@${d}`).toBe('undefined');
		expect(ratio('tan', rad(89.4)).kind).toBe('defined');
	});
	it('values', () => {
		const t0 = ratio('tan', 0);
		expect(t0.kind === 'defined' && Object.is(t0.value, 0)).toBe(true);
		const t80 = ratio('tan', rad(80));
		expect(t80.kind === 'defined' && t80.value).toBeCloseTo(5.671, 3);
		const t135 = ratio('tan', rad(135));
		expect(t135.kind === 'defined' && t135.value).toBeCloseTo(-1, 9);
	});
	it('similar triangles: tan = sin/cos', () => {
		for (let d = 0; d < 360; d += 7.3) {
			const r = ratio('tan', rad(d));
			if (r.kind === 'defined')
				expect(Math.abs(r.value - Math.sin(rad(d)) / Math.cos(rad(d)))).toBeLessThan(1e-12);
		}
	});
	it('fmtRatio', () => {
		expect(fmtRatio('tan', rad(89), 'de', 'nicht definiert')).toBe('57,29');
		expect(fmtRatio('tan', rad(90), 'en', 'undefined')).toBe('undefined');
		expect(fmtRatio('tan', rad(135), 'en', 'u')).toBe('−1.00');
	});
	it('never prints Infinity/NaN/e+/-0', () => {
		for (const fn of ['tan', 'sec', 'csc', 'cot'] as const)
			for (let d = 0; d <= 360; d += 0.1)
				for (const loc of ['en', 'de']) {
					const s = fmtRatio(fn, rad(d), loc, 'undefined');
					expect(s).not.toMatch(/Infinity|NaN|e\+|^-0|−0[.,]00$/);
				}
	});
});
