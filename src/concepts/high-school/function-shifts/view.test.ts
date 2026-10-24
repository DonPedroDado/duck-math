import { describe, it, expect } from 'vitest';
import { stepStart, stepEnd, totalDuration } from '#lib/engine/timeline.ts';
import { STEPS, initialUser, PAUSE, OPPOSITE } from './steps.ts';
import { view } from './view.ts';

const free = initialUser();
const KEYS = ['axes', 'draw', 'landmarks', 'ghost', 'arrows', 'lookup', 'c', 'd'] as const;

describe('shifts view', () => {
	it('is continuous across every step boundary', () => {
		for (let i = 1; i < STEPS.length; i++) {
			const t = stepStart(STEPS, i);
			const a = view(t - 1e-6, free);
			const b = view(t + 1e-6, free);
			for (const k of KEYS) expect(Math.abs(a[k] - b[k]), `${k} at step ${i}`).toBeLessThan(1e-3);
		}
	});
	it('stays in [0, 1] for opacities', () => {
		for (let t = 0; t <= totalDuration(STEPS); t += 0.01) {
			const v = view(t, free);
			for (const k of ['axes', 'draw', 'landmarks', 'ghost', 'arrows', 'lookup'] as const) {
				expect(v[k]).toBeGreaterThanOrEqual(0);
				expect(v[k]).toBeLessThanOrEqual(1);
			}
		}
	});
	it('vertical ends lifted by 2; the answer to f(x + 2) is a shift left', () => {
		expect(view(stepEnd(STEPS, 1), free).d).toBeCloseTo(2, 9);
		const end = view(stepEnd(STEPS, OPPOSITE), free);
		expect(end.c).toBeCloseTo(-2, 9);
		expect(end.d).toBeCloseTo(0, 9);
	});
	it('nothing of the answer shows before the predict pause', () => {
		const pause = stepStart(STEPS, OPPOSITE) + PAUSE;
		for (let t = stepStart(STEPS, OPPOSITE); t <= pause; t += 0.02) {
			expect(view(t, free).c).toBeCloseTo(0, 12);
		}
	});
	it('dragged values override the schedule', () => {
		const v = view(stepEnd(STEPS, 1), { c: 1.5, d: -1, guess: null });
		expect([v.c, v.d, v.cUser, v.dUser]).toEqual([1.5, -1, true, true]);
	});
});
