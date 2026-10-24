import { norm, TAU } from '#lib/engine/angle.ts';
import { easeMath } from '#lib/engine/timeline.ts';

export interface JumpDeps {
	raf: (cb: FrameRequestCallback) => number;
	caf: (id: number) => void;
	now: () => number;
}

/** Shortest-path angle at progress k (eased). */
export function jumpAngle(from: number, to: number, k: number): number {
	let d = (((to - from) % TAU) + TAU) % TAU;
	if (d > Math.PI) d -= TAU;
	return norm(from + d * easeMath(k));
}

// Single module-level tween: one writer at a time (T-02-28).
let handle: number | null = null;
let cancelFn: ((id: number) => void) | null = null;

export function cancelJump(): void {
	if (handle !== null && cancelFn) cancelFn(handle);
	handle = null;
}

const defaultDeps = (): JumpDeps => ({
	raf: (cb) => requestAnimationFrame(cb),
	caf: (id) => cancelAnimationFrame(id),
	now: () => performance.now()
});

export function startJump(
	from: number,
	to: number,
	apply: (theta: number) => void,
	ms = 400,
	deps?: JumpDeps
): void {
	cancelJump();
	const final = to >= 0 && to < TAU ? to : norm(to);
	const reduced =
		deps === undefined &&
		typeof matchMedia === 'function' &&
		matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) {
		apply(final);
		return;
	}
	const d = deps ?? defaultDeps();
	cancelFn = d.caf;
	const t0 = d.now();
	const tick = () => {
		const k = Math.min(1, (d.now() - t0) / ms);
		if (k >= 1) {
			handle = null;
			apply(final);
			return;
		}
		apply(jumpAngle(from, to, k));
		handle = d.raf(tick);
	};
	handle = d.raf(tick);
}
