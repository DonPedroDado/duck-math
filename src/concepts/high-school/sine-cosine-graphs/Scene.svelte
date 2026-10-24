<script lang="ts">
	import PanelPair from '#lib/stage/PanelPair.svelte';
	import CircleBase from '#lib/stage/CircleBase.svelte';
	import DragPoint from '#lib/stage/DragPoint.svelte';
	import GuessMarker from '#lib/stage/GuessMarker.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmt } from '#lib/engine/format.ts';
	import { TAU, norm, snapTheta } from '#lib/engine/angle.ts';
	import { polar, arcPath } from '#lib/stage/geom.ts';
	import LinkReset from '#lib/link/LinkReset.svelte';
	import { link } from '#lib/link/link.svelte.ts';
	import { linkOpacity } from '#lib/link/ids.ts';
	import { linkAttrs } from '#lib/link/linkable.ts';
	import type { PredictCtx } from '../../types';
	import { curvePath, curvePoints, ticks } from './graph.ts';
	import { unrollPoints } from './unroll.ts';
	import { displayTheta, fmtAngle } from './display.ts';
	import { SYM } from './notation.ts';
	import { GUESS_DEFAULT, type SGUser } from './steps.ts';
	import type { SGView } from './view.ts';

	let {
		v,
		title,
		user,
		glowing = false,
		stepId = 'intro',
		update,
		oninteract,
		predict
	}: {
		v: SGView;
		title: string;
		user: SGUser;
		glowing?: boolean;
		stepId?: string;
		step?: number;
		update: (patch: Partial<SGUser>) => void;
		oninteract?: () => void;
		predict?: PredictCtx;
	} = $props();

	const locale = getLocale();
	const th = $derived(displayTheta(v, user));
	const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
	const gu = $derived(user.guess ?? GUESS_DEFAULT);
	const phase = $derived(predict?.phase ?? 'none');
	const showGuess = $derived(
		stepId === 'sine' && (phase === 'awaiting' || (phase === 'after' && user.guess !== null))
	);
	const GRID_Y = [-1, -0.5, 0.5, 1];
	const GRID_X = [Math.PI / 2, Math.PI, (3 * Math.PI) / 2, TAU];
</script>

<LinkReset />
<PanelPair
	label={m.sg_stage_aria({ title })}
	circleLabel={m.sg_circle_aria()}
	graphLabel={m.sg_graph_aria()}
	domain={[0, TAU]}
>
	{#snippet children({ layout, circle, graph, glow })}
		{@const px = circle.x(Math.cos(th))}
		{@const py = circle.y(Math.sin(th))}
		{@const gpx = graph.gx(th)}
		{@const gpy = graph.gy(Math.sin(th))}
		{@const sinD = curvePath(curvePoints(Math.sin, 0, v.sinTraced, graph.gx, graph.gy))}
		{@const arcTheta =norm(th) || (th > 0 ? TAU : 0)}
		{@const pts = unrollPoints(
			arcTheta,
			v.unroll,
			(s) => [circle.x(Math.cos(s)), circle.y(Math.sin(s))],
			(s) => [graph.gx(s), graph.axisY]
		)}
		{@const [hx, hy] = polar(circle.cx, circle.cy, circle.R + 28, th)}
		{@const [ha, hb] = [polar(circle.cx, circle.cy, circle.R + 16, th + 0.18), polar(circle.cx, circle.cy, circle.R + 16, th + 0.04)]}
		<CircleBase
			x={circle.x}
			y={circle.y}
			cx={circle.cx}
			cy={circle.cy}
			R={circle.R}
			axes={v.axes}
			circle={v.circle}
			{locale}
		/>

		<g data-layer="graph-axes" opacity={v.graphAxes}>
			{#each GRID_X as u (u)}
				<line x1={graph.gx(u)} y1={graph.gy(1.5)} x2={graph.gx(u)} y2={graph.gy(-1.5)} stroke="var(--grid)" stroke-width="1" />
			{/each}
			{#each GRID_Y as u (u)}
				<line x1={graph.x0} y1={graph.gy(u)} x2={graph.x1} y2={graph.gy(u)} stroke="var(--grid)" stroke-width="1" />
			{/each}
			<line x1={graph.x0} y1={graph.axisY} x2={graph.x1} y2={graph.axisY} stroke="var(--axis)" stroke-width="1.5" />
			<line x1={graph.x0} y1={graph.gy(1.5)} x2={graph.x0} y2={graph.gy(-1.5)} stroke="var(--axis)" stroke-width="1.5" />
			{#each [1, -1] as u (u)}
				<line x1={graph.x0 - 4} y1={graph.gy(u)} x2={graph.x0 + 4} y2={graph.gy(u)} stroke="var(--axis)" stroke-width="1.5" />
				<text
					x={graph.x0 - 8}
					y={graph.gy(u)}
					text-anchor="end"
					dominant-baseline="middle"
					fill="var(--text-muted)"
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3">{fmt(u, 0, locale)}</text
				>
			{/each}
			{#each ticks(TAU) as t (t.value)}
				<line x1={graph.gx(t.value)} y1={graph.axisY - 4} x2={graph.gx(t.value)} y2={graph.axisY + 4} stroke="var(--axis)" stroke-width="1.5" />
				<text
					x={graph.gx(t.value)}
					y={graph.axisY + 18}
					text-anchor="middle"
					fill="var(--text-muted)"
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3">{t.label}</text
				>
			{/each}
		</g>

		<!-- Unrolled arc: peels off the circle and lies flat on the graph x-axis. -->
		<g
			{...linkAttrs('angle')}
			style:opacity={linkOpacity('angle', link.id)}
			style="transition: opacity var(--dur-link)"
			filter={stepId === 'unroll' && glowing ? glow.sm : undefined}
		>
			<path
				data-testid="unroll-arc"
				data-q={v.unroll.toFixed(3)}
				d={curvePath(pts)}
				fill="none"
				stroke="var(--c-angle)"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				opacity={v.arc}
			/>
			<text
				x={graph.gx(arcTheta)}
				y={graph.axisY - 12}
				text-anchor="middle"
				fill="var(--c-angle)"
				font-size="14"
				font-weight="600"
				font-style="italic"
				font-family="KaTeX_Math, 'Times New Roman', serif"
				paint-order="stroke"
				stroke="var(--bg)"
				stroke-width="3"
				opacity={v.arcLabel}>{SYM.theta}</text
			>
		</g>

		<!-- Sine curve -->
		<g
			{...linkAttrs('sin')}
			style:opacity={linkOpacity('sin', link.id)}
			style="transition: opacity var(--dur-link)"
			filter={stepId === 'sine' && glowing ? glow.sm : undefined}
		>
			<path d={sinD} fill="none" stroke="transparent" stroke-width="16" pointer-events="stroke" />
			<path
				data-testid="sin-curve"
				data-traced={v.sinTraced.toFixed(3)}
				d={sinD}
				fill="none"
				stroke="var(--c-sin)"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</g>

		<!-- Peak, revealed after the predict moment -->
		<g data-layer="peak" opacity={v.peak} pointer-events="none">
			<line
				x1={graph.gx(Math.PI / 2)}
				y1={graph.gy(1)}
				x2={graph.gx(Math.PI / 2)}
				y2={graph.axisY}
				stroke="var(--c-sin)"
				stroke-width="1.5"
				stroke-dasharray="4 4"
				opacity="0.6"
			/>
			<circle data-testid="peak-marker" cx={graph.gx(Math.PI / 2)} cy={graph.gy(1)} r="5" fill="var(--c-sin)" />
		</g>

		{#if phase === 'after' && stepId === 'sine' && user.guess !== null}
			{@const a = graph.gx(user.guess)}
			{@const b = graph.gx(Math.PI / 2)}
			{@const yy = graph.axisY + 10}
			<g data-testid="guess-connector" pointer-events="none">
				<path
					d="M{a},{yy - 4}V{yy + 4}M{a},{yy}H{b}M{b},{yy - 4}V{yy + 4}"
					fill="none"
					stroke="var(--c-guess)"
					stroke-width="1.5"
					stroke-dasharray="4 4"
				/>
			</g>
		{/if}

		<!-- Connector from the circle point to the graph point at the same height -->
		{#if layout.mode === 'row'}
			<g data-testid="connector" opacity={v.connector} pointer-events="none">
				<rect x={Math.min(px, gpx)} y={py - 2} width={Math.abs(gpx - px)} height="4" fill="transparent" />
				<line x1={px} y1={py} x2={gpx} y2={gpy} stroke="var(--c-sin)" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6" />
			</g>
		{:else}
			<polyline
				data-testid="elbow-connector"
				points="{px},{py} {px},{gpy} {gpx},{gpy}"
				fill="none"
				stroke="var(--c-sin)"
				stroke-width="1.5"
				stroke-dasharray="4 4"
				opacity={0.6 * v.connector}
				pointer-events="none"
			/>
		{/if}

		<circle
			data-testid="graph-point"
			data-x={gpx.toFixed(1)}
			cx={gpx}
			cy={gpy}
			r="7"
			fill="var(--c-point)"
			opacity={v.point}
			pointer-events="none"
		/>

		<g
			data-layer="hint"
			data-testid="drag-hint"
			opacity={user.moved ? 0 : v.hint}
			pointer-events="none"
			style="transition: opacity 300ms var(--ease-out)"
		>
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
				d="M{ha[0].toFixed(1)},{ha[1].toFixed(1)}A{circle.R + 16},{circle.R + 16} 0 0 1 {hb[0].toFixed(1)},{hb[1].toFixed(1)}"
				fill="none"
				stroke="var(--text-muted)"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</g>

		<line
			x1={circle.cx}
			y1={circle.cy}
			x2={px}
			y2={py}
			stroke="var(--c-point)"
			stroke-width="3"
			stroke-linecap="round"
			opacity={v.point}
		/>

		{#if showGuess}
			<GuessMarker
				x={graph.gx(gu)}
				y={graph.axisY}
				label={m.predict_marker_aria()}
				valuetext={m.sg_guess_valuetext({ value: fmt(gu, 2, locale) })}
				onpoint={(p) =>
					update({ guess: clamp(((p.x - graph.x0) / (graph.x1 - graph.x0)) * TAU, 0, TAU) })}
				onstep={(d, big) => update({ guess: clamp(gu + d * (big ? Math.PI / 4 : Math.PI / 12), 0, TAU) })}
				onreveal={() => predict?.onreveal()}
				pulse={phase === 'awaiting'}
			/>
		{/if}

		<DragPoint
			cx={circle.cx}
			cy={circle.cy}
			R={circle.R}
			theta={norm(th)}
			scale={v.point}
			label={m.sg_point_aria()}
			valuetext={fmtAngle(th, user.unit, locale)}
			onchange={(t) => update({ theta: snapTheta(t) })}
			{oninteract}
			glow={glow.md}
		/>
	{/snippet}
</PanelPair>
