<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { concepts, conceptsIn } from '#concepts/registry.ts';
	import { CATEGORIES } from '#lib/catalog/categories.ts';
	import { UPCOMING } from '#lib/catalog/upcoming.ts';
	import ConceptCard from '#lib/catalog/ConceptCard.svelte';
	import SoonCard from '#lib/catalog/SoonCard.svelte';
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.catalog_title() })}</title>
</svelte:head>

<div class="page">
	<h1>{m.catalog_title()}</h1>
	<p class="intro">{m.catalog_intro()}</p>

	{#if concepts.length === 0}
		<div data-testid="catalog-empty">
			<h2>{m.catalog_empty_heading()}</h2>
			<p>{m.catalog_empty_body()}</p>
		</div>
	{:else}
		{#each CATEGORIES as cat (cat.id)}
			<section aria-labelledby={`cat-${cat.id}`} class:later={cat.status === 'later'}>
				<h2 id={`cat-${cat.id}`}>{cat.title()}</h2>
				{#if cat.status === 'live'}
					<div class="grid">
						{#each conceptsIn(cat.id) as c (c.id)}
							<ConceptCard concept={c} />
						{/each}
						{#each UPCOMING.filter((u) => u.category === cat.id) as u (u.id)}
							<SoonCard item={u} />
						{/each}
					</div>
				{:else}
					<div data-testid="later-card" class="later-card">{m.catalog_university_placeholder()}</div>
				{/if}
			</section>
		{/each}
	{/if}
</div>

<style>
	.page {
		max-width: 1120px;
		margin: 0 auto;
		padding: var(--sp-3xl) var(--sp-md);
	}
	h1 {
		margin: 0;
		font-size: var(--fs-display);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-heading);
		color: var(--text-strong);
	}
	.intro {
		margin: var(--sp-sm) 0 0;
	}
	section {
		margin-top: var(--sp-2xl);
	}
	h2 {
		margin: 0 0 var(--sp-md);
		font-size: var(--fs-heading);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-heading);
		color: var(--text-strong);
	}
	section.later h2 {
		color: var(--text-muted);
	}
	.grid {
		display: grid;
		box-sizing: border-box;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 256px), 1fr));
		gap: var(--sp-md);
	}
	.later-card {
		box-sizing: border-box;
		padding: var(--sp-lg);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		opacity: 0.5;
	}
	@media (min-width: 640px) {
		.page {
			padding-left: var(--sp-lg);
			padding-right: var(--sp-lg);
		}
		.grid {
			gap: var(--sp-xl);
		}
	}
	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
</style>
