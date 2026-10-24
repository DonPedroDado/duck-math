/** Closed set of link roles shared by formulas (TeX classes `link-<id>`) and visuals (`data-link`). */
export const LINK_IDS = [
	'angle',
	'point',
	'cos',
	'sin',
	'tan',
	'sec',
	'csc',
	'cot',
	'cos2',
	'sin2',
	'one',
	'ghost-neg',
	'ghost-supp',
	'ghost-comp',
	'radian',
	'a',
	'b',
	'c',
	'd',
	'f',
	'ghost',
	'left',
	'right',
	'lim',
	'asym'
] as const;

export type LinkId = (typeof LINK_IDS)[number];

export function isLinkId(s: string): s is LinkId {
	return (LINK_IDS as readonly string[]).includes(s);
}

/** Resolve a link id from a DOM class string. Unknown `link-*` tokens are ignored (closed union). */
export function linkFromClass(className: string): LinkId | null {
	const tok = className.split(/\s+/).find((t) => t.startsWith('link-'));
	if (!tok) return null;
	const id = tok.slice(5);
	return isLinkId(id) ? id : null;
}

/** Opacity for an element owning `own` while `active` is highlighted. */
export function linkOpacity(own: LinkId | readonly LinkId[], active: LinkId | null): string {
	if (active === null) return '1';
	const owns = typeof own === 'string' ? own === active : own.includes(active);
	return owns ? '1' : 'var(--dim-opacity)';
}
