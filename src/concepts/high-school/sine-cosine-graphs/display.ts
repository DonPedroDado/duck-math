import { fmt } from '#lib/engine/format.ts';

/** Single-writer rule (D-11): the timeline never writes theta. Sweep shows until the student drags. */
export function displayTheta(
	v: { sweepOn: number; rewind: number; sweep: number },
	user: { theta: number; moved: boolean }
): number {
	if (user.moved || v.sweepOn === 0) return user.theta;
	return v.rewind < 1 ? user.theta * (1 - v.rewind) : v.sweep;
}

/** Unwrapped angle formatting (no wrapping at 2π). */
export function fmtAngle(theta: number, unit: 'deg' | 'rad', locale: string): string {
	if (unit === 'rad') return fmt(theta, 2, locale);
	let d = Math.round(((theta * 180) / Math.PI) * 10) / 10;
	const nearest = Math.round(d);
	if (Math.abs(d - nearest) < 0.05) d = nearest;
	return fmt(d, Number.isInteger(d) ? 0 : 1, locale) + '°';
}
