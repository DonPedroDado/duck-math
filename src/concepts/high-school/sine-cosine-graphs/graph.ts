import { line } from 'd3-shape';
import { TICK_LABELS } from './notation.ts';

export type Pt = [number, number];

export function curvePoints(
	f: (s: number) => number,
	s0: number,
	s1: number,
	gx: (u: number) => number,
	gy: (v: number) => number,
	n = 240
): Pt[] {
	if (s1 <= s0 + 1e-9) return [];
	const out: Pt[] = [];
	for (let k = 0; k <= n; k++) {
		const s = s0 + ((s1 - s0) * k) / n;
		out.push([gx(s), gy(f(s))]);
	}
	return out;
}

export function curvePath(pts: Pt[]): string {
	if (pts.length === 0) return '';
	return line()(pts) ?? '';
}

export function ticks(range: number): { value: number; label: string }[] {
	const out: { value: number; label: string }[] = [];
	for (let k = 1; k <= TICK_LABELS.length; k++) {
		const value = (k * Math.PI) / 2;
		if (value > range + 1e-9) break;
		out.push({ value, label: TICK_LABELS[k - 1] });
	}
	return out;
}
