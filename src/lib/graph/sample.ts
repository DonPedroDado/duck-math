import { line } from 'd3-shape';

export type Pt = [number, number];

/**
 * Samples g on [x0, x1] into runs of math points. A run breaks where `defined` is false or
 * the value leaves [-clip, clip], so undefined regions and steep exits never draw spikes.
 */
export function sampleRuns(
	g: (x: number) => number,
	defined: (x: number) => boolean,
	x0: number,
	x1: number,
	clip: number,
	n = 360
): Pt[][] {
	const runs: Pt[][] = [];
	let run: Pt[] = [];
	for (let i = 0; i <= n; i++) {
		const x = x0 + ((x1 - x0) * i) / n;
		const y = defined(x) ? g(x) : NaN;
		if (Number.isFinite(y) && Math.abs(y) <= clip) {
			run.push([x, y]);
		} else {
			if (Number.isFinite(y) && run.length) run.push([x, Math.sign(y) * clip]);
			if (run.length > 1) runs.push(run);
			run = [];
		}
	}
	if (run.length > 1) runs.push(run);
	return runs;
}

/** SVG path for runs, mapped to pixels. */
export function runsPath(runs: Pt[][], gx: (u: number) => number, gy: (v: number) => number): string {
	const l = line();
	return runs.map((r) => l(r.map(([x, y]) => [gx(x), gy(y)])) ?? '').join('');
}
