<script lang="ts">
	let {
		label,
		value,
		options,
		onchange
	}: {
		label: string;
		value: string;
		options: { value: string; label: string; testid: string }[];
		onchange: (v: string) => void;
	} = $props();
</script>

<div role="group" aria-label={label} class="seg">
	{#each options as o (o.value)}
		<button
			type="button"
			data-testid={o.testid}
			aria-pressed={o.value === value}
			onclick={() => onchange(o.value)}>{o.label}</button
		>
	{/each}
</div>

<style>
	.seg {
		display: inline-flex;
		gap: 0;
		padding: 4px;
		border-radius: 999px;
		background: var(--surface-raised);
	}
	button {
		min-height: 44px;
		min-width: 56px;
		padding: 0 var(--sp-md);
		border: 0;
		border-radius: 999px;
		background: transparent;
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
