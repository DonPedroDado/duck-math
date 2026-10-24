import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { formulaLines } from './formulas.ts';
import { tex } from '#lib/tex/tex.ts';

const rad = (d: number) => (d * Math.PI) / 180;

describe('formulaLines', () => {
	it('intro is empty', () => expect(formulaLines('intro', rad(35), 'en')).toEqual([]));
	it('tan has linked terms', () => {
		const all = formulaLines('tan', rad(35), 'en')
			.map((l) => l.tex)
			.join('');
		for (const c of ['link-tan', 'link-sin', 'link-cos']) expect(all).toContain(c);
	});
	it('undefined at 90 degrees', () => {
		const last = formulaLines('tan', rad(90), 'en').at(-1)!;
		expect(last.undefinedAfter).toBe(true);
		expect(last.tex).not.toMatch(/\d/);
	});
	it('de decimal comma at 80', () => {
		expect(formulaLines('tan', rad(80), 'de').at(-1)!.tex).toContain('5{,}67');
	});
	it('sec/csc/cot definitions and poles', () => {
		expect(formulaLines('sec', rad(35), 'en')[0].tex).toContain('\\dfrac{1}{');
		expect(formulaLines('sec', rad(90), 'en').at(-1)!.undefinedAfter).toBe(true);
		expect(formulaLines('csc', rad(0), 'en').at(-1)!.undefinedAfter).toBe(true);
		expect(formulaLines('cot', rad(180), 'en').at(-1)!.undefinedAfter).toBe(true);
		expect(formulaLines('cot', rad(135), 'en').at(-1)!.tex).toContain('-1.00');
		expect(formulaLines('sec', rad(0), 'en').at(-1)!.undefinedAfter).toBeUndefined();
	});
	it('all has four linked definitions', () => {
		const ls = formulaLines('all', rad(35), 'en');
		expect(ls).toHaveLength(4);
		const all = ls.map((l) => l.tex).join('');
		for (const c of ['link-tan', 'link-sec', 'link-csc', 'link-cot']) expect(all).toContain(c);
	});
	it('every line renders for a sweep', () => {
		for (const id of ['tan', 'sec', 'csc', 'cot', 'all'] as const)
			for (let d = 0; d <= 360; d += 5)
				for (const loc of ['en', 'de'])
					for (const l of formulaLines(id, rad(d), loc)) tex(l.tex);
	});
	it('has no \\text{', () => {
		expect(readFileSync(new URL('./formulas.ts', import.meta.url), 'utf8')).not.toContain('\\text{');
	});
});
