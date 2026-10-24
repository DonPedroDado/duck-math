import { initialState, reduce, type PlayerAction, type PlayerState } from './player';
import type { StepDef } from './timeline';

/** rAF loop around the pure reducer. SSR-safe. */
export class Player {
	state = $state<PlayerState>({ t: 0, step: 0, playing: false, rate: 1, revealed: true });

	private raf = 0;
	private running = false;
	private session = 0;
	private last = 0;
	private destroyed = false;

	constructor(
		private steps: readonly StepDef[],
		initialStep: number,
		private onstep?: (i: number, prev: number) => void
	) {
		this.state = initialState(steps, initialStep);
	}

	dispatch(a: PlayerAction): void {
		if (this.destroyed) return;
		const prev = this.state;
		const next = reduce(this.steps, prev, a);
		if (next === prev) return;
		this.state = next;
		if (next.step !== prev.step) this.onstep?.(next.step, prev.step);
		if (next.playing && !this.running) this.start();
		else if (!next.playing && this.running) this.stop();
	}

	/** Starts the loop once per play session; the loop owns re-scheduling so rAF timestamps are kept frame to frame. */
	private start(): void {
		if (typeof requestAnimationFrame === 'undefined') return;
		this.running = true;
		this.last = performance.now();
		const id = ++this.session;
		const loop = (ts: number) => {
			// A frame from an earlier (stopped) session must never drive the clock.
			if (id !== this.session) return;
			this.raf = 0;
			if (this.destroyed || !this.running) return;
			const dt = Math.max(0, (ts - this.last) / 1000);
			this.last = ts;
			this.dispatch({ type: 'tick', dt });
			if (this.running && this.state.playing && !this.destroyed) this.raf = requestAnimationFrame(loop);
			else this.running = false;
		};
		this.raf = requestAnimationFrame(loop);
	}

	private stop(): void {
		this.running = false;
		this.session++;
		if (this.raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.raf);
		this.raf = 0;
	}

	destroy(): void {
		this.destroyed = true;
		this.stop();
	}
}
