import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { STEPS } from './steps.ts';

export interface TNView {
	t: number;
	step: number;
	p: number;
	axes: number;
	circle: number;
	point: number;
	hint: number;
	xLine: number;
	xTick: number;
	radiusExt: number;
	tanSeg: number;
	tanLabel: number;
	triangles: number;
	ratio: number;
}

/** Pure schedule: reads only t. Never the angle (PD-1). */
export function view(t: number): TNView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (p: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const hint = i === 0 ? seg(p, 0.85, 1) : i === 1 ? 1 - seg(p, 0, 0.1) : 0;
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.25))),
		circle: layer(0, (q) => E(seg(q, 0.2, 0.6))),
		point: layer(0, (q) => E(seg(q, 0.6, 0.85))),
		hint,
		xLine: layer(1, (q) => E(seg(q, 0, 0.15))),
		xTick: layer(1, (q) => E(seg(q, 0.1, 0.2))),
		radiusExt: layer(1, (q) => E(seg(q, 0.15, 0.3))),
		tanSeg: layer(1, (q) => E(seg(q, 0.36, 0.6))),
		tanLabel: layer(1, (q) => E(seg(q, 0.55, 0.65))),
		triangles: layer(1, (q) => E(seg(q, 0.6, 0.85))),
		ratio: layer(1, (q) => E(seg(q, 0.85, 1)))
	};
}
