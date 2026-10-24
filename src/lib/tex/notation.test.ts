import { describe, it, expect } from 'vitest';
import { tex } from './tex.ts';
import { trigName, trigTex } from './notation.ts';

describe('trig notation per locale (R-02)', () => {
	it('international names in en and de', () => {
		for (const l of ['en', 'de']) {
			expect(trigName('tan', l)).toBe('tan');
			expect(trigTex('csc', l)).toBe('\\csc');
		}
	});
	it('Russian school names in ru; sin, cos and sec unchanged', () => {
		expect(['tan', 'cot', 'csc', 'sin', 'cos', 'sec'].map((f) => trigName(f as never, 'ru'))).toEqual([
			'tg', 'ctg', 'cosec', 'sin', 'cos', 'sec'
		]);
		expect(trigTex('tan', 'ru')).toBe('\\operatorname{tg}');
		expect(trigTex('sin', 'ru')).toBe('\\sin');
	});
	it('renders in KaTeX', () => {
		expect(tex(`${trigTex('cot', 'ru')}\\theta`)).toContain('ctg');
	});
});
