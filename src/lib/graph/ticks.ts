import type { Viewport } from './viewport.ts';

/** Grid and tick layout for windows of any size (zoom in to 0.001, out to 1000s). */

/** Rounds away float noise from i·step (0.30000000000000004 → 0.3). */
const clean = (x: number) => Number(x.toPrecision(12));

/** Multiples of step inside [lo, hi]. */
export function tickValues(lo: number, hi: number, step: number): number[] {
	const out: number[] = [];
	for (let i = Math.ceil(lo / step - 1e-9); i * step <= hi + step * 1e-9; i++) out.push(clean(i * step));
	return out;
}

/** Decimals that show a step exactly (0.05 → 2). */
export const decimalsFor = (step: number) => Math.max(0, -Math.floor(Math.log10(step) + 1e-9));

/**
 * Grid lines for a range, so zooming never pops: major lines every 10ⁿ, the next decade down
 * fades in as the window shrinks toward it. Tuned so a range of 12 gives lines at every integer
 * (Phase 3 look) with the finer decade invisible.
 */
export function gridLevels(range: number): { major: number; minor: number; fade: number } {
	const L = Math.log10(range / 1.23);
	const major = clean(10 ** Math.floor(L));
	const frac = L - Math.floor(L);
	return { major, minor: clean(major / 10), fade: Math.max(0, 1 - frac) ** 2 };
}

/** Labels on major lines: every line, or every 2nd/5th when they would crowd. */
export function labelStep(range: number, major: number, max = 7): number {
	for (const m of [1, 2, 5, 10]) if (range / (major * m) <= max) return clean(major * m);
	return clean(major * 10);
}

/** Pixel margins for a pinned axis: room for its labels on their side. */
export const PIN_PX = { bottom: 30, top: 8, left: 44, right: 8 };

/**
 * Where the axes sit in math units: at 0 when that is comfortably on screen, else pinned
 * inside the nearer edge so labels (and limit output ticks) stay readable when zoomed away.
 */
export function axisAt(vp: Viewport): { ax: number; ay: number } {
	const kx = Math.abs(vp.gx(1) - vp.gx(0));
	const ky = Math.abs(vp.gy(1) - vp.gy(0));
	return {
		ax: Math.min(vp.x1 - PIN_PX.right / kx, Math.max(vp.x0 + PIN_PX.left / kx, 0)),
		ay: Math.min(vp.y1 - PIN_PX.top / ky, Math.max(vp.y0 + PIN_PX.bottom / ky, 0))
	};
}
