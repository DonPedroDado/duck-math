<script lang="ts">
	import '@fontsource-variable/inter';
	import '#lib/styles/tokens.css';
	import favicon from '#lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref, locales } from '#lib/paraglide/runtime.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const names = { en: m.shell_locale_en_name, de: m.shell_locale_de_name } as const;
	const shorts = { en: m.shell_locale_en_short, de: m.shell_locale_de_short } as const;

	function switchLocale(e: MouseEvent & { currentTarget: HTMLAnchorElement }, locale: 'en' | 'de') {
		localStorage.setItem('dm-locale', locale);
		e.currentTarget.href = localizeHref(location.pathname, { locale });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content={m.shell_meta_description()} />
</svelte:head>

<header>
	<a href={localizeHref('/')} class="wordmark">{m.shell_wordmark()}</a>
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
		height: var(--header-h);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
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
