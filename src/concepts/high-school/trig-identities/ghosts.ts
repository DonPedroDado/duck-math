import { norm, TAU } from '#lib/engine/angle.ts';

export type GhostKind = 'neg' | 'supp' | 'comp';

export interface Ghost {
	angle: number;
	cos: number;
	sin: number;
}

/** Mirror point computed from the transformed angle (not by sign flips), so every quadrant is right. */
export function ghost(kind: GhostKind, theta: number): Ghost {
	const raw = kind === 'neg' ? -theta : kind === 'supp' ? Math.PI - theta : Math.PI / 2 - theta;
	const angle = norm(raw);
	return { angle, cos: Math.cos(angle), sin: Math.sin(angle) };
}

/** True when the ghost sits (within tolDeg) on the real point, e.g. complement at 45 degrees. */
export function coincides(kind: GhostKind, theta: number, tolDeg = 0.5): boolean {
	const d = Math.abs(ghost(kind, theta).angle - norm(theta));
	const w = Math.min(d, TAU - d);
	return (w * 180) / Math.PI < tolDeg;
}
