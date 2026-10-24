import type { BaseId } from '#lib/graph/base.ts';
import { formula, symbolic, term } from '#lib/graph/tex.ts';
import type { Params } from '#lib/graph/transform.ts';
import { BASE_TEX } from './notation.ts';
import { APPLIED } from './steps.ts';
import type { StepId } from './step-ids.ts';

const ALL = ['a', 'b', 'c', 'd'] as const;
const B = term('b', '2');

/** The general form, then the live formula with every term applied so far (F-13). */
export function formulaLines(id: StepId, p: Params, locale: string, base: BaseId, revealed = true): string[] {
	if (id === 'intro') return [symbolic(ALL)];
	if (id === 'order') {
		const ref = `f(${B}(x - ${term('c', '1')}))`;
		if (!revealed) return [`g(x) = ${ref}`];
		return [
			`g(x) = f(${B}x - 1) = f(${B}(x - ${term('c', '\\tfrac{1}{2}')}))`,
			`\\text{vs. } ${ref}`
		];
	}
	// Build steps show every applied term (even at its identity value while it animates in);
	// explore shows only the terms that differ from f.
	const show = id === 'explore' ? {} : Object.fromEntries(ALL.map((r) => [r, APPLIED[id].includes(r)]));
	const out = [symbolic(ALL), formula(p, locale, show)];
	const def = BASE_TEX[base];
	if (id === 'explore' && def) out.push(def);
	return out;
}
