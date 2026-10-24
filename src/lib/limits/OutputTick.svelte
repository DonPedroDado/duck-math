<script lang="ts">
	import { axisAt } from '#lib/graph/ticks.ts';
	import type { Viewport } from '#lib/graph/viewport.ts';
	import type { HandleSide } from './approach.ts';

	/**
	 * f(x) of one handle projected onto the y-axis (L-05): a faint guide from the curve point,
	 * a coloured tick on the axis. Off-screen values become an arrow at the axis end.
	 */
	let {
		vp,
		x,
		y,
		side,
		color,
		opacity = 1
	}: { vp: Viewport; x: number; y: number; side: HandleSide; color: string; opacity?: number } = $props();

	const ax = $derived(axisAt(vp).ax);
	const px = $derived(vp.gx(ax));
	const state = $derived(!Number.isFinite(y) ? 'none' : y > vp.y1 ? 'above' : y < vp.y0 ? 'below' : 'in');
	/** Both ticks sit right of the axis (labels are on its left), side by side so equal heights never hide one. */
	const o = $derived(side === 'left' ? 2 : 16);
</script>

{#if opacity > 0 && state !== 'none'}
	<g data-testid="tick-{side}" data-y={y} data-state={state} {opacity} pointer-events="none">
		{#if state === 'in'}
			{@const py = vp.gy(y)}
			<line x1={vp.gx(x)} y1={py} x2={px} y2={py} stroke={color} stroke-width="1" stroke-dasharray="2 5" opacity="0.5" />
			<path d="M{px + o},{py} L{px + o + 8},{py - 5} L{px + o + 8},{py + 5} Z" fill={color} />
			<line x1={px + o + 7} y1={py} x2={px + o + 13} y2={py} stroke={color} stroke-width="3" stroke-linecap="round" />
		{:else}
			{@const up = state === 'above'}
			{@const py = up ? vp.gy(vp.y1) + 4 : vp.gy(vp.y0) - 4}
			{@const d = up ? 1 : -1}
			<path
				d="M{px + o + 5},{py} L{px + o},{py + d * 9} L{px + o + 10},{py + d * 9} Z"
				fill={color}
			/>
		{/if}
	</g>
{/if}
