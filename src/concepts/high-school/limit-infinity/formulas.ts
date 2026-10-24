import { SCENARIOS, limitOf } from '#lib/limits/scenario.ts';
import { limLine, type LimLine } from '#lib/limits/tex.ts';
import type { StepId } from './step-ids.ts';
import { SCENARIO } from './steps.ts';
import type { LIView } from './view.ts';

/** Formula lines per step: the function, the one-sided limits, then the verdict (L-07). */
export function formulaLines(id: StepId, v: LIView, locale: string): LimLine[] {
	const sc = SCENARIO[id];
	if (sc === 'pen') return [];
	const s = SCENARIOS[sc];
	const out: LimLine[] = [{ tex: s.tex }];
	const num = (y: unknown) => (typeof y === 'number' ? y : null);
	if (v.lims > 0.5) out.push(limLine('left', s.at, num(s.left), locale), limLine('right', s.at, num(s.right), locale));
	if (v.lim > 0.5 && typeof s.at === 'number') {
		const L = limitOf(s);
		out.push(limLine('both', s.at, L === 'dne' ? null : L, locale));
	}
	return out;
}
