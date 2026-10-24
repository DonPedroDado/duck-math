<script lang="ts">
	import { sampleRuns, runsPath } from './sample.ts';
	import type { Viewport } from './viewport.ts';

	/**
	 * Grab the whole curve: a wide invisible stroke along g. Reports the pointer's movement
	 * since pointerdown in math units; keyboard users have the sliders (F-08).
	 */
	let {
		vp,
		g,
		defined = () => true,
		live = true,
		cursor = 'grab',
		ondelta,
		ondragstart,
		oninteract
	}: {
		vp: Viewport;
		g: (x: number) => number;
		defined?: (x: number) => boolean;
		live?: boolean;
		cursor?: string;
		ondelta: (d: { dx: number; dy: number }) => void;
		ondragstart?: () => void;
		oninteract?: () => void;
	} = $props();

	let start: { x: number; y: number } | null = $state(null);
	const d = $derived(runsPath(sampleRuns(g, defined, -vp.half, vp.half, vp.half + 1), vp.gx, vp.gy));

	function at(e: PointerEvent) {
		const ctm = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
		if (!ctm) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		return { x: vp.ux(p.x), y: vp.uy(p.y) };
	}
	function down(e: PointerEvent) {
		if (!live) return;
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		start = at(e);
		oninteract?.();
		ondragstart?.();
	}
	function move(e: PointerEvent) {
		if (!start) return;
		const p = at(e);
		if (p) ondelta({ dx: p.x - start.x, dy: p.y - start.y });
	}
	const end = () => (start = null);
</script>

{#if live && d}
	<path
		data-testid="curve-drag"
		{d}
		fill="none"
		stroke="transparent"
		stroke-width="28"
		stroke-linecap="round"
		pointer-events="stroke"
		style="cursor:{start ? 'grabbing' : cursor}; touch-action:none"
		role="presentation"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={end}
		onpointercancel={end}
		onlostpointercapture={end}
	/>
{/if}
