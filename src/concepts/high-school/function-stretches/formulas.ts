import { formula, symbolic, term } from '#lib/graph/tex.ts';
import { IDENTITY } from '#lib/graph/transform.ts';
import type { StepId } from './step-ids.ts';

/** Formula lines per step: the general form, then live numbers. `revealed`: after the predict. */
export function formulaLines(id: StepId, a: number, b: number, locale: string, revealed = true): string[] {
	const p = { ...IDENTITY, a, b };
	switch (id) {
		case 'intro':
			return ['y = f(x)'];
		case 'vertical':
			return [symbolic(['a']), formula(p, locale, { a: true, b: false })];
		case 'horizontal':
			if (!revealed) return [`g(x) = f(${term('b', '2')}x)`];
			return [symbolic(['b']), formula(p, locale, { a: false, b: true })];
		// At −1 the live line itself reads −f(x) / f(−x) (F-12).
		case 'reflect-x':
			return [symbolic(['a']), formula(p, locale, { a: true, b: false })];
		case 'reflect-y':
			return [symbolic(['b']), formula(p, locale, { a: false, b: true })];
		case 'explore':
			return [symbolic(['a', 'b']), formula(p, locale, { a: true, b: true })];
	}
}
