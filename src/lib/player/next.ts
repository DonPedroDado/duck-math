export type NextTarget = { kind: 'next'; path: string; title: () => string } | { kind: 'catalog' };

/** Successor in catalog order; the catalog when `id` is last or unknown. */
export function nextConcept(
	list: readonly { id: string; path: string; title: () => string }[],
	id: string
): NextTarget {
	const i = list.findIndex((c) => c.id === id);
	if (i < 0 || i >= list.length - 1) return { kind: 'catalog' };
	const n = list[i + 1];
	return { kind: 'next', path: n.path, title: n.title };
}
