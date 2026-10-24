import { describe, it, expect } from 'vitest';
import { viewport } from './viewport.ts';
import { BASES, monotoneCubic, inDomain } from './base.ts';
import { apply, lookupSource, mapPoint, mix, IDENTITY, type Params } from './transform.ts';
import { gridLines } from './grid.ts';
import { sampleRuns, runsPath } from './sample.ts';
import { formula, symbolic, num } from './tex.ts';

const f = BASES.f;
const rnd = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

describe('viewport', () => {
	it('maps the window onto the stage and back', () => {
		const v = viewport(600, 6);
		expect(v.gx(-6)).toBe(0);
		expect(v.gx(6)).toBe(600);
		expect(v.gy(6)).toBe(0);
		expect(v.ux(v.gx(2.5))).toBeCloseTo(2.5, 12);
		expect(v.uy(v.gy(-1.25))).toBeCloseTo(-1.25, 12);
	});
});

describe('base curve f', () => {
	const at = (id: string) => f.landmarks.find((l) => l.id === id)!;
	it('passes through its landmarks', () => {
		for (const l of f.landmarks) expect(f.f(l.x)).toBeCloseTo(l.y, 12);
	});
	it('is asymmetric: peak higher than the valley is deep, not at x = 0, f(0) ≠ 0', () => {
		expect(at('peak').y).toBeGreaterThan(-at('valley').y);
		expect(at('peak').x).not.toBe(0);
		expect(f.f(0)).not.toBe(0);
		expect(f.f(-1)).not.toBeCloseTo(f.f(1), 1);
	});
	it('peak and valley are true extrema', () => {
		const p = at('peak');
		const v = at('valley');
		for (let x = -12; x <= 12; x += 0.05) {
			expect(f.f(x)).toBeLessThanOrEqual(p.y + 1e-9);
			expect(f.f(x)).toBeGreaterThanOrEqual(v.y - 1e-9);
		}
	});
	it('crosses zero exactly once, and stays so for far inputs', () => {
		let crossings = 0;
		let prev = f.f(-60);
		for (let x = -60; x <= 60; x += 0.01) {
			const y = f.f(x);
			if (Math.sign(y) !== Math.sign(prev) && y !== 0) crossings++;
			prev = y;
		}
		expect(crossings).toBe(1);
	});
	it('monotone cubic does not overshoot between knots', () => {
		const g = monotoneCubic([0, 1, 2], [0, 1, 1]);
		for (let x = 0; x <= 2; x += 0.01) expect(g(x)).toBeLessThanOrEqual(1 + 1e-12);
	});
	it('alternate bases pass through their landmarks; sqrt has a domain', () => {
		for (const b of Object.values(BASES))
			for (const l of b.landmarks) expect(b.f(l.x)).toBeCloseTo(l.y, 12);
		expect(inDomain(BASES.sqrt, -0.1)).toBe(false);
		expect(inDomain(BASES.sqrt, 0)).toBe(true);
	});
});

describe('transform', () => {
	it('identity leaves f unchanged', () => {
		const g = apply(IDENTITY, f.f);
		for (let x = -6; x <= 6; x += 0.5) expect(g(x)).toBe(f.f(x));
	});
	it('mapped landmarks lie on g (random params)', () => {
		const r = rnd(7);
		for (let k = 0; k < 200; k++) {
			const p: Params = { a: r() * 6 - 3, b: (r() * 3 + 0.2) * (r() < 0.5 ? -1 : 1), c: r() * 8 - 4, d: r() * 6 - 3 };
			const g = apply(p, f.f);
			for (const l of f.landmarks) {
				const [x, y] = mapPoint(p, [l.x, l.y])!;
				expect(g(x)).toBeCloseTo(y, 9);
			}
		}
	});
	it('f(x+2) moves left: lookup reads f 2 units ahead', () => {
		const p = { ...IDENTITY, c: -2 };
		expect(lookupSource(p, 0)).toBe(2);
		expect(mapPoint(p, [-2.5, 3])).toEqual([-4.5, 3]);
	});
	it('b = 0 is defined: the constant a·f(0)+d, no single image point', () => {
		const p = { a: 2, b: 0, c: 1, d: 1 };
		expect(apply(p, f.f)(5)).toBeCloseTo(2 * f.f(0) + 1, 12);
		expect(mapPoint(p, [1, 1])).toBeNull();
	});
	it('mix interpolates', () => {
		expect(mix(IDENTITY, { a: 3, b: 1, c: 2, d: -2 }, 0.5)).toEqual({ a: 2, b: 1, c: 1, d: -1 });
	});
});

describe('rubber grid', () => {
	it('identity is the plain integer grid', () => {
		const g = gridLines(IDENTITY, 6);
		expect(g.v).toEqual([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6]);
		expect(g.h).toEqual(g.v);
	});
	it('stretches with a and b and follows shifts', () => {
		const g = gridLines({ a: 2, b: 2, c: 1, d: -1 }, 6);
		expect(g.h).toContain(-1);
		expect(g.h).toContain(1);
		expect(g.h).not.toContain(0);
		expect(g.v).toContain(1.5);
	});
	it('a = 0 squashes every horizontal line onto y = d; b = 0 culls vertical lines', () => {
		const g = gridLines({ a: 0, b: 0, c: 0, d: 1 }, 6);
		expect(new Set(g.h)).toEqual(new Set([1]));
		expect(g.v).toEqual([]);
	});
});

describe('sampling', () => {
	it('breaks runs where f is undefined (sqrt left of 0)', () => {
		const b = BASES.sqrt;
		const runs = sampleRuns(b.f, (x) => inDomain(b, x), -6, 6, 7);
		expect(runs).toHaveLength(1);
		expect(runs[0][0][0]).toBeGreaterThanOrEqual(0);
	});
	it('clips steep exits instead of drawing spikes', () => {
		const runs = sampleRuns((x) => 2 ** x, () => true, -6, 6, 7);
		for (const r of runs) for (const [, y] of r) expect(Math.abs(y)).toBeLessThanOrEqual(7);
	});
	it('path maps to pixels', () => {
		const v = viewport(120, 6);
		expect(runsPath([[[-6, 0], [6, 0]]], v.gx, v.gy)).toBe('M0,60L120,60');
	});
});

describe('formula', () => {
	const roles = (s: string) => [...s.matchAll(/link-(\w)/g)].map((m) => m[1]);
	it('identity is plain f(x)', () => {
		expect(formula(IDENTITY, 'en')).toBe('g(x) = f(x)');
	});
	it('shows only changed terms, with natural signs', () => {
		const s = formula({ ...IDENTITY, c: -2, d: 1.5 }, 'en');
		expect(s).toContain('x + \\htmlClass{t-c link-c}{2}');
		expect(s).toContain('+ \\htmlClass{t-d link-d}{1.5}');
		expect(roles(s)).toEqual(['c', 'd']);
	});
	it('full form, a = −1 reads as a minus', () => {
		const s = formula({ a: -1, b: 2, c: 1, d: -1 }, 'en');
		expect(s).toBe(
			'g(x) = \\htmlClass{t-a link-a}{-}f(\\htmlClass{t-b link-b}{2}(x - \\htmlClass{t-c link-c}{1})) - \\htmlClass{t-d link-d}{1}'
		);
	});
	it('show forces identity terms (build-up) and German decimals are TeX-safe', () => {
		const s = formula(IDENTITY, 'de', { b: true });
		expect(s).toContain('{t-b link-b}{1}x');
		expect(num(-1.25, 'de')).toBe('-1{,}25');
		expect(num(0.004, 'en')).toBe('0');
	});
	it('symbolic', () => {
		expect(roles(symbolic(['a', 'b', 'c', 'd']))).toEqual(['a', 'b', 'c', 'd']);
		expect(symbolic(['d'])).toBe('g(x) = f(x) + \\htmlClass{t-d link-d}{d}');
	});
});
