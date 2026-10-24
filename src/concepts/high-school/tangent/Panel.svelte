<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmtDeg } from '#lib/engine/format.ts';
	import { fmtRatio, ratio } from '#lib/trig/ratios.ts';
	import Tex from '#lib/tex/Tex.svelte';
	import PredictPrompt from '#lib/player/PredictPrompt.svelte';
	import type { PanelProps } from '#concepts/types.ts';
	import { formulaLines } from './formulas.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { STEPS, type TNUser } from './steps.ts';
	import type { TNView } from './view.ts';

	let { step, user, locale, predict }: PanelProps<TNUser, TNView> = $props();

	const theta = $derived(user.theta);
	const id = $derived(STEP_IDS[step]);
	const lines = $derived(formulaLines(id, theta, locale));
	/** Readout rows appear with the step that introduces each function. */
	const FNS = (['tan', 'sec', 'csc', 'cot'] as const).map((fn) => ({
		fn,
		from: STEP_IDS.indexOf(fn)
	}));

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.tn_step_intro_caption(),
		tan: () => m.tn_step_tan_caption(),
		sec: () => m.tn_step_sec_caption(),
		csc: () => m.tn_step_csc_caption(),
		cot: () => m.tn_step_cot_caption(),
		all: () => m.tn_step_all_caption()
	};
	const awaiting = $derived(id === 'tan' && predict?.phase === 'awaiting');
	const answered = $derived(id === 'tan' && predict?.phase === 'after');
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.tn_title()}</h1>
<div aria-live="polite">
	{#if awaiting}
		<PredictPrompt question={m.tn_step_tan_predict_caption()} />
	{:else}
		{#key `${step}-${answered}`}
			<p class="caption" data-testid="caption">
				{answered ? m.tn_step_tan_answer_caption() : CAPTIONS[id]()}
			</p>
		{/key}
	{/if}
</div>
<div class="readout" aria-label={m.tn_readout_label()}>
	<div>
		<span aria-hidden="true">θ =</span>
		<span class="value" data-testid="theta-readout">{fmtDeg(theta, locale)}</span>
	</div>
	{#each FNS as f (f.fn)}
		{#if step >= f.from}
			<div class="row">
				<span class="swatch" style:background="var(--c-{f.fn})" aria-hidden="true"></span>
				<span aria-hidden="true">{f.fn} θ =</span>
				<span
					class="value"
					data-testid="{f.fn}-readout"
					class:undef={ratio(f.fn, theta).kind === 'undefined'}
					>{fmtRatio(f.fn, theta, locale, m.undefined_readout())}</span
				>
			</div>
		{/if}
	{/each}
</div>
<div data-testid="formula" class="formula" style="min-height: 168px">
	{#key id}
		<div class="formula-fade">
			{#each lines as line, i (`${id}-${i}`)}
				<div class="formula-line">
					<Tex src={line.tex} />
					{#if line.undefinedAfter}
						<span class="undef" data-testid="formula-undefined">{m.undefined_readout()}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/key}
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
	.readout {
		font-variant-numeric: tabular-nums;
		color: var(--text-strong);
		min-height: 3em;
	}
	.row {
		min-height: 32px;
	}
	.swatch {
		display: inline-block;
		width: 4px;
		height: 16px;
		vertical-align: middle;
		margin-right: 6px;
	}
	.undef {
		color: var(--text-muted);
	}
	.formula-fade {
		animation: fade 150ms var(--ease-out);
	}
	.formula-line {
		min-height: 32px;
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
		.formula-fade {
			animation: none;
		}
	}
</style>
