<script lang="ts">
	import { gridLines } from './grid.ts';
	import type { Params } from './transform.ts';
	import type { Viewport } from './viewport.ts';

	/**
	 * The plane transformed like the graph (F-10). `fixed` glows the line that stays put:
	 * 'x' = the line y = d (vertical stretch), 'y' = the line x = c (horizontal stretch).
	 */
	let {
		vp,
		p,
		opacity = 1,
		fixed = null
	}: { vp: Viewport; p: Params; opacity?: number; fixed?: 'x' | 'y' | null } = $props();

	const g = $derived(gridLines(p, vp.half));
	const H = $derived(vp.half);
</script>

{#if opacity > 0}
	<g data-testid="rubber-grid" data-v={g.v.length} data-h={g.h.length} opacity={opacity} pointer-events="none">
		{#each g.v as x, i (i)}
			<line x1={vp.gx(x)} y1={vp.gy(H)} x2={vp.gx(x)} y2={vp.gy(-H)} stroke="var(--axis)" stroke-width="1" opacity="0.35" />
		{/each}
		{#each g.h as y, i (i)}
			<line x1={vp.gx(-H)} y1={vp.gy(y)} x2={vp.gx(H)} y2={vp.gy(y)} stroke="var(--axis)" stroke-width="1" opacity="0.35" />
		{/each}
		{#if fixed === 'x'}
			<line data-testid="fixed-axis" data-axis="x" x1={vp.gx(-H)} y1={vp.gy(p.d)} x2={vp.gx(H)} y2={vp.gy(p.d)} stroke="var(--accent)" stroke-width="2.5" opacity="0.8" />
		{:else if fixed === 'y'}
			<line data-testid="fixed-axis" data-axis="y" x1={vp.gx(p.c)} y1={vp.gy(-H)} x2={vp.gx(p.c)} y2={vp.gy(H)} stroke="var(--accent)" stroke-width="2.5" opacity="0.8" />
		{/if}
	</g>
{/if}
