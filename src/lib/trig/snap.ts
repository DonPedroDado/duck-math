import { norm } from '#lib/engine/angle.ts';
import { SPECIAL } from './special.ts';

export const SNAP_TARGETS_DEG: readonly number[] = SPECIAL.map((s) => s.deg);

/** Stateless magnetic snap: within tolDeg of a special angle returns it exactly, else the raw angle. Axes are not targets. */
export function snapSpecial(raw: number, tolDeg = 3): number {
	const d = (norm(raw) * 180) / Math.PI;
	let best = -1;
	let bestDist = Infinity;
	for (const t of SNAP_TARGETS_DEG) {
		const diff = Math.abs(d - t);
		const dist = Math.min(diff, 360 - diff);
		if (dist < bestDist) {
			bestDist = dist;
			best = t;
		}
	}
	return bestDist <= tolDeg ? (best * Math.PI) / 180 : raw;
}
