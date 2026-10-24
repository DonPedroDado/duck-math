<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Icon from '#lib/icons/Icon.svelte';
	import Scrubber from './Scrubber.svelte';
	import { isStaged, type PlayerAction, type PlayerState } from '#lib/engine/player.ts';
	import { totalDuration, type StepDef } from '#lib/engine/timeline.ts';

	let {
		state,
		steps,
		stepTitle,
		dispatch
	}: {
		state: PlayerState;
		steps: readonly StepDef[];
		stepTitle: (i: number) => string;
		dispatch: (a: PlayerAction) => void;
	} = $props();

	const last = $derived(steps.length - 1);
	const total = $derived(totalDuration(steps));
	const playLabel = $derived(state.playing ? m.player_pause() : m.player_play());
</script>

<div class="bar" role="toolbar" aria-label={m.player_controls()}>
	<div class="inner">
		<button
			type="button"
			class="btn"
			data-testid="player-reset"
			aria-label={m.player_reset()}
			title={m.player_reset()}
			disabled={state.step === 0 && isStaged(steps, state) && !state.playing}
			onclick={() => dispatch({ type: 'reset' })}><Icon name="reset" /></button
		>
		<button
			type="button"
			class="btn"
			data-testid="player-prev"
			aria-label={m.player_prev()}
			title={m.player_prev()}
			disabled={state.step === 0}
			onclick={() => dispatch({ type: 'prev' })}><Icon name="prev" /></button
		>
		<button
			type="button"
			class="btn play"
			data-testid="player-play"
			data-playing={state.playing}
			aria-label={playLabel}
			title={playLabel}
			onclick={() => dispatch({ type: 'toggle' })}
			><Icon name={state.playing ? 'pause' : 'play'} /></button
		>
		<button
			type="button"
			class="btn"
			data-testid="player-next"
			aria-label={m.player_next()}
			title={m.player_next()}
			disabled={state.step === last}
			onclick={() => dispatch({ type: 'next' })}><Icon name="next" /></button
		>
		<Scrubber
			t={state.t}
			{total}
			{steps}
			step={state.step}
			{stepTitle}
			onseek={(t) => dispatch({ type: 'seek', t })}
			ongoto={(i) => dispatch({ type: 'goto', step: i })}
		/>
	</div>
</div>

<style>
	.bar {
		min-height: var(--bar-h-phone);
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
		background: var(--surface);
		border-top: 1px solid var(--border);
		display: flex;
		align-items: center;
	}
	.inner {
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: var(--sp-sm) var(--sp-md);
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-sm);
	}
	.inner > :global(.scrubber) {
		margin-left: var(--sp-md);
	}
	.btn {
		flex: none;
		width: var(--target);
		height: var(--target);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: var(--text);
		cursor: pointer;
		transition:
			background var(--dur-ui) var(--ease-out),
			transform var(--dur-ui) var(--ease-out);
	}
	.btn:hover:not(:disabled) {
		background: var(--surface-raised);
	}
	.btn:active:not(:disabled) {
		transform: scale(0.96);
	}
	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.btn.play,
	.btn.play:hover:not(:disabled) {
		width: 48px;
		height: 48px;
		background: var(--accent);
		color: var(--accent-ink);
	}
	@media (min-width: 1024px) {
		.bar {
			height: var(--bar-h);
		}
	}
</style>
