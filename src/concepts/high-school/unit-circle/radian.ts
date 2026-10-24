import { seg, easeMath as E } from '#lib/engine/timeline.ts';

/** Copies sit slightly outside the circle so they do not hide it. */
export const R_COPY = 1.03;
/** Three full radii plus the remainder, reaching exactly pi. */
export const COPY_LENGTHS = [1, 1, 1, Math.PI - 3];

const SAMPLES = 33;

/** Point at arclength s along a path of constant curvature k >= 0, local frame (start 0,0; heading +x). */
export function bentPoint(s: number, k: number): [number, number] {
	if (k < 1e-6) return [s, 0];
	return [Math.sin(k * s) / k, (1 - Math.cos(k * s)) / k];
}

export interface RadianCopy {
	j: number;
	len: number;
	points: [number, number][];
	opacity: number;
	landed: boolean;
	endAngle: number;
}

const WINDOWS: [number, number][] = [
	[0, 0.42],
	[0.45, 0.62],
	[0.64, 0.81],
	[0.83, 0.93]
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function build(j: number, q: number): { origin: [number, number]; heading: number; k: number; op: number } {
	if (j === 0) {
		if (q < 0.25) {
			return { origin: [0, 0], heading: (Math.PI / 6) * E(seg(q, 0, 0.25)), k: 0, op: 1 };
		}
		if (q < 0.6) {
			const b = E(seg(q, 0.25, 0.6));
			return {
				origin: [lerp(0, 1, b), 0],
				heading: lerp(Math.PI / 6, Math.PI / 2, b),
				k: 0,
				op: 1
			};
		}
		return { origin: [1, 0], heading: Math.PI / 2, k: E(seg(q, 0.6, 1)), op: 1 };
	}
	return {
		origin: [Math.cos(j), Math.sin(j)],
		heading: j + Math.PI / 2,
		k: E(seg(q, 0.35, 1)),
		op: E(seg(q, 0, 0.35))
	};
}

/** pr = radian-step progress in [0,1]; dim = copiesDim. Pure; no angle input. */
export function radianCopies(pr: number, dim: number): RadianCopy[] {
	const out: RadianCopy[] = [];
	for (let j = 0; j < COPY_LENGTHS.length; j++) {
		const [a, b] = WINDOWS[j];
		const q = seg(pr, a, b);
		if (q <= 0) continue;
		const len = COPY_LENGTHS[j];
		const { origin, heading, k, op } = build(j, q);
		const c = Math.cos(heading);
		const s = Math.sin(heading);
		const points: [number, number][] = [];
		for (let n = 0; n < SAMPLES; n++) {
			const [lx, ly] = bentPoint((len * n) / (SAMPLES - 1), k);
			points.push([(c * lx - s * ly + origin[0]) * R_COPY, (s * lx + c * ly + origin[1]) * R_COPY]);
		}
		const last = points[SAMPLES - 1];
		let ang = Math.atan2(last[1], last[0]);
		if (ang < -1e-9) ang += 2 * Math.PI;
		out.push({
			j,
			len,
			points,
			opacity: op * (1 - 0.6 * dim),
			landed: q >= 1,
			endAngle: Math.round(ang * 1000) / 1000
		});
	}
	return out;
}
