export interface Clipped {
	x: number;
	y: number;
	clipped: boolean;
	dir: 1 | -1;
}

/** Largest coordinate (in units) a clipped segment may reach: stage range minus an inset in px. */
export function clipLimit(R: number, insetPx = 12, range = 1.5): number {
	return range - insetPx / R;
}

const dirOf = (v: number): 1 | -1 => (v < 0 ? -1 : 1);
const clamp = (v: number, L: number) => (v > L ? L : v < -L ? -L : v);

/** tan segment on x = 1: (1, tan) clamped on y. */
export function tanEnd(t: number, L: number): Clipped {
	return { x: 1, y: clamp(t, L), clipped: Math.abs(t) > L, dir: dirOf(t) };
}

/** sec: the radius ray extended to x = 1 ends at (1, t); scaled down so the long coordinate stays within L. */
export function secEnd(t: number, L: number): Clipped {
	const s = Math.abs(t) > L ? L / Math.abs(t) : 1;
	return { x: s, y: s * t, clipped: Math.abs(t) > L, dir: dirOf(t) };
}

/** cot segment on y = 1: (cot, 1) clamped on x. */
export function cotEnd(c: number, L: number): Clipped {
	return { x: clamp(c, L), y: 1, clipped: Math.abs(c) > L, dir: dirOf(c) };
}

/** csc: the ray to y = 1 ends at (c, 1); scaled so the long coordinate stays within L. */
export function cscEnd(c: number, L: number): Clipped {
	const s = Math.abs(c) > L ? L / Math.abs(c) : 1;
	return { x: s * c, y: s, clipped: Math.abs(c) > L, dir: dirOf(c) };
}
