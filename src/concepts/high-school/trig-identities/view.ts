import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { STEPS } from './steps.ts';

export interface IDView {
	t: number;
	step: number;
	p: number;
	axes: number;
	circle: number;
	point: number;
	hint: number;
	triangle: number;
	squares: number;
	slide: number;
	mirrorX: number;
	ghostNeg: number;
	mirrorY: number;
	ghostSupp: number;
	mirrorD: number;
	ghostComp: number;
	swap: number;
	toggle: number;
	sq45: number;
	diag: number;
	halfFade: number;
	eqTri: number;
	alt: number;
	halfFade60: number;
	mirror30: number;
	chips: number;
	tools: number;
}

/** Pure schedule: reads only t. Never the angle (PD-1). */
export function view(t: number): IDView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (p: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	/** Visible only in step k; fades out over the first 10% of the next step so nothing jumps. */
	const only = (k: number, fin: (p: number) => number) =>
		i === k ? fin(p) : i === k + 1 ? 1 - E(seg(p, 0, 0.1)) : 0;
	const hint = i === 0 ? seg(p, 0.8, 1) : i === 1 ? 1 - seg(p, 0, 0.1) : 0;
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.2))),
		circle: layer(0, (q) => E(seg(q, 0.15, 0.5))),
		point: layer(0, (q) => E(seg(q, 0.45, 0.65))),
		hint,
		triangle: layer(0, (q) => E(seg(q, 0.6, 0.95))),
		squares: only(1, (q) => E(seg(q, 0, 0.35))),
		slide: i === 1 ? E(seg(p, 0.45, 0.6)) - E(seg(p, 0.8, 0.95)) : 0,
		mirrorX: only(2, (q) => E(seg(q, 0, 0.15))),
		ghostNeg: only(2, (q) => E(seg(q, 0.15, 0.5))),
		mirrorY: only(3, (q) => E(seg(q, 0.12, 0.3))),
		ghostSupp: only(3, (q) => E(seg(q, 0.3, 0.6))),
		mirrorD: only(4, (q) => E(seg(q, 0, 0.15))),
		ghostComp: only(4, (q) => E(seg(q, 0.15, 0.5))),
		swap: only(4, (q) => E(seg(q, 0.5, 0.8))),
		toggle: layer(2, (q) => E(seg(q, 0, 0.15))),
		sq45: only(5, (q) => E(seg(q, 0, 0.3))),
		diag: only(5, (q) => E(seg(q, 0.25, 0.45))),
		halfFade: layer(5, (q) => E(seg(q, 0.5, 0.75))),
		eqTri: only(6, (q) => E(seg(q, 0, 0.25))),
		alt: only(6, (q) => E(seg(q, 0.25, 0.45))),
		halfFade60: layer(6, (q) => E(seg(q, 0.45, 0.65))),
		mirror30: only(6, (q) => E(seg(q, 0.7, 0.9))),
		chips: i >= 6 ? (i === 6 ? E(seg(p, 0.9, 1)) : 1) : 0,
		tools: layer(7, (q) => E(seg(q, 0, 0.3)))
	};
}
