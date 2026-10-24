import { describe, it, expect } from 'vitest';
import { fmt, fmtDeg, fmtRad, degValue } from './format';

const TAU = 2 * Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

describe('fmt', () => {
	it('uses locale decimal separator', () => {
		expect(fmt(0.866, 2, 'de')).toBe('0,87');
		expect(fmt(0.866, 2, 'en')).toBe('0.87');
	});
	it('uses U+2212 and never negative zero', () => {
		expect(fmt(-0.5, 2, 'en')).toBe('−0.50');
		expect(fmt(-0.001, 2, 'en')).toBe('0.00');
		expect(fmt(-0, 2, 'de')).toBe('0,00');
	});
});

describe('fmtDeg', () => {
	it('integers and decimals', () => {
		expect(fmtDeg(Math.PI / 3, 'en')).toBe('60°');
		expect(fmtDeg(rad(59.96), 'en')).toBe('60°');
		expect(fmtDeg(rad(12.34), 'de')).toBe('12,3°');
	});
	it('wraps near 360', () => {
		expect(fmtDeg(rad(359.97), 'en')).toBe('0°');
		expect(fmtDeg(rad(359.9), 'en')).toBe('359.9°');
		expect(fmtDeg(-Math.PI / 2, 'en')).toBe('270°');
	});
});

describe('fmtRad', () => {
	it('two decimals', () => {
		expect(fmtRad(Math.PI / 3, 'de')).toBe('1,05');
		expect(fmtRad(Math.PI / 3, 'en')).toBe('1.05');
		expect(fmtRad(TAU - 1e-6, 'en')).toBe('6.28');
	});
});

describe('degValue', () => {
	it('matches fmtDeg rounding and wraps 360 to 0', () => {
		expect(degValue(Math.PI / 3)).toBe(60);
		expect(degValue(rad(59.96))).toBe(60);
		expect(degValue(rad(12.34))).toBe(12.3);
		expect(degValue(rad(359.97))).toBe(0);
		expect(degValue(rad(359.9))).toBe(359.9);
		expect(degValue(TAU - 5.3e-15)).toBe(0);
		expect(degValue(0)).toBe(0);
	});
	it('fmtDeg of a drifted 360 is 0°', () => {
		expect(fmtDeg(TAU - 5.3e-15, 'en')).toBe('0°');
	});
});
