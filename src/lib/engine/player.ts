import { locate, stepStart, stepEnd, totalDuration, type StepDef } from './timeline';

export const MAX_DT = 0.05;

export interface PlayerState {
	t: number;
	step: number;
	playing: boolean;
	rate: number;
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
	| { type: 'goto'; step: number };

export function initialState(steps: readonly StepDef[], step = 0): PlayerState {
	return { t: stepEnd(steps, step), step, playing: false, rate: 1 };
}

export function isStaged(steps: readonly StepDef[], s: PlayerState): boolean {
	return s.t >= stepEnd(steps, s.step) - 1e-9;
}

function play(steps: readonly StepDef[], s: PlayerState): PlayerState {
	const last = steps.length - 1;
	if (s.t < stepEnd(steps, s.step) - 1e-9) return s.playing ? s : { ...s, playing: true };
	if (s.step < last) return { ...s, step: s.step + 1, t: stepStart(steps, s.step + 1), playing: true };
	return { ...s, step: 0, t: 0, playing: true };
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
			const t = Math.min(s.t + Math.min(Math.max(a.dt, 0), MAX_DT) * s.rate, end);
			return { ...s, t, playing: t < end };
		}
		case 'next':
			if (s.step >= last) return s;
			return { ...s, step: s.step + 1, t: stepStart(steps, s.step + 1), playing: true };
		case 'prev': {
			const step = Math.max(s.step - 1, 0);
			return { ...s, step, t: stepEnd(steps, step), playing: false };
		}
		case 'reset':
			return { ...s, step: 0, t: stepEnd(steps, 0), playing: false };
		case 'seek': {
			if (!Number.isFinite(a.t)) return s;
			const t = Math.min(Math.max(a.t, 0), totalDuration(steps));
			return { ...s, t, step: locate(steps, t).i, playing: false };
		}
		case 'goto': {
			if (!Number.isFinite(a.step)) return s;
			const step = Math.min(Math.max(Math.trunc(a.step), 0), last);
			return { ...s, step, t: stepEnd(steps, step), playing: false };
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
