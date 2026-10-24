<script lang="ts">
	/** 44px chip. `pressed` is only passed for toggles; momentary chips (jumps) leave it undefined so no aria-pressed is set. */
	let {
		label,
		testid,
		pressed,
		onclick
	}: { label: string; testid: string; pressed?: boolean; onclick: () => void } = $props();
</script>

<button
	type="button"
	data-testid={testid}
	aria-pressed={pressed === undefined ? undefined : pressed}
	{onclick}>{label}</button
>

<style>
	button {
		min-height: 44px;
		min-width: 56px;
		padding: 0 var(--sp-md);
		border: 0;
		border-radius: 999px;
		background: var(--surface-raised);
		color: var(--text);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background var(--dur-ui),
			color var(--dur-ui);
	}
	button[aria-pressed='true'] {
		background: var(--bg);
		color: var(--text-strong);
	}
</style>
