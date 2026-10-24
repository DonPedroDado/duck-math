<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmtDeg, fmtRad } from '#lib/engine/format.ts';
	import SegmentedToggle from '#lib/ui/SegmentedToggle.svelte';
	import ChipButton from '#lib/ui/ChipButton.svelte';
	import { exactFor } from '#lib/trig/special.ts';
	import { startJump } from './jump.ts';
	import PredictPrompt from '#lib/player/PredictPrompt.svelte';
	import Tex from '#lib/tex/Tex.svelte';
	import type { PanelProps } from '../../types';
	import { formulaLines } from './formulas.ts';
	import { SYM } from './notation.ts';
	import { areaTerms } from './squares.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { STEPS, type IDUser } from './steps.ts';
	import type { IDView } from './view.ts';

	let { step, v, user, locale, update, predict }: PanelProps<IDUser, IDView> = $props();

	const theta = $derived(user.theta);
	const unit = $derived(user.unit);
	const id = $derived(STEP_IDS[step]);

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.id_step_intro_caption(),
		pythagoras: () => m.id_step_pythagoras_caption(),
		negative: () => m.id_step_negative_caption(),
		supplement: () => m.id_step_supplement_caption(),
		complement: () => m.id_step_complement_caption(),
		square45: () => m.id_step_square45_caption(),
		triangle3060: () => m.id_step_triangle3060_caption(),
		special: () => m.id_step_special_caption()
	};

	const lines = $derived(formulaLines(id, theta, unit, locale, user.ghosts));
	const ex = $derived(exactFor(theta));
	const rad = (d: number) => (d * Math.PI) / 180;
	const JUMPS = [
		{ d: 30, label: SYM.chip30 },
		{ d: 45, label: SYM.chip45 },
		{ d: 60, label: SYM.chip60 }
	];
	const GHOST_CHIPS = $derived([
		{ k: 'neg' as const, label: SYM.negDeg },
		{ k: 'supp' as const, label: unit === 'rad' ? SYM.suppRad : SYM.suppDeg },
		{ k: 'comp' as const, label: unit === 'rad' ? SYM.compRad : SYM.compDeg }
	]);
	const area = $derived(areaTerms(theta, locale));
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.id_title()}</h1>
<!-- Persistent live region: only its content is re-keyed, so screen readers announce each caption. -->
<div aria-live="polite">
	{#if predict?.phase === 'awaiting' && id === 'supplement'}
		<PredictPrompt question={m.id_step_supplement_predict_caption()} />
	{:else}
		{#key `${step}-${predict?.phase === 'after'}`}
			<p class="caption" data-testid="caption">
				{id === 'supplement' && predict?.phase === 'after'
					? m.id_step_supplement_answer_caption()
					: CAPTIONS[id]()}
			</p>
		{/key}
	{/if}
</div>
<div class="readout" style="opacity: {v.axes}" aria-hidden={v.axes === 0}>
	<span aria-hidden="true">{SYM.theta} {unit === 'rad' ? '≈' : '='}</span>
	<!-- Plain element, not <output>: <output> is an implicit live region and would re-announce every drag step. -->
	<span class="value" data-testid="theta-readout" data-unit={unit}
		>{unit === 'rad' ? fmtRad(theta, locale) : fmtDeg(theta, locale)}</span
	>
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
<div class="exact-slot">
	{#if ex}
		{#key ex.deg}
			<div class="exact" data-testid="exact" data-deg={ex.deg} data-sin={ex.sin} data-cos={ex.cos} data-tan={ex.tan}>
				<Tex src={`${ex.deg}^\\circ = ${ex.rad} \\qquad \\tan = ${ex.tan}`} />
			</div>
		{/key}
	{/if}
</div>
<div class="chips" inert={v.chips === 0} aria-hidden={v.chips === 0} style="opacity: {v.chips}">
	<div role="group" aria-label={m.id_special_group()} class="chip-row">
		{#each JUMPS as j (j.d)}
			<ChipButton
				label={j.label}
				testid={`chip-${j.d}`}
				onclick={() => startJump(user.theta, rad(j.d), (t) => update({ theta: t }))}
			/>
		{/each}
	</div>
</div>
<div class="chips" inert={v.tools === 0} aria-hidden={v.tools === 0} style="opacity: {v.tools}">
	<div role="group" aria-label={m.id_ghost_group()} class="chip-row">
		{#each GHOST_CHIPS as g (g.k)}
			<ChipButton
				label={g.label}
				testid={`ghost-chip-${g.k}`}
				pressed={user.ghosts[g.k]}
				onclick={() => update({ ghosts: { ...user.ghosts, [g.k]: !user.ghosts[g.k] } })}
			/>
		{/each}
		<ChipButton
			label={m.id_squares_chip()}
			testid="chip-squares"
			pressed={user.squares}
			onclick={() => update({ squares: !user.squares })}
		/>
	</div>
</div>
{#if id === 'pythagoras'}
	<p class="area" data-testid="area-row">
		<span data-testid="area-sum">{area.sum}</span>
	</p>
{/if}
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
		min-height: 1.5em;
	}
	.exact-slot {
		min-height: 32px;
	}
	.exact {
		animation: fade 150ms var(--ease-out);
	}
	.chips {
		min-height: 0;
	}
	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.area {
		margin: 0;
		font-variant-numeric: tabular-nums;
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
