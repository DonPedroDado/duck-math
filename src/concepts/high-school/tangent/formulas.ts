import { fmtValue } from '#lib/engine/format.ts';
import { texNum } from '#lib/tex/tex.ts';
import { ratio, type Fn } from '#lib/trig/ratios.ts';
import type { StepId } from './step-ids.ts';

export interface FormulaLine {
	tex: string;
	/** The Panel prints the localized "undefined" text after the formula (never inside TeX). */
	undefinedAfter?: boolean;
}

const cls = (role: string, body: string) => `\\htmlClass{t-${role} link-${role}}{${body}}`;

function valueLine(fn: Fn, theta: number, locale: string): FormulaLine {
	const lhs = cls(fn, `\\${fn}\\theta`);
	const r = ratio(fn, theta);
	return r.kind === 'defined'
		? { tex: `${lhs} = ${cls(fn, texNum(fmtValue(r.value, locale)))}` }
		: { tex: `${lhs} =`, undefinedAfter: true };
}

/** Per-step TeX lines with live locale numbers. Formulas carry no language. */
export function formulaLines(step: StepId, theta: number, locale: string): FormulaLine[] {
	const sin = cls('sin', '\\sin\\theta');
	const cos = cls('cos', '\\cos\\theta');
	switch (step) {
		case 'intro':
			return [];
		case 'tan': {
			const tan = cls('tan', '\\tan\\theta');
			return [
				{ tex: `${tan} = \\dfrac{${sin}}{${cos}}` },
				{ tex: `\\dfrac{${sin}}{${cos}} = \\dfrac{${tan}}{1}` },
				valueLine('tan', theta, locale)
			];
		}
		case 'sec':
			return [
				{ tex: `${cls('sec', '\\sec\\theta')} = \\dfrac{1}{${cos}}` },
				valueLine('sec', theta, locale)
			];
		case 'csc':
			return [
				{ tex: `${cls('csc', '\\csc\\theta')} = \\dfrac{1}{${sin}}` },
				valueLine('csc', theta, locale)
			];
		case 'cot':
			return [
				{ tex: `${cls('cot', '\\cot\\theta')} = \\dfrac{${cos}}{${sin}}` },
				valueLine('cot', theta, locale)
			];
		case 'all':
			return [
				{ tex: `${cls('tan', '\\tan\\theta')} = \\dfrac{${sin}}{${cos}}` },
				{ tex: `${cls('sec', '\\sec\\theta')} = \\dfrac{1}{${cos}}` },
				{ tex: `${cls('csc', '\\csc\\theta')} = \\dfrac{1}{${sin}}` },
				{ tex: `${cls('cot', '\\cot\\theta')} = \\dfrac{${cos}}{${sin}}` }
			];
	}
}
