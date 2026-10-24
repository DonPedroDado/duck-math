<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.catalog_title() })}</title>
</svelte:head>

<h1>{m.catalog_title()}</h1>
<p>{m.catalog_intro()}</p>
