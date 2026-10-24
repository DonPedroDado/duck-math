import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [2.5, 3.5, 4.5, 3.0, 2.0, 2.5];
export const OPPOSITE = STEP_IDS.indexOf('opposite');
/** Seconds into `opposite` where the predict question stops playback (F-11). */
export const PAUSE = 1.2;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === OPPOSITE ? { pause: PAUSE } : {})
}));

/** Dragged values; null means "follow the animation" (view schedule). */
export interface SHUser {
	c: number | null;
	d: number | null;
	/** Predicted x of the peak of f(x + 2); null until placed. */
	guess: number | null;
}

export const POLICY = { c: 'restage', d: 'restage', guess: 'restage' } as const;
export const RANGE = { c: [-4, 4], d: [-3, 3] } as const;

export const stepDefaults = (): Partial<SHUser> => ({ c: null, d: null, guess: null });
export const initialUser = (): SHUser => ({ c: null, d: null, guess: null });

/** Params the student may drag in each step (F-08). */
export const ACTIVE: Record<(typeof STEP_IDS)[number], readonly ('c' | 'd')[]> = {
	intro: [],
	vertical: ['d'],
	opposite: ['c'],
	lookup: ['c'],
	horizontal: ['c'],
	both: ['c', 'd']
};
