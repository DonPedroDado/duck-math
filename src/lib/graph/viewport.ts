/** Square math window [-half, half]² mapped onto a Stage of size S (equal aspect, y up). */
export interface Viewport {
	half: number;
	/** Pixels per math unit. */
	k: number;
	gx: (u: number) => number;
	gy: (v: number) => number;
	/** Inverse: pixel to math. */
	ux: (px: number) => number;
	uy: (py: number) => number;
}

export function viewport(S: number, half = 6): Viewport {
	const c = S / 2;
	const k = S / (2 * half);
	return {
		half,
		k,
		gx: (u) => c + u * k,
		gy: (v) => c - v * k,
		ux: (px) => (px - c) / k,
		uy: (py) => (c - py) / k
	};
}
