import { fmt } from '#lib/engine/format.ts';

export interface Sq {
	/** Four vertices in unit-circle space (y up). */
	pts: [number, number][];
	side: number;
	/** 0 at a flip angle, 1 from `FADE_DEG` away: the square crossfades instead of jumping sides. */
	fade: number;
	area: number;
}
export interface Squares {
	cos2: Sq;
	sin2: Sq;
	one: Sq;
}

/** Half-width (degrees) of the crossfade window around a flip angle. */
export const FADE_DEG = 2;

const sgn = (x: number) => (x < 0 ? -1 : 1);
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Angular distance in degrees from theta to the nearest of `flips` (degrees). */
function distDeg(theta: number, flips: readonly number[]): number {
	const d = ((((theta * 180) / Math.PI) % 360) + 360) % 360;
	let best = Infinity;
	for (const f of flips) {
		const a = Math.abs(d - f);
		best = Math.min(best, a, 360 - a);
	}
	return best;
}

function build(
	a: [number, number],
	b: [number, number],
	len: number,
	n: [number, number],
	fade: number
): Sq {
	return {
		pts: [a, b, [b[0] + n[0] * len, b[1] + n[1] * len], [a[0] + n[0] * len, a[1] + n[1] * len]],
		side: len,
		fade: clamp01(fade / FADE_DEG),
		area: len * len
	};
}

/**
 * The three Pythagoras squares on the right triangle O, F = (cos, 0), P, all pointing outward.
 * Leg normals use fixed axis directions, so a zero-length leg never normalises a zero vector.
 */
export function squares(theta: number): Squares {
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	const cos2 = build([0, 0], [c, 0], Math.abs(c), [0, -sgn(s)], distDeg(theta, [0, 180]));
	const sin2 = build([c, 0], [c, s], Math.abs(s), [sgn(c), 0], distDeg(theta, [90, 270]));
	// Perpendicular of OP pointing away from F (its dot with F - midpoint is -sc or sc).
	const n: [number, number] = c * s > 0 ? [-s, c] : c * s < 0 ? [s, -c] : [-s, c];
	const one = build([0, 0], [c, s], 1, n, distDeg(theta, [0, 90, 180, 270]));
	return { cos2, sin2, one };
}

/** A square thinner than one pixel is not drawn. */
export function visible(side: number, R: number): boolean {
	return side * R >= 1;
}

/** Two displayed terms that always add up to exactly the displayed 1: b is the rounded complement of a. */
export function areaTerms(theta: number, locale: string): { a: string; b: string; sum: string } {
	const c = Math.cos(theta);
	const a2 = Number((c * c).toFixed(2));
	return { a: fmt(c * c, 2, locale), b: fmt(1 - a2, 2, locale), sum: fmt(1, 2, locale) };
}
