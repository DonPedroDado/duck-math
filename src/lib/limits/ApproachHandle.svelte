<script lang="ts">
	import DragHandle from '#lib/graph/DragHandle.svelte';
	import { axisAt } from '#lib/graph/ticks.ts';
	import { inside, type Viewport } from '#lib/graph/viewport.ts';
	import type { HandleSide } from './approach.ts';

	/**
	 * One side's handle on the x-axis (L-05): a triangle pointing the way it travels, a dashed
	 * drop line up to its point on the curve. Hit areas lean outward so the two handles can sit
	 * either side of a without overlapping.
	 */
	let {
		vp,
		x,
		y,
		side,
		pointing = 'in',
		color,
		label,
		value,
		min,
		max,
		valuetext,
		live = true,
		opacity = 1,
		onpoint,
		onkey,
		ongrab,
		oninteract
	}: {
		vp: Viewport;
		x: number;
		/** f(x); may be off-screen or not finite. */
		y: number;
		side: HandleSide;
		/** 'in': toward a; 'out': toward ±∞. */
		pointing?: 'in' | 'out';
		color: string;
		label: string;
		value: number;
		min: number;
		max: number;
		valuetext: string;
		live?: boolean;
		opacity?: number;
		onpoint: (p: { x: number; y: number }) => void;
		onkey: (dir: -1 | 1, big: boolean) => void;
		ongrab?: () => void;
		oninteract?: () => void;
	} = $props();

	const ay = $derived(axisAt(vp).ay);
	const glyph = $derived((side === 'left') === (pointing === 'in') ? 'right' : 'left');
	const outward = $derived(side === 'left' ? -1 : 1);
	const yc = $derived(Number.isFinite(y) ? Math.min(vp.y1, Math.max(vp.y0, y)) : ay);
	const onCurve = $derived(Number.isFinite(y) && inside(vp, x, y));
</script>

{#if opacity > 0 && x >= vp.x0 && x <= vp.x1}
	<g data-testid="handle-{side}" data-hx={x} data-fy={y} {opacity}>
		<line
			x1={vp.gx(x)}
			y1={vp.gy(ay)}
			x2={vp.gx(x)}
			y2={vp.gy(yc)}
			stroke={color}
			stroke-width="1.5"
			stroke-dasharray="4 4"
			opacity="0.7"
			pointer-events="none"
		/>
		{#if onCurve}
			<circle cx={vp.gx(x)} cy={vp.gy(y)} r="6" fill={color} stroke="var(--bg)" stroke-width="2" pointer-events="none" />
		{/if}
		<DragHandle
			{vp}
			{x}
			y={ay}
			axis="x"
			{glyph}
			hitDx={pointing === 'in' ? outward * 12 : 0}
			{label}
			{value}
			{min}
			{max}
			{valuetext}
			{color}
			{live}
			{onpoint}
			{onkey}
			{ongrab}
			{oninteract}
		/>
	</g>
{/if}
