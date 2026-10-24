import { describe, it, expect } from 'vitest';
import { clipLimit, tanEnd, secEnd, cotEnd, cscEnd } from './clip';

describe('clip', () => {
	it('clipLimit', () => expect(clipLimit(200)).toBe(1.5 - 12 / 200));
	it('tanEnd', () => {
		expect(tanEnd(5.67, 1.44)).toEqual({ x: 1, y: 1.44, clipped: true, dir: 1 });
		expect(tanEnd(-0.5, 1.44)).toEqual({ x: 1, y: -0.5, clipped: false, dir: -1 });
		expect(tanEnd(0, 1.44)).toMatchObject({ y: 0, clipped: false });
	});
	it('secEnd', () => {
		const e = secEnd(5.67, 1.44);
		expect(e.x).toBeCloseTo(1.44 / 5.67, 12);
		expect(e.y).toBeCloseTo(1.44, 12);
		expect(e.clipped).toBe(true);
		expect(secEnd(0.5, 1.44)).toMatchObject({ x: 1, y: 0.5, clipped: false });
	});
	it('cotEnd', () => expect(cotEnd(-3, 1.44)).toEqual({ x: -1.44, y: 1, clipped: true, dir: -1 }));
	it('cscEnd', () => expect(cscEnd(0.5, 1.44)).toMatchObject({ x: 0.5, y: 1, clipped: false }));
});
