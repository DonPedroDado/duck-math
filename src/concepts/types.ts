import type { Component } from 'svelte';
import type { StepDef } from '#lib/engine/timeline.ts';
import type { ParamPolicy, PredictPhase } from '#lib/engine/player.ts';

export interface PredictCtx {
	phase: PredictPhase;
	onreveal: () => void;
}

// Provisional; frozen in Phase 3 (MOD-01).
export interface SceneProps<U, V> {
	v: V;
	user: U;
	step: number;
	stepId: string;
	title: string;
	glowing: boolean;
	update: (patch: Partial<U>) => void;
	oninteract: () => void;
	predict?: PredictCtx;
}
export interface PanelProps<U, V> {
	v: V;
	user: U;
	step: number;
	stepId: string;
	locale: string;
	update: (patch: Partial<U>) => void;
	predict?: PredictCtx;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ConceptRuntime<U extends object = any, V = any> {
	steps: readonly StepDef[];
	policy: { [K in keyof U]?: ParamPolicy };
	stepDefaults: (i: number, prev: number) => Partial<U>;
	initialUser: (i: number) => U;
	view: (t: number, user: U) => V;
	stepTitle: (i: number) => string;
	Scene: Component<SceneProps<U, V>>;
	Panel: Component<PanelProps<U, V>>;
	layout?: 'side' | 'below';
}

export type CategoryId = 'high-school' | 'university';

// Provisional; the contract is frozen in Phase 3.
export interface ConceptManifest {
	id: string;
	category: CategoryId;
	/** Unlocalized, trailing slash. */
	path: string;
	order: number;
	title: () => string;
	hook: () => string;
	stepIds: readonly string[];
	thumbnail?: Component;
}
