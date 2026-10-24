import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [2.0, 3.5, 5.0];

export const UNROLL = 1;
export const SINE = 2;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === SINE ? { pause: 0.5 } : {})
}));

export interface SGUser {
	/** UNWRAPPED angle; may later exceed 2π. */
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

export function stepDefaults(i: number, prev: number): Partial<SGUser> {
	return { moved: false, guess: null, ...(i <= UNROLL && prev >= SINE ? { theta: DEFAULT_THETA } : {}) };
}

export function initialUser(_i: number): SGUser {
	return { theta: DEFAULT_THETA, unit: 'deg', moved: false, guess: null };
}
