import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [2.0, 2.5, 4.0, 2.0, 2.5, 2.5];

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({ id, dur: DURS[k] }));

export interface UCUser {
	theta: number;
	unit: 'deg' | 'rad';
	moved: boolean;
}

export const DEFAULT_THETA = Math.PI / 3;

/** D-03: theta kept across steps; unit re-staged when a step change crosses the radians boundary. */
export const POLICY = { theta: 'keep', unit: 'restage', moved: 'keep' } as const;

const RADIANS = 3;

export function stepDefaults(i: number, prev: number): Partial<UCUser> {
	if (i < RADIANS) return { unit: 'deg' };
	if (prev < RADIANS) return { unit: 'rad' };
	return {};
}

export function initialUnit(i: number): 'deg' | 'rad' {
	return i >= RADIANS ? 'rad' : 'deg';
}

export function initialUser(i: number): UCUser {
	return { theta: DEFAULT_THETA, unit: initialUnit(i), moved: false };
}
