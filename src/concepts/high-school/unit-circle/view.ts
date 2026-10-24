import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { STEPS, type UCUser } from './steps.ts';

export interface UCView {
	t: number;
	step: number;
	p: number;
	axes: number;
	circle: number;
	point: number;
	hint: number;
	arc: number;
	thetaLabel: number;
	readout: number;
	radian: number;
	oneRadLabel: number;
	piLabel: number;
	copiesDim: number;
	toggle: number;
	unitBlend: number;
	cosDrop: number;
	cosSeg: number;
	cosLabel: number;
	sinDrop: number;
	sinSeg: number;
	sinLabel: number;
}

/** Pure schedule: reads only t and the angle unit. Never the angle (PD-1). */
export function view(t: number, user: Pick<UCUser, 'unit'>): UCView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (p: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const hint = i === 0 ? seg(p, 0.8, 1) : i === 1 ? 1 - seg(p, 0, 0.1) : 0;
	const unitBlend = user.unit === 'deg' ? 0 : i < 3 ? 0 : i === 3 ? E(seg(p, 0, 0.4)) : 1;
	return {
		t,
		step: i,
		p,
		axes: layer(0, (q) => E(seg(q, 0, 0.2))),
		circle: layer(0, (q) => E(seg(q, 0.2, 0.6))),
		point: layer(0, (q) => E(seg(q, 0.6, 0.8))),
		hint,
		arc: layer(1, (q) => E(seg(q, 0, 0.6))),
		thetaLabel: layer(1, (q) => E(seg(q, 0.5, 0.8))),
		readout: layer(1, (q) => E(seg(q, 0.6, 0.9))),
		radian: layer(2, (q) => q),
		oneRadLabel: layer(2, (q) => E(seg(q, 0.42, 0.52))),
		piLabel: layer(2, (q) => E(seg(q, 0.93, 1))),
		copiesDim: layer(3, (q) => E(seg(q, 0.2, 0.6))),
		toggle: layer(3, (q) => E(seg(q, 0, 0.15))),
		unitBlend,
		cosDrop: layer(4, (q) => E(seg(q, 0, 0.16))),
		cosSeg: layer(4, (q) => E(seg(q, 0.16, 0.48))),
		cosLabel: layer(4, (q) => E(seg(q, 0.48, 0.64))),
		sinDrop: layer(5, (q) => E(seg(q, 0, 0.16))),
		sinSeg: layer(5, (q) => E(seg(q, 0.16, 0.48))),
		sinLabel: layer(5, (q) => E(seg(q, 0.48, 0.64)))
	};
}
