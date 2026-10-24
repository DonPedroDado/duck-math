<script lang="ts">
	import type { Viewport } from '#lib/graph/viewport.ts';

	/** Where the curve leaves the window toward ±∞: an arrowhead at the edge and a "+∞ / −∞" label. */
	let {
		vp,
		x,
		dir,
		color = 'var(--c-point)',
		opacity = 1,
		testid
	}: { vp: Viewport; x: number; dir: 1 | -1; color?: string; opacity?: number; testid?: string } = $props();

	const px = $derived(vp.gx(x));
	/** Tip just inside the edge; the label sits beside it. */
	const tip = $derived(dir > 0 ? vp.gy(vp.y1) + 6 : vp.gy(vp.y0) - 6);
</script>

{#if opacity > 0 && x >= vp.x0 && x <= vp.x1}
	<g data-testid={testid} data-dir={dir} {opacity} pointer-events="none">
		<path d="M{px},{tip} L{px - 7},{tip + dir * 12} L{px + 7},{tip + dir * 12} Z" fill={color} />
		<text
			x={px + 12}
			y={tip + dir * 10}
			dominant-baseline="middle"
			fill={color}
			font-size="15"
			font-weight="700">{dir > 0 ? '+∞' : '−∞'}</text
		>
	</g>
{/if}
