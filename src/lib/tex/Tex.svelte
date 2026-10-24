<script module lang="ts">
	/** Sources already reported, so a broken theta-dependent line does not log on every pointermove. */
	const reported = new Set<string>();
</script>

<script lang="ts">
	import 'katex/dist/katex.min.css';
	import '#lib/styles/math.css';
	import { tex } from './tex.ts';

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
</script>

<!-- The ONLY {@html} in the app: it receives KaTeX output of repo-authored TeX strings only. -->
{#if html !== null}
	<span class="tex">{@html html}</span>
{:else}
	<code class="tex tex-error" data-testid="tex-error">{src}</code>
{/if}
