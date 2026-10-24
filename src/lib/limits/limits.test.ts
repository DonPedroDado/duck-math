import { describe, it, expect } from 'vitest';
import { SCENARIOS, limitOf, definedAt, type Scenario } from './scenario.ts';
import { clampSide, digitsFor, minGap, readout, zoomFrame, Z_MAX } from './approach.ts';
import { EDGE_U, outwardDrag, outwardHalf, outwardU, outwardX, U_MAX } from './outward.ts';
import { sampleRuns } from '#lib/graph/sample.ts';

describe('scenarios (L-03, L-04)', () => {
	it('declared limits', () => {
		const L = Object.fromEntries(Object.values(SCENARIOS).map((s) => [s.id, limitOf(s)]));
		expect(L).toEqual({
			hole: 2,
			holeValue: 2,
			jump: 'dne',
			osc: 'dne',
			recip: 'dne',
			recipSq: Infinity,
			rational: 2
		});
	});
	it('declared one-sided limits match the curve close to a', () => {
		for (const s of Object.values(SCENARIOS)) {
			if (typeof s.at !== 'number') continue;
			for (const [side, dx] of [['left', -1e-7], ['right', 1e-7]] as const) {
				const lim = s[side];
				if (lim === 'osc') continue;
				const y = s.f(s.at + dx);
				if (Number.isFinite(lim)) expect(y, `${s.id} ${side}`).toBeCloseTo(lim as number, 5);
				else expect(Math.sign(y) * (Math.abs(y) > 1e6 ? Infinity : 0), `${s.id} ${side}`).toBe(lim);
			}
		}
	});
	it('limits at infinity match the curve far out', () => {
		const s = SCENARIOS.rational;
		expect(s.f(-1e9)).toBeCloseTo(s.left as number, 6);
		expect(s.f(1e9)).toBeCloseTo(s.right as number, 6);
	});
	it('plotting and reading out never evaluate f at a', () => {
		for (const base of Object.values(SCENARIOS)) {
			if (typeof base.at !== 'number') continue;
			const a = base.at;
			const s: Scenario = {
				...base,
				f: (x) => {
					if (x === a) throw new Error(`${base.id}: f evaluated at a`);
					return base.f(x);
				}
			};
			// The approach point lands exactly on a sample here (−3 + 6·i/360).
			expect(() => sampleRuns(s.f, definedAt(s), a - 3, a + 3, 10, 360, s.breaks)).not.toThrow();
			expect(() => readout(s, a - 1e-12, 'left')).not.toThrow();
		}
	});
	it('the hole formula alone gives 0/0 at a (why the limit is declared)', () => {
		expect(SCENARIOS.hole.f(1)).toBeNaN();
	});
});

describe('approach (L-05, L-06, L-08)', () => {
	it('handles stay on their own side, never on a', () => {
		const a = 1;
		const gap = minGap(3);
		for (const x of [-5, 0.5, 0.999, 1, 1.0001, 3, 9]) {
			const l = clampSide(x, a, 'left', gap, -2, 4);
			const r = clampSide(x, a, 'right', gap, -2, 4);
			expect(l).toBeLessThanOrEqual(a - gap);
			expect(r).toBeGreaterThanOrEqual(a + gap);
			expect(l).toBeGreaterThanOrEqual(-2);
			expect(r).toBeLessThanOrEqual(4);
		}
	});
	it('the gap shrinks with zoom but stays a fixed share of the window', () => {
		const f0 = zoomFrame(1, 2, 0, 3);
		const f2 = zoomFrame(1, 2, 2, 3);
		expect(f2.hx).toBeCloseTo(0.03, 12);
		expect(minGap(f2.hx) / f2.hx).toBe(minGap(f0.hx) / f0.hx);
		expect(zoomFrame(1, 2, 99, 3).hx).toBeCloseTo(3 * 10 ** -Z_MAX, 15);
	});
	it('readout uses the declared limit below float safety', () => {
		expect(readout(SCENARIOS.hole, 1 + 1e-12, 'right')).toBe(2);
		expect(readout(SCENARIOS.jump, 1 - 1e-12, 'left')).toBe(2);
		expect(readout(SCENARIOS.hole, 1.5, 'right')).toBeCloseTo(2.5, 12);
	});
	it('readout digits grow with zoom', () => {
		expect(digitsFor(3)).toBe(2);
		expect(digitsFor(0.03)).toBeGreaterThan(digitsFor(3));
		expect(digitsFor(3e-4)).toBeLessThanOrEqual(7);
	});
});

describe('outward zoom for x → ±∞ (L-09)', () => {
	const H = 6;
	it('is linear inside the edge and creeps toward 1 beyond it', () => {
		expect(outwardU(3, H)).toBeCloseTo(0.5, 12);
		expect(outwardU(-3, H)).toBeCloseTo(-0.5, 12);
		expect(outwardU(EDGE_U * H, H)).toBeCloseTo(EDGE_U, 12);
		expect(outwardU(1e6, H)).toBeLessThan(1);
	});
	it('is continuous and monotone, and outwardX inverts it', () => {
		let last = -1;
		for (let x = 0.01; x < 1e5; x *= 1.01) {
			const u = outwardU(x, H);
			expect(u).toBeGreaterThan(last);
			if (last >= 0) expect(u - last).toBeLessThan(0.02);
			last = u;
			if (u <= U_MAX) expect(outwardX(u, H) / x).toBeCloseTo(1, 9);
		}
	});
	it('reaches the thousands within the screen', () => {
		expect(outwardX(U_MAX, H)).toBeGreaterThan(1000);
	});
	it('the widest handle sits exactly at its screen fraction', () => {
		for (const x of [2, 4.8, 10, 250, 3000]) {
			const h = outwardHalf([x, -1], H);
			expect(x / h).toBeCloseTo(Math.abs(outwardU(x, H)), 12);
		}
		expect(outwardHalf([1, -2], H)).toBe(H);
	});
	it('relative drag never jumps on grab', () => {
		expect(outwardDrag(-40, 0.3, 0.3, H)).toBeCloseTo(-40, 9);
		expect(outwardDrag(50, -0.5, -0.45, H)).toBeGreaterThan(50);
	});
});
