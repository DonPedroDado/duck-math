/**
 * x → ±∞ (L-09): dragging a handle past the edge zooms the window out. Positions on screen are
 * fractions u ∈ (−1, 1) of the half-width. Inside the edge u is linear in x; beyond it u creeps
 * toward 1 while x grows without bound, and the half-width is x / u, so the dragged handle stays
 * under the pointer. Everything is a pure function of x, so scrubbing reproduces it exactly.
 */

/** Screen fraction where the zoom-out starts. */
export const EDGE_U = 0.8;
/** How fast x grows past the edge: u = 0.95 → 16·edge, u = 0.99 → 400·edge. */
const P = 0.5;
/** Farthest screen fraction a drag can reach. */
export const U_MAX = 0.995;

/** Screen fraction of x for a base half-width hx0. */
export function outwardU(x: number, hx0: number): number {
	const e = EDGE_U * hx0;
	const ax = Math.abs(x);
	const u = ax <= e ? ax / hx0 : EDGE_U + (1 - EDGE_U) * (1 - (e / ax) ** P);
	return Math.sign(x) * u;
}

/** Inverse of outwardU: the x a screen fraction stands for. */
export function outwardX(u: number, hx0: number): number {
	const e = EDGE_U * hx0;
	const au = Math.min(U_MAX, Math.abs(u));
	const ax = au <= EDGE_U ? au * hx0 : e / (1 - (au - EDGE_U) / (1 - EDGE_U)) ** (1 / P);
	return Math.sign(u) * ax;
}

/** Half-width that fits every handle: hx0 until one passes the edge, then that handle's x / u. */
export function outwardHalf(xs: readonly number[], hx0: number): number {
	let h = hx0;
	for (const x of xs) if (x !== 0) h = Math.max(h, Math.abs(x) / Math.abs(outwardU(x, hx0)));
	return h;
}

/**
 * Relative drag in screen-fraction space: the dragged handle tracks the pointer, and grabbing
 * a handle that is not the widest never makes it jump.
 */
export function outwardDrag(xStart: number, uStart: number, uNow: number, hx0: number): number {
	return outwardX(outwardU(xStart, hx0) + (uNow - uStart), hx0);
}
