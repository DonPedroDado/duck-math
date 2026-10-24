export interface TailSeg {
	s0: number;
	s1: number;
	/** Opacity, ramping up toward the head (last === 1). */
	o: number;
}

/**
 * Comet tail as a pure function of theta (Pattern 6): never accumulates frame history,
 * so scrubbing forward or back always shows the same trail for the same position.
 */
export function tail(theta: number, len = Math.PI / 2, n = 24): TailSeg[] {
	if (!(theta > 1e-9)) return [];
	const start = Math.max(0, theta - len);
	const out: TailSeg[] = [];
	for (let k = 0; k < n; k++) {
		out.push({
			s0: start + ((theta - start) * k) / n,
			s1: start + ((theta - start) * (k + 1)) / n,
			o: (k + 1) / n
		});
	}
	return out;
}
