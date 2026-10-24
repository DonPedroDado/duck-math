<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface StageCtx {
		S: number;
		cx: number;
		cy: number;
		R: number;
		x: (u: number) => number;
		y: (u: number) => number;
		glow: { sm: string; md: string };
	}

	let {
		size = $bindable(600),
		label,
		children
	}: { size?: number; label: string; children: Snippet<[StageCtx]> } = $props();

	const uid = $props.id();
	let w = $state(0);
	const S = $derived(w || size);
	const R = $derived(S / 3);
	const c = $derived(S / 2);
	$effect(() => {
		if (w) size = w;
	});
</script>

<div class="stage" bind:clientWidth={w}>
	<svg
		data-testid="stage"
		viewBox="0 0 {S} {S}"
		width="100%"
		height="100%"
		role="group"
		aria-label={label}
		style="touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; display:block"
	>
		<title>{label}</title>
		<defs>
			<filter id="{uid}-glow-sm" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
				<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
			<filter id="{uid}-glow-md" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
				<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
		</defs>
		{@render children({
			S,
			cx: c,
			cy: c,
			R,
			x: (u: number) => c + u * R,
			y: (u: number) => c - u * R,
			glow: { sm: `url(#${uid}-glow-sm)`, md: `url(#${uid}-glow-md)` }
		})}
	</svg>
</div>

<style>
	.stage {
		aspect-ratio: 1;
		width: 100%;
		box-sizing: border-box;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		overflow: hidden;
	}
</style>
