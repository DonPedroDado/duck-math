import { describe, it, expect } from 'vitest';
import { separate, type Lbl } from './labels.ts';

const d = (a: Lbl, b: Lbl) => Math.hypot(a.x - b.x, a.y - b.y);

describe('separate', () => {
	it('keeps the higher priority label and moves the other', () => {
		const out = separate(
			[
				{ id: 'sec', x: 3, y: 0, ux: 1, uy: 0 },
				{ id: 'tan', x: 0, y: 0, ux: 0, uy: 1 }
			],
			16
		);
		const tan = out.find((l) => l.id === 'tan')!;
		const sec = out.find((l) => l.id === 'sec')!;
		expect(tan).toMatchObject({ x: 0, y: 0 });
		expect(sec.y).toBe(0);
		expect(sec.x).toBeGreaterThan(3);
		expect(d(tan, sec)).toBeGreaterThanOrEqual(16);
	});
	it('leaves far labels alone', () => {
		const ls: Lbl[] = [
			{ id: 'tan', x: 0, y: 0, ux: 0, uy: 1 },
			{ id: 'cot', x: 100, y: 0, ux: 1, uy: 0 }
		];
		expect(separate(ls)).toEqual(ls);
	});
	it('priority order tan > cot > sec > csc > sin > cos', () => {
		const ids: Lbl['id'][] = ['cos', 'sin', 'csc', 'sec', 'cot', 'tan'];
		const out = separate(
			ids.map((id) => ({ id, x: 0, y: 0, ux: 1, uy: 0 })),
			16
		);
		expect(out.map((l) => l.id)).toEqual(['tan', 'cot', 'sec', 'csc', 'sin', 'cos']);
		expect(out[0].x).toBe(0);
		expect(out[1].x).toBeGreaterThanOrEqual(16);
		expect(out[2].x).toBeGreaterThan(out[1].x);
	});
	it('is bounded to 20 steps', () => {
		const out = separate(
			[
				{ id: 'tan', x: 0, y: 0, ux: 0, uy: 0 },
				{ id: 'sec', x: 0, y: 0, ux: 0, uy: 0 }
			],
			16
		);
		expect(out).toHaveLength(2);
	});
});
