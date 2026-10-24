import { fmtValue } from '#lib/engine/format.ts';

export type Fn = 'tan' | 'sec' | 'csc' | 'cot';
export type Ratio = { kind: 'undefined' } | { kind: 'defined'; value: number };

/** Within this many degrees of a pole the ratio counts as undefined. */
export const POLE_EPS_DEG = 0.5;

/** tan/sec have poles at 90° + k*180°, csc/cot at k*180°. */
const OFFSET: Record<Fn, number> = { tan: 90, sec: 90, csc: 0, cot: 0 };

/** Angular distance in degrees to the nearest pole. Poles are found by angle, never by magnitude (Math.tan(PI/2) is finite). */
export function distToPoleDeg(fn: Fn, theta: number): number {
	const deg = (theta * 180) / Math.PI;
	const d = (((deg - OFFSET[fn]) % 180) + 180) % 180;
	return Math.min(d, 180 - d);
}

export function ratio(fn: Fn, theta: number): Ratio {
	if (distToPoleDeg(fn, theta) < POLE_EPS_DEG) return { kind: 'undefined' };
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	const value = fn === 'tan' ? s / c : fn === 'sec' ? 1 / c : fn === 'csc' ? 1 / s : c / s;
	return { kind: 'defined', value: value === 0 ? 0 : value };
}

export function fmtRatio(fn: Fn, theta: number, locale: string, undefinedText: string): string {
	const r = ratio(fn, theta);
	return r.kind === 'undefined' ? undefinedText : fmtValue(r.value, locale);
}
