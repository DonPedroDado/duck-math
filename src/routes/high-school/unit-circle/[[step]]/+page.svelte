<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import type { PlayerAction } from '#lib/engine/player.ts';
	import { stepPath } from '#concepts/high-school/unit-circle/urls.ts';
	import { Player } from '#lib/engine/clock.svelte.ts';
	import { restage } from '#lib/engine/player.ts';
	import ConceptLayout from '#lib/player/ConceptLayout.svelte';
	import PlayerBar from '#lib/player/PlayerBar.svelte';
	import Scene from '#concepts/high-school/unit-circle/Scene.svelte';
	import Panel from '#concepts/high-school/unit-circle/Panel.svelte';
	import { STEP_IDS, isStepId, type StepId } from '#concepts/high-school/unit-circle/step-ids.ts';
	import {
		STEPS,
		POLICY,
		stepDefaults,
		initialUser
	} from '#concepts/high-school/unit-circle/steps.ts';
	import { snapTheta } from '#lib/engine/angle.ts';
	import { view } from '#concepts/high-school/unit-circle/view.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const i0 = Math.max(0, STEP_IDS.indexOf(data.step as StepId));
	let user = $state(initialUser(i0));
	let historyMode: 'push' | 'replace' | 'none' = 'push';
	function syncUrl(i: number) {
		const id = STEP_IDS[i];
		const url = localizeHref(stepPath(id));
		if (historyMode === 'none' || location.pathname === url) {
			historyMode = 'push';
			return;
		}
		(historyMode === 'replace' ? replaceState : pushState)(url, { ucStep: id });
		historyMode = 'push';
	}
	const player = new Player(STEPS, i0, (i, prev) => {
		user = restage(user, POLICY, stepDefaults(i, prev));
		syncUrl(i);
	});
	function act(a: PlayerAction) {
		historyMode = a.type === 'seek' ? 'replace' : 'push';
		player.dispatch(a);
	}
	$effect(() => {
		const id = page.state.ucStep ?? data.step;
		const current = untrack(() => STEP_IDS[player.state.step]);
		if (isStepId(id) && id !== current) {
			untrack(() => {
				historyMode = 'none';
				player.dispatch({ type: 'goto', step: STEP_IDS.indexOf(id) });
			});
		}
	});
	let glowing = $state(false);
	$effect(() => {
		if (player.state.playing) {
			glowing = true;
			return;
		}
		const id = setTimeout(() => (glowing = false), 600);
		return () => clearTimeout(id);
	});
	const v = $derived(view(player.state.t, user));
	onDestroy(() => player.destroy());

	const locale = getLocale();
	const TITLES: Record<StepId, () => string> = {
		intro: () => m.uc_step_intro_title(),
		angle: () => m.uc_step_angle_title(),
		radian: () => m.uc_step_radian_title(),
		radians: () => m.uc_step_radians_title(),
		cosine: () => m.uc_step_cosine_title(),
		sine: () => m.uc_step_sine_title()
	};
	const stepTitle = (i: number) => TITLES[STEP_IDS[i]]();
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: m.uc_title() })}</title>
</svelte:head>

<div
	data-testid="concept"
	data-step={STEP_IDS[player.state.step]}
	data-t={player.state.t.toFixed(2)}
	data-playing={player.state.playing}
>
	<ConceptLayout>
		{#snippet stage()}
			<svelte:boundary>
			<Scene
				{v}
				{glowing}
				stepId={STEP_IDS[player.state.step]}
				title={stepTitle(player.state.step)}
				theta={user.theta}
				moved={user.moved}
				onthetachange={(t) => (user.theta = snapTheta(t))}
				ondragstart={() => {
					player.dispatch({ type: 'pause' });
					user.moved = true;
				}}
			/>
			{#snippet failed()}
				<div class="scene-error" role="alert">
					<p>{m.error_scene_body()}</p>
					<button type="button" onclick={() => location.reload()}>{m.error_scene_cta()}</button>
				</div>
			{/snippet}
			</svelte:boundary>
		{/snippet}
		{#snippet panel()}
			<Panel
				step={player.state.step}
				{v}
				theta={user.theta}
				unit={user.unit}
				{locale}
				onunitchange={(u) => (user.unit = u)}
			/>
		{/snippet}
		{#snippet bar()}
			<PlayerBar
				state={player.state}
				steps={STEPS}
				{stepTitle}
				dispatch={act}
			/>
		{/snippet}
	</ConceptLayout>
</div>

<style>
	.scene-error {
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--sp-md);
		padding: var(--sp-lg);
		text-align: center;
		background: var(--bg);
		color: var(--text);
	}
	.scene-error button {
		min-height: var(--target);
		padding: 0 var(--sp-lg);
		border: 0;
		border-radius: var(--radius-card);
		background: var(--accent);
		color: var(--accent-ink);
		font-weight: var(--fw-semibold);
		cursor: pointer;
	}
</style>
