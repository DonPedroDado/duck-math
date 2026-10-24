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
	import { BASES, inDomain } from '#lib/graph/base.ts';
	import { apply, friendly, lookupSource, mapPoint, type Params } from '#lib/graph/transform.ts';
	import GraphAxes from '#lib/graph/GraphAxes.svelte';
	import RubberGrid from '#lib/graph/RubberGrid.svelte';
	import FunctionPlot from '#lib/graph/FunctionPlot.svelte';
	import Landmark from '#lib/graph/Landmark.svelte';
	import DragHandle from '#lib/graph/DragHandle.svelte';
	import CurveDrag from '#lib/graph/CurveDrag.svelte';
	import type { SceneProps } from '#concepts/types.ts';
	import { ACTIVE, RANGE, type CBUser } from './steps.ts';
	import { STEP_IDS } from './step-ids.ts';
	import type { CBView } from './view.ts';

	let { v, title, user, glowing = false, step, update, oninteract, predict }: SceneProps<CBUser, CBView> =
		$props();

	const locale = getLocale();
	const id = $derived(STEP_IDS[step]);
	const base = $derived(BASES[user.base]);
	const p: Params = $derived({ a: v.a, b: v.b, c: v.c, d: v.d });
	const g = $derived(apply(p, base.f));
	const defined = $derived((x: number) => inDomain(base, lookupSource(p, x)));
	/** The landmark the handle sits on: the first one off both axes (the peak for f). */
	const HL = $derived(base.landmarks.find((l) => l.x !== 0 && l.y !== 0) ?? base.landmarks[0]);
	const PEAK = BASES.f.landmarks.find((l) => l.id === 'peak')!;
	const CMP: Params = { a: 1, b: 2, c: 1, d: 0 };
	const cmpG = apply(CMP, BASES.f.f);

	const awaiting = $derived(id === 'order' && predict?.phase === 'awaiting');
	const active = $derived(ACTIVE[id]);
	const stretch = $derived(active.filter((r) => r === 'a' || r === 'b'));
	const shift = $derived(active.filter((r) => r === 'c' || r === 'd'));
	const handleAt = $derived(mapPoint(p, [HL.x, HL.y]));
	const showGuess = $derived(
		id === 'order' && (awaiting || (predict?.phase === 'after' && user.guess !== null))
	);
	const guessX = $derived(user.guess ?? CMP.c + PEAK.x / CMP.b);

	const clamp = (r: keyof typeof RANGE, x: number, tol = 0.15) => friendly(x, RANGE[r][0], RANGE[r][1], tol);
	function onpoint(q: { x: number; y: number }) {
		const patch: Partial<CBUser> = {};
		if (stretch.includes('a')) patch.a = clamp('a', (q.y - v.d) / HL.y, 0.08);
		if (stretch.includes('b')) {
			const dx = q.x - v.c;
			patch.b = clamp('b', Math.abs(dx) < 1e-3 ? Math.sign(HL.x * (dx || 1)) * 99 : HL.x / dx, 0.08);
		}
		update(patch);
	}
	function onkey(dir: -1 | 1, big: boolean) {
		const r = stretch.includes('a') ? 'a' : 'b';
		update({ [r]: clamp(r, v[r] + dir * (big ? 0.5 : 0.1), 0) });
	}
	let from = { c: 0, d: 0 };
	function ondelta({ dx, dy }: { dx: number; dy: number }) {
		const patch: Partial<CBUser> = {};
		if (shift.includes('c')) patch.c = clamp('c', from.c + dx);
		if (shift.includes('d')) patch.d = clamp('d', from.d + dy);
		update(patch);
	}
</script>

<LinkReset />
<Stage label={m.cb_stage_aria({ title })}>
	{#snippet children({ S, glow })}
		{@const vp = viewport(S)}
		<GraphAxes {vp} axes={v.axes} {locale} />
		<g style:opacity={linkOpacity(['a', 'b'], link.id)}>
			<RubberGrid {vp} {p} opacity={v.grid} fixedX={v.fixedX} fixedY={v.fixedY} />
		</g>

		<g {...linkAttrs('ghost')} style:opacity={linkOpacity('ghost', link.id)}>
			<FunctionPlot {vp} g={base.f} defined={(x) => inDomain(base, x)} ghost opacity={v.ghost} testid="ghost" />
		</g>

		{#if v.cmp > 0}
			<g data-testid="cmp" style:opacity={linkOpacity('c', link.id)}>
				<FunctionPlot {vp} g={cmpG} color="var(--c-pc)" width={2} opacity={0.75 * v.cmp} />
				<text
					x={vp.gx(CMP.c + PEAK.x / CMP.b)}
					y={vp.gy(PEAK.y) - 14}
					text-anchor="middle"
					fill="var(--c-pc)"
					font-size="14"
					font-weight="600"
					opacity={v.cmp}
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3"
					pointer-events="none">f(2(x − 1))</text
				>
			</g>
		{/if}

		<g
			data-testid="curve"
			data-a={v.a.toFixed(2)}
			data-b={v.b.toFixed(2)}
			data-c={v.c.toFixed(2)}
			data-d={v.d.toFixed(2)}
			data-base={user.base}
			style:opacity={linkOpacity('f', link.id)}
		>
			<FunctionPlot {vp} {g} {defined} draw={v.draw} filter={glowing ? glow.sm : undefined} />
		</g>

		<g style:opacity={linkOpacity(['a', 'b', 'c', 'd', 'f'], link.id)}>
			{#each base.landmarks as l (l.id)}
				<Landmark {vp} id={l.id} from={[l.x, l.y]} to={mapPoint(p, [l.x, l.y])} opacity={v.landmarks} arrow={v.arrows} />
			{/each}
		</g>

		<CurveDrag
			{vp}
			{g}
			{defined}
			live={shift.length > 0}
			cursor={shift.length === 2 ? 'move' : shift[0] === 'c' ? 'ew-resize' : 'ns-resize'}
			ondragstart={() => (from = { c: v.c, d: v.d })}
			{ondelta}
			{oninteract}
		/>

		{#if stretch.length && handleAt}
			{@const r = stretch[0]}
			<DragHandle
				{vp}
				x={handleAt[0]}
				y={handleAt[1]}
				testid="peak-handle"
				axis={stretch.length === 2 ? 'xy' : r === 'a' ? 'y' : 'x'}
				color={stretch.length === 2 ? 'var(--c-point)' : `var(--c-p${r})`}
				label={m.fn_landmark_peak()}
				value={v[r]}
				min={RANGE[r][0]}
				max={RANGE[r][1]}
				valuetext={m.cb_handle_valuetext({ a: fmt(v.a, 1, locale), b: fmt(v.b, 1, locale) })}
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
				valuetext={m.cb_guess_valuetext({ value: fmt(guessX, 1, locale) })}
				pulse={awaiting}
				onpoint={(q) => update({ guess: friendly(vp.ux(q.x), -vp.half, vp.half, 0.1) })}
				onstep={(dir, big) => update({ guess: friendly(guessX + dir * (big ? 1 : 0.1), -vp.half, vp.half, 0) })}
				onreveal={() => predict?.onreveal()}
				{oninteract}
			/>
			{#if predict?.phase === 'after'}
				{@const real = mapPoint(p, [PEAK.x, PEAK.y])}
				{#if real}
					<line
						data-testid="guess-connector"
						x1={vp.gx(guessX)}
						y1={vp.gy(PEAK.y) - 30}
						x2={vp.gx(real[0])}
						y2={vp.gy(PEAK.y) - 30}
						stroke="var(--c-guess)"
						stroke-width="1.5"
						stroke-dasharray="4 4"
						pointer-events="none"
					/>
				{/if}
			{/if}
		{/if}
	{/snippet}
</Stage>
