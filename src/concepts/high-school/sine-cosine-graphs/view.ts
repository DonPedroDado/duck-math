import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { TAU } from '#lib/engine/angle.ts';
import { STEPS } from './steps.ts';

export interface SGView {
	t: number;
	step: number;
	p: number;
	axes: number;
	circle: number;
	point: number;
	hint: number;
	graphAxes: number;
	connector: number;
	toggle: number;
	unroll: number;
	arc: number;
	arcLabel: number;
	sweepOn: number;
	rewind: number;
	sweep: number;
	sinTraced: number;
	peak: number;
}

/** Pure schedule: reads only t. Never the angle (D-11 single writer). */
export function view(t: number): SGView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (p: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const hint = i === 0 ? seg(p, 0.85, 1) : i === 1 ? 1 - seg(p, 0, 0.1) : 0;
	const sweepP = i === 2 ? TAU * seg(p, 0.12, 0.92) : 0;
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.2))),
		circle: layer(0, (q) => E(seg(q, 0.15, 0.5))),
		point: layer(0, (q) => E(seg(q, 0.45, 0.65))),
		hint,
		graphAxes: layer(0, (q) => E(seg(q, 0.55, 0.85))),
		connector: layer(0, (q) => E(seg(q, 0.8, 1))),
		toggle: layer(1, (q) => E(seg(q, 0, 0.15))),
		// Linear on purpose: per-sample easing lives in unrollBlend.
		unroll: i < 1 ? 0 : i === 1 ? seg(p, 0.1, 0.85) : 1,
		arc: i === 1 ? E(seg(p, 0, 0.1)) : i === 2 ? 1 - E(seg(p, 0, 0.08)) : 0,
		arcLabel: i === 1 ? E(seg(p, 0.85, 1)) : i === 2 ? 1 - E(seg(p, 0, 0.08)) : 0,
		// JUMP: sweep ownership switches at step entry; display continuity holds because rewind starts at 0.
		sweepOn: i === 2 ? 1 : 0,
		rewind: i === 2 ? E(seg(p, 0, 0.08)) : 0,
		sweep: sweepP,
		sinTraced: i < 2 ? 0 : i === 2 ? sweepP : TAU,
		peak: i === 2 ? E(seg(p, 0.92, 1)) : 0
	};
}
