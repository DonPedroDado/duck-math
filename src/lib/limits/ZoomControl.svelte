<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt } from '#lib/engine/format.ts';
	import { Z_MAX } from './approach.ts';

	/**
	 * Zoom around the approach point (L-08): − / slider / + on the log₁₀ zoom level, with the
	 * magnification as a readout. No free pan or pinch: the centre is always a.
	 */
	let {
		z,
		locale,
		onchange,
		oninteract
	}: { z: number; locale: string; onchange: (z: number) => void; oninteract?: () => void } = $props();

	const BUTTON_STEP = 0.5;
	const set = (x: number) => {
		oninteract?.();
		onchange(Math.min(Z_MAX, Math.max(0, Math.round(x * 10) / 10)));
	};
	const mag = $derived(10 ** z);
	const valuetext = $derived(`×${fmt(mag, mag < 10 ? 1 : 0, locale)}`);
</script>

<div class="row" data-testid="zoom" data-z={z.toFixed(2)}>
	<button type="button" aria-label={m.zoom_out()} disabled={z <= 0} onclick={() => set(z - BUTTON_STEP)}>−</button>
	<input
		type="range"
		min="0"
		max={Z_MAX}
		step="0.1"
		value={z}
		aria-label={m.zoom_label()}
		aria-valuetext={valuetext}
		onpointerdown={() => oninteract?.()}
		onkeydown={() => oninteract?.()}
		oninput={(e) => onchange(Number(e.currentTarget.value))}
	/>
	<button type="button" aria-label={m.zoom_in()} disabled={z >= Z_MAX} onclick={() => set(z + BUTTON_STEP)}>+</button>
	<span class="value" aria-hidden="true">{valuetext}</span>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: var(--target) 1fr var(--target) 4.5rem;
		align-items: center;
		gap: var(--sp-sm);
		min-height: var(--target);
	}
	button {
		width: var(--target);
		height: var(--target);
		border: 0;
		border-radius: 999px;
		background: var(--surface-raised);
		color: var(--text-strong);
		font: inherit;
		font-size: 20px;
		font-weight: 600;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	input {
		width: 100%;
		accent-color: var(--text-strong);
		height: var(--target);
		margin: 0;
		cursor: pointer;
	}
	.value {
		color: var(--text-strong);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
</style>
