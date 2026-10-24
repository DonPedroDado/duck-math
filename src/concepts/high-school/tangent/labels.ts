export interface Lbl {
	id: 'tan' | 'cot' | 'sec' | 'csc' | 'sin' | 'cos';
	x: number;
	y: number;
	/** Unit vector the label may be pushed along. */
	ux: number;
	uy: number;
}

const PRIORITY: Lbl['id'][] = ['tan', 'cot', 'sec', 'csc', 'sin', 'cos'];
const STEP = 4;
const MAX_STEPS = 20;

/** Push labels along their own direction until each is >= min px from every higher-priority label. Pure, bounded. */
export function separate<T extends Lbl>(labels: readonly T[], min = 16): T[] {
	const ordered = [...labels].sort((a, b) => PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id));
	const placed: T[] = [];
	for (const l of ordered) {
		let { x, y } = l;
		for (let n = 0; n < MAX_STEPS; n++) {
			if (placed.every((q) => Math.hypot(q.x - x, q.y - y) >= min)) break;
			x += l.ux * STEP;
			y += l.uy * STEP;
		}
		placed.push({ ...l, x, y });
	}
	return placed;
}
