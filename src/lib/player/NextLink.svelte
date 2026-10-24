<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/icons/Icon.svelte';
	import { conceptsIn } from '#concepts/registry.ts';
	import type { CategoryId } from '#concepts/types.ts';
	import { nextConcept } from './next.ts';

	let { conceptId, category }: { conceptId: string; category: CategoryId } = $props();
	const target = $derived(nextConcept(conceptsIn(category), conceptId));
	// trailingSlash = 'always': localizeHref('/') yields '/en', the catalog lives at '/en/'.
	const href = $derived.by(() => {
		const raw = localizeHref(target.kind === 'next' ? target.path : '/');
		return raw.endsWith('/') ? raw : raw + '/';
	});
</script>

<a data-testid="next-link" class="next" {href}>
	{target.kind === 'next' ? m.next_concept({ concept: target.title() }) : m.next_back_catalog()}
	<Icon name="arrow-right" size={16} />
</a>

<style>
	.next {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-xs);
		min-height: var(--target);
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
		color: var(--accent);
		text-decoration: none;
	}
	.next:hover {
		text-decoration: underline 2px;
	}
</style>
