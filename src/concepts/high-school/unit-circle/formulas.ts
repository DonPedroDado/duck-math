import { fmt, fmtDeg, fmtRad } from '#lib/engine/format.ts';
import { texNum } from '#lib/tex/tex.ts';
import { derive } from './derive.ts';
import type { StepId } from './step-ids.ts';

const cls = (c: string, body: string) => `\\htmlClass{${c}}{${body}}`;

/** Per-step TeX lines with live locale numbers. Formulas carry no language. */
export function formulaLines(
	step: StepId,
	theta: number,
	unit: 'deg' | 'rad',
	locale: string
): string[] {
	const d = derive(theta);
	const N = (x: number) => texNum(fmt(x, 2, locale));
	const angleLine = () => {
		const D = texNum(fmtDeg(theta, locale).replace('°', ''));
		return `${cls('t-angle', '\\theta')} = ${cls('t-angle', `${D}^\\circ`)}`;
	};
	const cosT = cls('t-cos link-cos', '\\cos\\theta');
	const sinT = cls('t-sin link-sin', '\\sin\\theta');
	switch (step) {
		case 'intro':
			return [];
		case 'angle':
			return [angleLine()];
		case 'radian':
			return [cls('t-radian', '1\\ \\mathrm{rad}')];
		case 'radians': {
			if (unit === 'deg') return [angleLine()];
			const R = texNum(fmtRad(theta, locale));
			if (Math.abs(theta - Math.PI / 3) < 1e-9)
				return [
					`${cls('t-angle', '\\theta')} = ${cls('t-angle', '\\tfrac{\\pi}{3}')} \\approx ${cls('t-angle', R)}`
				];
			return [`${cls('t-angle', '\\theta')} \\approx ${cls('t-angle', R)}`];
		}
		case 'cosine':
			return [`${cosT} = x = ${cls('t-cos link-cos', N(d.cos))}`];
		case 'sine': {
			const SEP = locale === 'de' ? '\\,;\\,' : ',\\ ';
			return [
				`${cosT} = ${cls('t-cos link-cos', N(d.cos))}`,
				`${sinT} = ${cls('t-sin link-sin', N(d.sin))}`,
				`P = (${cosT}${SEP}${sinT})`
			];
		}
	}
}
