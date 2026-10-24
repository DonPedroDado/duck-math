import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS } from './step-ids.ts';

const DURS = [1.8, 4.0, 2.5, 3.0, 3.0, 4.0, 5.0, 1.0];
const DEFS: readonly StepDef[] = STEP_IDS.map((id, k) => ({ id, dur: DURS[k] }));
/** Supplement carries the predict pause: the student places a guess before the answer appears. */
export const STEPS: readonly StepDef[] = DEFS.map((d) => (d.id === 'supplement' ? { ...d, pause: 0.3 } : d));

export const SQUARE45 = STEP_IDS.indexOf('square45');
export const TRI3060 = STEP_IDS.indexOf('triangle3060');
export const SPECIAL_STEP = STEP_IDS.indexOf('special');

export interface Ghosts {
	neg: boolean;
	supp: boolean;
	comp: boolean;
}

export interface IDUser {
	theta: number;
	unit: 'deg' | 'rad';
	moved: boolean;
	/** Predicted angle of the 180° − θ mirror point on the circle; null until placed. */
	guess: number | null;
	/** Free-exploration mirror toggles (final step). */
	ghosts: Ghosts;
	/** Free-exploration squares toggle (final step). */
	squares: boolean;
}

/** 50 degrees: not special, so the snap in later steps stays discoverable. */
export const DEFAULT_THETA = (50 * Math.PI) / 180;
export const GUESS_DEFAULT = (270 * Math.PI) / 180;

export const POLICY = {
	theta: 'restage',
	unit: 'keep',
	moved: 'keep',
	guess: 'restage',
	ghosts: 'restage',
	squares: 'restage'
} as const;

const rad = (d: number) => (d * Math.PI) / 180;

/** Fresh object on every call. Theta is restaged only on entering the two derivation steps (D-06 otherwise keeps it). */
export function stepDefaults(i: number, prev: number): Partial<IDUser> {
	return {
		guess: null,
		ghosts: { neg: false, supp: false, comp: false },
		squares: false,
		...(i === SQUARE45 && prev !== SQUARE45 ? { theta: rad(45) } : {}),
		...(i === TRI3060 && prev !== TRI3060 ? { theta: rad(60) } : {})
	};
}

export function initialUser(i: number): IDUser {
	return {
		theta: i === SQUARE45 ? rad(45) : i === TRI3060 ? rad(60) : DEFAULT_THETA,
		unit: 'deg',
		moved: false,
		guess: null,
		ghosts: { neg: false, supp: false, comp: false },
		squares: false
	};
}
