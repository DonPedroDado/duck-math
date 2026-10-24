<script lang="ts">
	import { sampleRuns, runsPath } from './sample.ts';
	import type { Viewport } from './viewport.ts';

	let {
		vp,
		g,
		defined = () => true,
		ghost = false,
		color = 'var(--c-point)',
		width = 3,
		opacity = 1,
		filter,
		testid,
		draw = 1
	}: {
		vp: Viewport;
		g: (x: number) => number;
		defined?: (x: number) => boolean;
		/** Dim dashed copy of the original f (F-09). */
		ghost?: boolean;
		color?: string;
		width?: number;
		opacity?: number;
		filter?: string;
		testid?: string;
		/** 0..1: draws on from the left. */
		draw?: number;
	} = $props();

	const H = $derived(vp.half);
	const x1 = $derived(-H + 2 * H * draw);
	const d = $derived(draw > 0 ? runsPath(sampleRuns(g, defined, -H, x1, H + 1), vp.gx, vp.gy) : '');
</script>

{#if opacity > 0 && d}
	<path
		data-testid={testid}
		{d}
		fill="none"
		stroke={color}
		stroke-width={ghost ? 2 : width}
		stroke-dasharray={ghost ? '7 6' : undefined}
		stroke-linecap="round"
		stroke-linejoin="round"
		opacity={ghost ? opacity * 0.45 : opacity}
		{filter}
		pointer-events="none"
	/>
{/if}
