/** Base curves f for the transformation concepts (F-04, F-06). */

export type BaseId = 'f' | 'square' | 'sqrt' | 'exp2' | 'sin';
export type LandmarkId = 'peak' | 'valley' | 'zero' | 'yInt' | 'p1' | 'p2';

export interface Landmark {
	id: LandmarkId;
	x: number;
	y: number;
}
export interface Base {
	id: BaseId;
	f: (x: number) => number;
	/** Inputs where f is defined. */
	domain: readonly [number, number];
	landmarks: readonly Landmark[];
}

/**
 * Monotone cubic (Fritsch–Carlson) through the knots: no overshoot, and a local extremum
 * exactly at a knot where the data turns, so landmarks sit on knots. Flat at and beyond the end knots.
 */
export function monotoneCubic(xs: readonly number[], ys: readonly number[]): (x: number) => number {
	const n = xs.length;
	const h = xs.slice(1).map((x, i) => x - xs[i]);
	const dk = h.map((hi, i) => (ys[i + 1] - ys[i]) / hi);
	// Zero slope at both ends, so the constant continuation outside the knots joins smoothly.
	const m = xs.map((_, i) => {
		if (i === 0 || i === n - 1) return 0;
		return dk[i - 1] * dk[i] <= 0 ? 0 : (dk[i - 1] + dk[i]) / 2;
	});
	for (let i = 0; i < n - 1; i++) {
		if (dk[i] === 0) {
			m[i] = m[i + 1] = 0;
			continue;
		}
		const a = m[i] / dk[i];
		const b = m[i + 1] / dk[i];
		const s = a * a + b * b;
		if (s > 9) {
			const t = 3 / Math.sqrt(s);
			m[i] = t * a * dk[i];
			m[i + 1] = t * b * dk[i];
		}
	}
	return (x) => {
		// Flat beyond the knots: wide stretches read far-out inputs, which must not add new zeros.
		if (x <= xs[0]) return ys[0];
		if (x >= xs[n - 1]) return ys[n - 1];
		let i = 0;
		while (x > xs[i + 1]) i++;
		const t = (x - xs[i]) / h[i];
		const t2 = t * t;
		const t3 = t2 * t;
		return (
			(2 * t3 - 3 * t2 + 1) * ys[i] +
			(t3 - 2 * t2 + t) * h[i] * m[i] +
			(-2 * t3 + 3 * t2) * ys[i + 1] +
			(t3 - t2) * h[i] * m[i + 1]
		);
	};
}

/**
 * The hand-shaped f: a peak higher than the valley is deep, nothing at x = 0, f(0) ≠ 0,
 * one zero crossing between peak and valley. Asymmetric, so every reflection shows.
 */
const KX = [-12, -9, -6.5, -4.5, -2.5, -1, 0, 1.2, 3, 5, 7.5, 12];
const KY = [0.3, 0.5, 0.9, 1.6, 2.5, 2.0, 1.5, 0, -1.6, -0.9, -0.5, -0.2];
const fCurve = monotoneCubic(KX, KY);

export const BASES: Record<BaseId, Base> = {
	f: {
		id: 'f',
		f: fCurve,
		domain: [-Infinity, Infinity],
		landmarks: [
			{ id: 'peak', x: -2.5, y: 2.5 },
			{ id: 'yInt', x: 0, y: 1.5 },
			{ id: 'zero', x: 1.2, y: 0 },
			{ id: 'valley', x: 3, y: -1.6 }
		]
	},
	square: {
		id: 'square',
		f: (x) => x * x,
		domain: [-Infinity, Infinity],
		landmarks: [
			{ id: 'valley', x: 0, y: 0 },
			{ id: 'p1', x: 1, y: 1 },
			{ id: 'p2', x: 2, y: 4 }
		]
	},
	sqrt: {
		id: 'sqrt',
		f: (x) => Math.sqrt(x),
		domain: [0, Infinity],
		landmarks: [
			{ id: 'zero', x: 0, y: 0 },
			{ id: 'p1', x: 1, y: 1 },
			{ id: 'p2', x: 4, y: 2 }
		]
	},
	exp2: {
		id: 'exp2',
		f: (x) => 2 ** x,
		domain: [-Infinity, Infinity],
		landmarks: [
			{ id: 'yInt', x: 0, y: 1 },
			{ id: 'p1', x: 1, y: 2 },
			{ id: 'p2', x: 2, y: 4 }
		]
	},
	sin: {
		id: 'sin',
		f: Math.sin,
		domain: [-Infinity, Infinity],
		landmarks: [
			{ id: 'zero', x: 0, y: 0 },
			{ id: 'peak', x: Math.PI / 2, y: 1 },
			{ id: 'valley', x: -Math.PI / 2, y: -1 }
		]
	}
};

export const inDomain = (b: Base, u: number) => u >= b.domain[0] && u <= b.domain[1];
