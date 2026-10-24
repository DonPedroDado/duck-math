import { describe, it, expect } from 'vitest';
import { stepStart, stepEnd, totalDuration } from '#lib/engine/timeline.ts';
import { STEPS, initialUser, PAUSE, HORIZONTAL } from './steps.ts';
import { view } from './view.ts';

const free = initialUser();
const KEYS = ['axes', 'draw', 'landmarks', 'ghost', 'arrows', 'grid', 'fixedX', 'fixedY', 'mirror', 'a', 'b'] as const;

describe('stretches view', () => {
	it('is continuous across every step boundary', () => {
		for (let i = 1; i < STEPS.length; i++) {
			const t = stepStart(STEPS, i);
			const x = view(t - 1e-6, free);
			const y = view(t + 1e-6, free);
			for (const k of KEYS) expect(Math.abs(x[k] - y[k]), `${k} at step ${i}`).toBeLessThan(1e-3);
		}
	});
	it('opacities stay in [0, 1]', () => {
		for (let t = 0; t <= totalDuration(STEPS); t += 0.01) {
			const v = view(t, free);
			for (const k of ['axes', 'draw', 'landmarks', 'ghost', 'arrows', 'grid', 'fixedX', 'fixedY', 'mirror'] as const) {
				expect(v[k]).toBeGreaterThanOrEqual(0);
				expect(v[k]).toBeLessThanOrEqual(1);
			}
		}
	});
	it('ends: a = 2, then b = 2, then −f(x), then f(−x)', () => {
		const at = (i: number) => view(stepEnd(STEPS, i), free);
		expect([at(1).a, at(1).b]).toEqual([2, 1]);
		expect([at(2).a, at(2).b]).toEqual([1, 2]);
		expect([at(3).a, at(3).b]).toEqual([-1, 1]);
		expect([at(4).a, at(4).b]).toEqual([1, -1]);
	});
	it('nothing of the answer before the predict pause', () => {
		const t0 = stepStart(STEPS, HORIZONTAL);
		for (let t = t0; t <= t0 + PAUSE; t += 0.02) expect(view(t, free).b).toBe(1);
	});
	it('reflections pass through 0', () => {
		const zero = (k: 'a' | 'b', i: number) => {
			let min = Infinity;
			for (let t = stepStart(STEPS, i); t <= stepEnd(STEPS, i); t += 0.005) min = Math.min(min, Math.abs(view(t, free)[k]));
			return min;
		};
		expect(zero('a', 3)).toBeLessThan(0.01);
		expect(zero('b', 4)).toBeLessThan(0.01);
	});
});
