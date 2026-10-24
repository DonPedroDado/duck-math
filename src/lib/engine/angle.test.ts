import { describe, it, expect } from 'vitest';
import { TAU, DISPLAY_EPS, norm, snapTheta } from './angle';
import { degValue, fmtDeg, fmtRad } from './format';

const rad = (d: number) => (d * Math.PI) / 180;

describe('norm', () => {
	it('wraps into [0, TAU) and snaps float drift to 0', () => {
		expect(norm(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 12);
		expect(norm(TAU)).toBe(0);
		expect(norm(TAU - 1e-12)).toBe(0);
	});
});

describe('snapTheta', () => {
	it('snaps the band just below 360° to exactly 0 (model agrees with display)', () => {
		expect(snapTheta(TAU - 5e-4)).toBe(0);
		expect(degValue(snapTheta(TAU - 5e-4))).toBe(0);
		expect(fmtRad(snapTheta(TAU - 5e-4), 'en')).toBe('0.00');
		expect(fmtDeg(snapTheta(rad(359.97)), 'en')).toBe('0°');
	});
	it('snaps the band just above 0° to exactly 0', () => {
		expect(snapTheta(rad(0.03))).toBe(0);
		expect(snapTheta(DISPLAY_EPS / 2)).toBe(0);
	});
	it('leaves displayable angles untouched', () => {
		expect(snapTheta(rad(0.06))).toBeCloseTo(rad(0.06), 12);
		expect(degValue(snapTheta(rad(0.06)))).toBe(0.1);
		expect(snapTheta(rad(359.9))).toBeCloseTo(rad(359.9), 12);
		expect(snapTheta(Math.PI / 3)).toBeCloseTo(Math.PI / 3, 12);
	});
	it('a nonzero snapped theta never displays as 0°', () => {
		for (let i = 0; i < 2000; i++) {
			const t = snapTheta((i / 2000) * rad(0.2));
			if (t > 0) expect(degValue(t)).not.toBe(0);
			const u = snapTheta(TAU - (i / 2000) * rad(0.2));
			if (u > 0) expect(degValue(u)).not.toBe(0);
		}
	});
});
