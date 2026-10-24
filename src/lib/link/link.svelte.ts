import type { LinkId } from './ids.ts';

/** Currently highlighted link role. Never written during SSR/prerender (only from client events). */
export const link = $state<{ id: LinkId | null }>({ id: null });

export function setLink(id: LinkId | null): void {
	link.id = id;
}
export function clearLink(): void {
	link.id = null;
}
export function toggleLink(id: LinkId | null): void {
	link.id = id === null || link.id === id ? null : id;
}
