<script lang="ts">
	import { fmt } from '#lib/engine/format.ts';
	import type { Viewport } from './viewport.ts';

	let { vp, axes = 1, locale, ticks = 2 }: { vp: Viewport; axes?: number; locale: string; ticks?: number } = $props();

	const H = $derived(vp.half);
	const lines = $derived(Array.from({ length: 2 * H + 1 }, (_, i) => i - H).filter((u) => u !== 0));
	const labels = $derived(lines.filter((u) => u % ticks === 0 && Math.abs(u) < H));
</script>

<g data-layer="grid" opacity={axes}>
	{#each lines as u (u)}
		<line x1={vp.gx(u)} y1={vp.gy(H)} x2={vp.gx(u)} y2={vp.gy(-H)} stroke="var(--grid)" stroke-width="1" />
		<line x1={vp.gx(-H)} y1={vp.gy(u)} x2={vp.gx(H)} y2={vp.gy(u)} stroke="var(--grid)" stroke-width="1" />
	{/each}
</g>
<g data-layer="axes" opacity={axes}>
	<line x1={vp.gx(-H)} y1={vp.gy(0)} x2={vp.gx(H)} y2={vp.gy(0)} stroke="var(--axis)" stroke-width="1.5" />
	<line x1={vp.gx(0)} y1={vp.gy(-H)} x2={vp.gx(0)} y2={vp.gy(H)} stroke="var(--axis)" stroke-width="1.5" />
	{#each labels as u (u)}
		<line x1={vp.gx(u)} y1={vp.gy(0) - 4} x2={vp.gx(u)} y2={vp.gy(0) + 4} stroke="var(--axis)" stroke-width="1.5" />
		<line x1={vp.gx(0) - 4} y1={vp.gy(u)} x2={vp.gx(0) + 4} y2={vp.gy(u)} stroke="var(--axis)" stroke-width="1.5" />
		<text x={vp.gx(u)} y={vp.gy(0) + 20} text-anchor="middle" fill="var(--text-muted)" font-size="13" font-weight="600"
			>{fmt(u, 0, locale)}</text
		>
		<text
			x={vp.gx(0) - 8}
			y={vp.gy(u)}
			text-anchor="end"
			dominant-baseline="middle"
			fill="var(--text-muted)"
			font-size="13"
			font-weight="600">{fmt(u, 0, locale)}</text
		>
	{/each}
</g>
