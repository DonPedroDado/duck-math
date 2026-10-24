import { describe, it, expect } from 'vitest';
import { locate, stepStart, stepEnd, totalDuration, seg, easeMath } from './timeline';
import { STEPS } from '#concepts/high-school/unit-circle/steps.ts';

describe('timeline', () => {
	it('durations and bounds', () => {
		expect(totalDuration(STEPS)).toBeCloseTo(15.5, 9);
		expect(stepEnd(STEPS, 1)).toBeCloseTo(4.5, 9);
		expect(stepStart(STEPS, 2)).toBeCloseTo(4.5, 9);
		expect(stepStart(STEPS, 0)).toBe(0);
	});
	it('locate', () => {
		expect(locate(STEPS, 0)).toMatchObject({ i: 0, p: 0 });
		expect(locate(STEPS, 4.5)).toMatchObject({ i: 1, p: 1 });
		const l = locate(STEPS, 4.5000001);
		expect(l.i).toBe(2);
		expect(l.p).toBeCloseTo(0, 5);
		expect(locate(STEPS, 99)).toMatchObject({ i: 5, p: 1 });
		expect(locate(STEPS, -3)).toMatchObject({ i: 0, p: 0 });
	});
	it('zero-length windows and steps never produce NaN', () => {
		expect(seg(0.4, 0.5, 0.5)).toBe(0);
		expect(seg(0.5, 0.5, 0.5)).toBe(1);
		expect(seg(0.6, 0.5, 0.5)).toBe(1);
		const Z = [
			{ id: 'a', dur: 1 },
			{ id: 'b', dur: 0 },
			{ id: 'c', dur: 1 }
		];
		expect(locate(Z, 1)).toMatchObject({ i: 0, p: 1 });
		expect(locate([{ id: 'z', dur: 0 }], 0)).toMatchObject({ i: 0, p: 1 });
		for (const t of [0, 0.5, 1, 1.5, 2]) expect(Number.isNaN(locate(Z, t).p)).toBe(false);
	});
	it('seg and ease', () => {
		expect(seg(0.5, 0, 1)).toBe(0.5);
		expect(seg(2, 0, 1)).toBe(1);
		expect(seg(-1, 0, 1)).toBe(0);
		expect(easeMath(0)).toBe(0);
		expect(easeMath(1)).toBe(1);
	});
});
