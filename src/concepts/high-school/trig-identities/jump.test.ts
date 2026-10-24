import { describe, it, expect } from 'vitest';
import { jumpAngle, startJump, cancelJump, type JumpDeps } from './jump';

const rad = (d: number) => (d * Math.PI) / 180;

function fake() {
	let t = 0;
	let cb: FrameRequestCallback | null = null;
	const deps: JumpDeps = {
		raf: (f) => {
			cb = f;
			return 1;
		},
		caf: () => {
			cb = null;
		},
		now: () => t
	};
	return {
		deps,
		step(dt: number) {
			t += dt;
			const f = cb;
			cb = null;
			f?.(t);
		}
	};
}

describe('jump', () => {
	it('shortest path and endpoints', () => {
		expect(jumpAngle(rad(350), rad(30), 0.5)).toBeCloseTo(rad(10), 9);
		expect(jumpAngle(rad(20), rad(70), 0)).toBeCloseTo(rad(20), 9);
		expect(jumpAngle(rad(20), rad(70), 1)).toBeCloseTo(rad(70), 9);
	});
	it('runs to the target', () => {
		const f = fake();
		const seen: number[] = [];
		startJump(0, rad(60), (t) => seen.push(t), 400, f.deps);
		for (let i = 0; i < 10; i++) f.step(50);
		expect(seen.length).toBeGreaterThan(2);
		expect(seen.at(-1)).toBe(rad(60));
		for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeGreaterThanOrEqual(seen[i - 1]);
	});
	it('cancel stops applying', () => {
		const f = fake();
		const seen: number[] = [];
		startJump(0, rad(60), (t) => seen.push(t), 400, f.deps);
		f.step(100);
		cancelJump();
		const n = seen.length;
		f.step(100);
		f.step(400);
		expect(seen.length).toBe(n);
	});
});
