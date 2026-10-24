import { describe, it, expect } from 'vitest';
import { stepEnd, stepStart, totalDuration } from '#lib/engine/timeline.ts';
import { SCENARIOS } from '#lib/limits/scenario.ts';
import { readout } from '#lib/limits/approach.ts';
import { PAUSE, PREDICT, STEPS, initialUser } from './steps.ts';
import { STEP_IDS } from './step-ids.ts';
import { view } from './view.ts';

const free = initialUser();
const at = (id: (typeof STEP_IDS)[number]) => STEP_IDS.indexOf(id);
const KEYS = ['axes', 'draw', 'cx', 'cy', 'hx', 'hy', 'handles', 'lims', 'lim', 'guess', 'penOn'] as const;
const OPACITIES = ['axes', 'draw', 'mix', 'handles', 'vasym', 'hasym', 'arrows', 'lims', 'lim', 'guess', 'penOn'] as const;

describe('limit-infinity view', () => {
	it('is continuous across every step boundary', () => {
		for (let i = 1; i < STEPS.length; i++) {
			const t = stepStart(STEPS, i);
			const a = view(t - 1e-6, free);
			const b = view(t + 1e-6, free);
			for (const k of KEYS) expect(Math.abs(a[k] - b[k]) / Math.max(1, Math.abs(a[k])), `${k} at step ${i}`).toBeLessThan(1e-3);
			if (a.hs === b.hs) {
				for (const k of ['xl', 'xr'] as const) expect(Math.abs(a[k] - b[k]), `${k} at step ${i}`).toBeLessThan(1e-3);
			}
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
	it('nothing shoots off before the predict pause (L-12)', () => {
		for (let t = stepStart(STEPS, PREDICT); t <= stepStart(STEPS, PREDICT) + PAUSE; t += 0.02) {
			const v = view(t, free);
			expect([v.arrows, v.vasym, v.lims]).toEqual([0, 0, 0]);
			expect(v.xl).toBeCloseTo(-0.6 * 4, 9);
		}
	});
	it('predict ends with 1/x at −∞ on the left, +∞ on the right', () => {
		const v = view(stepEnd(STEPS, PREDICT), free);
		expect(readout(SCENARIOS.recip, v.xl, 'left')).toBeLessThan(-5);
		expect(readout(SCENARIOS.recip, v.xr, 'right')).toBeGreaterThan(5);
		expect(v.lim).toBe(1);
	});
	it('both-up: both outputs grow huge; zooming in (x only) makes them bigger still', () => {
		const end = stepEnd(STEPS, at('both-up'));
		const v = view(end, free);
		expect(readout(SCENARIOS.recipSq, v.xl, 'left')).toBeGreaterThan(50);
		expect(readout(SCENARIOS.recipSq, v.xr, 'right')).toBeGreaterThan(50);
		const z = view(end, { ...free, z: 2 });
		expect(z.hy).toBe(4);
		expect(readout(SCENARIOS.recipSq, z.xr, 'right')).toBeGreaterThan(1e5);
	});
	it('at-infinity: handles run out to the hundreds, the window follows, f(x) hugs 2', () => {
		const v = view(stepEnd(STEPS, at('at-infinity')), free);
		expect(v.pointing).toBe('out');
		expect(v.xr).toBeGreaterThan(300);
		expect(v.xl).toBeLessThan(-300);
		expect(v.hx).toBeGreaterThan(v.xr);
		for (const [x, side] of [[v.xl, 'left'], [v.xr, 'right']] as const)
			expect(Math.abs(readout(SCENARIOS.rational, x, side) - 2)).toBeLessThan(0.01);
	});
	it('dragged outward handles stay on their side of the asymptote', () => {
		const v = view(stepEnd(STEPS, at('at-infinity')), { ...free, xl: 5, xr: -5 });
		expect(v.xl).toBeLessThanOrEqual(-1.5);
		expect(v.xr).toBeGreaterThanOrEqual(0);
	});
	it('continuity: the pen crosses the whole window; a dragged pen wins', () => {
		expect(view(stepEnd(STEPS, at('continuity')), free).pen).toBeCloseTo(5, 9);
		expect(view(stepEnd(STEPS, at('continuity')), { ...free, pen: -2 }).pen).toBe(-2);
	});
});
