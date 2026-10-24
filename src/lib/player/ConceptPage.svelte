<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { baseLocale, getLocale, localizeHref, locales } from '#lib/paraglide/runtime.js';
	import type { PlayerAction } from '#lib/engine/player.ts';
	import { Player } from '#lib/engine/clock.svelte.ts';
	import { restage } from '#lib/engine/player.ts';
	import ConceptLayout from '#lib/player/ConceptLayout.svelte';
	import PlayerBar from '#lib/player/PlayerBar.svelte';
	import type { ConceptManifest, ConceptRuntime } from '#concepts/types.ts';

	let {
		manifest,
		runtime,
		step
	}: { manifest: ConceptManifest; runtime: ConceptRuntime; step: string } = $props();

	// svelte-ignore state_referenced_locally
	const stepIds = manifest.stepIds;
	// svelte-ignore state_referenced_locally
	const basePath = manifest.path;
	// svelte-ignore state_referenced_locally
	const rt = runtime;
	const stepPath = (id: string) => `${basePath}${id}/`;

	// svelte-ignore state_referenced_locally
	const i0 = Math.max(0, stepIds.indexOf(step));
	let user = $state(rt.initialUser(i0));
	let historyMode: 'push' | 'replace' | 'none' = 'push';
	function syncUrl(i: number) {
		const id = stepIds[i];
		const url = localizeHref(stepPath(id));
		if (historyMode === 'none' || location.pathname === url) {
			historyMode = 'push';
			return;
		}
		(historyMode === 'replace' ? replaceState : pushState)(url, { conceptStep: id });
		historyMode = 'push';
	}
	const player = new Player(rt.steps, i0, (i, prev) => {
		user = restage(user, rt.policy, rt.stepDefaults(i, prev));
		syncUrl(i);
	});
	function act(a: PlayerAction) {
		historyMode = a.type === 'seek' ? 'replace' : 'push';
		player.dispatch(a);
	}
	$effect(() => {
		const id = page.state.conceptStep ?? step;
		const current = untrack(() => stepIds[player.state.step]);
		if (stepIds.includes(id) && id !== current) {
			untrack(() => {
				historyMode = 'none';
				player.dispatch({ type: 'goto', step: stepIds.indexOf(id) });
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
	const v = $derived(rt.view(player.state.t, user));
	onDestroy(() => player.destroy());

	const locale = getLocale();
	const stepTitle = (i: number) => rt.stepTitle(i);
	const update = (patch: Partial<typeof user>) => Object.assign(user, patch);
	const oninteract = () => {
		player.dispatch({ type: 'pause' });
		if ('moved' in user) (user as { moved: boolean }).moved = true;
	};

	// The bare concept URL is canonical for step 0.
	const canonicalPath = $derived.by(() => {
		const id = stepIds[player.state.step];
		return id === stepIds[0] ? basePath : stepPath(id);
	});
</script>

<svelte:head>
	<title>{m.shell_page_title({ title: manifest.title() })}</title>
	<link rel="canonical" href={localizeHref(canonicalPath)} />
	{#each locales as l (l)}
		<link rel="alternate" hreflang={l} href={localizeHref(canonicalPath, { locale: l })} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={localizeHref(canonicalPath, { locale: baseLocale })} />
</svelte:head>

<div
	data-testid="concept"
	data-step={stepIds[player.state.step]}
	data-t={player.state.t.toFixed(2)}
	data-playing={player.state.playing}
>
	<ConceptLayout variant={rt.layout ?? 'side'}>
		{#snippet stage()}
			<svelte:boundary>
				<rt.Scene
					{v}
					{user}
					step={player.state.step}
					stepId={stepIds[player.state.step]}
					title={stepTitle(player.state.step)}
					{glowing}
					{update}
					{oninteract}
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
			<rt.Panel
				{v}
				{user}
				step={player.state.step}
				stepId={stepIds[player.state.step]}
				{locale}
				{update}
			/>
		{/snippet}
		{#snippet bar()}
			<PlayerBar state={player.state} steps={rt.steps} {stepTitle} dispatch={act} />
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
