<script lang="ts">
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	// The static 404.html fallback is prerendered with lang=en; sync it with the URL locale.
	$effect(() => {
		document.documentElement.lang = getLocale();
	});
	const raw = $derived(localizeHref('/'));
	const home = $derived(raw.endsWith('/') ? raw : raw + '/');
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.error_404_heading() })}</title>
</svelte:head>

<div class="box">
	{#if page.status === 404}
		<h1>{m.error_404_heading()}</h1>
		<p>{m.error_404_body()}</p>
	{:else}
		<h1>{page.status}</h1>
	{/if}
	<a href={home} class="cta">{m.error_404_cta()}</a>
</div>

<style>
	.box {
		max-width: 640px;
		margin: 0 auto;
		padding: var(--sp-3xl) var(--sp-md);
	}
	h1 {
		margin: 0 0 var(--sp-sm);
		font-size: var(--fs-display);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-heading);
		color: var(--text-strong);
	}
	p {
		margin: 0 0 var(--sp-lg);
	}
	.cta {
		display: inline-flex;
		align-items: center;
		min-height: var(--target);
		padding: 0 var(--sp-md);
		box-sizing: border-box;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--text-strong);
		text-decoration: none;
		transition: background var(--dur-ui) var(--ease-out);
	}
	.cta:hover {
		background: var(--surface-raised);
	}
</style>
