import { SCENARIOS, type Side } from '#lib/limits/scenario.ts';
import { limLine, type LimLine } from '#lib/limits/tex.ts';
import type { StepId } from './step-ids.ts';
import { SCENARIO } from './steps.ts';
import type { LAView } from './view.ts';

const val = (s: Side) => (s === 'osc' ? null : s);

/** Formula lines per step: the function, then the one-sided limits, then the verdict (L-07). */
export function formulaLines(id: StepId, v: LAView, locale: string): LimLine[] {
	const s = SCENARIOS[SCENARIO[id]];
	const a = s.at as number;
	const out: LimLine[] = [{ tex: s.tex }];
	if (id === 'intro') return out;
	if (id === 'predict') {
		out.push({
			tex: v.subst > 0.5 ? 'f(1) = \\dfrac{1^2 - 1}{1 - 1} = \\dfrac{0}{0}' : 'f(1) = \\,?'
		});
		return out;
	}
	if (v.lims > 0.5) {
		out.push(limLine('left', a, val(s.left), locale), limLine('right', a, val(s.right), locale));
	}
	if (v.lim > 0.5) {
		const both = s.left === s.right && s.left !== 'osc' ? s.left : null;
		const line = limLine('both', a, both, locale);
		if (id === 'value' && v.filled > 0.5) line.tex += ` \\ne ${s.value} = f(${a})`;
		out.push(line);
	}
	return out;
}
