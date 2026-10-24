import type { LinkId } from './ids.ts';
import { clearLink, setLink, toggleLink } from './link.svelte.ts';

let lastType = 'mouse';

/**
 * Pointer handlers for SVG elements that take part in formula/visual linking.
 * On touch, enter/leave fire around the tap, so only click toggles
 * (prevents set-clear-toggle cancelling itself).
 */
export function linkAttrs(id: LinkId) {
	return {
		'data-link': id,
		onpointerenter(e: PointerEvent) {
			if (e.pointerType !== 'touch') setLink(id);
		},
		onpointerleave(e: PointerEvent) {
			if (e.pointerType !== 'touch') clearLink();
		},
		onpointerdown(e: PointerEvent) {
			lastType = e.pointerType;
		},
		onclick(e: MouseEvent) {
			if (lastType === 'touch') {
				e.stopPropagation();
				toggleLink(id);
			}
		}
	};
}
