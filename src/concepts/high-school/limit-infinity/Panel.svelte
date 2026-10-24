<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { fmt } from '#lib/engine/format.ts';
	import Tex from '#lib/tex/Tex.svelte';
	import PredictPrompt from '#lib/player/PredictPrompt.svelte';
	import ChipButton from '#lib/ui/ChipButton.svelte';
	import { SCENARIOS } from '#lib/limits/scenario.ts';
	import { readout } from '#lib/limits/approach.ts';
	import ZoomControl from '#lib/limits/ZoomControl.svelte';
	import type { PanelProps } from '#concepts/types.ts';
	import { formulaLines } from './formulas.ts';
	import { PEN } from './pen.ts';
	import { STEP_IDS, type StepId } from './step-ids.ts';
	import { PREDICT, STEPS, type LIUser } from './steps.ts';
	import type { LIView } from './view.ts';
	import { xDigits, yDigits } from './digits.ts';

	let { v, user, step, locale, update, oninteract, predict }: PanelProps<LIUser, LIView> = $props();

	const id = $derived(STEP_IDS[step]);
	const lines = $derived(formulaLines(id, v, locale));
	const awaiting = $derived(step === PREDICT && predict?.phase === 'awaiting');
	const answered = $derived(step === PREDICT && predict?.phase === 'after');
	const hs = $derived(v.hs === 'pen' ? null : SCENARIOS[v.hs]);
	const rows = $derived(
		hs
			? (['left', 'right'] as const).map((side) => {
					const x = side === 'left' ? v.xl : v.xr;
					return { side, x, y: readout(hs, x, side) };
				})
			: []
	);
	/** The truth for each side of 0 in the predict: 1/x goes down on the left, up on the right. */
	const TRUTH = { gl: -1, gr: 1 } as const;
	const LIFT_NAME = { hole: () => m.li_break_hole(), jump: () => m.li_break_jump(), asym: () => m.li_break_asym() };

	const CAPTIONS: Record<StepId, () => string> = {
		intro: () => m.li_step_intro_caption(),
		predict: () => m.li_step_predict_caption(),
		'both-up': () => m.li_step_both_up_caption(),
		'at-infinity': () => m.li_step_at_infinity_caption(),
		continuity: () => m.li_step_continuity_caption()
	};
</script>

<p class="counter" data-testid="step-counter">
	{m.player_step_counter({ n: step + 1, total: STEPS.length })}
</p>
<h1>{m.li_title()}</h1>
<div aria-live="polite">
	{#if awaiting}
		<PredictPrompt question={m.li_step_predict_predict_caption()} />
	{:else}
		{#key `${step}-${answered}`}
			<p class="caption" data-testid="caption">
				{answered ? m.li_step_predict_answer_caption() : CAPTIONS[id]()}
			</p>
		{/key}
	{/if}
</div>

{#if step === PREDICT && (awaiting || user.gl !== null || user.gr !== null)}
	<div class="guesses" data-testid="side-guess">
		{#each [['gl', m.li_guess_left()], ['gr', m.li_guess_right()]] as const as [k, label] (k)}
			<div class="guess-row {k === 'gl' ? 'left' : 'right'}">
				<span class="label">{label}</span>
				{#each [[1, '↑', m.li_up()], [-1, '↓', m.li_down()]] as const as [dir, glyph, word] (dir)}
					<span class="chip" class:correct={answered && TRUTH[k] === dir}>
						<ChipButton
							label="{glyph} {word}"
							testid="guess-{k}-{dir > 0 ? 'up' : 'down'}"
							pressed={user[k] === dir}
							onclick={() => {
								if (!awaiting) return;
								oninteract?.();
								update({ [k]: dir });
							}}
						/>
					</span>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<div data-testid="formula" class="formula">
	{#each lines as line, i (`${id}-${i}`)}
		<div class="formula-line" data-role={line.role} data-dne={line.dne}>
			<Tex src={line.tex} />
			{#if line.dne}<span class="dne">{m.lim_dne()}</span>{/if}
		</div>
	{/each}
	{#if id === 'continuity'}
		<ul class="lifts" data-testid="lifts">
			{#each PEN.lifts as l (l.kind)}
				<li class:on={v.pen > l.x} data-on={v.pen > l.x}>{LIFT_NAME[l.kind]()}</li>
			{/each}
		</ul>
	{/if}
</div>

{#if rows.length && !awaiting}
	<div class="readouts" style:opacity={v.handles} data-testid="readouts">
		{#each rows as r (r.side)}
			{@const glyph = (r.side === 'left') === (v.pointing === 'in') ? '▶' : '◀'}
			<p class="readout {r.side}" data-testid="readout-{r.side}" data-y={r.y}>
				<span class="glyph" aria-hidden="true">{glyph}</span>
				<span>x = {fmt(r.x, xDigits(v), locale)}</span>
				<span>f(x) = {fmt(r.y, yDigits(v), locale)}</span>
			</p>
		{/each}
	</div>
{/if}
<div class="controls">
	{#if id === 'both-up'}
		<ZoomControl z={v.z} {locale} onchange={(z) => update({ z })} {oninteract} />
	{/if}
</div>

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
	.guesses {
		display: flex;
		flex-direction: column;
		gap: var(--sp-sm);
	}
	.guess-row {
		display: grid;
		grid-template-columns: minmax(6.5rem, auto) auto auto;
		align-items: center;
		gap: var(--sp-sm);
		justify-content: start;
	}
	.guess-row.left .label {
		color: var(--c-left);
	}
	.guess-row.right .label {
		color: var(--c-right);
	}
	.chip {
		border-radius: 999px;
		outline: 2px solid transparent;
		outline-offset: 2px;
		transition: outline-color var(--dur-ui);
	}
	.chip.correct {
		outline-color: var(--accent);
	}
	.formula {
		min-height: 168px;
	}
	.formula-line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--sp-sm);
		min-height: 32px;
		padding-block: var(--sp-xs);
		animation: fade 150ms var(--ease-out);
	}
	.dne {
		color: var(--text-strong);
	}
	.lifts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.lifts li {
		padding: var(--sp-xs) var(--sp-md);
		border-radius: 999px;
		background: var(--surface-raised);
		color: var(--text-muted);
		opacity: 0.35;
		transition: opacity var(--dur-ui);
	}
	.lifts li.on {
		color: var(--text-strong);
		opacity: 1;
	}
	.readouts {
		display: flex;
		flex-direction: column;
		gap: var(--sp-xs);
		font-variant-numeric: tabular-nums;
	}
	.readout {
		display: grid;
		grid-template-columns: 1.25rem 1fr 1.4fr;
		gap: var(--sp-sm);
		margin: 0;
	}
	.readout.left {
		color: var(--c-left);
	}
	.readout.right {
		color: var(--c-right);
	}
	.controls {
		min-height: var(--target);
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
		.caption,
		.formula-line {
			animation: none;
		}
	}
</style>
