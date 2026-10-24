<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmt } from '#lib/engine/format.ts';
	import LinkReset from '#lib/link/LinkReset.svelte';
	import { link } from '#lib/link/link.svelte.ts';
	import { linkOpacity } from '#lib/link/ids.ts';
	import { linkAttrs } from '#lib/link/linkable.ts';
	import { frame, inside, type Viewport } from '#lib/graph/viewport.ts';
	import GraphAxes from '#lib/graph/GraphAxes.svelte';
	import FunctionPlot from '#lib/graph/FunctionPlot.svelte';
	import { SCENARIOS, definedAt, type Scenario } from '#lib/limits/scenario.ts';
	import { clampSide, exitX, minGap, readout, type HandleSide } from '#lib/limits/approach.ts';
	import { outwardDrag, outwardU, outwardX } from '#lib/limits/outward.ts';
	import ApproachHandle from '#lib/limits/ApproachHandle.svelte';
	import OutputTick from '#lib/limits/OutputTick.svelte';
	import Dot from '#lib/limits/Dot.svelte';
	import Asymptote from '#lib/limits/Asymptote.svelte';
	import OffscreenArrow from '#lib/limits/OffscreenArrow.svelte';
	import type { SceneProps } from '#concepts/types.ts';
	import { PEN, penDefined } from './pen.ts';
	import { OUTWARD_LIMITS, PREDICT, type LIScenario, type LIUser } from './steps.ts';
	import { BASE, type LIView } from './view.ts';
	import { xDigits, yDigits } from './digits.ts';

	let { v, title, user, glowing = false, step, update, oninteract, predict }: SceneProps<LIUser, LIView> = $props();

	const locale = getLocale();
	const COLOR = { left: 'var(--c-left)', right: 'var(--c-right)' } as const;
	const SIDES = ['left', 'right'] as const;
	const LIFT_NAME = { hole: () => m.li_break_hole(), jump: () => m.li_break_jump(), asym: () => m.li_break_asym() };

	const isPoint = (sc: LIScenario) => sc === 'recip' || sc === 'recipSq';
	const hs = $derived(v.hs === 'pen' ? null : SCENARIOS[v.hs]);
	const outward = $derived(v.pointing === 'out');
	const fy = (side: HandleSide) => (hs ? readout(hs, side === 'left' ? v.xl : v.xr, side) : NaN);

	/** Point steps: stay on your side of a. At infinity: drag in screen-fraction space (L-09). */
	let grab: { x: number; u: number | null } | null = null;
	function drag(side: HandleSide, qx: number) {
		if (!hs) return;
		if (outward) {
			const u = (qx - v.cx) / v.hx;
			if (!grab) return;
			if (grab.u === null) grab.u = u;
			setOutward(side, outwardDrag(grab.x, grab.u, u, BASE.rational.hx));
			return;
		}
		const a = hs.at as number;
		const x = clampSide(qx, a, side, minGap(v.hx), v.cx - v.hx, v.cx + v.hx);
		update(side === 'left' ? { xl: x } : { xr: x });
	}
	function setOutward(side: HandleSide, x: number) {
		if (side === 'left') update({ xl: Math.min(OUTWARD_LIMITS.left, x) });
		else update({ xr: Math.max(OUTWARD_LIMITS.right, x) });
	}
	function key(side: HandleSide, dir: -1 | 1, big: boolean) {
		const x = side === 'left' ? v.xl : v.xr;
		if (outward) setOutward(side, outwardX(outwardU(x, BASE.rational.hx) + dir * (big ? 0.05 : 0.01), BASE.rational.hx));
		else drag(side, x + dir * v.hx * (big ? 0.2 : 0.04));
	}
	function onGrab(side: HandleSide) {
		grab = { x: side === 'left' ? v.xl : v.xr, u: null };
	}

	/** Where each side of a point example leaves the window toward ±∞. */
	function exits(s: Scenario, vp: Viewport) {
		if (typeof s.at !== 'number') return [];
		return SIDES.flatMap((side) => {
			const lim = s[side];
			if (lim !== Infinity && lim !== -Infinity) return [];
			const x = exitX(s.f, s.at as number, side, vp.y0, vp.y1, vp.x1 - vp.x0);
			return x === null ? [] : [{ side, x, dir: (lim > 0 ? 1 : -1) as 1 | -1 }];
		});
	}

	const penY = $derived(penDefined(v.pen) ? PEN.f(v.pen) : NaN);
	const awaiting = $derived(step === PREDICT && predict?.phase === 'awaiting');
</script>

{#snippet decorations(sc: LIScenario, vp: Viewport, vasym: number, hasym: number, arrows: number)}
	{#if sc !== 'pen'}
		{@const s = SCENARIOS[sc]}
		<g {...linkAttrs('asym')} style:opacity={linkOpacity('asym', link.id)}>
			{#each s.vAsym as x (x)}<Asymptote {vp} at={x} dir="v" opacity={vasym} />{/each}
			{#each s.hAsym as y (y)}<Asymptote {vp} at={y} dir="h" opacity={hasym} draw={hasym} color="var(--c-lim)" />{/each}
		</g>
		{#each exits(s, vp) as e (e.side)}
			<OffscreenArrow {vp} x={e.x} dir={e.dir} labelSide={e.side === 'left' ? -1 : 1} color={COLOR[e.side]} opacity={arrows} testid="exit-{e.side}" />
		{/each}
	{/if}
{/snippet}

<LinkReset />
<Stage label={m.li_stage_aria({ title })}>
	{#snippet children({ S, glow })}
		{@const vp = frame(S, v)}
		<GraphAxes {vp} axes={v.axes} {locale} />

		{#if v.mix < 1}
			<g opacity={1 - v.mix} data-testid="old">
				{#if v.prev === 'pen'}
					<FunctionPlot {vp} g={PEN.f} defined={penDefined} breaks={PEN.breaks} />
				{:else}
					{@const o = SCENARIOS[v.prev]}
					<FunctionPlot {vp} g={o.f} defined={definedAt(o)} breaks={o.breaks} />
					{@render decorations(v.prev, vp, 1, 1, isPoint(v.prev) ? 1 : 0)}
				{/if}
			</g>
		{/if}

		{#if v.sc === 'pen'}
			{@const drawn = (v.pen - vp.x0) / (vp.x1 - vp.x0)}
			<g data-testid="curve" data-sc="pen">
				<FunctionPlot
					{vp}
					g={PEN.f}
					defined={penDefined}
					breaks={PEN.breaks}
					draw={Math.min(1, Math.max(0, drawn))}
					opacity={v.mix}
					testid="plot"
					filter={glowing ? glow.sm : undefined}
				/>
			</g>
			{#each PEN.vAsym as x (x)}
				<Asymptote {vp} at={x} dir="v" opacity={v.vasym * (v.pen > x ? 1 : 0.35)} />
			{/each}
			{#each PEN.open as [x, y] (x)}
				<Dot {vp} {x} {y} open opacity={v.pen > x ? v.mix : 0} />
			{/each}
			{#each PEN.filled as [x, y] (x)}
				<Dot {vp} {x} {y} opacity={v.pen >= x ? v.mix : 0} />
			{/each}
			{#each PEN.lifts as l (l.kind)}
				{@const o = Math.min(1, Math.max(0, (v.pen - l.x) / 0.4))}
				{#if o > 0}
					<text
						data-testid="lift-{l.kind}"
						x={vp.gx(l.x) + 10}
						y={vp.gy(l.y) - 14}
						opacity={o * v.mix}
						fill="var(--text-strong)"
						font-size="15"
						font-weight="700"
						paint-order="stroke"
						stroke="var(--bg)"
						stroke-width="4"
						pointer-events="none">{LIFT_NAME[l.kind]()}</text
					>
				{/if}
			{/each}
			<ApproachHandle
				{vp}
				x={v.pen}
				y={penY}
				side="left"
				color="var(--c-point)"
				opacity={v.penOn}
				live={v.penOn > 0.5}
				label={m.li_pen_aria()}
				value={v.pen}
				min={PEN.from}
				max={PEN.to}
				valuetext={fmt(v.pen, 1, locale)}
				onpoint={(q) => update({ pen: Math.min(PEN.to, Math.max(PEN.from, q.x)) })}
				onkey={(dir, big) => update({ pen: Math.min(PEN.to, Math.max(PEN.from, v.pen + dir * (big ? 1 : 0.1))) })}
				{oninteract}
			/>
		{:else}
			{@const s = SCENARIOS[v.sc]}
			{@const def = definedAt(s)}
			{@const veiled = (x: number) => def(x) && Math.abs(x - (s.at as number)) >= v.veil}
			<g data-testid="curve" data-sc={v.sc} style:opacity={linkOpacity('f', link.id)}>
				<FunctionPlot
					{vp}
					g={s.f}
					defined={v.veil > 0 ? veiled : def}
					breaks={v.veil > 0 ? [...s.breaks, (s.at as number) - v.veil, (s.at as number) + v.veil] : s.breaks}
					draw={v.draw}
					opacity={v.mix}
					testid="plot"
					filter={glowing ? glow.sm : undefined}
				/>
			</g>
			{@render decorations(v.sc, vp, v.vasym, v.hasym, v.arrows)}
		{/if}

		{#if hs}
			{#each SIDES as side (side)}
				{@const x = side === 'left' ? v.xl : v.xr}
				{@const y = fy(side)}
				<g {...linkAttrs(side)} style:opacity={linkOpacity(side, link.id)}>
					<OutputTick {vp} {x} {y} {side} color={COLOR[side]} opacity={v.handles} />
					<ApproachHandle
						{vp}
						{x}
						{y}
						{side}
						pointing={v.pointing}
						color={COLOR[side]}
						opacity={v.handles}
						live={v.handles > 0.5 && !awaiting}
						label={side === 'left' ? m.lim_handle_left_aria() : m.lim_handle_right_aria()}
						value={x}
						min={vp.x0}
						max={vp.x1}
						valuetext={m.lim_handle_valuetext({ x: fmt(x, xDigits(v), locale), y: fmt(y, yDigits(v), locale) })}
						onpoint={(q) => drag(side, q.x)}
						onkey={(dir, big) => key(side, dir, big)}
						ongrab={() => onGrab(side)}
						{oninteract}
					/>
				</g>
			{/each}
		{/if}

		<!-- Predict: the student's up/down guess per side, as arrows beside 0 (L-12). -->
		{#if v.guess > 0 && hs && typeof hs.at === 'number'}
			{#each SIDES as side (side)}
				{@const g = side === 'left' ? user.gl : user.gr}
				{#if g !== null}
					{@const x = vp.gx((hs.at as number) + (side === 'left' ? -0.35 : 0.35) * v.hx)}
					{@const y0 = vp.gy(v.cy)}
					{@const tip = y0 - g * 70}
					<g data-testid="guess-{side}" data-dir={g} opacity={v.guess} pointer-events="none">
						<line x1={x} y1={y0} x2={x} y2={tip + g * 10} stroke="var(--c-guess)" stroke-width="3" stroke-dasharray="6 5" />
						<path d="M{x},{tip} L{x - 8},{tip + g * 13} L{x + 8},{tip + g * 13} Z" fill="var(--c-guess)" />
					</g>
				{/if}
			{/each}
		{/if}
	{/snippet}
</Stage>
