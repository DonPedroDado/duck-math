<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import type { ConceptManifest } from '#concepts/types';

	let { concept }: { concept: ConceptManifest } = $props();
	const Thumb = $derived(concept.thumbnail);
</script>

<a data-testid="concept-card" href={localizeHref(concept.path)} class="card">
	<div class="thumb">
		{#if Thumb}<Thumb />{/if}
	</div>
	<h3>{concept.title()}</h3>
	<p class="hook">{concept.hook()}</p>
	<span class="open"
		>{m.catalog_open()}
		<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"
			><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" /></svg
		></span
	>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--sp-sm);
		box-sizing: border-box;
		min-width: 0;
		padding: var(--sp-md);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		color: var(--text);
		text-decoration: none;
		transition:
			border-color var(--dur-ui) var(--ease-out),
			transform var(--dur-ui) var(--ease-out);
	}
	.thumb {
		aspect-ratio: 16 / 9;
		background: var(--bg);
		border-radius: 8px;
		overflow: hidden;
		transition: filter var(--dur-ui) var(--ease-out);
	}
	h3 {
		margin: 0;
		font-size: var(--fs-heading);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-heading);
		color: var(--text-strong);
		text-decoration: underline 2px transparent;
		text-underline-offset: 4px;
	}
	.hook {
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.open {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-xs);
		margin-top: auto;
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
		color: var(--text-muted);
		transition: color var(--dur-ui) var(--ease-out);
	}
	.card:hover {
		border-color: var(--axis);
		transform: translateY(-2px);
	}
	.card:hover .thumb {
		filter: var(--glow-sm);
	}
	.card:hover h3 {
		text-decoration-color: var(--accent);
	}
	.card:hover .open {
		color: var(--accent);
	}
</style>
