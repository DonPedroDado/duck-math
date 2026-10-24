<script lang="ts">
	import { fmt } from '#lib/engine/format.ts';
	import { axisAt, decimalsFor, gridLevels, labelStep, tickValues } from './ticks.ts';
	import type { Viewport } from './viewport.ts';

	/**
	 * Grid, axes and labels for any window. Lines sit on powers of ten and the next decade fades
	 * in while zooming, so nothing pops. An axis whose 0 is off-screen is pinned inside the edge
	 * so its labels stay readable.
	 */
	let { vp, axes = 1, locale }: { vp: Viewport; axes?: number; locale: string } = $props();

	const EDGE_PX = 12;

	function layout(lo: number, hi: number, pxPerUnit: number) {
		const range = hi - lo;
		const { major, minor, fade } = gridLevels(range);
		const isMajor = (u: number) => Math.abs(u / major - Math.round(u / major)) < 1e-6;
		const step = labelStep(range, major);
		const edge = EDGE_PX / pxPerUnit;
		return {
			major: tickValues(lo, hi, major).filter((u) => u !== 0),
			minor: fade > 0.03 ? tickValues(lo, hi, minor).filter((u) => u !== 0 && !isMajor(u)) : [],
			fade,
			step,
			labels: tickValues(lo, hi, step).filter((u) => u !== 0 && u > lo + edge && u < hi - edge),
			digits: decimalsFor(step)
		};
	}

	const kx = $derived(Math.abs(vp.gx(1) - vp.gx(0)));
	const ky = $derived(Math.abs(vp.gy(1) - vp.gy(0)));
	const X = $derived(layout(vp.x0, vp.x1, kx));
	const Y = $derived(layout(vp.y0, vp.y1, ky));
	const { ax, ay } = $derived(axisAt(vp));
	const top = $derived(vp.gy(vp.y1));
	const bottom = $derived(vp.gy(vp.y0));
	const left = $derived(vp.gx(vp.x0));
	const right = $derived(vp.gx(vp.x1));
</script>

<g data-layer="grid" opacity={axes} data-xstep={X.step} data-ystep={Y.step}>
	{#each X.minor as u (u)}
		<line x1={vp.gx(u)} y1={top} x2={vp.gx(u)} y2={bottom} stroke="var(--grid)" stroke-width="1" opacity={X.fade} />
	{/each}
	{#each Y.minor as u (u)}
		<line x1={left} y1={vp.gy(u)} x2={right} y2={vp.gy(u)} stroke="var(--grid)" stroke-width="1" opacity={Y.fade} />
	{/each}
	{#each X.major as u (u)}
		<line x1={vp.gx(u)} y1={top} x2={vp.gx(u)} y2={bottom} stroke="var(--grid)" stroke-width="1" />
	{/each}
	{#each Y.major as u (u)}
		<line x1={left} y1={vp.gy(u)} x2={right} y2={vp.gy(u)} stroke="var(--grid)" stroke-width="1" />
	{/each}
</g>
<g data-layer="axes" opacity={axes}>
	<line x1={left} y1={vp.gy(ay)} x2={right} y2={vp.gy(ay)} stroke="var(--axis)" stroke-width="1.5" />
	<line x1={vp.gx(ax)} y1={top} x2={vp.gx(ax)} y2={bottom} stroke="var(--axis)" stroke-width="1.5" />
	{#each X.labels as u (u)}
		<line x1={vp.gx(u)} y1={vp.gy(ay) - 4} x2={vp.gx(u)} y2={vp.gy(ay) + 4} stroke="var(--axis)" stroke-width="1.5" />
		<text x={vp.gx(u)} y={vp.gy(ay) + 20} text-anchor="middle" fill="var(--text-muted)" font-size="13" font-weight="600"
			>{fmt(u, X.digits, locale)}</text
		>
	{/each}
	{#each Y.labels as u (u)}
		<line x1={vp.gx(ax) - 4} y1={vp.gy(u)} x2={vp.gx(ax) + 4} y2={vp.gy(u)} stroke="var(--axis)" stroke-width="1.5" />
		<text
			x={vp.gx(ax) - 8}
			y={vp.gy(u)}
			text-anchor="end"
			dominant-baseline="middle"
			fill="var(--text-muted)"
			font-size="13"
			font-weight="600">{fmt(u, Y.digits, locale)}</text
		>
	{/each}
</g>
