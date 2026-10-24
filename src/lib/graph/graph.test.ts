import { describe, it, expect } from 'vitest';
import { viewport, frame, inside } from './viewport.ts';
import { tickValues, decimalsFor, gridLevels, labelStep, axisAt } from './ticks.ts';
import { BASES, monotoneCubic, inDomain } from './base.ts';
import { apply, lookupSource, mapPoint, mix, IDENTITY, type Params } from './transform.ts';
import { gridLines } from './grid.ts';
import { sampleRuns, sampleDense, runsPath } from './sample.ts';
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

describe('friendly', () => {
	it('snaps near whole numbers, else tenths, and clamps', async () => {
		const { friendly } = await import('./transform.ts');
		expect(friendly(1.87, -4, 4)).toBe(2);
		expect(friendly(1.63, -4, 4)).toBe(1.6);
		expect(friendly(-9, -4, 4)).toBe(-4);
		expect(Object.is(friendly(-0.04, -4, 4), 0)).toBe(true);
	});
});

describe('frame (Phase 4)', () => {
	it('viewport(S, half) is the square frame centred on 0', () => {
		const a = viewport(600, 6);
		const b = frame(600, { cx: 0, cy: 0, hx: 6, hy: 6 });
		for (const u of [-6, -1.5, 0, 4]) {
			expect(a.gx(u)).toBe(b.gx(u));
			expect(a.gy(u)).toBe(b.gy(u));
		}
		expect([a.x0, a.x1, a.y0, a.y1, a.half]).toEqual([-6, 6, -6, 6, 6]);
	});
	it('centres on (cx, cy) with independent scales, and inverts', () => {
		const v = frame(400, { cx: 1, cy: 2, hx: 0.5, hy: 2 });
		expect(v.gx(1)).toBe(200);
		expect(v.gy(2)).toBe(200);
		expect(v.gx(1.5)).toBe(400);
		expect(v.gy(4)).toBe(0);
		expect(v.ux(v.gx(1.234))).toBeCloseTo(1.234, 12);
		expect(v.uy(v.gy(-0.7))).toBeCloseTo(-0.7, 12);
		expect(inside(v, 1.2, 3)).toBe(true);
		expect(inside(v, 1.6, 3)).toBe(false);
	});
});

describe('ticks (Phase 4)', () => {
	it('tick values are clean multiples inside the range', () => {
		expect(tickValues(-0.25, 0.25, 0.1)).toEqual([-0.2, -0.1, 0, 0.1, 0.2]);
		expect(tickValues(0.97, 1.03, 0.01)).toEqual([0.97, 0.98, 0.99, 1, 1.01, 1.02, 1.03]);
	});
	it('decimals show the step exactly', () => {
		expect(decimalsFor(1)).toBe(0);
		expect(decimalsFor(200)).toBe(0);
		expect(decimalsFor(0.5)).toBe(1);
		expect(decimalsFor(0.02)).toBe(2);
		expect(decimalsFor(0.001)).toBe(3);
	});
	it('a range of 12 keeps the Phase 3 look: lines at integers, labels every 2, no finer decade', () => {
		const g = gridLevels(12);
		expect(g.major).toBe(1);
		expect(g.fade).toBeLessThan(0.03);
		expect(labelStep(12, g.major)).toBe(2);
	});
	it('the finer decade fades in continuously as the window shrinks', () => {
		let last = gridLevels(12);
		for (let r = 12; r > 0.012; r *= 0.97) {
			const g = gridLevels(r);
			// Lines visible per unit change smoothly: a new major decade arrives fully faded in.
			if (g.major !== last.major) expect(last.fade).toBeGreaterThan(0.9);
			last = g;
		}
	});
	it('labels never crowd: at most 7 per axis at any zoom', () => {
		for (let r = 0.003; r < 5000; r *= 1.13) {
			const { major } = gridLevels(r);
			expect(r / labelStep(r, major)).toBeLessThanOrEqual(7);
		}
	});
	it('axes sit at 0 when visible, else pin inside the edge', () => {
		expect(axisAt(viewport(600, 6))).toEqual({ ax: 0, ay: 0 });
		const z = frame(600, { cx: 1, cy: 2, hx: 0.05, hy: 0.05 });
		const { ax, ay } = axisAt(z);
		expect(ax).toBeGreaterThan(z.x0);
		expect(ax).toBeLessThan(z.x0 + 0.01);
		expect(ay).toBeGreaterThan(z.y0);
		expect(ay).toBeLessThan(z.y0 + 0.01);
	});
});

describe('sampling at breaks and oscillation (Phase 4)', () => {
	const xsOf = (runs: [number, number][][]) => runs.map((r) => [r[0][0], r[r.length - 1][0]]);
	it('1/x never connects across 0, even with a huge clip', () => {
		const runs = sampleRuns((x) => 1 / x, () => true, -3, 3, 1e9, 360, [0]);
		expect(runs).toHaveLength(2);
		const [[, l1], [r0]] = xsOf(runs);
		expect(l1).toBeLessThan(0);
		expect(r0).toBeGreaterThan(0);
	});
	it('a jump splits into two runs at the break', () => {
		const runs = sampleRuns((x) => (x < 1 ? x + 1 : x - 1), () => true, -2, 4, 6, 360, [1]);
		expect(runs).toHaveLength(2);
		expect(runs[0][runs[0].length - 1][1]).toBeCloseTo(2, 4);
		expect(runs[1][0][1]).toBeCloseTo(0, 4);
	});
	it('re-entering runs start at the clip edge (no gap under an asymptote)', () => {
		const runs = sampleRuns((x) => 1 / x, () => true, -3, 3, 5, 360, [0]);
		expect(runs[1][0][1]).toBe(5);
		expect(runs[0][runs[0].length - 1][1]).toBe(-5);
	});
	it('sampleDense resolves sin(1/x): no neighbours more than tol apart where it can still refine', () => {
		const g = (x: number) => Math.sin(1 / x);
		const [run] = sampleDense(g, () => true, 0.05, 0.5, 1.5, 0.05, 20000).filter((r) => r.length > 1);
		let worst = 0;
		for (let i = 1; i < run.length; i++) worst = Math.max(worst, Math.abs(run[i][1] - run[i - 1][1]));
		expect(worst).toBeLessThanOrEqual(0.05 + 1e-9);
		// Coarse sampling would miss oscillations; dense catches every sign change of the true curve.
		const signs = (r: [number, number][]) => r.reduce((n, p, i) => n + (i && Math.sign(p[1]) !== Math.sign(r[i - 1][1]) ? 1 : 0), 0);
		// sin(1/x) crosses zero at x = 1/(kπ): k from 1 to 6 inside [0.05, 0.5].
		expect(signs(run)).toBe(6);
	});
	it('sampleDense respects its point cap near 0', () => {
		const runs = sampleDense((x) => Math.sin(1 / x), (x) => x !== 0, -0.01, 0.01, 1.5, 0.001, 2400, [0]);
		for (const r of runs) expect(r.length).toBeLessThanOrEqual(2400 * 2 + 400);
	});
});
