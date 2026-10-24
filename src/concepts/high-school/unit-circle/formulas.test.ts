import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { formulaLines } from './formulas.ts';
import { STEP_IDS } from './step-ids.ts';
import { tex } from '#lib/tex/tex.ts';

const P3 = Math.PI / 3;
describe('formulaLines', () => {
	it('intro is empty', () => expect(formulaLines('intro', P3, 'deg', 'en')).toEqual([]));
	it('cosine de/en', () => {
		const de = formulaLines('cosine', P3, 'rad', 'de')[0];
		expect(de).toContain('0{,}50');
		expect(de).toContain('t-cos');
		expect(formulaLines('cosine', P3, 'rad', 'en')[0]).toContain('0.50');
	});
	it('sine has 3 lines', () => {
		const de = formulaLines('sine', P3, 'rad', 'de');
		expect(de).toHaveLength(3);
		expect(de[1]).toContain('0{,}87');
		expect(de[1]).toContain('t-sin');
		expect(de[2]).toContain('\\,;\\,');
		expect(formulaLines('sine', P3, 'rad', 'en')[2]).toContain(',\\ ');
	});
	it('links cos/sin terms only on cosine/sine steps', () => {
		const lines = formulaLines('sine', P3, 'rad', 'en').join('');
		expect(lines).toContain('link-cos');
		expect(lines).toContain('link-sin');
		expect(formulaLines('angle', P3, 'rad', 'en').join('')).not.toContain('link-');
	});
	it('negative uses ASCII minus', () => {
		expect(formulaLines('cosine', (2 * Math.PI) / 3, 'rad', 'en')[0]).toContain('-0.50');
	});
	it('never -0', () => {
		const l = formulaLines('cosine', Math.PI / 2, 'rad', 'en')[0];
		expect(l).toContain('0.00');
		expect(l).not.toContain('-0.00');
	});
	it('radians default and other', () => {
		const a = formulaLines('radians', P3, 'rad', 'en')[0];
		expect(a).toContain('\\tfrac{\\pi}{3}');
		expect(a).toContain('1.05');
		const b = formulaLines('radians', 2, 'rad', 'en')[0];
		expect(b).toContain('\\approx');
		expect(b).toContain('2.00');
		expect(b).not.toContain('tfrac');
		expect(formulaLines('radians', P3, 'deg', 'en')[0]).toContain('60^\\circ');
	});
	it('angle and radian', () => {
		const a = formulaLines('angle', P3, 'deg', 'en')[0];
		expect(a).toContain('t-angle');
		expect(a).toContain('60^\\circ');
		const r = formulaLines('radian', 1, 'deg', 'en')[0];
		expect(r).toContain('t-radian');
		expect(r).toContain('\\mathrm{rad}');
	});
	it('all lines render for random theta', () => {
		for (let i = 0; i < 50; i++) {
			const th = Math.random() * 4 * Math.PI - Math.PI;
			for (const loc of ['en', 'de'])
				for (const unit of ['deg', 'rad'] as const)
					for (const s of STEP_IDS) for (const l of formulaLines(s, th, unit, loc)) tex(l);
		}
	});
	it('has no \\text{', () => {
		expect(readFileSync(new URL('./formulas.ts', import.meta.url), 'utf8')).not.toContain('\\text{');
	});
});
