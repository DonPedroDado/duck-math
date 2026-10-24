<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { clamp01, stepStart, type StepDef } from '#lib/engine/timeline.ts';

	let {
		t,
		total,
		steps,
		step,
		stepTitle,
		onseek,
		ongoto
	}: {
		t: number;
		total: number;
		steps: readonly StepDef[];
		step: number;
		stepTitle: (i: number) => string;
		onseek: (t: number) => void;
		ongoto: (i: number) => void;
	} = $props();

	let track: HTMLDivElement;
	let capturing = false;
	const pct = $derived(total > 0 ? clamp01(t / total) * 100 : 0);

	function xToT(e: PointerEvent): number {
		const r = track.getBoundingClientRect();
		if (r.width <= 0) return 0;
		return clamp01((e.clientX - r.left) / r.width) * total;
	}
	function down(e: PointerEvent) {
		try {
			track.setPointerCapture(e.pointerId);
		} catch {
			// Synthetic or already-released pointer: seek once, but do not enter capture mode.
			onseek(xToT(e));
			return;
		}
		capturing = true;
		onseek(xToT(e));
	}
	function move(e: PointerEvent) {
		if (!capturing) return;
		// A mouse with no button held means the gesture ended without an up/cancel event reaching us.
		if (e.pointerType === 'mouse' && e.buttons === 0) {
			capturing = false;
			return;
		}
		onseek(xToT(e));
	}
	function up() {
		capturing = false;
	}
	function key(e: KeyboardEvent) {
		const last = steps.length - 1;
		if (e.key === 'ArrowLeft') onseek(clamp01((t - 0.25) / total) * total);
		else if (e.key === 'ArrowRight') onseek(clamp01((t + 0.25) / total) * total);
		else if (e.key === 'PageDown') ongoto(Math.max(0, step - 1));
		else if (e.key === 'PageUp') ongoto(Math.min(last, step + 1));
		else if (e.key === 'Home') onseek(0);
		else if (e.key === 'End') onseek(total);
		else return;
		e.preventDefault();
	}
</script>

<div class="scrubber">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="track"
		bind:this={track}
		role="slider"
		tabindex="0"
		data-testid="scrubber"
		aria-label={m.player_scrubber()}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(pct)}
		aria-valuetext={m.player_scrubber_valuetext({
			n: step + 1,
			total: steps.length,
			title: stepTitle(step)
		})}
		onpointerdown={down}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
		onlostpointercapture={up}
		onkeydown={key}
	>
		<div class="rail"></div>
		<div class="fill" style="width: {pct}%"></div>
		<div class="knob" style="left: {pct}%"></div>
	</div>
	{#each steps as s, i (s.id)}
		<button
			type="button"
			class="tick"
			class:current={i === step}
			style="left: {total > 0 ? (stepStart(steps, i) / total) * 100 : 0}%"
			data-testid="scrubber-tick-{s.id}"
			aria-label={stepTitle(i)}
			title={stepTitle(i)}
			onpointerdown={(e) => e.stopPropagation()}
			onclick={() => ongoto(i)}
		>
			<span class="mark"></span>
			<span class="tip" aria-hidden="true">{stepTitle(i)}</span>
		</button>
	{/each}
</div>

<style>
	.scrubber {
		position: relative;
		flex: 1 1 96px;
		min-width: 96px;
		height: var(--target);
	}
	.track {
		position: absolute;
		inset: 0;
		touch-action: none;
		cursor: pointer;
	}
	.rail,
	.fill {
		position: absolute;
		left: 0;
		top: 50%;
		height: 4px;
		margin-top: -2px;
		border-radius: 2px;
	}
	.rail {
		width: 100%;
		background: var(--border);
	}
	.fill {
		background: var(--accent);
	}
	.knob {
		position: absolute;
		top: 50%;
		width: 16px;
		height: 16px;
		margin: -8px 0 0 -8px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 2px var(--bg);
		pointer-events: none;
	}
	.tick {
		position: absolute;
		top: 0;
		width: 24px;
		height: var(--target);
		margin-left: -12px;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.mark {
		width: 2px;
		height: 12px;
		background: var(--axis);
	}
	.tick.current .mark {
		background: var(--text-strong);
	}
	.tip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		padding: var(--sp-xs) var(--sp-sm);
		border-radius: var(--sp-xs);
		background: var(--surface-raised);
		color: var(--text);
		font-size: var(--fs-label);
		font-weight: var(--fw-semibold);
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--dur-ui) var(--ease-out);
	}
	.tick:hover .tip,
	.tick:focus-visible .tip {
		opacity: 1;
	}
</style>
