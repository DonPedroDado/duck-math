import { formula, num, symbolic, term } from '#lib/graph/tex.ts';
import { IDENTITY } from '#lib/graph/transform.ts';
import type { StepId } from './step-ids.ts';

/** Formula lines per step: the general form (letters), then the live numbers. */
export function formulaLines(id: StepId, c: number, d: number, locale: string): string[] {
	const p = { ...IDENTITY, c, d };
	switch (id) {
		case 'intro':
			return ['y = f(x)'];
		case 'vertical':
			return [symbolic(['d']), formula(p, locale, { c: false, d: true })];
		case 'opposite':
			return [`g(x) = f(x + ${term('c', '2')})`];
		case 'lookup': {
			// f(x + 2) = f(x − (−2)): the + inside is a negative c (F-11).
			if (c < 0) {
				const k = num(-c, locale);
				return [
					`g(x) = f(x + ${term('c', k)})`,
					`\\phantom{g(x)} = f(x - (${term('c', `-${k}`)}))`,
					`${term('c', 'c')} = ${term('c', `-${k}`)}`
				];
			}
			return [symbolic(['c']), formula(p, locale, { c: true, d: false })];
		}
		case 'horizontal':
			return [symbolic(['c']), formula(p, locale, { c: true, d: false })];
		case 'both':
			return [symbolic(['c', 'd']), formula(p, locale, { c: true, d: true })];
	}
}
