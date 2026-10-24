import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS, type StepId } from './step-ids.ts';

const DURS = [2.5, 3.5, 4.5, 4.0, 4.0, 2.0];
export const HORIZONTAL = STEP_IDS.indexOf('horizontal');
/** Seconds into `horizontal` where "where does the peak of f(2x) land?" stops playback. */
export const PAUSE = 1.3;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === HORIZONTAL ? { pause: PAUSE } : {})
}));

/** Dragged values; null follows the schedule. */
export interface SRUser {
	a: number | null;
	b: number | null;
	/** Predicted x of the peak of f(2x); null until placed. */
	guess: number | null;
}

export const POLICY = { a: 'restage', b: 'restage', guess: 'restage' } as const;
export const RANGE = { a: [-3, 3], b: [-3, 3] } as const;

export const stepDefaults = (): Partial<SRUser> => ({ a: null, b: null, guess: null });
export const initialUser = (): SRUser => ({ a: null, b: null, guess: null });

export const ACTIVE: Record<StepId, readonly ('a' | 'b')[]> = {
	intro: [],
	vertical: ['a'],
	horizontal: ['b'],
	'reflect-x': ['a'],
	'reflect-y': ['b'],
	explore: ['a', 'b']
};
/** The line that stays put while the step's param changes (F-10). */
export const FIXED: Record<StepId, 'x' | 'y' | null> = {
	intro: null,
	vertical: 'x',
	horizontal: 'y',
	'reflect-x': 'x',
	'reflect-y': 'y',
	explore: null
};
