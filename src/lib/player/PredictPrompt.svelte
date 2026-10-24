<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';

	let { question }: { question: string } = $props();
</script>

<p class="caption" data-testid="predict-question">{question}</p>
<p class="hint" data-testid="predict-hint">{m.predict_hint()}</p>

<style>
	.hint {
		margin: var(--sp-xs) 0 0;
		font-size: var(--fs-label);
		color: var(--text-muted);
	}
</style>
