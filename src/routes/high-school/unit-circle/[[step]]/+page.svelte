<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmtDeg } from '#lib/engine/format.ts';
	import Scene from '#concepts/high-school/unit-circle/Scene.svelte';
	import { SYM } from '#concepts/high-school/unit-circle/notation.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let theta = $state(Math.PI / 3);
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.uc_title() })}</title>
</svelte:head>

<h1>{m.uc_title()}</h1>
<div class="host" data-testid="stage-host" data-step={data.step}>
	<Scene {theta} onthetachange={(t) => (theta = t)} />
	<p class="readout">
		<span aria-hidden="true">{SYM.theta} {SYM.eq}</span>
		<span data-testid="theta-readout" style="font-variant-numeric: tabular-nums">{fmtDeg(theta, getLocale())}</span>
	</p>
</div>

<style>
	.host {
		max-width: 640px;
	}
</style>
