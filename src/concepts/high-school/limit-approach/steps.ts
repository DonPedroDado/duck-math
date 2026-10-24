import type { StepDef } from '#lib/engine/timeline.ts';
import { STEP_IDS, type StepId } from './step-ids.ts';

const DURS = [3, 4.5, 5, 5, 5, 5.5, 6.5];
export const PREDICT = STEP_IDS.indexOf('predict');
/** Seconds into `predict` where the question stops playback (L-11): nothing at x = 1 yet. */
export const PAUSE = 0.8;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === PREDICT ? { pause: PAUSE } : {})
}));

export type LAScenario = 'hole' | 'holeValue' | 'jump' | 'osc';

/** Example per step (L-03). */
export const SCENARIO: Record<StepId, LAScenario> = {
	intro: 'hole',
	predict: 'hole',
	approach: 'hole',
	zoom: 'hole',
	value: 'holeValue',
	jump: 'jump',
	oscillate: 'osc'
};

/** Dragged values; null means "follow the animation" (view schedule). */
export interface LAUser {
	/** Handle positions (math x). */
	xl: number | null;
	xr: number | null;
	/** Zoom level, log₁₀ (L-08). */
	z: number | null;
	/** Predicted f(1); null until placed. */
	guess: number | null;
}

/** Every step re-stages: each example starts from its own approach and zoom. */
export const POLICY = { xl: 'restage', xr: 'restage', z: 'restage', guess: 'restage' } as const;

export const stepDefaults = (): Partial<LAUser> => ({ xl: null, xr: null, z: null, guess: null });
export const initialUser = (): LAUser => ({ xl: null, xr: null, z: null, guess: null });

/** Steps with the zoom control. */
export const ZOOMABLE: Record<StepId, boolean> = {
	intro: false,
	predict: false,
	approach: false,
	zoom: true,
	value: true,
	jump: true,
	oscillate: true
};
