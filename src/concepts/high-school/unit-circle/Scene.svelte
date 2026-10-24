<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import DragPoint from '#lib/stage/DragPoint.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmtDeg } from '#lib/engine/format.ts';

	import type { UCView } from './view.ts';

	let {
		v,
		title,
		theta,
		moved,
		onthetachange,
		ondragstart
	}: {
		v: UCView;
		title: string;
		theta: number;
		moved: boolean;
		onthetachange: (t: number) => void;
		ondragstart?: () => void;
	} = $props();

	const val = $derived(fmtDeg(theta, getLocale()));
</script>

<Stage label={m.uc_stage_aria({ title })}>
	{#snippet children({ cx, cy, R, x, y })}
		<line x1={x(-1.5)} y1={cy} x2={x(1.5)} y2={cy} stroke="var(--axis)" stroke-width="1.5" />
		<line x1={cx} y1={y(-1.5)} x2={cx} y2={y(1.5)} stroke="var(--axis)" stroke-width="1.5" />
		<circle {cx} {cy} r={R} fill="none" stroke="var(--c-point)" stroke-width="2" opacity="0.9" />
		<line
			x1={cx}
			y1={cy}
			x2={x(Math.cos(theta))}
			y2={y(Math.sin(theta))}
			stroke="var(--c-point)"
			stroke-width="3"
			stroke-linecap="round"
		/>
		<DragPoint
			{cx}
			{cy}
			{R}
			{theta}
			label={m.uc_point_aria({ value: val })}
			valuetext={val}
			onchange={onthetachange}
			{ondragstart}
		/>
	{/snippet}
</Stage>
