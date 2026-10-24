import { describe, it, expect } from 'vitest';
import { formulaLines } from './formulas.ts';
import { STEP_IDS } from './step-ids.ts';
import { tex } from '#lib/tex/tex.ts';

const P3 = Math.PI / 3;
describe('formulaLines', () => {
	it('intro is empty', () => expect(formulaLines('intro', P3, 'deg', 'en')).toEqual([]));
	it('unroll links the angle', () => {
		const l = formulaLines('unroll', P3, 'deg', 'en');
		expect(l[0]).toContain('t-angle link-angle');
		expect(l[1]).toContain('60^\\circ');
		expect(formulaLines('unroll', P3, 'rad', 'en')[1]).toContain('\\approx 1.05');
	});
	it('sine links sin, de uses decimal comma', () => {
		const en = formulaLines('sine', P3, 'rad', 'en');
		expect(en.join('')).toContain('link-sin');
		expect(en[1]).toContain('0.87');
		expect(formulaLines('sine', P3, 'rad', 'de')[1]).toContain('0{,}87');
	});
	it('renders for a sweep over 0..2π', () => {
		for (const id of STEP_IDS)
			for (let k = 0; k <= 24; k++)
				for (const unit of ['deg', 'rad'] as const)
					for (const loc of ['en', 'de'])
						for (const line of formulaLines(id, (k * Math.PI) / 12, unit, loc))
							expect(() => tex(line)).not.toThrow();
	});
});
