import type { Frame } from '#lib/graph/viewport.ts';
import type { Scenario, Side } from './scenario.ts';

/** Zoom is a log₁₀ level: z = 2 shows a window 100× smaller, centred on the approach point. */
export const Z_MAX = 4;

export function zoomFrame(cx: number, cy: number, z: number, hx: number, hy = hx): Frame {
	const s = 10 ** -Math.min(Z_MAX, Math.max(0, z));
	return { cx, cy, hx: hx * s, hy: hy * s };
}

/** Handles stop this fraction of the half-width short of a: always a visible gap (L-06). */
export const GAP_FRAC = 0.03;
export const minGap = (hx: number) => GAP_FRAC * hx;

export type HandleSide = 'left' | 'right';

/** Keeps a handle on its own side of a, never on it, and inside [lo, hi]. */
export function clampSide(x: number, a: number, side: HandleSide, gap: number, lo: number, hi: number): number {
	return side === 'left' ? Math.max(lo, Math.min(x, a - gap)) : Math.min(hi, Math.max(x, a + gap));
}

/** Below this distance from a, doubles can't be trusted near 0/0; the readout shows the declared limit. */
const FLOAT_SAFE = 1e-9;

/** f(x) for a handle's readout. Never evaluates at a. */
export function readout(s: Scenario, x: number, side: HandleSide): number {
	const lim: Side = side === 'left' ? s.left : s.right;
	if (typeof s.at === 'number' && Math.abs(x - s.at) < FLOAT_SAFE && typeof lim === 'number') return lim;
	return s.f(x);
}

/** Decimals that resolve the gap at this zoom, so x visibly creeps toward a. */
export function digitsFor(hx: number): number {
	return Math.min(7, Math.max(2, Math.ceil(-Math.log10(minGap(hx)))));
}
