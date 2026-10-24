/** Math window mapped onto a Stage of size S (y up). */
export interface Viewport {
	/** Half-width of a square window centred on 0 (Phase 3 scenes). For a frame, the x half-width. */
	half: number;
	/** Pixels per math unit along x. */
	k: number;
	/** Visible bounds in math units. */
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	gx: (u: number) => number;
	gy: (v: number) => number;
	/** Inverse: pixel to math. */
	ux: (px: number) => number;
	uy: (py: number) => number;
}

/** Square window [-half, half]², equal aspect. */
export function viewport(S: number, half = 6): Viewport {
	return frame(S, { cx: 0, cy: 0, hx: half, hy: half });
}

export interface Frame {
	cx: number;
	cy: number;
	/** Half-widths in math units; x and y scale independently. */
	hx: number;
	hy: number;
}

/** Window centred on (cx, cy): zoom around a point, or zoom x out on its own (Phase 4). */
export function frame(S: number, { cx, cy, hx, hy }: Frame): Viewport {
	const c = S / 2;
	const kx = S / (2 * hx);
	const ky = S / (2 * hy);
	return {
		half: hx,
		k: kx,
		x0: cx - hx,
		x1: cx + hx,
		y0: cy - hy,
		y1: cy + hy,
		gx: (u) => c + (u - cx) * kx,
		gy: (v) => c - (v - cy) * ky,
		ux: (px) => cx + (px - c) / kx,
		uy: (py) => cy + (c - py) / ky
	};
}

/** Is (x, y) inside the window, with an optional margin in math units? */
export const inside = (vp: Viewport, x: number, y: number, m = 0) =>
	x >= vp.x0 + m && x <= vp.x1 - m && y >= vp.y0 + m && y <= vp.y1 - m;
