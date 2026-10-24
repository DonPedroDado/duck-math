import { describe, it, expect } from 'vitest';
import { arcPath, nudge, polar } from './geom';

describe('geom', () => {
	it('polar', () => {
		const [x, y] = polar(0, 0, 1, Math.PI / 2);
		expect(x).toBeCloseTo(0, 9);
		expect(y).toBeCloseTo(-1, 9);
	});
	it('arcPath empty for zero sweep', () => {
		expect(arcPath(0, 0, 10, 0, 0)).toBe('');
	});
	it('arcPath quarter', () => {
		const d = arcPath(100, 100, 50, 0, Math.PI / 2);
		expect(d.startsWith('M150.00,100.00')).toBe(true);
		expect(d).toContain('A50.00,50.00 0 0 0');
	});
	it('large arc flag', () => {
		expect(arcPath(0, 0, 10, 0, 1.5 * Math.PI)).toContain('A10.00,10.00 0 1 0');
	});
	it('full circle has two arcs', () => {
		expect((arcPath(0, 0, 10, 0, 2 * Math.PI).match(/A/g) ?? []).length).toBe(2);
	});
	it('nudge', () => {
		const a = nudge(0, 0, 0, 0);
		expect(a[0]).toBeCloseTo(0, 9);
		expect(a[1]).toBeCloseTo(-26, 9);
		const b = nudge(10, 0, 0, 0);
		expect(b[0]).toBeCloseTo(26, 9);
		expect(b[1]).toBeCloseTo(0, 9);
		expect(nudge(40, 0, 0, 0)).toEqual([40, 0]);
		const c = nudge(3, 4, 0, 0, 10);
		expect(c[0]).toBeCloseTo(6, 9);
		expect(c[1]).toBeCloseTo(8, 9);
	});
});
