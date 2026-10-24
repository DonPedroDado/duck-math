import { locate, stepStart, stepEnd, totalDuration, type StepDef } from './timeline';

export const MAX_DT = 0.05;

export interface PlayerState {
	t: number;
	step: number;
	playing: boolean;
	rate: number;
	/** False only while a predict pause of the current step has not been revealed in this visit. */
	revealed: boolean;
}
export type PlayerAction =
	| { type: 'tick'; dt: number }
	| { type: 'play' }
	| { type: 'pause' }
	| { type: 'toggle' }
	| { type: 'next' }
	| { type: 'prev' }
	| { type: 'reset' }
	| { type: 'seek'; t: number }
	| { type: 'goto'; step: number }
	| { type: 'reveal' };

export function initialState(steps: readonly StepDef[], step = 0): PlayerState {
	return { t: stepEnd(steps, step), step, playing: false, rate: 1, revealed: true };
}

export function isStaged(steps: readonly StepDef[], s: PlayerState): boolean {
	return s.t >= stepEnd(steps, s.step) - 1e-9;
}

/** Absolute time of the predict pause of step i, or null. */
export function pauseTime(steps: readonly StepDef[], i: number): number | null {
	const p = steps[i].pause;
	return p === undefined ? null : stepStart(steps, i) + p;
}

export function awaiting(steps: readonly StepDef[], s: PlayerState): boolean {
	const pt = pauseTime(steps, s.step);
	return pt !== null && !s.revealed && Math.abs(s.t - pt) < 1e-9;
}

export type PredictPhase = 'none' | 'before' | 'awaiting' | 'after';

export function predictPhase(steps: readonly StepDef[], s: PlayerState): PredictPhase {
	const pt = pauseTime(steps, s.step);
	if (pt === null) return 'none';
	if (s.revealed || s.t > pt + 1e-9) return 'after';
	return Math.abs(s.t - pt) < 1e-9 ? 'awaiting' : 'before';
}

function revealed(s: PlayerState): PlayerState {
	return { ...s, revealed: true, playing: true };
}

function play(steps: readonly StepDef[], s: PlayerState): PlayerState {
	const last = steps.length - 1;
	if (awaiting(steps, s)) return revealed(s);
	if (s.t < stepEnd(steps, s.step) - 1e-9) return s.playing ? s : { ...s, playing: true };
	if (s.step < last) return { ...s, step: s.step + 1, t: stepStart(steps, s.step + 1), playing: true, revealed: false };
	return { ...s, step: 0, t: 0, playing: true, revealed: false };
}

export function reduce(steps: readonly StepDef[], s: PlayerState, a: PlayerAction): PlayerState {
	const last = steps.length - 1;
	switch (a.type) {
		case 'play':
			return play(steps, s);
		case 'toggle':
			return s.playing ? { ...s, playing: false } : play(steps, s);
		case 'pause':
			return s.playing ? { ...s, playing: false } : s;
		case 'tick': {
			if (!s.playing || !Number.isFinite(a.dt)) return s;
			const end = stepEnd(steps, s.step);
			const pt = s.revealed ? null : pauseTime(steps, s.step);
			const cap = pt !== null && s.t < pt + 1e-9 ? pt : end;
			const t = Math.min(s.t + Math.min(Math.max(a.dt, 0), MAX_DT) * s.rate, cap);
			return { ...s, t, playing: t < cap };
		}
		case 'reveal':
			return awaiting(steps, s) ? revealed(s) : s;
		case 'next':
			if (awaiting(steps, s)) return revealed(s);
			if (s.step >= last) return s;
			return { ...s, step: s.step + 1, t: stepStart(steps, s.step + 1), playing: true, revealed: false };
		case 'prev': {
			const step = Math.max(s.step - 1, 0);
			return { ...s, step, t: stepEnd(steps, step), playing: false, revealed: true };
		}
		case 'reset':
			return { ...s, step: 0, t: stepEnd(steps, 0), playing: false, revealed: true };
		case 'seek': {
			if (!Number.isFinite(a.t)) return s;
			const t = Math.min(Math.max(a.t, 0), totalDuration(steps));
			const i = locate(steps, t).i;
			const pt = pauseTime(steps, i);
			return { ...s, t, step: i, playing: false, revealed: pt === null ? true : t > pt + 1e-9 };
		}
		case 'goto': {
			if (!Number.isFinite(a.step)) return s;
			const step = Math.min(Math.max(Math.trunc(a.step), 0), last);
			return { ...s, step, t: stepEnd(steps, step), playing: false, revealed: true };
		}
	}
}

export type ParamPolicy = 'keep' | 'restage';

export function restage<P extends object>(
	user: P,
	policy: { [K in keyof P]?: ParamPolicy },
	defaults: Partial<P>
): P {
	const out = { ...user };
	for (const key of Object.keys(policy) as (keyof P)[]) {
		if (policy[key] === 'restage' && key in defaults) out[key] = defaults[key] as P[keyof P];
	}
	return out;
}
