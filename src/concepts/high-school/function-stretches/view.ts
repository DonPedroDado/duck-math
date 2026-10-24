import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { STEPS, type SRUser } from './steps.ts';

export interface SRView {
	t: number;
	step: number;
	p: number;
	axes: number;
	draw: number;
	landmarks: number;
	ghost: number;
	arrows: number;
	/** Rubber-sheet grid (F-10). */
	grid: number;
	/** Glow of the line that stays put: y = 0 under a (steps 1, 3), x = 0 under b (steps 2, 4). */
	fixedX: number;
	fixedY: number;
	/** Mirror line in the reflection steps (F-12). */
	mirror: number;
	a: number;
	b: number;
	aUser: boolean;
	bUser: boolean;
}

/** Scheduled a and b per step; continuous across boundaries. */
function sched(i: number, p: number): { a: number; b: number } {
	switch (i) {
		case 0:
			return { a: 1, b: 1 };
		case 1:
			return { a: 1 + E(seg(p, 0.15, 0.6)), b: 1 };
		case 2:
			// a returns to 1 before the question; the answer (b → 2) plays after the pause.
			return { a: 2 - E(seg(p, 0, 0.15)), b: 1 + E(seg(p, 0.45, 0.8)) };
		case 3:
			// Slowly through 0 (linear, so the flat moment is visible), then on to −1 (F-12).
			return { a: 1 - 2 * seg(p, 0.2, 0.8), b: 2 - E(seg(p, 0, 0.15)) };
		case 4:
			return { a: -1 + 2 * E(seg(p, 0, 0.15)), b: 1 - 2 * seg(p, 0.2, 0.8) };
		default:
			return { a: 1, b: -1 + 2 * E(seg(p, 0.1, 0.5)) };
	}
}

export function view(t: number, user: SRUser): SRView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (q: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const s = sched(i, p);
	/** On in its own steps; fades out at the start of the following step (continuous). */
	const glowIn = (own: number[]) =>
		own.includes(i) ? E(seg(p, 0.05, 0.2)) : own.includes(i - 1) ? 1 - E(seg(p, 0, 0.15)) : 0;
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.25))),
		draw: layer(0, (q) => E(seg(q, 0.2, 0.65))),
		landmarks: layer(0, (q) => E(seg(q, 0.65, 0.85))),
		grid: layer(0, (q) => E(seg(q, 0.8, 1))),
		ghost: layer(1, (q) => E(seg(q, 0, 0.15))),
		arrows: layer(1, (q) => E(seg(q, 0.5, 0.7))),
		fixedX: glowIn([1, 3]),
		fixedY: glowIn([2, 4]),
		mirror:
			i === 3 || i === 4 ? E(seg(p, 0.5, 0.65)) * (1 - E(seg(p, 0.9, 1))) : 0,
		a: user.a ?? s.a,
		b: user.b ?? s.b,
		aUser: user.a !== null,
		bUser: user.b !== null
	};
}
