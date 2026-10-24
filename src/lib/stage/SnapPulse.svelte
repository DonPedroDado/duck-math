<script lang="ts">
	/** One-shot ring at (x, y); re-fires whenever `trigger` changes to a non-null value. */
	let { x, y, trigger }: { x: number; y: number; trigger: number | null } = $props();
</script>

{#key trigger}
	{#if trigger !== null}
		<circle
			data-testid="snap-pulse"
			class="pulse"
			cx={x}
			cy={y}
			r="18"
			fill="none"
			stroke="var(--c-point)"
			stroke-width="2"
			pointer-events="none"
		/>
	{/if}
{/key}

<style>
	.pulse {
		opacity: 0;
		animation: pulse var(--dur-snap) var(--ease-out) 1;
	}
	@keyframes pulse {
		from {
			r: 18px;
			opacity: 0.8;
		}
		to {
			r: 28px;
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
			opacity: 0;
		}
	}
</style>
