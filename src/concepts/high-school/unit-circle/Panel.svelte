<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt, fmtDeg, fmtRad } from '#lib/engine/format.ts';
	import { SYM } from './notation.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { STEPS } from './steps.ts';
	import type { UCView } from './view.ts';

	let {
		step,
		v,
		theta,
		locale
	}: { step: number; v: UCView; theta: number; locale: string } = $props();

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.uc_step_intro_caption(),
		angle: () => m.uc_step_angle_caption(),
		radian: () => m.uc_step_radian_caption(),
		radians: () => m.uc_step_radians_caption({ pi: fmt(Math.PI, 2, locale) }),
		cosine: () => m.uc_step_cosine_caption(),
		sine: () => m.uc_step_sine_caption()
	};

	const shownUnit = $derived(v.unitBlend >= 0.5 ? 'rad' : 'deg');
	const morph = $derived(v.unitBlend > 0 && v.unitBlend < 1 ? Math.abs(1 - 2 * v.unitBlend) : 1);
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.uc_title()}</h1>
{#key step}
	<p class="caption" data-testid="caption" aria-live="polite">{CAPTIONS[STEP_IDS[step]]()}</p>
{/key}
<div class="readout" style="opacity: {v.readout * morph}" aria-hidden={v.readout === 0}>
	<span aria-hidden="true">{SYM.theta} {shownUnit === 'rad' ? SYM.approx : SYM.eq}</span>
	<output data-testid="theta-readout" data-unit={shownUnit}
		>{shownUnit === 'rad' ? fmtRad(theta, locale) : fmtDeg(theta, locale)}</output
	>
	{#if shownUnit === 'rad'}<span aria-hidden="true">{SYM.rad}</span>{/if}
</div>
<div data-testid="formula" class="formula" style="min-height: 96px"></div>
<div data-testid="toggle-slot" style="min-height: 44px"></div>

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
		.caption {
			animation: none;
		}
	}
</style>
