/** g(x) = a·f(b(x−c)) + d (F-07). */
export interface Params {
	a: number;
	b: number;
	c: number;
	d: number;
}
export const IDENTITY: Params = { a: 1, b: 1, c: 0, d: 0 };

/** The input at which f is read for the new graph at x: b(x − c) (F-11). */
export const lookupSource = (p: Params, x: number) => p.b * (x - p.c);

export function apply(p: Params, f: (u: number) => number): (x: number) => number {
	return (x) => p.a * f(lookupSource(p, x)) + p.d;
}

/** Where a point (x, y) of f lands on g. Null when b = 0 (every input reads f(0); no single image). */
export function mapPoint(p: Params, [x, y]: readonly [number, number]): [number, number] | null {
	if (p.b === 0) return null;
	return [x / p.b + p.c, p.a * y + p.d];
}

/** Linear blend of params, for animating between steps. */
export function mix(p: Params, q: Params, t: number): Params {
	return {
		a: p.a + (q.a - p.a) * t,
		b: p.b + (q.b - p.b) * t,
		c: p.c + (q.c - p.c) * t,
		d: p.d + (q.d - p.d) * t
	};
}

/** Dragged param values: 0.1 steps, pulled onto whole numbers within `tol`, clamped. */
export function friendly(v: number, lo: number, hi: number, tol = 0.15): number {
	const r = Math.round(v);
	const s = Math.abs(v - r) <= tol ? r : Math.round(v * 10) / 10;
	return Math.min(hi, Math.max(lo, s)) + 0;
}
