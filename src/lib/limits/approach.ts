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

/** Keeps a handle inside [lo, hi] and, above all, on its own side of a, never on it. */
export function clampSide(x: number, a: number, side: HandleSide, gap: number, lo: number, hi: number): number {
	const w = Math.min(hi, Math.max(lo, x));
	return side === 'left' ? Math.min(w, a - gap) : Math.max(w, a + gap);
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

/**
 * Where the curve leaves the window [y0, y1] closest to a on one side, heading to ±∞ (L-09):
 * bisects between a point inside the window and one just next to a. null if it never leaves.
 */
export function exitX(
	f: (x: number) => number,
	a: number,
	side: HandleSide,
	y0: number,
	y1: number,
	hx: number
): number | null {
	const s = side === 'left' ? -1 : 1;
	const inside = (x: number) => {
		const y = f(x);
		return Number.isFinite(y) && y >= y0 && y <= y1;
	};
	let near = a + s * hx * 1e-6;
	let far = a + s * hx;
	if (inside(near) || !inside(far)) return null;
	for (let k = 0; k < 60; k++) {
		const mid = (near + far) / 2;
		if (inside(mid)) far = mid;
		else near = mid;
	}
	return far;
}
