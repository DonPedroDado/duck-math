import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Player } from './clock.svelte';
import { initialState, MAX_DT } from './player';
import { stepStart, stepEnd } from './timeline';
import { STEPS } from '#concepts/high-school/unit-circle/steps.ts';

let queue: ((ts: number) => void)[];
let now: number;
let cancel: ReturnType<typeof vi.fn>;

beforeEach(() => {
	queue = [];
	now = 0;
	cancel = vi.fn();
	vi.stubGlobal('requestAnimationFrame', (cb: (ts: number) => void) => {
		queue.push(cb);
		return queue.length;
	});
	vi.stubGlobal('cancelAnimationFrame', cancel);
	vi.spyOn(performance, 'now').mockImplementation(() => now);
});
afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

/** run the next queued frame at `now` */
function frame(advanceMs: number) {
	now += advanceMs;
	const cb = queue.shift();
	cb?.(now);
}

describe('Player', () => {
	it('initial state', () => {
		const p = new Player(STEPS, 2);
		expect(p.state).toEqual(initialState(STEPS, 2));
		expect(p.state.t).toBeCloseTo(8.5, 9);
	});
	it('no-op dispatch keeps identity and skips onstep', () => {
		const onstep = vi.fn();
		const p = new Player(STEPS, 0, onstep);
		const before = p.state;
		p.dispatch({ type: 'pause' });
		expect(p.state).toBe(before);
		expect(onstep).not.toHaveBeenCalled();
	});
	it('next calls onstep once and schedules one frame', () => {
		const onstep = vi.fn();
		const p = new Player(STEPS, 0, onstep);
		p.dispatch({ type: 'next' });
		expect(onstep).toHaveBeenCalledTimes(1);
		expect(onstep).toHaveBeenCalledWith(1, 0);
		expect(queue.length).toBe(1);
		p.destroy();
	});
	it('runs to the step end and stops', () => {
		const p = new Player(STEPS, 0);
		p.dispatch({ type: 'next' });
		expect(p.state.t).toBe(stepStart(STEPS, 1));
		for (let k = 0; k < 1000 && queue.length; k++) frame(16.67);
		expect(p.state.t).toBe(stepEnd(STEPS, 1));
		expect(p.state.playing).toBe(false);
		expect(p.state.step).toBe(1);
		expect(queue.length).toBe(0);
	});
	it('large frame gap is clamped', () => {
		const p = new Player(STEPS, 0);
		p.dispatch({ type: 'next' });
		const t0 = p.state.t;
		frame(0);
		frame(5000);
		expect(p.state.t - t0).toBeLessThanOrEqual(MAX_DT + 1e-9);
		p.destroy();
	});
	it('destroy cancels pending frame and ignores late frames', () => {
		const p = new Player(STEPS, 0);
		p.dispatch({ type: 'next' });
		const cb = queue[0];
		p.destroy();
		expect(cancel).toHaveBeenCalledWith(1);
		const t = p.state.t;
		cb(100);
		expect(p.state.t).toBe(t);
		expect(queue.length).toBe(1);
	});
	it('SSR: no requestAnimationFrame does not throw', () => {
		vi.stubGlobal('requestAnimationFrame', undefined);
		const p = new Player(STEPS, 0);
		expect(() => p.dispatch({ type: 'play' })).not.toThrow();
		expect(p.state.playing).toBe(true);
		expect(queue.length).toBe(0);
	});
});
