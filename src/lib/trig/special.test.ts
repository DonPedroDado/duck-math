import { describe, it, expect } from 'vitest';
import { SPECIAL, exactFor } from './special';

const rad = (d: number) => (d * Math.PI) / 180;

/** Parses the small TeX subset used by the table. */
function atom(s: string): number {
	const mm = /^(\d*)\\sqrt\{(\d+)\}$/.exec(s);
	if (mm) return (mm[1] === '' ? 1 : Number(mm[1])) * Math.sqrt(Number(mm[2]));
	if (/^\d+$/.test(s)) return Number(s);
	throw new Error(`unparsed atom ${s}`);
}
function evalTeX(src: string): number {
	let s = src;
	let sign = 1;
	if (s.startsWith('-')) {
		sign = -1;
		s = s.slice(1);
	}
	const f = /^\\tfrac\{(.+)\}\{(\d+)\}$/.exec(s);
	if (f) return (sign * atom(f[1])) / Number(f[2]);
	return sign * atom(s);
}

describe('SPECIAL', () => {
	it('has 12 entries', () => {
		expect(SPECIAL.length).toBe(12);
		expect(SPECIAL.map((s) => s.deg)).toEqual([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330]);
	});
	it('exact strings equal the numeric values', () => {
		for (const s of SPECIAL) {
			expect(Math.abs(evalTeX(s.sin) - Math.sin(rad(s.deg)))).toBeLessThan(1e-12);
			expect(Math.abs(evalTeX(s.cos) - Math.cos(rad(s.deg)))).toBeLessThan(1e-12);
			expect(Math.abs(evalTeX(s.tan) - Math.tan(rad(s.deg)))).toBeLessThan(1e-12);
		}
	});
	it('exactFor', () => {
		expect(exactFor(rad(60))?.deg).toBe(60);
		expect(exactFor(rad(60) + 1e-6)).toBeNull();
		expect(exactFor(rad(90))).toBeNull();
	});
});
