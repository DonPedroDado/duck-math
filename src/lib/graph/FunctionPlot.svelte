<script lang="ts">
	import { sampleRuns, sampleDense, runsPath } from './sample.ts';
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
		draw = 1,
		breaks = [],
		dense = false
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
		/** x values where the path must split (jumps, vertical asymptotes). */
		breaks?: readonly number[];
		/** Refine until neighbours are under a pixel apart (oscillation such as sin 1/x). */
		dense?: boolean;
	} = $props();

	const x1 = $derived(vp.x0 + (vp.x1 - vp.x0) * draw);
	/** Clip a little beyond the window so exits leave the frame cleanly. */
	const clip = $derived.by(() => {
		const m = (vp.y1 - vp.y0) / 12;
		return [vp.y0 - m, vp.y1 + m] as const;
	});
	const runs = $derived.by(() => {
		if (draw <= 0) return [];
		if (!dense) return sampleRuns(g, defined, vp.x0, x1, clip, 360, breaks);
		const pxPerY = Math.abs(vp.gy(0) - vp.gy(1));
		return sampleDense(g, defined, vp.x0, x1, clip, 0.75 / pxPerY, 2400, breaks);
	});
	const d = $derived(runsPath(runs, vp.gx, vp.gy));
</script>

{#if opacity > 0 && d}
	<path
		data-testid={testid}
		data-runs={runs.length}
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
