import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import { SCENARIOS } from '#lib/limits/scenario.ts';
import { clampSide, GAP_FRAC, minGap, Z_MAX } from '#lib/limits/approach.ts';
import { STEP_IDS } from './step-ids.ts';
import { PREDICT, SCENARIO, STEPS, type LAScenario, type LAUser } from './steps.ts';

/** Unzoomed window per example; `zoomY: false` zooms x only (a jump or sin 1/x would leave a y-zoom). */
export const BASE: Record<LAScenario, { cx: number; cy: number; h: number; zoomY: boolean }> = {
	hole: { cx: 1, cy: 2, h: 3, zoomY: true },
	holeValue: { cx: 1, cy: 2, h: 3, zoomY: true },
	jump: { cx: 1, cy: 1, h: 3, zoomY: false },
	osc: { cx: 0, cy: 0, h: 1.6, zoomY: false }
};

export interface LAView {
	t: number;
	step: number;
	p: number;
	axes: number;
	/** The curve draws on from the left (intro). */
	draw: number;
	/** Current example, the previous one, and the crossfade between them (0 = old, 1 = new). */
	sc: LAScenario;
	prev: LAScenario;
	mix: number;
	/** Window: centre and half-widths in math units. */
	cx: number;
	cy: number;
	hx: number;
	hy: number;
	z: number;
	/** The example the handles belong to (switches halfway through a crossfade) and its approach point. */
	hs: LAScenario;
	a: number;
	/** Handle x (dragged or scheduled), always on their own side of a. */
	xl: number;
	xr: number;
	handles: number;
	/** Dots of the current example: open (holes) and filled (the value f(a)). */
	open: number;
	filled: number;
	/** The guide line x = a and the substitution f(1) = 0/0 (predict). */
	guide: number;
	subst: number;
	/** One-sided limit lines, then the two-sided result. */
	lims: number;
	lim: number;
}

/** Scheduled handle distance from a, as a fraction of the half-width. */
const FAR = 0.85;
function dist(i: number, p: number): number {
	const go = (from: number, to: number, a: number, b: number) => from + (to - from) * E(seg(p, a, b));
	switch (STEP_IDS[i]) {
		case 'intro':
		case 'predict':
			return FAR;
		case 'approach':
			return go(FAR, GAP_FRAC, 0.15, 0.75);
		case 'zoom':
			return go(GAP_FRAC, 0.35, 0, 0.12);
		case 'value':
			return p < 0.45 ? 0.35 : go(0.35, GAP_FRAC, 0.45, 0.85);
		case 'jump':
			return p < 0.3 ? go(GAP_FRAC, FAR, 0, 0.2) : go(FAR, GAP_FRAC, 0.3, 0.8);
		default:
			return p < 0.3 ? go(GAP_FRAC, FAR, 0, 0.2) : go(FAR, 0.3, 0.3, 0.5);
	}
}

/** Scheduled zoom; 0 at every step boundary so examples switch unzoomed. */
function zoom(i: number, p: number): number {
	switch (STEP_IDS[i]) {
		case 'zoom':
			return 2 * E(seg(p, 0.15, 0.85));
		case 'value':
			return 2 * (1 - E(seg(p, 0, 0.25)));
		case 'oscillate':
			return 2 * E(seg(p, 0.4, 0.92));
		default:
			return 0;
	}
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function view(t: number, user: LAUser): LAView {
	const { i, p } = locate(STEPS, t);
	const id = STEP_IDS[i];
	const sc = SCENARIO[id];
	const prev = SCENARIO[STEP_IDS[Math.max(0, i - 1)]];
	// Same curve (hole → hole with a value): nothing to crossfade.
	const mix = SCENARIOS[prev].f === SCENARIOS[sc].f ? 1 : E(seg(p, 0, 0.25));

	// Window: crossfade centre and size between examples, then zoom around the centre.
	const A = BASE[prev];
	const B = BASE[sc];
	const z = Math.min(Z_MAX, Math.max(0, user.z ?? zoom(i, p)));
	const s = 10 ** -z;
	const h = Math.exp(lerp(Math.log(A.h), Math.log(B.h), mix));
	const cx = lerp(A.cx, B.cx, mix);
	const cy = lerp(A.cy, B.cy, mix);
	const hx = h * s;
	const hy = B.zoomY ? h * s : h;

	// Handles stay with the old example until halfway, and are hidden while they switch.
	const hs = mix < 0.5 ? prev : sc;
	const a = SCENARIOS[hs].at as number;
	const moves = SCENARIOS[prev].at !== SCENARIOS[sc].at;
	const d = dist(i, p) * hx;
	const gap = minGap(hx);
	const side = (x: number | null, k: 'left' | 'right', fallback: number) =>
		clampSide(x ?? fallback, a, k, gap, cx - hx, cx + hx);

	const fadeLims = (on: number, off = 0) => (1 - E(seg(p, 0, 0.1))) * off + E(seg(p, on, on + 0.08));
	const lims =
		i <= PREDICT ? 0 : id === 'approach' ? fadeLims(0.78) : id === 'zoom' || id === 'value' ? 1 : fadeLims(0.82, 1);
	const lim =
		i <= PREDICT ? 0 : id === 'approach' ? fadeLims(0.88) : id === 'zoom' || id === 'value' ? 1 : fadeLims(0.9, 1);

	return {
		t,
		step: i,
		p,
		axes: i > 0 ? 1 : E(seg(p, 0, 0.25)),
		draw: i > 0 ? 1 : E(seg(p, 0.15, 0.8)),
		sc,
		prev,
		mix,
		cx,
		cy,
		hx,
		hy,
		z,
		hs,
		a,
		xl: side(user.xl, 'left', a - d),
		xr: side(user.xr, 'right', a + d),
		handles: (i < PREDICT + 1 ? 0 : id === 'approach' ? E(seg(p, 0, 0.15)) : 1) * (moves ? Math.abs(1 - 2 * mix) : 1),
		open: i < PREDICT ? 0 : i === PREDICT ? E(seg(p, 0.55, 0.75)) : mix,
		filled: id === 'value' ? E(seg(p, 0.25, 0.4)) : mix,
		guide: i === PREDICT ? E(seg(p, 0, 0.15)) * (1 - E(seg(p, 0.85, 1))) : 0,
		subst: i < PREDICT ? 0 : i === PREDICT ? E(seg(p, 0.25, 0.5)) : 1,
		lims: Math.min(1, lims),
		lim: Math.min(1, lim)
	};
}
