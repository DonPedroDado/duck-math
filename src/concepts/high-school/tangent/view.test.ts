import { describe, it, expect } from 'vitest';
import { view, type TNView } from './view';
import { STEPS, DEFAULT_THETA, PREDICT_THETA, stepDefaults, initialUser } from './steps';
import { STEP_IDS } from './step-ids';
import { stepEnd, stepStart } from '#lib/engine/timeline.ts';

const _noTheta: 'theta' extends keyof TNView ? never : true = true;
const SKIP = new Set(['t', 'step', 'p']);
const nums = (v: TNView) => Object.entries(v).filter(([k]) => !SKIP.has(k)) as [string, number][];

describe('steps', () => {
	it('ids, policy and defaults', () => {
		expect(_noTheta).toBe(true);
		expect(STEPS.map((s) => s.id)).toEqual([...STEP_IDS]);
		expect(STEPS[1].pause).toBe(1.4);
		expect(initialUser(0).theta).toBe(DEFAULT_THETA);
		expect(initialUser(1).theta).toBe(PREDICT_THETA);
		expect(stepDefaults(1, 0)).toEqual({ theta: PREDICT_THETA, guess: null });
		expect(stepDefaults(0, 1)).toEqual({ guess: null });
	});
});

describe('view', () => {
	it('has no theta', () => expect('theta' in view(1)).toBe(false));
	it('continuous across every step boundary', () => {
		for (let s = 0; s < STEPS.length - 1; s++) {
			const e = stepEnd(STEPS, s);
			const a = nums(view(e - 1e-7));
			const c = nums(view(e + 1e-7));
			a.forEach(([k, v], j) => expect(Math.abs(v - c[j][1]), `${s}:${k}`).toBeLessThan(1e-3));
		}
	});
	const DIMS = ['dimTan', 'dimSec', 'dimCsc'];
	const NEW = [
		'secSeg', 'secLabel', 'yLine', 'yTick', 'cscExt', 'cscSeg', 'cscLabel', 'cotSeg', 'cotLabel', ...DIMS
	];
	it('sec, csc, cot and all stage one segment each', () => {
		const at = (i: number) => view(stepEnd(STEPS, i)) as unknown as Record<string, number>;
		const sec = at(2);
		expect(sec.secSeg).toBeCloseTo(1, 9);
		expect(sec.dimTan).toBeCloseTo(1, 9);
		expect(sec.dimSec).toBe(0);
		expect(sec.cscSeg).toBe(0);
		const csc = at(3);
		expect(csc.cscSeg).toBeCloseTo(1, 9);
		expect(csc.yLine).toBeCloseTo(1, 9);
		expect(csc.dimSec).toBeCloseTo(1, 9);
		expect(csc.cotSeg).toBe(0);
		const cot = at(4);
		expect(cot.cotSeg).toBeCloseTo(1, 9);
		expect(cot.dimCsc).toBeCloseTo(1, 9);
		for (const [k, x] of nums(view(stepEnd(STEPS, 5)))) {
			if (DIMS.includes(k) || k === 'hint') expect(x, k).toBeCloseTo(0, 9);
			else expect(x, k).toBeCloseTo(1, 9);
		}
		for (const i of [2, 3, 4, 5]) expect('theta' in stepDefaults(i, i - 1)).toBe(false);
	});
	it('staged values', () => {
		for (const [k, x] of nums(view(stepEnd(STEPS, 1)))) {
			if (NEW.includes(k)) expect(x, k).toBe(0);
			else expect(x, k).toBeCloseTo(k === 'hint' ? 0 : 1, 9);
		}
		const i0 = view(stepEnd(STEPS, 0)) as unknown as Record<string, number>;
		for (const k of ['axes', 'circle', 'point', 'hint']) expect(i0[k], k).toBeCloseTo(1, 9);
		for (const k of ['xLine', 'tanSeg', 'triangles']) expect(i0[k], k).toBe(0);
	});
	it('draws nothing of the answer before the pause', () => {
		for (let t = 0; t <= stepStart(STEPS, 1) + 1.4; t += 0.01) expect(view(t).tanSeg).toBe(0);
	});
});
