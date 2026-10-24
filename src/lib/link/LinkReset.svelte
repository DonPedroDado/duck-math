<script lang="ts">
	import { onDestroy } from 'svelte';
	import { clearLink } from './link.svelte.ts';

	// Clears a touch-set link when tapping empty space. Sliders are excluded so a drag never clears a link.
	function onpointerdown(e: PointerEvent) {
		const t = e.target as Element | null;
		if (!t?.closest?.('[data-link],[class*="link-"],[role="slider"]')) clearLink();
	}
	// Also resets the singleton when leaving a concept.
	onDestroy(clearLink);
</script>

<svelte:window {onpointerdown} />
