import { easeCubicInOut } from 'd3-ease';

export interface StepDef {
	id: string;
	dur: number;
}
export interface Located {
	i: number;
	p: number;
	start: number;
	end: number;
}

export const easeMath = easeCubicInOut;
export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
export const seg = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

export function totalDuration(steps: readonly StepDef[]): number {
	return steps.reduce((s, d) => s + d.dur, 0);
}
export function stepStart(steps: readonly StepDef[], i: number): number {
	let s = 0;
	for (let k = 0; k < i; k++) s += steps[k].dur;
	return s;
}
export function stepEnd(steps: readonly StepDef[], i: number): number {
	return stepStart(steps, i) + steps[i].dur;
}

/** t === stepEnd(i) belongs to step i (p = 1); t = 0 -> step 0, p = 0. */
export function locate(steps: readonly StepDef[], t: number): Located {
	const total = totalDuration(steps);
	const tc = Math.min(Math.max(t, 0), total);
	let start = 0;
	for (let i = 0; i < steps.length; i++) {
		const end = start + steps[i].dur;
		if (tc <= end || i === steps.length - 1) {
			return { i, p: clamp01((tc - start) / steps[i].dur), start, end };
		}
		start = end;
	}
	/* c8 ignore next */
	return { i: 0, p: 0, start: 0, end: 0 };
}
