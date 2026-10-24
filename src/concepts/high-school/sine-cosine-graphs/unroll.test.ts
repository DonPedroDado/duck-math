import { describe, expect, it } from 'vitest';
import { unrollBlend, unrollPoints } from './unroll.ts';

const C = (s: number): [number, number] => [Math.cos(s) * 100, -Math.sin(s) * 100];
const F = (s: number): [number, number] => [s * 40, 200];

describe('unroll', () => {
	it('blend endpoints', () => {
		for (let k = 0; k <= 64; k++) {
			expect(unrollBlend(k, 64, 0)).toBe(0);
			expect(unrollBlend(k, 64, 1)).toBe(1);
		}
	});
	it('root leaves first', () => {
		for (const q of [0.2, 0.5, 0.8]) {
			let prev = Infinity;
			for (let k = 0; k <= 64; k++) {
				const b = unrollBlend(k, 64, q);
				expect(b).toBeLessThanOrEqual(prev + 1e-12);
				prev = b;
			}
		}
	});
	it('empty for zero theta', () => {
		expect(unrollPoints(0, 0.5, C, F)).toEqual([]);
	});
	it('q=0 on circle, q=1 on axis, deterministic', () => {
		const th = 2;
		const p0 = unrollPoints(th, 0, C, F);
		const p1 = unrollPoints(th, 1, C, F);
		p0.forEach((p, k) => expect(p).toEqual(C((th * k) / 64)));
		p1.forEach((p, k) => {
			expect(p[1]).toBe(200);
			expect(p).toEqual(F((th * k) / 64));
		});
		expect(unrollPoints(th, 0.37, C, F)).toEqual(unrollPoints(th, 0.37, C, F));
	});
});
