export type PairMode = 'row' | 'column';

export interface PairLayout {
	mode: PairMode;
	W: number;
	H: number;
	circle: { cx: number; cy: number; R: number; left: number; top: number; size: number };
	graph: { x0: number; x1: number; axisY: number; gR: number; top: number; bottom: number };
}

/** Pure two-panel geometry: shared axis line in row mode, sticky height budget in column mode. */
export function pairLayout(width: number, vh: number): PairLayout {
	const W = Number.isFinite(width) && width > 0 ? width : 960;
	const V = Number.isFinite(vh) && vh > 0 ? vh : 800;
	if (W >= 640) {
		const size = (W * 5) / 12;
		const R = size / 3;
		return {
			mode: 'row',
			W,
			H: size,
			circle: { cx: size / 2, cy: size / 2, R, left: 0, top: 0, size },
			graph: { x0: size + 24, x1: W - 16, axisY: size / 2, gR: R, top: 24, bottom: size - 24 }
		};
	}
	const G = Math.min(0.36 * V, 200);
	const C = Math.max(120, Math.min(W, 0.4 * V, 0.76 * V - 64 - G));
	const H = C + G;
	return {
		mode: 'column',
		W,
		H,
		circle: { cx: W / 2, cy: C / 2, R: C / 3, left: (W - C) / 2, top: 0, size: C },
		graph: { x0: 24, x1: W - 16, axisY: C + G / 2, gR: Math.max(1, (G - 48) / 3), top: C + 24, bottom: H - 24 }
	};
}

export const gxOf =
	(L: PairLayout, [d0, d1]: [number, number]) =>
	(u: number): number =>
		L.graph.x0 + ((u - d0) / (d1 - d0)) * (L.graph.x1 - L.graph.x0);

export const gyOf =
	(L: PairLayout) =>
	(v: number): number =>
		L.graph.axisY - v * L.graph.gR;
