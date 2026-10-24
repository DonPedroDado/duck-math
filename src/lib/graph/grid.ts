import type { Params } from './transform.ts';

/**
 * Rubber-sheet grid (F-10): the plane transformed like the graph. The line x = k goes to
 * x = k/b + c and y = k goes to y = a·k + d. Lines outside the window (plus margin) are culled;
 * as b → 0 the vertical lines fly off and are culled rather than drawn at huge coordinates.
 */
export function gridLines(p: Params, half: number, span = 24): { v: number[]; h: number[] } {
	const lim = half + 0.5;
	const v: number[] = [];
	const h: number[] = [];
	for (let k = -span; k <= span; k++) {
		if (Math.abs(p.b) > 1e-9) {
			const x = k / p.b + p.c;
			if (Math.abs(x) <= lim) v.push(x);
		}
		const y = p.a * k + p.d;
		if (Math.abs(y) <= lim) h.push(y);
	}
	return { v, h };
}
