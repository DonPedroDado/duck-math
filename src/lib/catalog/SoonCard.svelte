<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { UpcomingDef } from './upcoming';

	let { item }: { item: UpcomingDef } = $props();
	const Thumb = $derived(item.thumbnail);
</script>

<div data-testid="soon-card" aria-disabled="true" class="card">
	<div class="content">
		<div class="thumb"><Thumb /></div>
		<h3>{item.title()}</h3>
		<p class="hook">{item.hook()}</p>
	</div>
	<span class="badge">{m.catalog_soon_badge()}</span>
</div>

<style>
	.card {
		position: relative;
		box-sizing: border-box;
		min-width: 0;
		padding: var(--sp-md);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		cursor: default;
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--sp-sm);
		opacity: 0.5;
	}
	.thumb {
		aspect-ratio: 16 / 9;
		background: var(--bg);
		border-radius: 8px;
		overflow: hidden;
	}
	h3 {
		margin: 0;
		font-size: var(--fs-heading);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-heading);
		color: var(--text-strong);
	}
	.hook {
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.badge {
		position: absolute;
		top: calc(var(--sp-md) + var(--sp-sm));
		right: calc(var(--sp-md) + var(--sp-sm));
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-label);
		color: var(--text-strong);
		background: var(--surface-raised);
		border-radius: 999px;
		padding: 4px 8px;
	}
</style>
