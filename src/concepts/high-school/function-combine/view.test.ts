import { describe, it, expect } from 'vitest';
import { stepStart, stepEnd, totalDuration } from '#lib/engine/timeline.ts';
import { STEPS, initialUser, PAUSE, ORDER } from './steps.ts';
import { view } from './view.ts';

const free = initialUser();
const OPAC = ['axes', 'draw', 'landmarks', 'ghost', 'arrows', 'grid', 'fixedX', 'fixedY', 'cmp'] as const;
const KEYS = [...OPAC, 'a', 'b', 'c', 'd'] as const;
const params = (t: number) => {
	const v = view(t, free);
	return [v.a, v.b, v.c, v.d];
};

describe('combine view', () => {
	it('is continuous across every step boundary', () => {
		for (let i = 1; i < STEPS.length; i++) {
			const t = stepStart(STEPS, i);
			const x = view(t - 1e-6, free);
			const y = view(t + 1e-6, free);
			for (const k of KEYS) expect(Math.abs(x[k] - y[k]), `${k} at step ${i}`).toBeLessThan(1e-3);
		}
	});
	it('opacities stay in [0, 1]', () => {
		for (let t = 0; t <= totalDuration(STEPS); t += 0.01)
			for (const k of OPAC) {
				const v = view(t, free)[k];
				expect(v).toBeGreaterThanOrEqual(0);
				expect(v).toBeLessThanOrEqual(1);
			}
	});
	it('builds c, then b, then a, then d', () => {
		expect(params(stepEnd(STEPS, 1))).toEqual([1, 1, 2, 0]);
		expect(params(stepEnd(STEPS, 2))).toEqual([1, 2, 2, 0]);
		expect(params(stepEnd(STEPS, 3))).toEqual([-1.5, 2, 2, 0]);
		expect(params(stepEnd(STEPS, 4))).toEqual([-1.5, 2, 2, 1]);
	});
	it('order: f(2(x − 1)) at the question, f(2x − 1) = f(2(x − ½)) after', () => {
		expect(params(stepStart(STEPS, ORDER) + PAUSE)).toEqual([1, 2, 1, 0]);
		expect(params(stepEnd(STEPS, ORDER))).toEqual([1, 2, 0.5, 0]);
		expect(view(stepStart(STEPS, ORDER) + PAUSE, free).cmp).toBe(0);
	});
	it('explore starts from f itself', () => {
		expect(params(stepEnd(STEPS, 6))).toEqual([1, 1, 0, 0]);
	});
});
