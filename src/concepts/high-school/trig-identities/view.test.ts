import { describe, it, expect } from 'vitest';
import { view, type IDView } from './view';
import { STEPS, DEFAULT_THETA, initialUser, stepDefaults, POLICY } from './steps';
import { STEP_IDS } from './step-ids';
import { stepEnd, stepStart } from '#lib/engine/timeline.ts';

const _noTheta: 'theta' extends keyof IDView ? never : true = true;
const SKIP = new Set(['t', 'step', 'p']);
const nums = (v: IDView) => Object.entries(v).filter(([k]) => !SKIP.has(k)) as [string, number][];
/** Fields allowed to differ across a boundary: slide returns to 0 inside its step, so it is 0 on both sides. */
const JUMP = ['slide'];

describe('steps', () => {
	it('ids, defaults and pause', () => {
		expect(_noTheta).toBe(true);
		expect(STEPS.map((s) => s.id)).toEqual([...STEP_IDS]);
		expect(STEPS[3].pause).toBe(0.3);
		expect(STEPS.filter((s) => s.pause !== undefined)).toHaveLength(1);
		expect(initialUser(0)).toEqual({ theta: DEFAULT_THETA, unit: 'deg', moved: false, guess: null });
		expect(stepDefaults()).toEqual({ guess: null });
		expect(POLICY.guess).toBe('restage');
	});
});

describe('view', () => {
	it('has no theta', () => {
		expect('theta' in view(3)).toBe(false);
	});
	it('continuous across boundaries', () => {
		for (let i = 0; i < STEPS.length - 1; i++) {
			const b = stepEnd(STEPS, i);
			const a = nums(view(b - 1e-7));
			const c = nums(view(b + 1e-7));
			a.forEach(([k, v], j) => {
				if (JUMP.includes(k)) {
					expect(v, `${k}@${b}`).toBeLessThan(1e-3);
					expect(c[j][1], `${k}@${b}`).toBeLessThan(1e-3);
				} else expect(Math.abs(v - c[j][1]), `${k}@${b}`).toBeLessThan(1e-3);
			});
		}
	});
	it('staged table', () => {
		const at = (i: number) => view(stepEnd(STEPS, i)) as unknown as Record<string, number>;
		for (let i = 0; i < STEPS.length; i++) {
			const v = at(i);
			expect(v.axes).toBeCloseTo(1, 9);
			expect(v.triangle).toBeCloseTo(1, 9);
			expect(v.squares).toBeCloseTo(i === 1 ? 1 : 0, 9);
			expect(v.ghostNeg).toBeCloseTo(i === 2 ? 1 : 0, 9);
			expect(v.ghostSupp).toBeCloseTo(i === 3 ? 1 : 0, 9);
			expect(v.ghostComp).toBeCloseTo(i === 4 ? 1 : 0, 9);
			expect(v.toggle).toBeCloseTo(i >= 2 ? 1 : 0, 9);
			expect(v.slide).toBeCloseTo(0, 9);
		}
	});
	it('nothing of the supplement answer before the predict pause', () => {
		const end = stepStart(STEPS, 3) + 0.3;
		for (let t = 0; t <= end + 1e-9; t += 0.02) {
			const v = view(t);
			expect(v.ghostSupp).toBe(0);
			expect(v.mirrorY).toBe(0);
		}
	});
});
