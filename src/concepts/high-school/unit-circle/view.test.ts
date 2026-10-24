import { describe, it, expect } from 'vitest';
import { view, type UCView } from './view';
import { STEPS, DEFAULT_THETA, stepDefaults, initialUser } from './steps';
import { STEP_IDS } from './step-ids';
import { stepEnd, stepStart } from '#lib/engine/timeline.ts';

const _noTheta: 'theta' extends keyof UCView ? never : true = true;
const SKIP = new Set(['t', 'step', 'p']);
const nums = (v: UCView) => Object.entries(v).filter(([k]) => !SKIP.has(k)) as [string, number][];

describe('steps', () => {
	it('ids and defaults', () => {
		expect(_noTheta).toBe(true);
		expect(STEPS.map((s) => s.id)).toEqual([...STEP_IDS]);
		expect(initialUser(0).unit).toBe('deg');
		expect(initialUser(4).unit).toBe('rad');
		expect(initialUser(0).theta).toBe(Math.PI / 3);
		expect(DEFAULT_THETA).toBe(Math.PI / 3);
		expect(stepDefaults(1, 2)).toEqual({ unit: 'deg' });
		expect(stepDefaults(3, 2)).toEqual({ unit: 'rad' });
		expect(stepDefaults(4, 1)).toEqual({ unit: 'rad' });
		expect(stepDefaults(5, 4)).toEqual({});
	});
});

describe('view', () => {
	it('has no theta', () => {
		expect('theta' in view(3, { unit: 'deg' })).toBe(false);
	});
	it('continuous across boundaries', () => {
		for (const unit of ['deg', 'rad'] as const)
			for (const b of [2.0, 4.5, 8.5, 10.5, 13.0]) {
				const a = nums(view(b - 1e-7, { unit }));
				const c = nums(view(b + 1e-7, { unit }));
				a.forEach(([k, v], j) => expect(Math.abs(v - c[j][1]), `${k}@${b}`).toBeLessThan(1e-3));
			}
	});
	it('staged values', () => {
		const intro = ['axes', 'circle', 'point'];
		const later: [number, string[]][] = [
			[1, ['arc', 'thetaLabel', 'readout']],
			[2, ['radian', 'oneRadLabel', 'piLabel']],
			[3, ['copiesDim', 'toggle']],
			[4, ['cosDrop', 'cosSeg', 'cosLabel']],
			[5, ['sinDrop', 'sinSeg', 'sinLabel']]
		];
		for (let i = 0; i < 6; i++) {
			const v = view(stepEnd(STEPS, i), { unit: 'deg' }) as unknown as Record<string, number>;
			for (const k of intro) expect(v[k]).toBeCloseTo(1, 9);
			for (const [k, ks] of later) for (const f of ks) expect(v[f], `${f}@${i}`).toBeCloseTo(i >= k ? 1 : 0, 9);
			if (i >= 2) expect(v.hint).toBe(0);
		}
	});
	it('unitBlend', () => {
		for (let t = 0; t <= 15.5; t += 0.1) expect(view(t, { unit: 'deg' }).unitBlend).toBe(0);
		expect(view(stepEnd(STEPS, 3), { unit: 'rad' }).unitBlend).toBe(1);
		const mid = view(stepStart(STEPS, 3) + 0.4, { unit: 'rad' }).unitBlend;
		expect(mid).toBeGreaterThan(0);
		expect(mid).toBeLessThan(1);
	});
});
