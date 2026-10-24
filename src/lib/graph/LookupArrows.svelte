<script lang="ts">
	import { lookupSource, type Params } from './transform.ts';
	import type { Viewport } from './viewport.ts';

	/**
	 * F-11: for sample inputs x of the new graph, an arrow from where f is read, (u, f(u)) with
	 * u = b(x − c), to the point it becomes, (x, g(x)). For a pure shift the arrow is horizontal.
	 */
	let {
		vp,
		p,
		f,
		xs,
		opacity = 1
	}: { vp: Viewport; p: Params; f: (u: number) => number; xs: readonly number[]; opacity?: number } = $props();

	const H = $derived(vp.half);
	const items = $derived(
		xs
			.map((x) => {
				const u = lookupSource(p, x);
				const fu = f(u);
				return { x, u, src: [u, fu] as const, dst: [x, p.a * fu + p.d] as const };
			})
			.filter((it) => [it.src, it.dst].every(([a, b]) => Math.abs(a) <= H && Math.abs(b) <= H))
	);
</script>

{#if opacity > 0}
	<g data-testid="lookup" opacity={opacity} pointer-events="none">
		{#each items as it (it.x)}
			{@const x0 = vp.gx(it.src[0])}
			{@const y0 = vp.gy(it.src[1])}
			{@const x1 = vp.gx(it.dst[0])}
			{@const y1 = vp.gy(it.dst[1])}
			{@const L = Math.hypot(x1 - x0, y1 - y0)}
			<g data-testid="lookup-{it.x}" data-u={it.u.toFixed(3)}>
				<line x1={vp.gx(it.x)} y1={vp.gy(0)} x2={x1} y2={y1} stroke="var(--c-pc)" stroke-width="1" stroke-dasharray="3 4" opacity="0.6" />
				<line x1={vp.gx(it.u)} y1={vp.gy(0)} x2={x0} y2={y0} stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 4" opacity="0.6" />
				<circle cx={x0} cy={y0} r="4" fill="var(--text-muted)" />
				{#if L > 20}
					{@const ux = (x1 - x0) / L}
					{@const uy = (y1 - y0) / L}
					<line x1={x0 + ux * 6} y1={y0 + uy * 6} x2={x1 - ux * 12} y2={y1 - uy * 12} stroke="var(--c-pc)" stroke-width="2" />
					<polygon
						points="{x1 - ux * 6},{y1 - uy * 6} {x1 - ux * 13 - uy * 5},{y1 - uy * 13 + ux * 5} {x1 - ux * 13 + uy * 5},{y1 - uy * 13 - ux * 5}"
						fill="var(--c-pc)"
					/>
				{/if}
				<circle cx={x1} cy={y1} r="5" fill="var(--c-pc)" stroke="var(--bg)" stroke-width="2" />
			</g>
		{/each}
	</g>
{/if}
