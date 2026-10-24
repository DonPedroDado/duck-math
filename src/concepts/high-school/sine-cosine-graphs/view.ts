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
	range: number;
	cosRotate: number;
	cosRot: number;
	cosTraced: number;
	shift: number;
}

/** Pure schedule: reads only t. Never the angle (D-11 single writer). */
export function view(t: number): SGView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (p: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const hint = i === 0 ? seg(p, 0.85, 1) : i === 1 ? 1 - seg(p, 0, 0.1) : 0;
	// Continuous across steps (holds the previous end value) so only ownership flags jump.
	const sweep =
		i < 2 ? 0 : i === 2 ? TAU * seg(p, 0.12, 0.92) : i === 3 ? TAU : i === 4 ? TAU + TAU * seg(p, 0.3, 0.95) : 2 * TAU;
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
		// JUMP: sweep ownership switches at step entry; display continuity holds because the staged theta equals the sweep start.
		sweepOn: i === 2 || i === 4 ? 1 : 0,
		rewind: i === 2 ? E(seg(p, 0, 0.08)) : i === 4 ? 1 : 0,
		sweep,
		sinTraced: i < 2 ? 0 : i === 2 ? sweep : i === 3 ? TAU : i === 4 ? sweep : 2 * TAU,
		peak: i === 2 ? E(seg(p, 0.92, 1)) : i === 3 ? 1 - E(seg(p, 0, 0.1)) : 0,
		range: i < 4 ? TAU : i === 4 ? TAU + TAU * E(seg(p, 0, 0.3)) : 2 * TAU,
		// 0..1 = 0..90 degrees; stays at 1 afterwards so nothing jumps.
		cosRotate: i < 3 ? 0 : i === 3 ? E(seg(p, 0, 0.3)) : 1,
		// Fades in briefly so the rotating segment never pops at the step boundary.
		cosRot: i === 3 ? E(seg(p, 0, 0.05)) * (1 - E(seg(p, 0.35, 0.45))) : 0,
		cosTraced: i < 3 ? 0 : i === 3 ? TAU * seg(p, 0.35, 0.85) : i === 4 ? sweep : 2 * TAU,
		shift: i === 3 ? E(seg(p, 0.85, 1)) : i === 4 ? 1 - E(seg(p, 0, 0.1)) : 0
	};
}
