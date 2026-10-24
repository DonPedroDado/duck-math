import { fmt } from '#lib/engine/format.ts';
import { texNum } from '#lib/tex/tex.ts';
import { fmtAngle } from './display.ts';
import type { StepId } from './step-ids.ts';

const cls = (role: string, body: string) => `\\htmlClass{t-${role} link-${role}}{${body}}`;

/** Per-step TeX lines. `th` is the DISPLAYED angle. Formulas carry no language. */
export function formulaLines(step: StepId, th: number, unit: 'deg' | 'rad', locale: string): string[] {
	const N = (x: number) => texNum(fmt(x, 2, locale));
	switch (step) {
		case 'intro':
			return [];
		case 'unroll': {
			const a = texNum(fmtAngle(th, unit, locale).replace('°', ''));
			const value = unit === 'deg' ? `\\theta = ${a}^\\circ` : `\\theta \\approx ${a}`;
			return [`${cls('angle', '\\theta')} = x`, value];
		}
		case 'sine':
			return [
				`y = ${cls('sin', '\\sin\\theta')}`,
				`${cls('sin', '\\sin\\theta')} = ${cls('sin', N(Math.sin(th)))}`
			];
	}
}
