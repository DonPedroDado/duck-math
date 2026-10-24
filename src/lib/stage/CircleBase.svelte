<script lang="ts">
	import { arcPath } from '#lib/stage/geom.ts';
	import { fmt } from '#lib/engine/format.ts';

	let {
		x,
		y,
		cx,
		cy,
		R,
		axes,
		circle,
		locale,
		circleFilter
	}: {
		x: (u: number) => number;
		y: (u: number) => number;
		cx: number;
		cy: number;
		R: number;
		axes: number;
		circle: number;
		locale: string;
		circleFilter?: string;
	} = $props();

	const GRID = [-1.5, -1, -0.5, 0.5, 1, 1.5];
</script>

<g data-layer="grid" opacity={axes}>
	{#each GRID as u (u)}
		<line x1={x(u)} y1={y(-1.5)} x2={x(u)} y2={y(1.5)} stroke="var(--grid)" stroke-width="1" />
		<line x1={x(-1.5)} y1={y(u)} x2={x(1.5)} y2={y(u)} stroke="var(--grid)" stroke-width="1" />
	{/each}
</g>
<g data-layer="axes" opacity={axes}>
	<line x1={x(-1.5)} y1={cy} x2={x(1.5)} y2={cy} stroke="var(--axis)" stroke-width="1.5" />
	<line x1={cx} y1={y(-1.5)} x2={cx} y2={y(1.5)} stroke="var(--axis)" stroke-width="1.5" />
	{#each [1, -1] as u (u)}
		<line x1={x(u)} y1={cy - 4} x2={x(u)} y2={cy + 4} stroke="var(--axis)" stroke-width="1.5" />
		<line x1={cx - 4} y1={y(u)} x2={cx + 4} y2={y(u)} stroke="var(--axis)" stroke-width="1.5" />
	{/each}
	{#each [1, -1] as u (u)}
		<text
			x={x(u)}
			y={cy + 22}
			text-anchor="middle"
			fill="var(--text-muted)"
			font-size="14"
			font-weight="600">{fmt(u, 0, locale)}</text
		>
	{/each}
</g>
<g data-layer="circle" filter={circleFilter}>
	<path
		d={arcPath(cx, cy, R, 0, 2 * Math.PI * circle)}
		fill="none"
		stroke="var(--c-point)"
		stroke-width="2"
		opacity="0.9"
	/>
</g>
