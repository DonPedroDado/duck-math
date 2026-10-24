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
	it('seg and ease', () => {
		expect(seg(0.5, 0, 1)).toBe(0.5);
		expect(seg(2, 0, 1)).toBe(1);
		expect(seg(-1, 0, 1)).toBe(0);
		expect(easeMath(0)).toBe(0);
		expect(easeMath(1)).toBe(1);
	});
});
