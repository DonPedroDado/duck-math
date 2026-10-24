<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt } from '#lib/engine/format.ts';
	import SegmentedToggle from '#lib/ui/SegmentedToggle.svelte';
	import PredictPrompt from '#lib/player/PredictPrompt.svelte';
	import Tex from '#lib/tex/Tex.svelte';
	import type { PredictCtx } from '../../types';
	import { displayTheta, fmtAngle } from './display.ts';
	import { formulaLines } from './formulas.ts';
	import { SYM } from './notation.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { STEPS, type SGUser } from './steps.ts';
	import type { SGView } from './view.ts';

	let {
		step,
		v,
		user,
		locale,
		update,
		predict
	}: {
		step: number;
		v: SGView;
		user: SGUser;
		locale: string;
		update: (patch: Partial<SGUser>) => void;
		stepId?: string;
		predict?: PredictCtx;
	} = $props();

	const th = $derived(displayTheta(v, user));
	const unit = $derived(user.unit);
	const id = $derived<StepId>(STEP_IDS[step]);
	const phase = $derived(predict?.phase ?? 'none');
	const lines = $derived(formulaLines(id, th, unit, locale));

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.sg_step_intro_caption(),
		unroll: () => m.sg_step_unroll_caption(),
		sine: () => m.sg_step_sine_caption(),
		cosine: () => m.sg_step_cosine_caption(),
		periodic: () => m.sg_step_periodic_caption(),
		explore: () => m.sg_step_explore_caption()
	};
</script>

<div class="info">
	<div class="left">
		<p class="counter" data-testid="step-counter">
			{m.player_step_counter({ n: step + 1, total: STEPS.length })}
		</p>
		<h1>{m.sg_title()}</h1>
		<div aria-live="polite" class="cap">
			{#key `${step}-${phase}`}
				{#if phase === 'awaiting' && id === 'sine'}
					<PredictPrompt question={m.sg_step_sine_predict_caption()} />
				{:else if phase === 'after' && id === 'sine'}
					<p class="caption" data-testid="caption">{m.sg_step_sine_answer_caption()}</p>
				{:else}
					<p class="caption" data-testid="caption">{CAPTIONS[id]()}</p>
				{/if}
			{/key}
		</div>
	</div>
	<div class="right">
		<div class="readout" aria-hidden={v.arcLabel === 0 && id === 'intro'}>
			<span aria-hidden="true">{SYM.theta} {unit === 'rad' ? '≈' : '='}</span>
			<span class="value" data-testid="theta-readout" data-unit={unit}>{fmtAngle(th, unit, locale)}</span>
			{#if step >= 2}
				<span class="sin" aria-hidden="true">{SYM.sin} {SYM.theta} =</span>
				<span class="value" data-testid="sin-readout">{fmt(Math.sin(th), 2, locale)}</span>
			{/if}
			{#if step >= 3}
				<span class="sin" aria-hidden="true">{SYM.cos} {SYM.theta} =</span>
				<span class="value" data-testid="cos-readout">{fmt(Math.cos(th), 2, locale)}</span>
			{/if}
		</div>
		<div data-testid="formula" class="formula" style="min-height: 96px">
			{#key id}
				<div class="formula-fade">
					{#each lines as src, i (`${id}-${i}`)}
						<div class="formula-line"><Tex {src} /></div>
					{/each}
				</div>
			{/key}
		</div>
		<div data-testid="toggle-slot" style="min-height: 44px">
			<div
				class="toggle"
				data-testid="unit-toggle"
				style="opacity: {v.toggle}; transform: translateY({(1 - v.toggle) * 8}px)"
				inert={v.toggle === 0}
				aria-hidden={v.toggle === 0}
			>
				<SegmentedToggle
					label={m.uc_unit_toggle_label()}
					value={unit}
					options={[
						{ value: 'deg', label: m.uc_unit_deg(), testid: 'unit-deg' },
						{ value: 'rad', label: m.uc_unit_rad(), testid: 'unit-rad' }
					]}
					onchange={(u) => {
						if (u === 'deg' || u === 'rad') update({ unit: u });
					}}
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.info {
		display: flex;
		flex-direction: column;
		gap: var(--sp-lg);
	}
	.left,
	.right {
		display: flex;
		flex-direction: column;
		gap: var(--sp-md);
		min-width: 0;
	}
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
	}
	.cap {
		min-height: calc(3 * 1.5em);
		animation: fade var(--dur-ui) var(--ease-out);
	}
	.readout {
		font-variant-numeric: tabular-nums;
		color: var(--text-strong);
		min-height: 1.5em;
	}
	.sin {
		margin-left: var(--sp-md);
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
		.info {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: var(--sp-lg);
		}
		h1 {
			font-size: var(--fs-display);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cap,
		.formula-fade {
			animation: none;
		}
	}
</style>
