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
	import { viewport } from '#lib/graph/viewport.ts';
	import { BASES } from '#lib/graph/base.ts';
	import { apply, friendly, mapPoint, IDENTITY } from '#lib/graph/transform.ts';
	import GraphAxes from '#lib/graph/GraphAxes.svelte';
	import RubberGrid from '#lib/graph/RubberGrid.svelte';
	import FunctionPlot from '#lib/graph/FunctionPlot.svelte';
	import Landmark from '#lib/graph/Landmark.svelte';
	import DragHandle from '#lib/graph/DragHandle.svelte';
	import type { SceneProps } from '#concepts/types.ts';
	import { ACTIVE, FIXED, RANGE, type SRUser } from './steps.ts';
	import { STEP_IDS } from './step-ids.ts';
	import type { SRView } from './view.ts';

	let { v, title, user, glowing = false, step, update, oninteract, predict }: SceneProps<SRUser, SRView> =
		$props();

	const locale = getLocale();
	const f = BASES.f;
	const PEAK = f.landmarks.find((l) => l.id === 'peak')!;
	const id = $derived(STEP_IDS[step]);
	const p = $derived({ ...IDENTITY, a: v.a, b: v.b });
	const g = $derived(apply(p, f.f));

	const awaiting = $derived(id === 'horizontal' && predict?.phase === 'awaiting');
	const active = $derived(id === 'horizontal' && predict?.phase !== 'after' ? [] : ACTIVE[id]);
	const showGuess = $derived(
		id === 'horizontal' && (awaiting || (predict?.phase === 'after' && user.guess !== null))
	);
	const guessX = $derived(user.guess ?? PEAK.x);
	const fixed = $derived(FIXED[id]);
	/** Landmarks that do not move: zeros under a (on y = 0), the y-intercept under b (on x = 0). */
	const RINGS = [
		{ id: 'zero', glow: (w: SRView) => w.fixedX },
		{ id: 'yInt', glow: (w: SRView) => w.fixedY }
	];
	const peakAt = $derived(mapPoint(p, [PEAK.x, PEAK.y]));
	const role = $derived(active.includes('a') ? 'a' : 'b');

	const clampA = (x: number) => friendly(x, RANGE.a[0], RANGE.a[1], 0.08);
	/** x = PEAK.x / b, so b = PEAK.x / x; the pointer near the y-axis means a huge b, clamped. */
	const bFromX = (x: number) =>
		friendly(Math.abs(x) < 1e-3 ? Math.sign(PEAK.x * (x || 1)) * 99 : PEAK.x / x, RANGE.b[0], RANGE.b[1], 0.08);
	function onpoint(q: { x: number; y: number }) {
		const patch: Partial<SRUser> = {};
		if (active.includes('a')) patch.a = clampA(q.y / PEAK.y);
		if (active.includes('b')) patch.b = bFromX(q.x);
		update(patch);
	}
	function onkey(dir: -1 | 1, big: boolean) {
		const d = dir * (big ? 0.5 : 0.1);
		if (role === 'a') update({ a: clampA(v.a + d) });
		else update({ b: friendly(v.b + d, RANGE.b[0], RANGE.b[1], 0) });
	}
</script>

<LinkReset />
<Stage label={m.sr_stage_aria({ title })}>
	{#snippet children({ S, glow })}
		{@const vp = viewport(S)}
		<GraphAxes {vp} axes={v.axes} {locale} />
		<g {...linkAttrs(fixed === 'y' ? 'b' : 'a')} style:opacity={linkOpacity(['a', 'b'], link.id)}>
			<RubberGrid {vp} {p} opacity={v.grid} fixedX={v.fixedX} fixedY={v.fixedY} />
		</g>

		{#if v.mirror > 0}
			{@const H = vp.half}
			<line
				data-testid="mirror"
				data-axis={id === 'reflect-x' ? 'x' : 'y'}
				x1={id === 'reflect-x' ? vp.gx(-H) : vp.gx(0)}
				y1={id === 'reflect-x' ? vp.gy(0) : vp.gy(-H)}
				x2={id === 'reflect-x' ? vp.gx(H) : vp.gx(0)}
				y2={id === 'reflect-x' ? vp.gy(0) : vp.gy(H)}
				stroke="var(--c-point)"
				stroke-width="2"
				stroke-dasharray="10 6"
				opacity={v.mirror}
				pointer-events="none"
			/>
		{/if}

		<g {...linkAttrs('ghost')} style:opacity={linkOpacity('ghost', link.id)}>
			<FunctionPlot {vp} g={f.f} ghost opacity={v.ghost} testid="ghost" />
		</g>
		<g data-testid="curve" data-a={v.a.toFixed(2)} data-b={v.b.toFixed(2)} style:opacity={linkOpacity('f', link.id)}>
			<FunctionPlot {vp} {g} draw={v.draw} filter={glowing ? glow.sm : undefined} />
		</g>

		<g {...linkAttrs(role)} style:opacity={linkOpacity([role, 'f'], link.id)}>
			{#each f.landmarks as l (l.id)}
				<Landmark {vp} id={l.id} from={[l.x, l.y]} to={mapPoint(p, [l.x, l.y])} opacity={v.landmarks} arrow={v.arrows} />
			{/each}
		</g>
		{#each RINGS as r (r.id)}
			{@const l = f.landmarks.find((q) => q.id === r.id)!}
			<circle
				data-testid="fixed-{l.id}"
				cx={vp.gx(l.x)}
				cy={vp.gy(l.y)}
				r="11"
				fill="none"
				stroke="var(--accent)"
				stroke-width="2.5"
				opacity={r.glow(v)}
				pointer-events="none"
			/>
		{/each}

		{#if v.draw > 0.95 && peakAt && Math.abs(peakAt[0]) < vp.half - 0.6 && Math.abs(peakAt[1]) < vp.half - 0.6}
			{@const name = v.ghost > 0.5 && (Math.abs(v.a - 1) + Math.abs(v.b - 1) > 0.2) ? 'g' : 'f'}
			<text
				x={vp.gx(peakAt[0]) + 12}
				y={vp.gy(peakAt[1]) + (peakAt[1] >= 0 ? -12 : 24)}
				fill="var(--c-point)"
				font-size="16"
				font-style="italic"
				font-weight="600"
				paint-order="stroke"
				stroke="var(--bg)"
				stroke-width="3"
				pointer-events="none">{name}</text
			>
		{/if}

		{#if active.length && !awaiting && peakAt}
			<DragHandle
				{vp}
				x={peakAt[0]}
				y={peakAt[1]}
				testid="peak-handle"
				axis={active.length === 2 ? 'xy' : active[0] === 'a' ? 'y' : 'x'}
				color={active.length === 2 ? 'var(--c-point)' : `var(--c-p${role})`}
				label={m.fn_landmark_peak()}
				value={role === 'a' ? v.a : v.b}
				min={RANGE[role][0]}
				max={RANGE[role][1]}
				valuetext={m.sr_handle_valuetext({ param: role, value: fmt(role === 'a' ? v.a : v.b, 1, locale) })}
				{onpoint}
				{onkey}
				{oninteract}
			/>
		{/if}

		{#if showGuess}
			<GuessMarker
				x={vp.gx(guessX)}
				y={vp.gy(PEAK.y)}
				label={m.predict_marker_aria()}
				valuetext={m.sr_guess_valuetext({ value: fmt(guessX, 1, locale) })}
				pulse={awaiting}
				onpoint={(q) => update({ guess: friendly(vp.ux(q.x), -vp.half, vp.half, 0.1) })}
				onstep={(dir, big) => update({ guess: friendly(guessX + dir * (big ? 1 : 0.1), -vp.half, vp.half, 0) })}
				onreveal={() => predict?.onreveal()}
				{oninteract}
			/>
			{#if predict?.phase === 'after' && peakAt}
				<line
					data-testid="guess-connector"
					x1={vp.gx(guessX)}
					y1={vp.gy(PEAK.y) - 26}
					x2={vp.gx(peakAt[0])}
					y2={vp.gy(PEAK.y) - 26}
					stroke="var(--c-guess)"
					stroke-width="1.5"
					stroke-dasharray="4 4"
					pointer-events="none"
				/>
			{/if}
		{/if}
	{/snippet}
</Stage>
