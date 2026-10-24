import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
import type { Frame } from '#lib/graph/viewport.ts';
import { clampSide, GAP_FRAC, minGap, Z_MAX } from '#lib/limits/approach.ts';
import { outwardHalf, outwardX } from '#lib/limits/outward.ts';
import { SCENARIOS } from '#lib/limits/scenario.ts';
import { PEN } from './pen.ts';
import { STEP_IDS } from './step-ids.ts';
import { OUTWARD_LIMITS, PREDICT, SCENARIO, STEPS, type LIScenario, type LIUser } from './steps.ts';

/** Unzoomed window per example. Zoom (both-up) is x-only: y stays put while the curve runs off. */
export const BASE: Record<LIScenario, Frame> = {
	recip: { cx: 0, cy: 0, hx: 4, hy: 4 },
	recipSq: { cx: 2, cy: 2.5, hx: 4, hy: 4 },
	rational: { cx: 0, cy: 2, hx: 6, hy: 4 },
	pen: { cx: 0, cy: 0.75, hx: 5, hy: 5 }
};

export interface LIView extends Frame {
	t: number;
	step: number;
	p: number;
	axes: number;
	draw: number;
	sc: LIScenario;
	prev: LIScenario;
	mix: number;
	z: number;
	/** Handles belong to `hs` (switches halfway through a crossfade). */
	hs: LIScenario;
	xl: number;
	xr: number;
	handles: number;
	/** 'in': toward a; 'out': toward ±∞ (at-infinity). */
	pointing: 'in' | 'out';
	/** Vertical and horizontal asymptotes, and the ±∞ arrows where the curve leaves the window. */
	vasym: number;
	hasym: number;
	arrows: number;
	lims: number;
	lim: number;
	/**
	 * Until the reveal, the curve is drawn only as far in as the handles have explored
	 * (|x − a| ≥ veil), so the picture can't give the predict away.
	 */
	veil: number;
	/** Guess arrows on the stage (predict). */
	guess: number;
	/** Continuity: pen x and how visible the pen is. */
	pen: number;
	penOn: number;
}

const FAR = 0.6;
const go = (p: number, from: number, to: number, a: number, b: number) => from + (to - from) * E(seg(p, a, b));

/** Scheduled handle distance from a, as a fraction of the half-width (point steps). */
function dist(id: (typeof STEP_IDS)[number], p: number): number {
	if (id === 'predict') return go(p, FAR, GAP_FRAC, 0.25, 0.7);
	if (id === 'both-up') return p < 0.3 ? go(p, GAP_FRAC, FAR, 0, 0.2) : go(p, FAR, GAP_FRAC, 0.3, 0.75);
	return FAR;
}

/** Scheduled screen fraction of the outward handles (at-infinity). */
const outU = (p: number) => go(p, 0.5, 0.985, 0.25, 0.85);

interface Placed {
	frame: Frame;
	z: number;
	xl: number;
	xr: number;
}

/** Window and handles of step i at progress p, for a scenario on its own (no crossfade). */
function place(i: number, p: number, user: LIUser): Placed {
	const id = STEP_IDS[i];
	const sc = SCENARIO[id];
	const base = BASE[sc];
	if (sc === 'rational') {
		const xl = Math.min(OUTWARD_LIMITS.left, user.xl ?? outwardX(-outU(p), base.hx));
		const xr = Math.max(OUTWARD_LIMITS.right, user.xr ?? outwardX(outU(p), base.hx));
		return { frame: { ...base, hx: outwardHalf([xl, xr], base.hx) }, z: 0, xl, xr };
	}
	if (sc === 'pen') return { frame: base, z: 0, xl: base.cx - base.hx, xr: base.cx + base.hx };
	// Zoom is the student's (both-up): an automatic one would just empty the screen upward.
	const z = Math.min(Z_MAX, Math.max(0, user.z ?? 0));
	const hx = base.hx * 10 ** -z;
	const a = SCENARIOS[sc].at as number;
	const d = dist(id, p) * hx;
	const gap = minGap(hx);
	const [lo, hi] = [base.cx - hx, base.cx + hx];
	return {
		frame: { ...base, hx },
		z,
		xl: clampSide(user.xl ?? a - d, a, 'left', gap, lo, hi),
		xr: clampSide(user.xr ?? a + d, a, 'right', gap, lo, hi)
	};
}

const FREE: LIUser = { xl: null, xr: null, z: null, gl: null, gr: null, pen: null };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpLog = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

export function view(t: number, user: LIUser): LIView {
	const { i, p } = locate(STEPS, t);
	const id = STEP_IDS[i];
	const sc = SCENARIO[id];
	const prev = SCENARIO[STEP_IDS[Math.max(0, i - 1)]];
	const mix = prev === sc ? 1 : E(seg(p, 0, 0.25));

	// Crossfade the window from where the previous step ended (as scheduled) to this step's.
	const now = place(i, p, user);
	const was = mix < 1 ? place(i - 1, 1, FREE) : now;
	const hs = mix < 0.5 ? prev : sc;
	const h = mix < 0.5 ? was : now;
	const moves = prev !== sc;

	const fadeIn = (a: number) => E(seg(p, a, a + 0.08));
	const fadeOutIn = (a: number) => (1 - E(seg(p, 0, 0.1))) + fadeIn(a);
	const pick = (m: Partial<Record<(typeof STEP_IDS)[number], number>>) => Math.min(1, m[id] ?? 0);

	return {
		t,
		step: i,
		p,
		cx: lerp(was.frame.cx, now.frame.cx, mix),
		cy: lerp(was.frame.cy, now.frame.cy, mix),
		hx: lerpLog(was.frame.hx, now.frame.hx, mix),
		hy: lerpLog(was.frame.hy, now.frame.hy, mix),
		axes: i > 0 ? 1 : E(seg(p, 0, 0.2)),
		draw: i > 0 ? 1 : E(seg(p, 0.1, 0.6)),
		sc,
		prev,
		mix,
		z: now.z,
		hs,
		xl: h.xl,
		xr: h.xr,
		handles:
			(i === 0 ? E(seg(p, 0.6, 0.8)) : id === 'continuity' ? 1 - E(seg(p, 0, 0.2)) : 1) *
			(moves && id !== 'continuity' ? Math.abs(1 - 2 * mix) : 1),
		pointing: hs === 'rational' ? 'out' : 'in',
		vasym: pick({ predict: E(seg(p, 0.7, 0.8)), 'both-up': mix, 'at-infinity': mix, continuity: mix }),
		hasym: pick({ 'at-infinity': E(seg(p, 0.15, 0.35)) }),
		arrows: pick({ predict: E(seg(p, 0.62, 0.72)), 'both-up': fadeIn(0.7) }),
		lims: pick({ predict: fadeIn(0.75), 'both-up': fadeOutIn(0.8), 'at-infinity': fadeOutIn(0.85), continuity: fadeOutIn(2) }),
		// No two-sided line at infinity: the two directions are separate limits.
		lim: pick({ predict: fadeIn(0.85), 'both-up': fadeOutIn(0.88), 'at-infinity': fadeOutIn(2) }),
		// Recip only: a = 0, so the explored distance on each side is |x|.
		veil: i === 0 || id === 'predict' ? Math.min(-now.xl, now.xr) : 0,
		guess: i === PREDICT ? E(seg(p, 0, 0.1)) * (1 - E(seg(p, 0.7, 0.8))) : 0,
		pen: user.pen ?? lerp(PEN.from, PEN.to, id === 'continuity' ? seg(p, 0.12, 0.92) : 0),
		penOn: id === 'continuity' ? E(seg(p, 0.1, 0.18)) : 0
	};
}
