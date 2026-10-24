import { describe, it, expect } from 'vitest';
import { stepEnd, stepStart, totalDuration } from '#lib/engine/timeline.ts';
import { SCENARIOS } from '#lib/limits/scenario.ts';
import { readout } from '#lib/limits/approach.ts';
import { PAUSE, PREDICT, STEPS, initialUser } from './steps.ts';
import { STEP_IDS } from './step-ids.ts';
import { view } from './view.ts';

const free = initialUser();
const at = (id: (typeof STEP_IDS)[number]) => STEP_IDS.indexOf(id);
// Screen-relative values: handles and window move continuously in units of the window.
const KEYS = ['axes', 'draw', 'cx', 'cy', 'hx', 'hy', 'z', 'handles', 'open', 'guide', 'subst', 'lims', 'lim'] as const;
const OPACITIES = ['axes', 'draw', 'mix', 'handles', 'open', 'filled', 'guide', 'subst', 'lims', 'lim'] as const;

describe('limit-approach view', () => {
	it('is continuous across every step boundary', () => {
		for (let i = 1; i < STEPS.length; i++) {
			const t = stepStart(STEPS, i);
			const a = view(t - 1e-6, free);
			const b = view(t + 1e-6, free);
			for (const k of KEYS) {
				// A new example's dots fade in while the old ones (drawn at 1 − mix) fade out.
				if (k === 'open' && a.sc !== b.sc) continue;
				expect(Math.abs(a[k] - b[k]), `${k} at step ${i}`).toBeLessThan(1e-3);
			}
			// Handles keep their screen position.
			for (const k of ['xl', 'xr'] as const)
				expect(Math.abs((a[k] - a.cx) / a.hx - (b[k] - b.cx) / b.hx), `${k} at step ${i}`).toBeLessThan(1e-3);
		}
	});
	it('opacities stay in [0, 1]', () => {
		for (let t = 0; t <= totalDuration(STEPS); t += 0.01) {
			const v = view(t, free);
			for (const k of OPACITIES) {
				expect(v[k], k).toBeGreaterThanOrEqual(0);
				expect(v[k], k).toBeLessThanOrEqual(1);
			}
		}
	});
	it('handles never reach a, at any time and any drag', () => {
		for (let t = 0; t <= totalDuration(STEPS); t += 0.05) {
			for (const user of [free, { ...free, xl: 99, xr: -99 }, { ...free, xl: 1, xr: 1, z: 4 }]) {
				const v = view(t, user);
				expect(v.xl).toBeLessThan(v.a);
				expect(v.xr).toBeGreaterThan(v.a);
			}
		}
	});
	it('nothing of the answer shows before the predict pause (L-11)', () => {
		for (let t = stepStart(STEPS, PREDICT); t <= stepStart(STEPS, PREDICT) + PAUSE; t += 0.02) {
			const v = view(t, free);
			expect(v.open).toBe(0);
			expect(v.subst).toBe(0);
			expect(v.handles).toBe(0);
		}
	});
	it('the intro ends with the curve drawn and nothing at x = 1', () => {
		const v = view(stepEnd(STEPS, 0), free);
		expect([v.draw, v.open, v.guide, v.subst]).toEqual([1, 0, 0, 0]);
	});
	it('approach ends with both outputs close to 2', () => {
		const v = view(stepEnd(STEPS, at('approach')), free);
		expect(Math.abs(readout(SCENARIOS.hole, v.xl, 'left') - 2)).toBeLessThan(0.1);
		expect(Math.abs(readout(SCENARIOS.hole, v.xr, 'right') - 2)).toBeLessThan(0.1);
		expect(v.lim).toBe(1);
	});
	it('zoom ends 100× in; the next example starts unzoomed', () => {
		expect(view(stepEnd(STEPS, at('zoom')), free).z).toBeCloseTo(2, 9);
		expect(view(stepStart(STEPS, at('jump')), free).z).toBe(0);
	});
	it('the jump ends with outputs near 2 and 0: two different targets', () => {
		const v = view(stepEnd(STEPS, at('jump')), free);
		expect(readout(SCENARIOS.jump, v.xl, 'left')).toBeCloseTo(2, 0);
		expect(readout(SCENARIOS.jump, v.xr, 'right')).toBeCloseTo(0, 0);
	});
	it('oscillate zooms x only: sin(1/x) keeps its full height', () => {
		const v = view(stepEnd(STEPS, at('oscillate')), free);
		expect(v.z).toBeCloseTo(2, 9);
		expect(v.hy).toBe(1.6);
		expect(v.hx).toBeCloseTo(0.016, 9);
	});
	it('a dragged zoom wins over the schedule', () => {
		expect(view(stepStart(STEPS, at('zoom')) + 1, { ...free, z: 3 }).z).toBe(3);
	});
});
