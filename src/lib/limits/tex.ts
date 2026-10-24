import { num } from '#lib/graph/tex.ts';
import type { HandleSide } from './approach.ts';

/** One formula line; `dne` appends the localized "does not exist" after the TeX. */
export interface LimLine {
	tex: string;
	dne?: boolean;
	role?: 'left' | 'right' | 'lim';
}

/** x → a from one side, or x → ±∞. */
export function arrow(side: HandleSide | 'both', a: number | 'infinity', locale: string): string {
	if (a === 'infinity') return `x \\to ${side === 'left' ? '-' : '+'}\\infty`;
	return `x \\to ${num(a, locale)}${side === 'left' ? '^-' : side === 'right' ? '^+' : ''}`;
}

/** A limit value: a number, or ±∞. */
export function limTex(y: number, locale: string): string {
	if (y === Infinity) return '+\\infty';
	if (y === -Infinity) return '-\\infty';
	return num(y, locale);
}

/** `lim_{x→a⁻} f(x) = L` (or "does not exist" when L is null). */
export function limLine(side: HandleSide | 'both', a: number | 'infinity', y: number | null, locale: string): LimLine {
	const role = side === 'both' ? 'lim' : side;
	// The whole operator carries the class: KaTeX's subscript box would swallow a hover on the subscript alone.
	const head = `\\htmlClass{t-${role} link-${role}}{\\lim\\limits_{${arrow(side, a, locale)}}} f(x)`;
	return y === null ? { tex: head, dne: true, role } : { tex: `${head} = ${limTex(y, locale)}`, role };
}
