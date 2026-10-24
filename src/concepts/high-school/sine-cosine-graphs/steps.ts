import type { StepDef } from '#lib/engine/timeline.ts';
import { TAU } from '#lib/engine/angle.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [2.0, 3.5, 5.0, 4.0, 4.0, 0.8];

export const UNROLL = 1;
export const SINE = 2;
export const COSINE = 3;
export const PERIODIC = 4;
export const EXPLORE = 5;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === SINE ? { pause: 0.5 } : {})
}));

export interface SGUser {
	/** UNWRAPPED angle; may exceed 2π (up to 4π). */
	theta: number;
	unit: 'deg' | 'rad';
	moved: boolean;
	guess: number | null;
}

/** 60° (D-02). */
export const DEFAULT_THETA = Math.PI / 3;
export const GUESS_DEFAULT = Math.PI;

/**
 * `moved` is restaged on purpose (unlike unit-circle) so each sweep step starts view-driven:
 * the timeline never writes theta (D-11), the display rule picks sweep vs. student theta.
 */
export const POLICY = { theta: 'restage', unit: 'keep', moved: 'restage', guess: 'restage' } as const;

/** Staged theta is the angle the previous step's view ends at, so display stays continuous. */
export function stepDefaults(i: number, prev: number): Partial<SGUser> {
	const base = { moved: false, guess: null };
	if (i <= UNROLL) return prev >= SINE ? { ...base, theta: DEFAULT_THETA } : base;
	// Sine keeps theta for the rewind when entered forward; coming back it restages at the sweep end.
	if (i === SINE) return prev >= COSINE ? { ...base, theta: TAU } : base;
	if (i === COSINE) return { ...base, theta: TAU };
	return { ...base, theta: 2 * TAU };
}

export function initialUser(i: number): SGUser {
	const theta = i >= PERIODIC ? 2 * TAU : i === COSINE ? TAU : DEFAULT_THETA;
	return { theta, unit: 'deg', moved: false, guess: null };
}
