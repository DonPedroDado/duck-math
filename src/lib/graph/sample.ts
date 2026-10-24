import { line } from 'd3-shape';

export type Pt = [number, number];

/** Vertical clip: symmetric ±c, or explicit [lo, hi] for windows not centred on 0. */
export type Clip = number | readonly [number, number];
const bounds = (c: Clip): readonly [number, number] => (typeof c === 'number' ? [-c, c] : c);

/** Gap kept on each side of a break, relative to the sampled span. */
const BREAK_EPS = 1e-6;

/** [x0, x1] split at the breaks inside it, each piece pulled back from the break. */
function pieces(x0: number, x1: number, breaks: readonly number[]): [number, number][] {
	const eps = (x1 - x0) * BREAK_EPS;
	const cuts = breaks.filter((b) => b > x0 && b < x1).sort((a, b) => a - b);
	const out: [number, number][] = [];
	let lo = x0;
	for (const b of cuts) {
		out.push([lo, b - eps]);
		lo = b + eps;
	}
	out.push([lo, x1]);
	return out;
}

/**
 * Samples g on [x0, x1] into runs of math points. A run breaks where `defined` is false,
 * where the value leaves the clip, and always at `breaks` (jumps, asymptotes), so undefined
 * regions and steep exits never draw spikes or connect across a discontinuity.
 */
export function sampleRuns(
	g: (x: number) => number,
	defined: (x: number) => boolean,
	x0: number,
	x1: number,
	clip: Clip,
	n = 360,
	breaks: readonly number[] = []
): Pt[][] {
	const [lo, hi] = bounds(clip);
	const clamp = (y: number) => Math.min(hi, Math.max(lo, y));
	const runs: Pt[][] = [];
	for (const [a, b] of pieces(x0, x1, breaks)) {
		const m = Math.max(2, Math.round((n * (b - a)) / (x1 - x0)));
		let run: Pt[] = [];
		let out: Pt | null = null;
		for (let i = 0; i <= m; i++) {
			const x = a + ((b - a) * i) / m;
			const y = defined(x) ? g(x) : NaN;
			if (Number.isFinite(y) && y >= lo && y <= hi) {
				// Re-entering from beyond the clip: start at the edge, not mid-window.
				if (!run.length && out) run.push(out);
				run.push([x, y]);
				out = null;
			} else {
				if (Number.isFinite(y) && run.length) run.push([x, clamp(y)]);
				if (run.length > 1) runs.push(run);
				run = [];
				out = Number.isFinite(y) ? [x, clamp(y)] : null;
			}
		}
		if (run.length > 1) runs.push(run);
	}
	return runs;
}

/**
 * Like sampleRuns, then refines wherever neighbours are more than `tol` apart vertically
 * (in math units) so oscillation (sin 1/x) never aliases. Capped at `max` points per run;
 * below pixel scale the zig-zag fills a solid band, which is what the screen can show.
 */
export function sampleDense(
	g: (x: number) => number,
	defined: (x: number) => boolean,
	x0: number,
	x1: number,
	clip: Clip,
	tol: number,
	max = 2400,
	breaks: readonly number[] = []
): Pt[][] {
	const [lo, hi] = bounds(clip);
	const clamp = (y: number) => Math.min(hi, Math.max(lo, y));
	const minDx = (x1 - x0) / max;
	return sampleRuns(g, defined, x0, x1, clip, 360, breaks).map((run) => {
		const out: Pt[] = [run[0]];
		const refine = (p: Pt, q: Pt, depth: number) => {
			if (depth >= 8 || q[0] - p[0] <= minDx || Math.abs(q[1] - p[1]) <= tol) return out.push(q);
			const x = (p[0] + q[0]) / 2;
			const y = g(x);
			if (!Number.isFinite(y)) return out.push(q);
			const mid: Pt = [x, clamp(y)];
			refine(p, mid, depth + 1);
			refine(mid, q, depth + 1);
		};
		for (let i = 1; i < run.length; i++) refine(run[i - 1], run[i], 0);
		return out;
	});
}

/** SVG path for runs, mapped to pixels. */
export function runsPath(runs: Pt[][], gx: (u: number) => number, gy: (v: number) => number): string {
	const l = line();
	return runs.map((r) => l(r.map(([x, y]) => [gx(x), gy(y)])) ?? '').join('');
}
