<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt } from '#lib/engine/format.ts';
	import Tex from '#lib/tex/Tex.svelte';
	import PredictPrompt from '#lib/player/PredictPrompt.svelte';
	import { SCENARIOS } from '#lib/limits/scenario.ts';
	import { digitsFor, readout } from '#lib/limits/approach.ts';
	import ZoomControl from '#lib/limits/ZoomControl.svelte';
	import type { PanelProps } from '#concepts/types.ts';
	import { formulaLines } from './formulas.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { STEPS, ZOOMABLE, type LAUser } from './steps.ts';
	import type { LAView } from './view.ts';

	let { v, step, locale, update, oninteract, predict }: PanelProps<LAUser, LAView> = $props();

	const id = $derived(STEP_IDS[step]);
	const lines = $derived(formulaLines(id, v, locale));
	const awaiting = $derived(id === 'predict' && predict?.phase === 'awaiting');
	const answered = $derived(id === 'predict' && v.subst > 0.5);
	const s = $derived(SCENARIOS[v.hs]);
	const digits = $derived(digitsFor(v.hx));
	const rows = $derived(
		(['left', 'right'] as const).map((side) => {
			const x = side === 'left' ? v.xl : v.xr;
			return { side, x, y: readout(s, x, side) };
		})
	);

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.la_step_intro_caption(),
		predict: () => m.la_step_predict_caption(),
		approach: () => m.la_step_approach_caption(),
		zoom: () => m.la_step_zoom_caption(),
		value: () => m.la_step_value_caption(),
		jump: () => m.la_step_jump_caption(),
		oscillate: () => m.la_step_oscillate_caption()
	};
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.la_title()}</h1>
<div aria-live="polite">
	{#if awaiting}
		<PredictPrompt question={m.la_step_predict_predict_caption()} />
	{:else}
		{#key `${step}-${answered}`}
			<p class="caption" data-testid="caption">
				{answered ? m.la_step_predict_answer_caption() : CAPTIONS[id]()}
			</p>
		{/key}
	{/if}
</div>
<div data-testid="formula" class="formula">
	{#each lines as line, i (`${id}-${i}`)}
		<div class="formula-line" data-role={line.role} data-dne={line.dne}>
			<Tex src={line.tex} />
			{#if line.dne}<span class="dne">{m.lim_dne()}</span>{/if}
		</div>
	{/each}
</div>
<div class="readouts" style:opacity={v.handles} data-testid="readouts">
	{#each rows as r (r.side)}
		<p class="readout {r.side}" data-testid="readout-{r.side}" data-y={r.y}>
			<span class="glyph" aria-hidden="true">{r.side === 'left' ? '▶' : '◀'}</span>
			<span>x = {fmt(r.x, digits, locale)}</span>
			<span>f(x) = {fmt(r.y, digits, locale)}</span>
		</p>
	{/each}
</div>
<div class="controls">
	{#if ZOOMABLE[id]}
		<ZoomControl z={v.z} {locale} onchange={(z) => update({ z })} {oninteract} />
	{/if}
</div>

<style>
	.counter {
		margin: 0;
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-label);
		color: var(--text-muted);
	}
	h1 {
		margin: 0;
		font-size: var(--fs-heading);
		font-weight: var(--fw-semibold);
		line-height: var(--lh-heading);
		color: var(--text-strong);
	}
	.caption {
		margin: 0;
		min-height: calc(4 * 1.5em);
		animation: fade var(--dur-ui) var(--ease-out);
	}
	.formula {
		min-height: 196px;
	}
	.formula-line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--sp-sm);
		min-height: 32px;
		padding-block: var(--sp-xs);
		animation: fade 150ms var(--ease-out);
	}
	.dne {
		color: var(--text-strong);
	}
	.readouts {
		display: flex;
		flex-direction: column;
		gap: var(--sp-xs);
		font-variant-numeric: tabular-nums;
	}
	.readout {
		display: grid;
		grid-template-columns: 1.25rem 1fr 1.4fr;
		gap: var(--sp-sm);
		margin: 0;
	}
	.readout.left {
		color: var(--c-left);
	}
	.readout.right {
		color: var(--c-right);
	}
	.controls {
		min-height: var(--target);
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (min-width: 1024px) {
		h1 {
			font-size: var(--fs-display);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.caption,
		.formula-line {
			animation: none;
		}
	}
</style>
