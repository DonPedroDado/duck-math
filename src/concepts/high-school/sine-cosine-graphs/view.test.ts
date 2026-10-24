import { describe, it, expect } from 'vitest';
import { view, type SGView } from './view';
import { STEPS, DEFAULT_THETA, stepDefaults, initialUser } from './steps';
import { STEP_IDS } from './step-ids';
import { stepEnd, stepStart } from '#lib/engine/timeline.ts';
import { displayTheta } from './display';
import { TAU } from '#lib/engine/angle.ts';

const _noTheta: 'theta' extends keyof SGView ? never : true = true;
const SKIP = new Set(['t', 'step', 'p']);
/** Sweep ownership switches at step entry (display continuity comes from rewind starting at 0). */
const JUMP = ['sweepOn', 'rewind'];
const nums = (v: SGView) => Object.entries(v).filter(([k]) => !SKIP.has(k)) as [string, number][];

describe('steps', () => {
	it('ids, pause and defaults', () => {
		expect(_noTheta).toBe(true);
		expect(STEPS.map((s) => s.id)).toEqual([...STEP_IDS]);
		expect(STEPS[2].pause).toBe(0.5);
		expect(DEFAULT_THETA).toBe(Math.PI / 3);
		expect(stepDefaults(0, 2).theta).toBe(Math.PI / 3);
		expect(stepDefaults(1, 2).theta).toBe(Math.PI / 3);
		expect('theta' in stepDefaults(2, 1)).toBe(false);
		for (const [i, p] of [
			[0, 2],
			[1, 2],
			[2, 1]
		])
			expect(stepDefaults(i, p)).toMatchObject({ moved: false, guess: null });
		expect(initialUser(0)).toEqual({ theta: Math.PI / 3, unit: 'deg', moved: false, guess: null });
	});
	it('staging for cosine, periodic and explore', () => {
		expect('theta' in stepDefaults(2, 1)).toBe(false);
		expect(stepDefaults(2, 3).theta).toBe(TAU);
		for (const prev of [0, 2, 4]) expect(stepDefaults(3, prev).theta).toBe(TAU);
		for (const i of [4, 5]) expect(stepDefaults(i, i - 1).theta).toBe(2 * TAU);
		for (const i of [2, 3, 4, 5]) expect(stepDefaults(i, 3)).toMatchObject({ moved: false, guess: null });
		expect(initialUser(3).theta).toBe(TAU);
		expect(initialUser(5).theta).toBe(2 * TAU);
	});
});

describe('view', () => {
	it('has no theta', () => {
		expect('theta' in view(3)).toBe(false);
	});
	it('continuous across boundaries except JUMP', () => {
		for (const b of [1, 2, 3, 4, 5].map((i) => stepStart(STEPS, i))) {
			const a = nums(view(b - 1e-7));
			const c = nums(view(b + 1e-7));
			a.forEach(([k, v], j) => {
				if (JUMP.includes(k)) return;
				expect(Math.abs(v - c[j][1]), `${k}@${b}`).toBeLessThan(1e-3);
			});
		}
	});
	it('nothing traced before the pause', () => {
		for (let t = 0; t <= stepStart(STEPS, 2) + 0.5; t += 0.05) {
			const v = view(t);
			expect(v.sweep).toBe(0);
			expect(v.sinTraced).toBe(0);
		}
	});
	it('staged values', () => {
		const u = view(stepEnd(STEPS, 1));
		expect(u.unroll).toBe(1);
		expect(u.arc).toBe(1);
		expect(u.arcLabel).toBeCloseTo(1, 9);
		const s = view(stepEnd(STEPS, 2));
		expect(s.sinTraced).toBeCloseTo(2 * Math.PI, 9);
		expect(s.peak).toBeCloseTo(1, 9);
		expect(s.sweepOn).toBe(1);
		expect(s.rewind).toBeCloseTo(1, 9);
	});
	it('display theta is continuous at every step boundary', () => {
		const staged = (i: number) => stepDefaults(i, i - 1).theta ?? DEFAULT_THETA;
		for (let i = 1; i < STEPS.length; i++) {
			const b = stepStart(STEPS, i);
			const a = displayTheta(view(b - 1e-7), { theta: staged(i - 1), moved: false });
			const c = displayTheta(view(b + 1e-7), { theta: staged(i), moved: false });
			expect(Math.abs(a - c), `step ${i}`).toBeLessThan(1e-3);
		}
	});
	it('range, cosine and periodic schedule', () => {
		for (const i of [0, 1, 2, 3]) expect(view(stepStart(STEPS, i) + 0.01).range).toBe(TAU);
		expect(view(stepStart(STEPS, 4) + 4 * 0.3).range).toBeCloseTo(2 * TAU, 9);
		expect(view(stepEnd(STEPS, 4)).range).toBeCloseTo(2 * TAU, 9);
		expect(view(stepEnd(STEPS, 5)).range).toBeCloseTo(2 * TAU, 9);
		expect(view(stepEnd(STEPS, 2)).cosTraced).toBe(0);
		expect(view(stepEnd(STEPS, 3)).cosTraced).toBeCloseTo(TAU, 9);
		expect(view(stepEnd(STEPS, 4)).cosTraced).toBeCloseTo(2 * TAU, 9);
		expect(view(stepEnd(STEPS, 4)).sinTraced).toBeCloseTo(2 * TAU, 9);
	});
});
