import { fmt } from '#lib/engine/format.ts';
import { texNum } from '#lib/tex/tex.ts';
import { areaTerms } from './squares.ts';
import type { StepId } from './step-ids.ts';

/** TeX term carrying a color class and a link role (hover links it to the visual). */
export const term = (color: string, linkRole: string, body: string) =>
	`\\htmlClass{t-${color} link-${linkRole}}{${body}}`;

/** Per-step TeX lines with live locale numbers. Formulas carry no language. */
export function formulaLines(
	step: StepId,
	theta: number,
	unit: 'deg' | 'rad',
	locale: string
): string[] {
	const N = (x: number) => texNum(fmt(x, 2, locale));
	switch (step) {
		case 'intro':
			return [
				`${term('cos', 'cos', '\\cos\\theta')} = ${term('cos', 'cos', N(Math.cos(theta)))}`,
				`${term('sin', 'sin', '\\sin\\theta')} = ${term('sin', 'sin', N(Math.sin(theta)))}`
			];
		case 'pythagoras': {
			const a = areaTerms(theta, locale);
			return [
				`${term('cos', 'cos2', '\\cos^2\\theta')} + ${term('sin', 'sin2', '\\sin^2\\theta')} = ${term('point', 'one', '1')}`,
				`${term('cos', 'cos2', texNum(a.a))} + ${term('sin', 'sin2', texNum(a.b))} = ${term('point', 'one', texNum(a.sum))}`
			];
		}
		case 'negative':
			return [
				`${term('sin', 'ghost-neg', '\\sin(-\\theta)')} = -${term('sin', 'sin', '\\sin\\theta')}`,
				`${term('cos', 'ghost-neg', '\\cos(-\\theta)')} = ${term('cos', 'cos', '\\cos\\theta')}`
			];
		case 'supplement': {
			const a = unit === 'deg' ? '180^\\circ-\\theta' : '\\pi-\\theta';
			return [
				`${term('sin', 'ghost-supp', `\\sin(${a})`)} = ${term('sin', 'sin', '\\sin\\theta')}`,
				`${term('cos', 'ghost-supp', `\\cos(${a})`)} = -${term('cos', 'cos', '\\cos\\theta')}`
			];
		}
		case 'complement': {
			const a = unit === 'deg' ? '90^\\circ-\\theta' : '\\tfrac{\\pi}{2}-\\theta';
			return [
				`${term('sin', 'ghost-comp', `\\sin(${a})`)} = ${term('cos', 'cos', '\\cos\\theta')}`,
				`${term('cos', 'ghost-comp', `\\cos(${a})`)} = ${term('sin', 'sin', '\\sin\\theta')}`
			];
		}
	}
}
