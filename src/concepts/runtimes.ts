import type { ConceptRuntime } from './types';

const mods = import.meta.glob<{ default: ConceptRuntime }>('/src/concepts/*/*/runtime.ts');

/** `path` is the unlocalized manifest path, with leading and trailing slash. */
export async function loadRuntime(path: string): Promise<ConceptRuntime | null> {
	const load = mods[`/src/concepts${path}runtime.ts`];
	return load ? (await load()).default : null;
}
