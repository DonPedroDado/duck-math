import type { Component } from 'svelte';

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
