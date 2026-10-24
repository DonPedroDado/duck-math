const TAU = 2 * Math.PI;
const f = (x: number) => x.toFixed(2);

/** Math angle (CCW, y-up) to screen px. */
export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
	return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

export function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
	const sweep = a1 - a0;
	if (!(Math.abs(sweep) >= 1e-6)) return '';
	const [x0, y0] = polar(cx, cy, r, a0);
	if (Math.abs(sweep) >= TAU - 1e-6) {
		const [xm, ym] = polar(cx, cy, r, a0 + Math.PI);
		return `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 0 0 ${f(xm)},${f(ym)}A${f(r)},${f(r)} 0 0 0 ${f(x0)},${f(y0)}`;
	}
	const [x1, y1] = polar(cx, cy, r, a1);
	const large = Math.abs(sweep) > Math.PI ? 1 : 0;
	const sf = sweep > 0 ? 0 : 1;
	return `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 ${large} ${sf} ${f(x1)},${f(y1)}`;
}

/** Push a label away from the point so they are at least `min` px apart. */
export function nudge(lx: number, ly: number, px: number, py: number, min = 26): [number, number] {
	const dx = lx - px;
	const dy = ly - py;
	const d = Math.hypot(dx, dy);
	if (d >= min) return [lx, ly];
	if (d < 1e-9) return [px, py - min];
	return [px + (dx / d) * min, py + (dy / d) * min];
}
