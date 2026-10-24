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
	import FunctionPlot from '#lib/graph/FunctionPlot.svelte';
	import Landmark from '#lib/graph/Landmark.svelte';
	import LookupArrows from '#lib/graph/LookupArrows.svelte';
	import CurveDrag from '#lib/graph/CurveDrag.svelte';
	import type { SceneProps } from '#concepts/types.ts';
	import { ACTIVE, RANGE, type SHUser } from './steps.ts';
	import { STEP_IDS } from './step-ids.ts';
	import type { SHView } from './view.ts';

	let { v, title, user, glowing = false, step, update, oninteract, predict }: SceneProps<SHUser, SHView> =
		$props();

	const locale = getLocale();
	const f = BASES.f;
	const id = $derived(STEP_IDS[step]);
	const p = $derived({ ...IDENTITY, c: v.c, d: v.d });
	const g = $derived(apply(p, f.f));
	const PEAK = f.landmarks.find((l) => l.id === 'peak')!;

	/** Before the reveal the student answers the question; nothing else is draggable. */
	const awaiting = $derived(id === 'opposite' && predict?.phase === 'awaiting');
	const active = $derived(
		id === 'opposite' && predict?.phase !== 'after' ? [] : ACTIVE[id]
	);
	const showGuess = $derived(
		id === 'opposite' && (awaiting || (predict?.phase === 'after' && user.guess !== null))
	);
	const guessX = $derived(user.guess ?? PEAK.x);

	/** Arrow role for hover linking: vertical moves are d, sideways moves are c. */
	const arrowRole = $derived(id === 'vertical' ? 'd' : 'c');
	const shifted = $derived(Math.abs(v.c) + Math.abs(v.d) > 0.3);

	let from = { c: 0, d: 0 };
	const clampC = (x: number) => friendly(x, RANGE.c[0], RANGE.c[1]);
	const clampD = (x: number) => friendly(x, RANGE.d[0], RANGE.d[1]);
	function ondelta({ dx, dy }: { dx: number; dy: number }) {
		const patch: Partial<SHUser> = {};
		if (active.includes('c')) patch.c = clampC(from.c + dx);
		if (active.includes('d')) patch.d = clampD(from.d + dy);
		update(patch);
	}
	const cursor = $derived(
		active.length === 2 ? 'move' : active[0] === 'c' ? 'ew-resize' : 'ns-resize'
	);
</script>

<LinkReset />
<Stage label={m.sh_stage_aria({ title })}>
	{#snippet children({ S, glow })}
		{@const vp = viewport(S)}
		<GraphAxes {vp} axes={v.axes} {locale} />

		<g {...linkAttrs('ghost')} style:opacity={linkOpacity('ghost', link.id)}>
			<FunctionPlot {vp} g={f.f} ghost opacity={v.ghost} testid="ghost" />
		</g>

		<g data-testid="lookup-layer" style:opacity={linkOpacity('c', link.id)}>
			<LookupArrows {vp} {p} f={f.f} xs={[-5, -1.5, 2.5]} opacity={v.lookup} />
		</g>

		<g data-testid="curve" data-c={v.c.toFixed(2)} data-d={v.d.toFixed(2)} style:opacity={linkOpacity('f', link.id)}>
			<FunctionPlot {vp} {g} draw={v.draw} filter={glowing ? glow.sm : undefined} />
		</g>

		<g {...linkAttrs(arrowRole)} style:opacity={linkOpacity([arrowRole, 'f'], link.id)}>
			{#each f.landmarks as l (l.id)}
				<Landmark {vp} id={l.id} from={[l.x, l.y]} to={mapPoint(p, [l.x, l.y])} opacity={v.landmarks} arrow={v.arrows} />
			{/each}
		</g>

		{#if v.draw > 0.95}
			{@const L = shifted && v.ghost > 0.5 ? mapPoint(p, [PEAK.x, PEAK.y]) : [PEAK.x, PEAK.y]}
			{#if L && Math.abs(L[0]) < vp.half - 0.5 && Math.abs(L[1]) < vp.half - 0.6}
				<text
					x={vp.gx(L[0]) + 12}
					y={vp.gy(L[1]) - 12}
					fill="var(--c-point)"
					font-size="16"
					font-style="italic"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3"
					pointer-events="none">{shifted && v.ghost > 0.5 ? 'g' : 'f'}</text
				>
			{/if}
			{#if shifted && v.ghost > 0.5}
				<text
					x={vp.gx(PEAK.x) + 12}
					y={vp.gy(PEAK.y) - 12}
					fill="var(--text-muted)"
					font-size="16"
					font-style="italic"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3"
					pointer-events="none">f</text
				>
			{/if}
		{/if}

		<CurveDrag
			{vp}
			{g}
			live={active.length > 0 && !awaiting}
			{cursor}
			ondragstart={() => (from = { c: v.c, d: v.d })}
			{ondelta}
			{oninteract}
		/>

		{#if showGuess}
			<GuessMarker
				x={vp.gx(guessX)}
				y={vp.gy(PEAK.y)}
				label={m.predict_marker_aria()}
				valuetext={m.sh_guess_valuetext({ value: fmt(guessX, 1, locale) })}
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
						y1={vp.gy(PEAK.y) - 26}
						x2={vp.gx(real[0])}
						y2={vp.gy(PEAK.y) - 26}
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
