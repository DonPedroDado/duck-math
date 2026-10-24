<script lang="ts">
	import { inside, type Viewport } from '#lib/graph/viewport.ts';

	/** Open dot = a hole (no value there); filled dot = the value f(a) (L-04). */
	let {
		vp,
		x,
		y,
		open = false,
		color = 'var(--c-point)',
		opacity = 1,
		testid
	}: { vp: Viewport; x: number; y: number; open?: boolean; color?: string; opacity?: number; testid?: string } =
		$props();
</script>

{#if opacity > 0 && inside(vp, x, y)}
	<circle
		data-testid={testid}
		data-x={x}
		data-y={y}
		data-open={open}
		cx={vp.gx(x)}
		cy={vp.gy(y)}
		r="6.5"
		fill={open ? 'var(--bg)' : color}
		stroke={open ? color : 'var(--bg)'}
		stroke-width={open ? 2.5 : 2}
		{opacity}
		pointer-events="none"
	/>
{/if}
