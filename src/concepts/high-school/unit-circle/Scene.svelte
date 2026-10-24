<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import DragPoint from '#lib/stage/DragPoint.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmt, fmtDeg } from '#lib/engine/format.ts';
	import { arcPath, polar } from '#lib/stage/geom.ts';
	import { TAU } from './derive.ts';
	import { SYM } from './notation.ts';
	import { projection } from './projection.ts';
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

	const locale = getLocale();
	const val = $derived(fmtDeg(theta, locale));
	const P = $derived(projection(theta));
	const GRID = [-1.5, -1, -0.5, 0.5, 1, 1.5];
</script>

<Stage label={m.uc_stage_aria({ title })}>
	{#snippet children({ cx, cy, R, x, y })}
		<g data-layer="grid" opacity={v.axes}>
			{#each GRID as u (u)}
				<line x1={x(u)} y1={y(-1.5)} x2={x(u)} y2={y(1.5)} stroke="var(--grid)" stroke-width="1" />
				<line x1={x(-1.5)} y1={y(u)} x2={x(1.5)} y2={y(u)} stroke="var(--grid)" stroke-width="1" />
			{/each}
		</g>
		<g data-layer="axes" opacity={v.axes}>
			<line x1={x(-1.5)} y1={cy} x2={x(1.5)} y2={cy} stroke="var(--axis)" stroke-width="1.5" />
			<line x1={cx} y1={y(-1.5)} x2={cx} y2={y(1.5)} stroke="var(--axis)" stroke-width="1.5" />
			{#each [1, -1] as u (u)}
				<line x1={x(u)} y1={cy - 4} x2={x(u)} y2={cy + 4} stroke="var(--axis)" stroke-width="1.5" />
				<line x1={cx - 4} y1={y(u)} x2={cx + 4} y2={y(u)} stroke="var(--axis)" stroke-width="1.5" />
			{/each}
			<text
				x={x(1)}
				y={cy + 22}
				text-anchor="middle"
				fill="var(--text-muted)"
				font-size="14"
				font-weight="600">{fmt(1, 0, locale)}</text
			>
			<text
				x={x(-1)}
				y={cy + 22}
				text-anchor="middle"
				fill="var(--text-muted)"
				font-size="14"
				font-weight="600">{fmt(-1, 0, locale)}</text
			>
		</g>
		<g data-layer="circle">
			<path
				d={arcPath(cx, cy, R, 0, TAU * v.circle)}
				fill="none"
				stroke="var(--c-point)"
				stroke-width="2"
				opacity="0.9"
			/>
		</g>
		{#if theta >= 1e-3}
			<g data-layer="angle">
				<path
					data-testid="angle-arc"
					d={arcPath(cx, cy, 0.25 * R, 0, theta * v.arc)}
					fill="none"
					stroke="var(--c-angle)"
					stroke-width="3"
					stroke-linecap="round"
				/>
				{#if true}
					{@const [lx, ly] = polar(cx, cy, 0.38 * R, theta / 2)}
					<text
						data-testid="theta-label"
						x={lx}
						y={ly}
						text-anchor="middle"
						dominant-baseline="middle"
						fill="var(--c-angle)"
						font-size="14"
						font-weight="600"
						font-style="italic"
						font-family="KaTeX_Math, 'Times New Roman', serif"
						paint-order="stroke"
						stroke="var(--bg)"
						stroke-width="3"
						opacity={v.thetaLabel}>{SYM.theta}</text
					>
				{/if}
			</g>
		{/if}
		<g data-layer="projection">
			{#if P.showCos}
				<line
					data-testid="cos-drop"
					x1={x(P.cos)}
					y1={y(P.sin)}
					x2={x(P.cos)}
					y2={y(P.sin * (1 - v.cosDrop))}
					stroke="var(--c-cos)"
					stroke-width="1.5"
					opacity="0.6"
					stroke-dasharray="4 4"
				/>
				<line
					data-testid="cos-seg"
					data-len={(Math.abs(P.cos) * v.cosSeg).toFixed(3)}
					x1={x(0)}
					y1={y(0)}
					x2={x(P.cos * v.cosSeg)}
					y2={y(0)}
					stroke="var(--c-cos)"
					stroke-width="4"
					stroke-linecap="round"
				/>
				<text
					data-testid="cos-label"
					x={x(P.cos / 2)}
					y={y(0) + (P.cosLabelBelow ? 19 : -19)}
					text-anchor="middle"
					dominant-baseline="middle"
					fill="var(--c-cos)"
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3"
					opacity={v.cosLabel}>{SYM.cos}</text
				>
			{/if}
			{#if P.showSin}
				<line
					data-testid="sin-drop"
					x1={x(P.cos)}
					y1={y(P.sin)}
					x2={x(P.cos * (1 - v.sinDrop))}
					y2={y(P.sin)}
					stroke="var(--c-sin)"
					stroke-width="1.5"
					opacity="0.6"
					stroke-dasharray="4 4"
				/>
				<line
					data-testid="sin-seg"
					data-len={(Math.abs(P.sin) * v.sinSeg).toFixed(3)}
					x1={x(0)}
					y1={y(0)}
					x2={x(0)}
					y2={y(P.sin * v.sinSeg)}
					stroke="var(--c-sin)"
					stroke-width="4"
					stroke-linecap="round"
				/>
				<text
					data-testid="sin-label"
					x={x(0) + (P.sinLabelLeft ? -12 : 12)}
					y={y(P.sin / 2)}
					text-anchor={P.sinLabelLeft ? 'end' : 'start'}
					dominant-baseline="middle"
					fill="var(--c-sin)"
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3"
					opacity={v.sinLabel}>{SYM.sin}</text
				>
			{/if}
		</g>
		<g data-layer="hint" data-testid="drag-hint" opacity={moved ? 0 : v.hint} pointer-events="none">
			{#if true}
				{@const [hx, hy] = polar(cx, cy, R + 28, theta)}
				{@const [ax, ay] = polar(cx, cy, R + 16, theta + 0.18)}
				{@const [bx, by] = polar(cx, cy, R + 16, theta + 0.04)}
				<text
					x={hx}
					y={hy}
					text-anchor="middle"
					dominant-baseline="middle"
					fill="var(--text-muted)"
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3">{m.uc_drag_hint()}</text
				>
				<path
					d="M{ax.toFixed(1)},{ay.toFixed(1)}A{R + 16},{R + 16} 0 0 1 {bx.toFixed(1)},{by.toFixed(1)}"
					fill="none"
					stroke="var(--text-muted)"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			{/if}
		</g>
		<g data-layer="point">
			<line
				x1={cx}
				y1={cy}
				x2={x(Math.cos(theta))}
				y2={y(Math.sin(theta))}
				stroke="var(--c-point)"
				stroke-width="3"
				stroke-linecap="round"
				opacity={v.point}
			/>
			<DragPoint
				{cx}
				{cy}
				{R}
				{theta}
				scale={v.point}
				label={m.uc_point_aria({ value: val })}
				valuetext={val}
				onchange={onthetachange}
				{ondragstart}
			/>
		</g>
	{/snippet}
</Stage>
