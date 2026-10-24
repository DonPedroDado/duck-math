import type { StepDef } from '#lib/engine/timeline.ts';
import type { BaseId } from '#lib/graph/base.ts';
import type { Role } from '#lib/graph/tex.ts';
import { STEP_IDS, type StepId } from './step-ids.ts';

const DURS = [2.5, 2.5, 2.5, 2.5, 2.5, 5.0, 2.0];
export const ORDER = STEP_IDS.indexOf('order');
/** Seconds into `order` where "where does the peak of f(2x − 1) land?" stops playback. */
export const PAUSE = 1.6;

export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({
	id,
	dur: DURS[k],
	...(k === ORDER ? { pause: PAUSE } : {})
}));

/** Dragged values (null follows the schedule), the predict guess and the base graph. */
export interface CBUser {
	a: number | null;
	b: number | null;
	c: number | null;
	d: number | null;
	guess: number | null;
	base: BaseId;
}

export const POLICY = { a: 'restage', b: 'restage', c: 'restage', d: 'restage', guess: 'restage', base: 'restage' } as const;
export const RANGE: Record<Role, readonly [number, number]> = { a: [-3, 3], b: [-3, 3], c: [-4, 4], d: [-3, 3] };

const FRESH: CBUser = { a: null, b: null, c: null, d: null, guess: null, base: 'f' };
export const stepDefaults = (): Partial<CBUser> => ({ ...FRESH });
export const initialUser = (): CBUser => ({ ...FRESH });

/** The param each build step adds, and what the student may drag (F-13). */
export const ACTIVE: Record<StepId, readonly Role[]> = {
	intro: [],
	'build-c': ['c'],
	'build-b': ['b'],
	'build-a': ['a'],
	'build-d': ['d'],
	order: [],
	explore: ['a', 'b', 'c', 'd']
};
/** Terms shown in the live formula: everything applied so far. */
export const APPLIED: Record<StepId, readonly Role[]> = {
	intro: [],
	'build-c': ['c'],
	'build-b': ['c', 'b'],
	'build-a': ['c', 'b', 'a'],
	'build-d': ['c', 'b', 'a', 'd'],
	order: ['c', 'b'],
	explore: ['a', 'b', 'c', 'd']
};
