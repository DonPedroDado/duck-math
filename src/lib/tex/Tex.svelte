<script lang="ts">
	import 'katex/dist/katex.min.css';
	import '#lib/styles/math.css';
	import { tex } from './tex.ts';

	let { src }: { src: string } = $props();

	const html = $derived(tex(src));
</script>

<!-- The ONLY {@html} in the app: it receives KaTeX output of repo-authored TeX strings only. -->
<span class="tex">{@html html}</span>
