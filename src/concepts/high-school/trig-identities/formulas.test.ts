import { describe, it, expect } from 'vitest';
import { tex } from '#lib/tex/tex.ts';
import { formulaLines } from './formulas';
import { STEP_IDS } from './step-ids';

const rad = (d: number) => (d * Math.PI) / 180;

describe('formulaLines', () => {
	it('link roles per step', () => {
		const has = (id: (typeof STEP_IDS)[number], role: string) =>
			formulaLines(id, rad(50), 'deg', 'en').some((l) => l.includes(`link-${role}`));
		expect(has('intro', 'cos')).toBe(true);
		expect(has('intro', 'sin')).toBe(true);
		for (const r of ['cos2', 'sin2', 'one']) expect(has('pythagoras', r)).toBe(true);
		expect(has('negative', 'ghost-neg')).toBe(true);
		expect(has('supplement', 'ghost-supp')).toBe(true);
		expect(has('complement', 'ghost-comp')).toBe(true);
	});
	it('radian variants use pi', () => {
		expect(formulaLines('supplement', rad(50), 'rad', 'en').join('')).toContain('\\pi');
		expect(formulaLines('complement', rad(50), 'rad', 'en').join('')).toContain('\\pi');
		expect(formulaLines('supplement', rad(50), 'deg', 'en').join('')).toContain('180^\\circ');
	});
	it('german area line uses a decimal comma', () => {
		expect(formulaLines('pythagoras', rad(50), 'deg', 'de')[1]).toContain('{,}');
	});
	it('exact values at special angles, decimals elsewhere', () => {
		const de60 = formulaLines('special', rad(60), 'deg', 'de').join('');
		expect(de60).toContain('\\sqrt{3}');
		expect(de60).not.toContain('{,}');
		expect(formulaLines('special', rad(61), 'deg', 'de').join('')).toContain('{,}');
		expect(formulaLines('special', rad(210), 'deg', 'en').join('')).toContain('-\\tfrac{1}{2}');
		expect(formulaLines('intro', rad(60), 'rad', 'en').join('')).toContain('\\tfrac{\\pi}{3}');
	});
	it('derivation steps and ghost toggles', () => {
		expect(formulaLines('square45', rad(45), 'deg', 'en')[0]).toContain('x^2 + x^2 = 1');
		expect(formulaLines('triangle3060', rad(60), 'deg', 'en').join('')).toContain('\\sin 30^\\circ');
		const at30 = formulaLines('triangle3060', rad(30), 'deg', 'en').join('');
		expect(at30.split('\\sin 30^\\circ').length - 1).toBe(1);
		const g = { neg: true, supp: false, comp: false };
		expect(formulaLines('special', rad(50), 'deg', 'en', g).join('')).toContain('link-ghost-neg');
		expect(formulaLines('special', rad(50), 'deg', 'en').join('')).not.toContain('link-ghost-neg');
	});
	it('every line renders in both locales', () => {
		for (const locale of ['en', 'de'])
			for (const unit of ['deg', 'rad'] as const)
				for (let d = 0; d < 360; d += 5)
					for (const id of STEP_IDS)
						for (const l of formulaLines(id, rad(d), unit, locale, { neg: true, supp: true, comp: true })) expect(() => tex(l)).not.toThrow();
	});
});
