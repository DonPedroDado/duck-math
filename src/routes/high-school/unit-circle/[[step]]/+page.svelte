<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.uc_title() })}</title>
</svelte:head>

<h1>{m.uc_title()}</h1>
<div data-testid="stage-host" data-step={data.step}></div>
