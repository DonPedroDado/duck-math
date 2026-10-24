<script lang="ts" module>
	import type { PairLayout } from './panelpair.ts';

	export interface PairCtx {
		layout: PairLayout;
		circle: { cx: number; cy: number; R: number; x: (u: number) => number; y: (u: number) => number };
		graph: {
			x0: number;
			x1: number;
			axisY: number;
			gR: number;
			gx: (u: number) => number;
			gy: (v: number) => number;
		};
		glow: { sm: string; md: string };
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { gxOf, gyOf, pairLayout } from './panelpair.ts';

	let {
		label,
		circleLabel,
		graphLabel,
		domain,
		children
	}: {
		label: string;
		circleLabel: string;
		graphLabel: string;
		domain: [number, number];
		children: Snippet<[PairCtx]>;
	} = $props();

	const uid = $props.id();
	let w = $state(0);
	let vh = $state(0);
	const L = $derived(pairLayout(w || 960, vh || 800));
	const ctx = $derived<PairCtx>({
		layout: L,
		circle: {
			cx: L.circle.cx,
			cy: L.circle.cy,
			R: L.circle.R,
			x: (u: number) => L.circle.cx + u * L.circle.R,
			y: (u: number) => L.circle.cy - u * L.circle.R
		},
		graph: {
			x0: L.graph.x0,
			x1: L.graph.x1,
			axisY: L.graph.axisY,
			gR: L.graph.gR,
			gx: gxOf(L, domain),
			gy: gyOf(L)
		},
		glow: { sm: `url(#${uid}-glow-sm)`, md: `url(#${uid}-glow-md)` }
	});
</script>

<svelte:window bind:innerHeight={vh} />

<div class="pair" bind:clientWidth={w}>
	<svg
		data-testid="stage"
		viewBox="0 0 {L.W} {L.H}"
		width="100%"
		role="group"
		aria-label={label}
		style="touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; display:block"
	>
		<title>{label}</title>
		<defs>
			<filter id="{uid}-glow-sm" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
				<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
			<filter id="{uid}-glow-md" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
				<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
		</defs>
		<rect
			data-testid="frame-circle"
			x={L.circle.left}
			y={L.circle.top}
			width={L.circle.size}
			height={L.circle.size}
			fill="transparent"
			pointer-events="none"
		/>
		<rect
			data-testid="frame-graph"
			role="group"
			aria-label={graphLabel}
			x={L.graph.x0}
			y={L.graph.top}
			width={Math.max(0, L.graph.x1 - L.graph.x0)}
			height={Math.max(0, L.graph.bottom - L.graph.top)}
			fill="transparent"
			pointer-events="none"
		/>
		<g role="group" aria-label={circleLabel}>
			{@render children(ctx)}
		</g>
	</svg>
</div>

<style>
	.pair {
		width: 100%;
		box-sizing: border-box;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-card);
		overflow: hidden;
	}
</style>
