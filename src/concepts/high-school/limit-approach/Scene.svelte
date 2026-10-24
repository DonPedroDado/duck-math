<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import GuessMarker from '#lib/stage/GuessMarker.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmt } from '#lib/engine/format.ts';
	import LinkReset from '#lib/link/LinkReset.svelte';
	import { link } from '#lib/link/link.svelte.ts';
	import { linkOpacity } from '#lib/link/ids.ts';
	import { linkAttrs } from '#lib/link/linkable.ts';
	import { frame } from '#lib/graph/viewport.ts';
	import { friendly } from '#lib/graph/transform.ts';
	import { axisAt } from '#lib/graph/ticks.ts';
	import GraphAxes from '#lib/graph/GraphAxes.svelte';
	import FunctionPlot from '#lib/graph/FunctionPlot.svelte';
	import { SCENARIOS, definedAt, dotsOf, limitOf } from '#lib/limits/scenario.ts';
	import { clampSide, digitsFor, minGap, readout, type HandleSide } from '#lib/limits/approach.ts';
	import ApproachHandle from '#lib/limits/ApproachHandle.svelte';
	import OutputTick from '#lib/limits/OutputTick.svelte';
	import Dot from '#lib/limits/Dot.svelte';
	import Band from '#lib/limits/Band.svelte';
	import type { Scenario } from '#lib/limits/scenario.ts';
	import type { Viewport } from '#lib/graph/viewport.ts';
	import type { SceneProps } from '#concepts/types.ts';
	import { PREDICT, type LAUser } from './steps.ts';
	import type { LAView } from './view.ts';

	let { v, title, user, glowing = false, step, update, oninteract, predict }: SceneProps<LAUser, LAView> = $props();

	const locale = getLocale();
	const COLOR = { left: 'var(--c-left)', right: 'var(--c-right)' } as const;
	const s = $derived(SCENARIOS[v.sc]);
	const old = $derived(SCENARIOS[v.prev]);
	const a = $derived(s.at as number);
	const L = $derived(limitOf(s));
	const dots = $derived(dotsOf(s));
	const oldDots = $derived(dotsOf(old));

	const awaiting = $derived(step === PREDICT && predict?.phase === 'awaiting');
	const showGuess = $derived(step === PREDICT && (awaiting || (predict?.phase === 'after' && user.guess !== null)));
	const guessY = $derived(user.guess ?? 0);

	const digits = $derived(digitsFor(v.hx));
	const hs = $derived(SCENARIOS[v.hs]);
	const fy = (side: HandleSide) => readout(hs, side === 'left' ? v.xl : v.xr, side);

	/** Swings narrower than ~10 px (a 3 px stroke fills them) become a band; the curve is plotted outside it. */
	const BAND_PX = 10;
	function plot(sc: Scenario, vp: Viewport, S: number) {
		const at = sc.at as number;
		const r = sc.bandRadius?.((BAND_PX * (vp.x1 - vp.x0)) / S) ?? 0;
		const def = definedAt(sc);
		return {
			defined: r > 0 ? (x: number) => def(x) && Math.abs(x - at) > r : def,
			breaks: r > 0 ? [...sc.breaks, at - r, at + r] : sc.breaks,
			band: r > 0 && sc.band ? { x0: at - r, x1: at + r, y0: sc.band[0], y1: sc.band[1] } : null
		};
	}

	function drag(side: HandleSide, x: number) {
		const xs = clampSide(x, v.a, side, minGap(v.hx), v.cx - v.hx, v.cx + v.hx);
		update(side === 'left' ? { xl: xs } : { xr: xs });
	}
	function key(side: HandleSide, dir: -1 | 1, big: boolean) {
		const x = side === 'left' ? v.xl : v.xr;
		drag(side, x + dir * v.hx * (big ? 0.2 : 0.04));
	}
</script>

<LinkReset />
<Stage label={m.la_stage_aria({ title })}>
	{#snippet children({ S, glow })}
		{@const vp = frame(S, v)}
		{@const ax = axisAt(vp)}
		{@const P = plot(s, vp, S)}
		{@const O = plot(old, vp, S)}
		<GraphAxes {vp} axes={v.axes} {locale} />

		<!-- Target heights the outputs close in on (L-07). -->
		{#if v.lims > 0}
			{#each ['left', 'right'] as const as side (side)}
				{@const y = s[side]}
				{#if typeof y === 'number' && (side === 'left' || y !== s.left)}
					<line
						{...linkAttrs(L === 'dne' ? side : 'lim')}
						x1={vp.gx(ax.ax)}
						y1={vp.gy(y)}
						x2={vp.gx(a)}
						y2={vp.gy(y)}
						stroke={L === 'dne' ? COLOR[side] : 'var(--c-lim)'}
						stroke-width="1.5"
						stroke-dasharray="6 5"
						opacity={v.lims * 0.55}
						pointer-events="none"
					/>
				{/if}
			{/each}
		{/if}

		{#if v.mix < 1}
			<g opacity={1 - v.mix}>
				<FunctionPlot {vp} g={old.f} defined={O.defined} breaks={O.breaks} dense={old.dense} />
				{#if O.band}<Band {vp} {...O.band} />{/if}
				{#each oldDots.open as y (y)}<Dot {vp} x={old.at as number} {y} open />{/each}
				{#if oldDots.filled !== undefined}<Dot {vp} x={old.at as number} y={oldDots.filled} />{/if}
			</g>
		{/if}

		<g data-testid="curve" data-sc={v.sc} style:opacity={linkOpacity('f', link.id)}>
			<FunctionPlot
				opacity={v.mix}
				{vp}
				g={s.f}
				defined={P.defined}
				breaks={P.breaks}
				dense={s.dense}
				draw={v.draw}
				testid="plot"
				filter={glowing && !s.dense ? glow.sm : undefined}
			/>
			{#if P.band}<Band {vp} {...P.band} opacity={v.mix} />{/if}
		</g>

		{#if v.guide > 0}
			<line
				x1={vp.gx(a)}
				y1={vp.gy(vp.y1)}
				x2={vp.gx(a)}
				y2={vp.gy(vp.y0)}
				stroke="var(--text-muted)"
				stroke-width="1"
				stroke-dasharray="3 5"
				opacity={v.guide * 0.7}
				pointer-events="none"
			/>
		{/if}

		<g style:opacity={linkOpacity('lim', link.id)}>
			{#each dots.open as y (y)}
				<Dot {vp} x={a} {y} open opacity={v.open} testid="hole" />
			{/each}
			{#if dots.filled !== undefined}
				<Dot {vp} x={a} y={dots.filled} opacity={v.filled} testid="value" />
			{/if}
		</g>

		{#each ['left', 'right'] as const as side (side)}
			{@const x = side === 'left' ? v.xl : v.xr}
			{@const y = fy(side)}
			<g {...linkAttrs(side)} style:opacity={linkOpacity(side, link.id)}>
				<OutputTick {vp} {x} {y} {side} color={COLOR[side]} opacity={v.handles} />
				<ApproachHandle
					{vp}
					{x}
					{y}
					{side}
					color={COLOR[side]}
					opacity={v.handles}
					live={v.handles > 0.5}
					label={side === 'left' ? m.lim_handle_left_aria() : m.lim_handle_right_aria()}
					value={x}
					min={vp.x0}
					max={vp.x1}
					valuetext={m.lim_handle_valuetext({ x: fmt(x, digits, locale), y: fmt(y, digits, locale) })}
					onpoint={(q) => drag(side, q.x)}
					onkey={(dir, big) => key(side, dir, big)}
					{oninteract}
				/>
			</g>
		{/each}

		{#if showGuess && predict?.phase === 'after' && typeof L === 'number' && Math.abs(guessY - L) > 0.2}
			<line
				data-testid="guess-connector"
				x1={vp.gx(a)}
				y1={vp.gy(guessY) + (guessY < L ? -20 : 20)}
				x2={vp.gx(a)}
				y2={vp.gy(L) + (guessY < L ? 9 : -9)}
				stroke="var(--c-guess)"
				stroke-width="1.5"
				stroke-dasharray="4 4"
				opacity={v.open}
				pointer-events="none"
			/>
		{/if}
		{#if showGuess}
			<GuessMarker
				x={vp.gx(a)}
				y={vp.gy(guessY)}
				label={m.predict_marker_aria()}
				valuetext={m.la_guess_valuetext({ value: fmt(guessY, 1, locale) })}
				pulse={awaiting}
				onpoint={(q) => update({ guess: friendly(vp.uy(q.y), vp.y0 + 0.3, vp.y1 - 0.3, 0.1) })}
				onstep={(dir, big) => update({ guess: friendly(guessY + dir * (big ? 1 : 0.1), vp.y0 + 0.3, vp.y1 - 0.3, 0) })}
				onreveal={() => predict?.onreveal()}
				{oninteract}
			/>
		{/if}
	{/snippet}
</Stage>
