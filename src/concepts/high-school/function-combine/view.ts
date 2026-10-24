import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import type { Params } from '#lib/graph/transform.ts';
import { STEPS, type CBUser } from './steps.ts';

export interface CBView extends Params {
	t: number;
	step: number;
	p: number;
	axes: number;
	draw: number;
	landmarks: number;
	ghost: number;
	arrows: number;
	grid: number;
	fixedX: number;
	fixedY: number;
	/** The comparison curve f(2(x − 1)) in the order step. */
	cmp: number;
}

const BUILT: Params = { a: -1.5, b: 2, c: 2, d: 1 };

/** Scheduled params; continuous across step boundaries. */
function sched(i: number, p: number): Params {
	const k = (a: number, b: number) => E(seg(p, a, b));
	switch (i) {
		case 0:
			return { a: 1, b: 1, c: 0, d: 0 };
		case 1:
			return { a: 1, b: 1, c: 2 * k(0.15, 0.6), d: 0 };
		case 2:
			return { a: 1, b: 1 + k(0.15, 0.6), c: 2, d: 0 };
		case 3:
			return { a: 1 - 2.5 * k(0.15, 0.6), b: 2, c: 2, d: 0 };
		case 4:
			return { ...BUILT, d: k(0.15, 0.6) };
		case 5: {
			// Back to f(2(x − 1)), then after the pause the answer: c = ½.
			const r = k(0, 0.2);
			return { a: -1.5 + 2.5 * r, b: 2, c: 2 - r - 0.5 * k(0.45, 0.8), d: 1 - r };
		}
		default: {
			const r = k(0, 0.3);
			return { a: 1, b: 2 - r, c: 0.5 - 0.5 * r, d: 0 };
		}
	}
}

export function view(t: number, user: CBUser): CBView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (q: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const glowIn = (own: number[]) =>
		own.includes(i) ? E(seg(p, 0.05, 0.2)) : own.includes(i - 1) ? 1 - E(seg(p, 0, 0.15)) : 0;
	const s = sched(i, p);
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.25))),
		draw: layer(0, (q) => E(seg(q, 0.2, 0.65))),
		landmarks: layer(0, (q) => E(seg(q, 0.65, 0.85))),
		ghost: layer(1, (q) => E(seg(q, 0, 0.15))),
		arrows: layer(1, (q) => E(seg(q, 0.5, 0.7))),
		grid: layer(2, (q) => E(seg(q, 0, 0.15))),
		fixedX: glowIn([3]),
		fixedY: glowIn([2]),
		cmp: i === 5 ? E(seg(p, 0.4, 0.55)) : i === 6 ? 1 - E(seg(p, 0, 0.2)) : 0,
		a: user.a ?? s.a,
		b: user.b ?? s.b,
		c: user.c ?? s.c,
		d: user.d ?? s.d
	};
}
