<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt } from '#lib/engine/format.ts';
	import Tex from '#lib/tex/Tex.svelte';
	import PredictPrompt from '#lib/player/PredictPrompt.svelte';
	import ParamSlider from '#lib/ui/ParamSlider.svelte';
	import ChipButton from '#lib/ui/ChipButton.svelte';
	import type { BaseId } from '#lib/graph/base.ts';
	import { BASE_CHIP } from './notation.ts';
	import type { PanelProps } from '#concepts/types.ts';
	import { formulaLines } from './formulas.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { ACTIVE, RANGE, STEPS, type CBUser } from './steps.ts';
	import type { CBView } from './view.ts';

	let { v, user, step, locale, update, oninteract, predict }: PanelProps<CBUser, CBView> = $props();

	const id = $derived(STEP_IDS[step]);
	const lines = $derived(
		formulaLines(id, v, locale, user.base, predict?.phase !== 'awaiting' && predict?.phase !== 'before')
	);
	const awaiting = $derived(id === 'order' && predict?.phase === 'awaiting');
	const answered = $derived(id === 'order' && predict?.phase === 'after');
	const sliders = $derived(ACTIVE[id]);
	const BASE_IDS = Object.keys(BASE_CHIP) as BaseId[];
	const LABEL = {
		a: () => m.fn_param_a(),
		b: () => m.fn_param_b(),
		c: () => m.fn_param_c(),
		d: () => m.fn_param_d()
	};

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.cb_step_intro_caption(),
		'build-c': () => m.cb_step_build_c_caption(),
		'build-b': () => m.cb_step_build_b_caption(),
		'build-a': () => m.cb_step_build_a_caption(),
		'build-d': () => m.cb_step_build_d_caption(),
		order: () => m.cb_step_order_caption(),
		explore: () => m.cb_step_explore_caption()
	};
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.cb_title()}</h1>
<div aria-live="polite">
	{#if awaiting}
		<PredictPrompt question={m.cb_step_order_predict_caption()} />
	{:else}
		{#key `${step}-${answered}`}
			<p class="caption" data-testid="caption">
				{answered ? m.cb_step_order_answer_caption() : CAPTIONS[id]()}
			</p>
		{/key}
	{/if}
</div>
<div data-testid="formula" class="formula" style="min-height: 112px">
	{#key id}
		<div class="formula-fade">
			{#each lines as src, i (`${id}-${i}`)}
				<div class="formula-line">
					{#if id === 'order' && i === 1}<span class="vs">{m.cb_versus()}</span>{/if}
					<Tex {src} />
				</div>
			{/each}
		</div>
	{/key}
</div>
{#if id === 'explore'}
	<div role="group" aria-label={m.cb_base_group()} class="chip-row">
		{#each BASE_IDS as b (b)}
			<ChipButton
				label={BASE_CHIP[b]}
				testid="base-{b}"
				pressed={user.base === b}
				onclick={() => {
					oninteract?.();
					update({ base: b });
				}}
			/>
		{/each}
	</div>
{/if}
<div class="sliders" style="min-height: 88px">
	{#each sliders as r (r)}
		<ParamSlider
			role={r}
			value={v[r]}
			min={RANGE[r][0]}
			max={RANGE[r][1]}
			label={LABEL[r]()}
			valuetext={fmt(v[r], 1, locale)}
			onchange={(x) => update({ [r]: x })}
			{oninteract}
		/>
	{/each}
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
	.formula-fade {
		animation: fade 150ms var(--ease-out);
	}
	.formula-line {
		min-height: 32px;
		display: flex;
		align-items: baseline;
		gap: var(--sp-sm);
		/* KaTeX fractions overhang the line box; keep stacked lines apart. */
		padding-block: var(--sp-sm);
	}
	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-sm);
	}
	.sliders {
		display: flex;
		flex-direction: column;
		gap: var(--sp-xs);
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
