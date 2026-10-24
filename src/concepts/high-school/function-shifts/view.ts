import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { STEPS, type SHUser } from './steps.ts';

export interface SHView {
	t: number;
	step: number;
	p: number;
	axes: number;
	/** f draws on from the left. */
	draw: number;
	landmarks: number;
	/** Dashed original f (F-09). */
	ghost: number;
	/** Landmark arrows old → new. */
	arrows: number;
	/** Input-lookup arrows (F-11). */
	lookup: number;
	/** Effective params: the dragged value when there is one, else the schedule. */
	c: number;
	d: number;
	/** True when c/d come from the student, not the schedule. */
	cUser: boolean;
	dUser: boolean;
	hint: number;
}

/** Scheduled c and d per step; continuous across step boundaries. */
function sched(i: number, p: number): { c: number; d: number } {
	switch (i) {
		case 0:
			return { c: 0, d: 0 };
		case 1:
			return { c: 0, d: 2 * E(seg(p, 0.15, 0.6)) };
		case 2:
			// d returns to 0 before the question; the answer (c → −2) plays after the pause.
			return { c: -2 * E(seg(p, 0.4, 0.75)), d: 2 * (1 - E(seg(p, 0, 0.18))) };
		case 3:
		case 4:
			return { c: -2, d: 0 };
		default:
			return { c: -2, d: 1.5 * E(seg(p, 0.15, 0.55)) };
	}
}

export function view(t: number, user: SHUser): SHView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (q: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const s = sched(i, p);
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.25))),
		draw: layer(0, (q) => E(seg(q, 0.2, 0.65))),
		landmarks: layer(0, (q) => E(seg(q, 0.65, 0.85))),
		hint: i === 0 ? seg(p, 0.85, 1) : 0,
		ghost: layer(1, (q) => E(seg(q, 0, 0.15))),
		arrows:
			i === 1
				? E(seg(p, 0.55, 0.75))
				: i === 2
					? 1 - E(seg(p, 0, 0.15)) + E(seg(p, 0.7, 0.85))
					: i === 3
						? 1 - E(seg(p, 0, 0.15))
						: i === 4
							? E(seg(p, 0, 0.2))
							: i === 5
								? 1
								: 0,
		lookup: i === 3 ? E(seg(p, 0.15, 0.45)) : i === 4 ? 1 - E(seg(p, 0, 0.15)) : 0,
		c: user.c ?? s.c,
		d: user.d ?? s.d,
		cUser: user.c !== null,
		dUser: user.d !== null
	};
}
