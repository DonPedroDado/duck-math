<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt, fmtDeg, fmtRad } from '#lib/engine/format.ts';
	import SegmentedToggle from '#lib/ui/SegmentedToggle.svelte';
	import Tex from '#lib/tex/Tex.svelte';
	import { formulaLines } from './formulas.ts';
	import { SYM } from './notation.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { STEPS, type UCUser } from './steps.ts';
	import type { UCView } from './view.ts';

	let {
		step,
		v,
		user,
		locale,
		update
	}: {
		step: number;
		v: UCView;
		user: UCUser;
		locale: string;
		update: (patch: Partial<UCUser>) => void;
		stepId?: string;
	} = $props();

	const theta = $derived(user.theta);
	const unit = $derived(user.unit);

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.uc_step_intro_caption(),
		angle: () => m.uc_step_angle_caption(),
		radian: () => m.uc_step_radian_caption(),
		radians: () => m.uc_step_radians_caption({ pi: fmt(Math.PI, 2, locale) }),
		cosine: () => m.uc_step_cosine_caption(),
		sine: () => m.uc_step_sine_caption()
	};

	const shownUnit = $derived(v.unitBlend >= 0.5 ? 'rad' : 'deg');
	const id = $derived(STEP_IDS[step]);
	const lines = $derived(formulaLines(id, theta, shownUnit, locale));
	const morph = $derived(v.unitBlend > 0 && v.unitBlend < 1 ? Math.abs(1 - 2 * v.unitBlend) : 1);
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.uc_title()}</h1>
<!-- Persistent live region: only its content is re-keyed, so screen readers announce each step caption. -->
<div aria-live="polite">
	{#key step}
		<p class="caption" data-testid="caption">{CAPTIONS[STEP_IDS[step]]()}</p>
	{/key}
</div>
<div class="readout" style="opacity: {v.readout * morph}" aria-hidden={v.readout === 0}>
	<span aria-hidden="true">{SYM.theta} {shownUnit === 'rad' ? SYM.approx : SYM.eq}</span>
	<!-- Plain element, not <output>: <output> is an implicit live region (role=status) and would
	     re-announce every drag/arrow step on top of the slider's aria-valuetext. -->
	<span class="value" data-testid="theta-readout" data-unit={shownUnit}
		>{shownUnit === 'rad' ? fmtRad(theta, locale) : fmtDeg(theta, locale)}</span
	>
	{#if shownUnit === 'rad'}<span aria-hidden="true">{SYM.rad}</span>{/if}
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
	.readout .value {
		animation: fade var(--dur-ui) var(--ease-out);
	}
	.readout {
		font-variant-numeric: tabular-nums;
		color: var(--text-strong);
		min-height: 1.5em;
	}
	.formula-fade {
		animation: fade 150ms var(--ease-out);
	}
	.formula-line {
		min-height: 32px;
		/* KaTeX fractions overhang the line box; keep stacked lines apart. */
		padding-block: var(--sp-sm);
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
