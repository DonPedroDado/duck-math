<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		stage,
		panel,
		bar,
		variant = 'side'
	}: { stage: Snippet; panel: Snippet; bar: Snippet; variant?: 'side' | 'below' } = $props();
</script>

<div class="layout" class:below={variant === 'below'}>
	<div class="content">
		<div class="stage">{@render stage()}</div>
		<aside class="panel">{@render panel()}</aside>
	</div>
	<div class="bar">{@render bar()}</div>
</div>

<style>
	.layout {
		/* break out of the shell's main padding */
		margin: calc(-1 * var(--sp-lg)) calc(-1 * var(--sp-md));
		min-height: calc(100dvh - var(--header-h));
		display: flex;
		flex-direction: column;
	}
	.content {
		flex: 1;
		min-width: 0;
	}
	.stage {
		width: 100%;
		max-width: 560px;
		margin: 0 auto;
	}
	.panel {
		background: var(--surface);
		padding: var(--sp-lg);
		display: flex;
		flex-direction: column;
		gap: var(--sp-lg);
	}
	/* The desktop panel has a fixed height and scrolls; shrinking its blocks
	   would let readout rows and formulas spill over each other instead. */
	.panel > :global(*) {
		flex-shrink: 0;
	}
	.bar {
		position: sticky;
		bottom: 0;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 2;
	}
	.stage :global(.stage) {
		margin: 0 auto;
	}
	@media (max-width: 639px) {
		.layout {
			overflow-x: clip;
		}
		.stage {
			width: 100%;
			max-width: calc(100dvh - var(--header-h) - var(--bar-h-phone) - 96px);
			margin-inline: auto;
			position: sticky;
			top: var(--header-h);
			z-index: 1;
			background: var(--bg);
		}
		.stage :global(.stage) {
			border: 0;
			border-radius: 0;
		}
		.panel {
			padding: var(--sp-md);
		}
	}
	.below .stage {
		max-width: 1120px;
	}
	@media (max-width: 639px) {
		.below .stage {
			max-width: none;
		}
	}
	@media (min-width: 640px) and (max-width: 1023px) {
		.panel {
			margin: var(--sp-md);
			border-radius: var(--radius-card);
		}
		.below .stage {
			max-width: 720px;
			padding: var(--sp-md) var(--sp-md) 0;
			box-sizing: border-box;
		}
	}
	@media (min-width: 1024px) {
		.below .content {
			display: flex;
			flex-direction: column;
			height: auto;
		}
		.below .stage {
			width: min(100%, 1120px, calc((100dvh - var(--header-h) - var(--bar-h) - 160px - 48px) * 12 / 5));
			justify-self: auto;
			align-self: center;
		}
		.below .panel {
			overflow-y: visible;
		}
	}
	@media (min-width: 1024px) {
		.content {
			display: grid;
			grid-template-columns: minmax(0, 62fr) minmax(320px, 38fr);
			gap: var(--sp-lg);
			padding: var(--sp-lg);
			box-sizing: border-box;
			height: calc(100dvh - var(--header-h) - var(--bar-h));
			flex: none;
		}
		.stage {
			max-width: none;
			width: min(100%, calc(100dvh - var(--header-h) - var(--bar-h) - 48px));
			align-self: start;
			justify-self: center;
		}
		.panel {
			border-radius: var(--radius-card);
			overflow-y: auto;
		}
	}
</style>
