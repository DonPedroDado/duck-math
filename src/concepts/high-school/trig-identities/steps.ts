import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [1.8, 4.0, 2.5, 3.0, 3.0];
const DEFS: readonly StepDef[] = STEP_IDS.map((id, k) => ({ id, dur: DURS[k] }));
/** Supplement carries the predict pause: the student places a guess before the answer appears. */
export const STEPS: readonly StepDef[] = DEFS.map((d) => (d.id === 'supplement' ? { ...d, pause: 0.3 } : d));

export interface IDUser {
	theta: number;
	unit: 'deg' | 'rad';
	moved: boolean;
	/** Predicted angle of the 180° − θ mirror point on the circle; null until placed. */
	guess: number | null;
}

/** 50 degrees: not special, so the snap in later steps stays discoverable. */
export const DEFAULT_THETA = (50 * Math.PI) / 180;
export const GUESS_DEFAULT = (270 * Math.PI) / 180;

export const POLICY = { theta: 'keep', unit: 'keep', moved: 'keep', guess: 'restage' } as const;

export function stepDefaults(): Partial<IDUser> {
	return { guess: null };
}

export function initialUser(_i: number): IDUser {
	void _i;
	return { theta: DEFAULT_THETA, unit: 'deg', moved: false, guess: null };
}
