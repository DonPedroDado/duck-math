import { seg, easeMath as E } from '#lib/engine/timeline.ts';

export const UNROLL_N = 64;

/** Per-sample blend 0 (on circle) to 1 (on axis); the root (k = 0) leaves first. */
export const unrollBlend = (k: number, n: number, q: number): number =>
	E(seg(q, (k / n) * 0.6, (k / n) * 0.6 + 0.4));

type P = [number, number];

/** Pure peel of the arc [0, theta] from the circle onto the graph axis. */
export function unrollPoints(
	theta: number,
	q: number,
	onCircle: (s: number) => P,
	onAxis: (s: number) => P,
	n = UNROLL_N
): P[] {
	if (theta < 1e-6) return [];
	const out: P[] = [];
	for (let k = 0; k <= n; k++) {
		const s = (theta * k) / n;
		const b = unrollBlend(k, n, q);
		const a = onCircle(s);
		const c = onAxis(s);
		out.push(b === 0 ? a : b === 1 ? c : [a[0] + (c[0] - a[0]) * b, a[1] + (c[1] - a[1]) * b]);
	}
	return out;
}
