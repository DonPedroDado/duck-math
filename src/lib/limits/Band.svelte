<script lang="ts">
	import type { Viewport } from '#lib/graph/viewport.ts';

	/** Swings narrower than a few pixels, drawn as what the screen can show: a filled band (sin 1/x). */
	let {
		vp,
		x0,
		x1,
		y0,
		y1,
		color = 'var(--c-point)',
		opacity = 1
	}: { vp: Viewport; x0: number; x1: number; y0: number; y1: number; color?: string; opacity?: number } = $props();

	const l = $derived(Math.max(vp.x0, x0));
	const r = $derived(Math.min(vp.x1, x1));
</script>

{#if opacity > 0 && r > l}
	<rect
		data-testid="band"
		x={vp.gx(l)}
		y={vp.gy(y1)}
		width={vp.gx(r) - vp.gx(l)}
		height={vp.gy(y0) - vp.gy(y1)}
		fill={color}
		opacity={opacity * 0.5}
		pointer-events="none"
	/>
{/if}
