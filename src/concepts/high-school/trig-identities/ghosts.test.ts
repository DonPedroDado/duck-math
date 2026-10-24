import { describe, it, expect } from 'vitest';
import { norm } from '#lib/engine/angle.ts';
import { ghost, coincides } from './ghosts';

const rad = (d: number) => (d * Math.PI) / 180;
const eq = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-12);

describe('ghost', () => {
	it('angles and coordinates in every quadrant', () => {
		for (let d = 0; d < 360; d += 1) {
			const t = rad(d);
			const c = Math.cos(t);
			const s = Math.sin(t);
			expect(ghost('neg', t).angle).toBe(norm(-t));
			expect(ghost('supp', t).angle).toBe(norm(Math.PI - t));
			expect(ghost('comp', t).angle).toBe(norm(Math.PI / 2 - t));
			eq(ghost('neg', t).sin, -s);
			eq(ghost('neg', t).cos, c);
			eq(ghost('supp', t).sin, s);
			eq(ghost('supp', t).cos, -c);
			eq(ghost('comp', t).sin, c);
			eq(ghost('comp', t).cos, s);
		}
	});
});

describe('coincides', () => {
	it('detects self-mirrors', () => {
		expect(coincides('comp', rad(45))).toBe(true);
		expect(coincides('comp', rad(50))).toBe(false);
		expect(coincides('neg', 0)).toBe(true);
		expect(coincides('neg', rad(180))).toBe(true);
		expect(coincides('supp', rad(90))).toBe(true);
	});
});
