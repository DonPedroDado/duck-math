import type { Component } from 'svelte';
import type { StepDef } from '#lib/engine/timeline.ts';
import type { ParamPolicy, PredictPhase } from '#lib/engine/player.ts';

/**
 * The concept module contract (MOD-01). A concept is a folder
 * `src/concepts/<category>/<id>/` with an `index.ts` (default export: ConceptManifest, eager,
 * used by the catalog) and a `runtime.ts` (default export: ConceptRuntime, lazy, used by the
 * concept page). The shell discovers both by glob; adding a folder needs no shell edit (MOD-02).
 * See src/concepts/AUTHORING.md.
 */

/** State of a predict pause, passed to Scene and Panel while the current step has one. */
export interface PredictCtx {
	phase: PredictPhase;
	/** Reveal the answer (same as the player's Reveal button). */
	onreveal: () => void;
}

/** Props of a concept's Scene (the stage visual). U = user params, V = view schedule. */
export interface SceneProps<U, V> {
	/** The view schedule at the current time: `runtime.view(t, user)`. */
	v: V;
	/** The params the student owns (dragged values). */
	user: U;
	/** Current step index. */
	step: number;
	/** Current step id (URL segment). */
	stepId: string;
	/** Localized step title, for the stage's accessible label. */
	title: string;
	/** True while the timeline animates; glow strokes only then. */
	glowing: boolean;
	/** Write user params. The only way a Scene changes state. */
	update: (patch: Partial<U>) => void;
	/** Call on any drag or key interaction: pauses playback and hands control to the student. */
	oninteract: () => void;
	predict?: PredictCtx;
}

/** Props of a concept's Panel (counter, title, caption, formulas, controls). */
export interface PanelProps<U, V> {
	v: V;
	user: U;
	step: number;
	stepId: string;
	/** Current locale, for number formatting. */
	locale: string;
	update: (patch: Partial<U>) => void;
	predict?: PredictCtx;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ConceptRuntime<U extends object = any, V = any> {
	/** Steps in order: id, duration in seconds, optional predict pause. Ids must equal the manifest's stepIds. */
	steps: readonly StepDef[];
	/** Per user param: 'keep' carries it into the next step, 'restage' resets it from stepDefaults. */
	policy: { [K in keyof U]?: ParamPolicy };
	/** Params to apply when entering step i from step prev. */
	stepDefaults: (i: number, prev: number) => Partial<U>;
	/** User params when a page opens directly on step i (deep link). */
	initialUser: (i: number) => U;
	/** Pure schedule of everything animated: a function of time (and user params), never of frame history. */
	view: (t: number, user: U) => V;
	/** Localized title of step i. */
	stepTitle: (i: number) => string;
	Scene: Component<SceneProps<U, V>>;
	Panel: Component<PanelProps<U, V>>;
	/** 'side' (default): panel beside the stage. 'below': panel under a wide stage. */
	layout?: 'side' | 'below';
}

export type CategoryId = 'high-school' | 'university';

export interface ConceptManifest {
	/** Folder name; also the URL segment. */
	id: string;
	/** Parent folder name. */
	category: CategoryId;
	/** `/<category>/<id>/` (unlocalized, leading and trailing slash). */
	path: string;
	/** Catalog position within the category (ascending). Also defines the Next-concept chain. */
	order: number;
	/** Message functions: catalog card and page title, and the card's one-line hook. */
	title: () => string;
	hook: () => string;
	/** Step ids in order (URL segments). Must match runtime.steps. */
	stepIds: readonly string[];
	/** Small SVG shown on the catalog card. */
	thumbnail?: Component;
}
