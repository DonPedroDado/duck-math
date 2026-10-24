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
	it('every line renders for a sweep', () => {
		for (let d = 0; d <= 360; d += 5)
			for (const loc of ['en', 'de'])
				for (const l of formulaLines('tan', rad(d), loc)) tex(l.tex);
	});
	it('has no \\text{', () => {
		expect(readFileSync(new URL('./formulas.ts', import.meta.url), 'utf8')).not.toContain('\\text{');
	});
});
