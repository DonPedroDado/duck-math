import { fmtValue } from '#lib/engine/format.ts';
import { texNum } from '#lib/tex/tex.ts';
import { ratio } from '#lib/trig/ratios.ts';
import type { StepId } from './step-ids.ts';

export interface FormulaLine {
	tex: string;
	/** The Panel prints the localized "undefined" text after the formula (never inside TeX). */
	undefinedAfter?: boolean;
}

const cls = (role: string, body: string) => `\\htmlClass{t-${role} link-${role}}{${body}}`;

/** Per-step TeX lines with live locale numbers. Formulas carry no language. */
export function formulaLines(step: StepId, theta: number, locale: string): FormulaLine[] {
	switch (step) {
		case 'intro':
			return [];
		case 'tan': {
			const tan = cls('tan', '\\tan\\theta');
			const sin = cls('sin', '\\sin\\theta');
			const cos = cls('cos', '\\cos\\theta');
			const r = ratio('tan', theta);
			const value: FormulaLine =
				r.kind === 'defined'
					? { tex: `${tan} = ${cls('tan', texNum(fmtValue(r.value, locale)))}` }
					: { tex: `${tan} =`, undefinedAfter: true };
			return [
				{ tex: `${tan} = \\dfrac{${sin}}{${cos}}` },
				{ tex: `\\dfrac{${sin}}{${cos}} = \\dfrac{${tan}}{1}` },
				value
			];
		}
	}
}
