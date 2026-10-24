/** Shared angle helpers. Single source of truth for wrap and snap tolerances (lib and concepts import from here). */

export const TAU = 2 * Math.PI;

const WRAP_EPS = 1e-9;

/** Wrap into [0, TAU). Values within WRAP_EPS of TAU (or of 0) become exactly 0, so float drift never yields TAU - ulp. */
export function norm(theta: number): number {
	const r = ((theta % TAU) + TAU) % TAU;
	return r < WRAP_EPS || TAU - r < WRAP_EPS ? 0 : r;
}

/** Display resolution in degrees: anything closer than this to 0° / 360° is shown as 0°. */
export const DISPLAY_EPS_DEG = 0.05;
/** Same tolerance in radians. */
export const DISPLAY_EPS = (DISPLAY_EPS_DEG * Math.PI) / 180;

/**
 * Model-level snap applied where theta is stored. Angles that would display as 0°
 * (within DISPLAY_EPS of 0 or of 360°) become exactly 0, so the readout, aria value,
 * radian readout and the angle arc all agree.
 */
export function snapTheta(theta: number): number {
	const r = norm(theta);
	// Compare in degrees with the exact expression degValue() uses, so the two can never disagree at the boundary.
	const d = (r * 180) / Math.PI;
	return d < DISPLAY_EPS_DEG || d >= 360 - DISPLAY_EPS_DEG ? 0 : r;
}

/** Within this many degrees of a whole degree, the angle counts as on the grid (absorbs float drift). */
const GRID_EPS_DEG = 1e-6;

/**
 * Keyboard step on the integer-degree grid: snap the current angle to whole degrees in the
 * direction of travel (so an off-grid 134.6° goes to 135° on +1 and 134° on -1, never skipping a
 * degree), add deltaDeg, wrap mod 360, convert once. On-grid angles (within float drift) step exactly.
 */
export function keyStep(theta: number, deltaDeg: number): number {
	const d = (norm(theta) * 180) / Math.PI;
	const r = Math.round(d);
	const cur = Math.abs(d - r) < GRID_EPS_DEG ? r : deltaDeg > 0 ? Math.floor(d) : Math.ceil(d);
	const next = (((cur + deltaDeg) % 360) + 360) % 360;
	return (next * Math.PI) / 180;
}

/** Angle of the vector (dx, dyUp) in [0, TAU). dyUp is math-up (caller flips screen y). */
export function angleFromPoint(dx: number, dyUp: number): number {
	return norm(Math.atan2(dyUp, dx));
}
