import type { CategoryId, ConceptManifest } from './types';

const mods = import.meta.glob<{ default: ConceptManifest }>('/src/concepts/*/*/index.ts', {
	eager: true
});

export const concepts: ConceptManifest[] = Object.values(mods)
	.map((x) => x.default)
	.sort((a, b) => a.order - b.order);

export const conceptsIn = (c: CategoryId): ConceptManifest[] =>
	concepts.filter((x) => x.category === c);
