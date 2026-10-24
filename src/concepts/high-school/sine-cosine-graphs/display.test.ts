import { describe, expect, it } from 'vitest';
import { displayTheta, fmtAngle } from './display.ts';

const v = (sweepOn: number, rewind: number, sweep: number) => ({ sweepOn, rewind, sweep });

describe('displayTheta', () => {
	it('user theta when no sweep', () => {
		expect(displayTheta(v(0, 0, 0), { theta: 1, moved: false })).toBe(1);
	});
	it('rewinds user theta', () => {
		expect(displayTheta(v(1, 0.5, 0), { theta: 1, moved: false })).toBe(0.5);
	});
	it('shows sweep after rewind', () => {
		expect(displayTheta(v(1, 1, 3), { theta: 1, moved: false })).toBe(3);
	});
	it('moved wins', () => {
		expect(displayTheta(v(1, 1, 3), { theta: 1, moved: true })).toBe(1);
	});
});

describe('fmtAngle', () => {
	it('formats unwrapped', () => {
		expect(fmtAngle(2 * Math.PI, 'deg', 'en')).toBe('360°');
		expect(fmtAngle(4 * Math.PI, 'deg', 'de')).toBe('720°');
		expect(fmtAngle(Math.PI / 3, 'rad', 'de')).toBe('1,05');
		expect(fmtAngle(Math.PI / 3, 'deg', 'en')).toBe('60°');
	});
});
