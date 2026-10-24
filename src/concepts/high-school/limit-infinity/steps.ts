import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS, type StepId } from './step-ids.ts';

const DURS = [3.5, 5.5, 5, 7, 7];
export const PREDICT = STEP_IDS.indexOf('predict');
/** Seconds into `predict` where the question stops playback (L-12): handles parked, nothing shot off yet. */
export const PAUSE = 0.8;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === PREDICT ? { pause: PAUSE } : {})
}));

export type LIScenario = 'recip' | 'recipSq' | 'rational' | 'pen';

/** Example per step (L-03). */
export const SCENARIO: Record<StepId, LIScenario> = {
	intro: 'recip',
	predict: 'recip',
	'both-up': 'recipSq',
	'at-infinity': 'rational',
	continuity: 'pen'
};

/** Dragged values; null means "follow the animation" (view schedule). */
export interface LIUser {
	xl: number | null;
	xr: number | null;
	/** Zoom level, log₁₀ (both-up only). */
	z: number | null;
	/** Predicted direction on each side of 0: 1 = up (+∞), −1 = down (−∞). */
	gl: 1 | -1 | null;
	gr: 1 | -1 | null;
	/** Pen position (continuity). */
	pen: number | null;
}

export const POLICY = { xl: 'restage', xr: 'restage', z: 'restage', gl: 'restage', gr: 'restage', pen: 'restage' } as const;

const FRESH: LIUser = { xl: null, xr: null, z: null, gl: null, gr: null, pen: null };
export const stepDefaults = (): Partial<LIUser> => ({ ...FRESH });
export const initialUser = (): LIUser => ({ ...FRESH });

/** In at-infinity the handles keep to their own side of the asymptote x = −1 and of the y-axis. */
export const OUTWARD_LIMITS = { left: -1.5, right: 0 } as const;
