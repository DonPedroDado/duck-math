<script module lang="ts">
	/** Sources already reported, so a broken theta-dependent line does not log on every pointermove. */
	const reported = new Set<string>();
</script>

<script lang="ts">
	import 'katex/dist/katex.min.css';
	import '#lib/styles/math.css';
	import { tex } from './tex.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { linkFromClass, type LinkId } from '#lib/link/ids.ts';
	import { link, setLink, clearLink, toggleLink } from '#lib/link/link.svelte.ts';
	import { ROLE_NAME } from '#lib/link/roles.ts';

	let { src }: { src: string } = $props();

	/**
	 * tex() keeps throwing (unit tests rely on it). In dev and during SSR/prerender the error is rethrown,
	 * so a broken formula fails the build instead of shipping raw TeX. In the production browser a live
	 * render error must not take down the panel, so fall back to the raw source and log once per source.
	 */
	const html = $derived.by((): string | null => {
		try {
			return tex(src);
		} catch (err) {
			if (import.meta.env.DEV || import.meta.env.SSR) throw err;
			if (!reported.has(src)) {
				reported.add(src);
				console.error('KaTeX failed to render', src, err);
			}
			return null;
		}
	});

	let wrap = $state<HTMLSpanElement>();
	/** True while the current link was set by a term of this formula (mouse/keyboard). */
	let owned = false;
	let lastType = 'mouse';

	const LINK_SEL = '[class*="link-"]';
	function idAt(t: EventTarget | null): LinkId | null {
		const el = (t as Element | null)?.closest?.(LINK_SEL);
		return el ? linkFromClass(el.getAttribute('class') ?? '') : null;
	}

	/** Mouse/pen hover is resolved on move too, because live re-renders replace the nodes under a still pointer. */
	function onhover(e: PointerEvent) {
		if (e.pointerType === 'touch') return;
		const id = idAt(e.target);
		if (id) {
			owned = true;
			if (id !== link.id) setLink(id);
		} else if (owned) {
			owned = false;
			clearLink();
		}
	}
	function onleave(e: PointerEvent) {
		if (e.pointerType === 'touch') return;
		if (owned) {
			owned = false;
			clearLink();
		}
	}
	function onclick(e: MouseEvent) {
		if (lastType !== 'touch') return;
		e.stopPropagation();
		const id = idAt(e.target);
		owned = id !== null;
		toggleLink(id);
	}
	function onfocusin(e: FocusEvent) {
		// Pointer-caused focus is handled by hover/click; only keyboard focus links here.
		if (lastType !== 'key') return;
		const id = idAt(e.target);
		if (id) {
			owned = true;
			setLink(id);
		}
	}
	function onfocusout() {
		if (owned) {
			owned = false;
			clearLink();
		}
	}

	// Re-applied after every KaTeX re-render (the DOM below is replaced on each theta change).
	$effect(() => {
		void html;
		const active = link.id;
		if (!wrap) return;
		for (const el of wrap.querySelectorAll(LINK_SEL)) {
			const id = linkFromClass(el.getAttribute('class') ?? '');
			if (!id) continue;
			el.setAttribute('tabindex', '0');
			el.setAttribute('role', 'button');
			el.setAttribute('aria-label', m.link_term_aria({ role: ROLE_NAME[id]() }));
			el.classList.toggle('link-active', id === active);
		}
	});
</script>

<!-- Keyboard focus arrives after a keydown outside this wrapper, so track keys on window. -->
<svelte:window onkeydown={() => (lastType = 'key')} />

<!-- The ONLY {@html} in the app: it receives KaTeX output of repo-authored TeX strings only. -->
{#if html !== null}
	<!-- Delegated handlers on the persistent wrapper; the focusable terms inside carry role/tabindex/aria-label. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<span
		class="tex"
		bind:this={wrap}
		onpointerover={onhover}
		onpointermove={onhover}
		onpointerleave={onleave}
		onpointerdown={(e) => (lastType = e.pointerType)}
		{onclick}
		{onfocusin}
		{onfocusout}
	>{@html html}</span>
{:else}
	<code class="tex tex-error" data-testid="tex-error">{src}</code>
{/if}

<style>
	.tex :global([class*='link-']) {
		cursor: pointer;
		position: relative;
		transition: text-decoration-color var(--dur-link);
	}
	/* Touch hit area without layout change. */
	.tex :global([class*='link-']::after) {
		content: '';
		position: absolute;
		inset: -12px -4px;
	}
	.tex :global(.link-active) {
		text-decoration: underline 2px currentColor;
		text-underline-offset: 4px;
	}
</style>
