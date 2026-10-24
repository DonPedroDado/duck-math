<script lang="ts">
	/**
	 * Panel slider for one transformation param, in its role color (F-08). A native range input:
	 * keyboard and ARIA come for free. Writes the same param the graph handles write.
	 */
	let {
		role,
		value,
		min,
		max,
		step = 0.1,
		label,
		valuetext,
		disabled = false,
		onchange,
		oninteract
	}: {
		role: 'a' | 'b' | 'c' | 'd';
		value: number;
		min: number;
		max: number;
		step?: number;
		label: string;
		valuetext: string;
		disabled?: boolean;
		onchange: (v: number) => void;
		oninteract?: () => void;
	} = $props();
</script>

<label class="row" style="--c: var(--c-p{role})" data-testid="slider-{role}">
	<span class="name" aria-hidden="true">{role}</span>
	<input
		type="range"
		{min}
		{max}
		{step}
		{value}
		{disabled}
		aria-label={label}
		aria-valuetext={valuetext}
		data-link={role}
		onpointerdown={() => oninteract?.()}
		onkeydown={() => oninteract?.()}
		oninput={(e) => onchange(Number(e.currentTarget.value))}
	/>
	<span class="value" aria-hidden="true">{valuetext}</span>
</label>

<style>
	.row {
		display: grid;
		grid-template-columns: 1.25rem 1fr 3.5rem;
		align-items: center;
		gap: var(--sp-sm);
		min-height: var(--target);
	}
	.name {
		color: var(--c);
		font-style: italic;
		font-weight: var(--fw-semibold);
		font-family: KaTeX_Math, serif;
		font-size: 20px;
	}
	.value {
		color: var(--c);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	input {
		width: 100%;
		accent-color: var(--c);
		height: var(--target);
		margin: 0;
		cursor: pointer;
	}
	input:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
