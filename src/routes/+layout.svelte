<script lang="ts">
	import '@fontsource-variable/inter';
	import '#lib/styles/tokens.css';
	import favicon from '#lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { deLocalizeUrl, getLocale, localizeHref, locales } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/icons/Icon.svelte';
	import { concepts } from '#concepts/registry.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// e2e waits for this before sending input (see e2e/helpers/test.ts).
	onMount(() => {
		document.documentElement.dataset.hydrated = '';
	});

	const concept = $derived(
		concepts.find((c) => deLocalizeUrl(page.url).pathname.startsWith(c.path))
	);

	const names = { en: m.shell_locale_en_name, de: m.shell_locale_de_name, ru: m.shell_locale_ru_name } as const;
	const shorts = { en: m.shell_locale_en_short, de: m.shell_locale_de_short, ru: m.shell_locale_ru_short } as const;

	function switchLocale(e: MouseEvent & { currentTarget: HTMLAnchorElement }, locale: keyof typeof names) {
		localStorage.setItem('dm-locale', locale);
		e.currentTarget.href = localizeHref(location.pathname, { locale });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content={m.shell_meta_description()} />
</svelte:head>

<header>
	<div class="left">
		{#if concept}
			<a
				class="back-icon"
				href={localizeHref('/')}
				aria-label={m.shell_back_catalog()}
				title={m.shell_back_catalog()}><Icon name="chevron-left" size={24} /></a
			>
			<span class="title">{concept.title()}</span>
		{/if}
		<a href={localizeHref('/')} class="wordmark" class:hide-phone={!!concept}>{m.shell_wordmark()}</a>
		{#if concept}
			<a class="back" href={localizeHref('/')}
				><Icon name="chevron-left" size={20} /> {m.shell_back_catalog()}</a
			>
		{/if}
	</div>
	<nav aria-label={m.shell_language()}>
		{#each locales as locale (locale)}
			<a
				href={localizeHref(page.url.pathname, { locale })}
				data-testid={`locale-${locale}`}
				aria-label={names[locale]()}
				aria-current={getLocale() === locale ? 'true' : undefined}
				class:active={getLocale() === locale}
				data-sveltekit-reload
				onclick={(e) => switchLocale(e, locale)}>{shorts[locale]()}</a
			>
		{/each}
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 10;
		height: var(--header-h);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-md);
		padding: 0 var(--sp-md);
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.wordmark {
		font-size: var(--fs-heading);
		font-weight: var(--fw-semibold);
		color: var(--text-strong);
		text-decoration: none;
	}
	nav {
		display: flex;
		flex: none;
	}
	.left {
		display: flex;
		align-items: center;
		gap: var(--sp-sm);
		min-width: 0;
	}
	.back,
	.back-icon {
		display: inline-flex;
		align-items: center;
		min-height: var(--target);
		color: var(--text-muted);
		text-decoration: none;
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
	}
	.back-icon {
		width: var(--target);
		justify-content: center;
		margin-left: calc(-1 * var(--sp-sm));
	}
	.title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-strong);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.back-icon,
	.title {
		display: none;
	}
	@media (max-width: 639px) {
		.back-icon {
			display: inline-flex;
		}
		.title {
			display: block;
		}
		.hide-phone,
		.back {
			display: none;
		}
	}
	nav a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--target);
		height: var(--target);
		color: var(--text-muted);
		text-decoration: none;
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
		box-sizing: border-box;
		border-bottom: 2px solid transparent;
	}
	nav a.active {
		color: var(--text-strong);
		border-bottom-color: var(--accent);
	}
	main {
		padding: var(--sp-lg) var(--sp-md);
	}
</style>
