<script lang="ts">
	import ConceptPage from '#lib/player/ConceptPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

{#key data.manifest.id}
	<ConceptPage manifest={data.manifest} runtime={data.runtime} step={data.step} />
{/key}
