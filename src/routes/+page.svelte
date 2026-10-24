<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { conceptsIn } from '#concepts/registry.ts';
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.catalog_title() })}</title>
</svelte:head>

<h1>{m.catalog_title()}</h1>
<p>{m.catalog_intro()}</p>

<section>
	<h2>{m.catalog_section_high_school()}</h2>
	<ul>
		{#each conceptsIn('high-school') as c (c.id)}
			<li>
				<a href={localizeHref(c.path)}>{c.title()}</a>
				<p>{c.hook()}</p>
			</li>
		{/each}
	</ul>
</section>
