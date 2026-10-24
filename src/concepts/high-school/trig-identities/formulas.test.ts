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
	it('every line renders in both locales', () => {
		for (const locale of ['en', 'de'])
			for (const unit of ['deg', 'rad'] as const)
				for (let d = 0; d < 360; d += 7)
					for (const id of STEP_IDS)
						for (const l of formulaLines(id, rad(d), unit, locale)) expect(() => tex(l)).not.toThrow();
	});
});
