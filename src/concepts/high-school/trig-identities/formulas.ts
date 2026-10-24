import { fmt } from '#lib/engine/format.ts';
import { exactFor } from '#lib/trig/special.ts';
import { texNum } from '#lib/tex/tex.ts';
import { areaTerms } from './squares.ts';
import type { StepId } from './step-ids.ts';
import type { Ghosts } from './steps.ts';

/** TeX term carrying a color class and a link role (hover links it to the visual). */
export const term = (color: string, linkRole: string, body: string) =>
	`\\htmlClass{t-${color} link-${linkRole}}{${body}}`;

const NO_GHOSTS: Ghosts = { neg: false, supp: false, comp: false };

/**
 * sin and cos lines. At a special angle the decimals switch to the exact forms from the table
 * (D-25); everywhere else they are live locale numbers.
 */
function trigLines(theta: number, unit: 'deg' | 'rad', N: (x: number) => string): string[] {
	const e = exactFor(theta);
	if (e) {
		const A = unit === 'deg' ? `${e.deg}^\\circ` : e.rad;
		return [
			`${term('cos', 'cos', `\\cos ${A}`)} = ${term('cos', 'cos', e.cos)}`,
			`${term('sin', 'sin', `\\sin ${A}`)} = ${term('sin', 'sin', e.sin)}`
		];
	}
	return [
		`${term('cos', 'cos', '\\cos\\theta')} = ${term('cos', 'cos', N(Math.cos(theta)))}`,
		`${term('sin', 'sin', '\\sin\\theta')} = ${term('sin', 'sin', N(Math.sin(theta)))}`
	];
}

const HALF_SQ = '\\left(\\tfrac{1}{2}\\right)^2';
const IMPLIES = '\\;\\Rightarrow\\;';

/**
 * x^2 + y^2 = 1 solved for the current angle: the special triangles by their reference angle
 * (squares hide the quadrant's signs), any other angle with live numbers.
 */
function pythagorasFor(theta: number, N: (x: number) => string): string {
	const x = (b: string) => term('cos', 'cos', b);
	const y = (b: string) => term('sin', 'sin', b);
	const e = exactFor(theta);
	const ref = e ? Math.min(e.deg % 180, 180 - (e.deg % 180)) : null;
	if (ref === 60) return `${x(HALF_SQ)} + ${y('y^2')} = 1 ${IMPLIES} ${y('y^2 = \\tfrac{3}{4}')}`;
	if (ref === 30) return `${x('x^2')} + ${y(HALF_SQ)} = 1 ${IMPLIES} ${x('x^2 = \\tfrac{3}{4}')}`;
	if (ref === 45) return `${x('x^2')} + ${y('x^2')} = 1 ${IMPLIES} ${x('x^2 = \\tfrac{1}{2}')}`;
	return `${x(`${N(Math.cos(theta))}^2`)} + ${y(`${N(Math.sin(theta))}^2`)} = 1`;
}

/** Per-step TeX lines with live locale numbers. Formulas carry no language. */
export function formulaLines(
	step: StepId,
	theta: number,
	unit: 'deg' | 'rad',
	locale: string,
	ghosts: Ghosts = NO_GHOSTS
): string[] {
	const N = (x: number) => texNum(fmt(x, 2, locale));
	switch (step) {
		case 'intro':
			return trigLines(theta, unit, N);
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
		case 'square45':
			return [
				`${term('point', 'one', 'x^2 + x^2 = 1')}`,
				`${term('cos', 'cos', 'x = \\tfrac{\\sqrt{2}}{2}')}`,
				...trigLines(theta, unit, N)
			];
		case 'triangle3060':
			return [pythagorasFor(theta, N), ...trigLines(theta, unit, N)];
		case 'special': {
			const lines = trigLines(theta, unit, N);
			if (ghosts.neg) lines.push(...formulaLines('negative', theta, unit, locale));
			if (ghosts.supp) lines.push(...formulaLines('supplement', theta, unit, locale));
			if (ghosts.comp) lines.push(...formulaLines('complement', theta, unit, locale));
			return lines;
		}
	}
}
