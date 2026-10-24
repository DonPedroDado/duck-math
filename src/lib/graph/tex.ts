import { texNum } from '#lib/tex/tex.ts';
import { IDENTITY, type Params } from './transform.ts';

export type Role = 'a' | 'b' | 'c' | 'd';
export type Show = Partial<Record<Role, boolean>>;

/** A colored, hover-linked TeX term for a parameter role (F-07). */
export const term = (role: Role, body: string) => `\\htmlClass{t-${role} link-${role}}{${body}}`;

const cache = new Map<string, Intl.NumberFormat>();
/** Up to 2 decimals, trailing zeros dropped, locale separators, TeX-safe. */
export function num(x: number, locale: string): string {
	let f = cache.get(locale);
	if (!f) {
		f = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, useGrouping: false });
		cache.set(locale, f);
	}
	let r = Math.round(x * 100) / 100;
	if (r === 0) r = 0;
	return texNum(f.format(r).replace('-', '−'));
}

const shown = (p: Params, show: Show, r: Role) => show[r] ?? p[r] !== IDENTITY[r];

/** Factor for a or b: −1 reads as a bare minus. */
const factor = (r: Role, v: number, locale: string) => term(r, Math.abs(v + 1) < 1e-9 ? '-' : num(v, locale));

/**
 * `g(x) = a·f(b(x−c)) + d` with live numbers. Terms at their identity value are left out
 * unless `show` forces them; signs read naturally (c = −2 gives x + 2).
 */
export function formula(p: Params, locale: string, show: Show = {}, fn = 'f', lhs = 'g(x)'): string {
	let inner = 'x';
	if (shown(p, show, 'c')) {
		inner = p.c < 0 ? `x + ${term('c', num(-p.c, locale))}` : `x - ${term('c', num(p.c, locale))}`;
	}
	if (shown(p, show, 'b')) {
		const B = factor('b', p.b, locale);
		inner = inner === 'x' ? `${B}x` : `${B}(${inner})`;
	}
	let out = `${fn}(${inner})`;
	if (shown(p, show, 'a')) {
		const A = factor('a', p.a, locale);
		out = A.endsWith('{-}') ? `${A}${out}` : `${A}\\cdot ${out}`;
	}
	if (shown(p, show, 'd')) {
		out += p.d < 0 ? ` - ${term('d', num(-p.d, locale))}` : ` + ${term('d', num(p.d, locale))}`;
	}
	return lhs ? `${lhs} = ${out}` : out;
}

/** The general form with letters: a·f(b(x−c))+d, only the roles in `roles`. */
export function symbolic(roles: readonly Role[], fn = 'f', lhs = 'g(x)'): string {
	const has = (r: Role) => roles.includes(r);
	let inner = has('c') ? `x - ${term('c', 'c')}` : 'x';
	if (has('b')) inner = has('c') ? `${term('b', 'b')}(${inner})` : `${term('b', 'b')}x`;
	let out = `${fn}(${inner})`;
	if (has('a')) out = `${term('a', 'a')}\\cdot ${out}`;
	if (has('d')) out += ` + ${term('d', 'd')}`;
	return lhs ? `${lhs} = ${out}` : out;
}
