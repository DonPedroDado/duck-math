<script lang="ts">
	import 'katex/dist/katex.min.css';
	import '#lib/styles/math.css';
	import { tex } from './tex.ts';

	let { src }: { src: string } = $props();

	/** tex() keeps throwing (unit tests rely on it); a live render error must not take down the panel, so fall back to the raw source. */
	const html = $derived.by((): string | null => {
		try {
			return tex(src);
		} catch (err) {
			console.error('KaTeX failed to render', src, err);
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
