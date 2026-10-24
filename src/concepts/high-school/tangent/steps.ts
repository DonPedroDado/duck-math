import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [1.6, 4.0, 2.0, 2.5, 2.0, 1.5];

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(id === 'tan' ? { pause: 1.4 } : {})
}));

export interface TNUser {
	theta: number;
	moved: boolean;
	/** Height of the student's guess on x = 1, in units; null until placed. */
	guess: number | null;
}

/** D-02: a fresh start, independent of the Unit circle. */
export const DEFAULT_THETA = (35 * Math.PI) / 180;
/** The predict question is about this angle; theta is restaged to it on entering tan. */
export const PREDICT_THETA = (80 * Math.PI) / 180;
/** Neutral start of the guess marker on x = 1. */
export const GUESS_DEFAULT = 1;

export const POLICY = { theta: 'restage', moved: 'keep', guess: 'restage' } as const;

const TAN = STEP_IDS.indexOf('tan');

export function stepDefaults(i: number, prev: number): Partial<TNUser> {
	if (i === TAN && prev < TAN) return { theta: PREDICT_THETA, guess: null };
	return { guess: null };
}

export function initialUser(i: number): TNUser {
	return { theta: i === TAN ? PREDICT_THETA : DEFAULT_THETA, moved: false, guess: null };
}
