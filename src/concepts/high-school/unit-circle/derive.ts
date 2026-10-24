import { TAU, norm } from '#lib/engine/angle.ts';

export { TAU, norm };

/** Keyboard step on the integer-degree grid: round current angle to whole degrees, add deltaDeg, wrap mod 360, convert once. */
export function keyStep(theta: number, deltaDeg: number): number {
	const cur = Math.round((norm(theta) * 180) / Math.PI);
	const next = (((cur + deltaDeg) % 360) + 360) % 360;
	return (next * Math.PI) / 180;
}

export interface Derived {
	theta: number;
	cos: number;
	sin: number;
	x: number;
	y: number;
	deg: number;
	quadrant: 0 | 1 | 2 | 3 | 4;
}

const snap = (v: number) => (Math.abs(v) < 1e-12 || v === 0 ? 0 : v);

/** cos/sin are derived from the angle the point is drawn from, so display and visual agree. */
export function derive(theta: number): Derived {
	const t = norm(theta);
	const cos = snap(Math.cos(t));
	const sin = snap(Math.sin(t));
	let quadrant: Derived['quadrant'];
	if (Math.abs(cos) < 1e-9 || Math.abs(sin) < 1e-9) quadrant = 0;
	else if (cos > 0) quadrant = sin > 0 ? 1 : 4;
	else quadrant = sin > 0 ? 2 : 3;
	return { theta: t, cos, sin, x: cos, y: sin, deg: (t * 180) / Math.PI, quadrant };
}

/** dyUp is math-up (caller flips screen y). */
export function angleFromPoint(dx: number, dyUp: number): number {
	return norm(Math.atan2(dyUp, dx));
}
