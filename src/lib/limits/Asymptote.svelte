<script lang="ts">
	import type { Viewport } from '#lib/graph/viewport.ts';

	/** A dashed asymptote: vertical x = at, or horizontal y = at. `draw` grows it from one end. */
	let {
		vp,
		at,
		dir,
		color = 'var(--text-muted)',
		opacity = 1,
		draw = 1
	}: { vp: Viewport; at: number; dir: 'v' | 'h'; color?: string; opacity?: number; draw?: number } = $props();

	const visible = $derived(dir === 'v' ? at >= vp.x0 && at <= vp.x1 : at >= vp.y0 && at <= vp.y1);
</script>

{#if opacity > 0 && draw > 0 && visible}
	<line
		data-testid="asym-{dir}-{at}"
		x1={dir === 'v' ? vp.gx(at) : vp.gx(vp.x0)}
		y1={dir === 'v' ? vp.gy(vp.y0) : vp.gy(at)}
		x2={dir === 'v' ? vp.gx(at) : vp.gx(vp.x0 + (vp.x1 - vp.x0) * draw)}
		y2={dir === 'v' ? vp.gy(vp.y0 + (vp.y1 - vp.y0) * draw) : vp.gy(at)}
		stroke={color}
		stroke-width="1.5"
		stroke-dasharray="8 6"
		{opacity}
		pointer-events="none"
	/>
{/if}
