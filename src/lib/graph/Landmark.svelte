<script lang="ts">
	import { inside as within, type Viewport } from './viewport.ts';

	/** A landmark of f and where it lands on g, with an arrow from old to new (F-09). */
	let {
		vp,
		id,
		from,
		to,
		opacity = 1,
		arrow = 1,
		color = 'var(--c-point)'
	}: {
		vp: Viewport;
		id: string;
		from: readonly [number, number];
		to: readonly [number, number] | null;
		opacity?: number;
		arrow?: number;
		color?: string;
	} = $props();

	const inside = (q: readonly [number, number] | null) => !!q && within(vp, q[0], q[1]);
	const len = $derived(to ? Math.hypot(vp.gx(to[0]) - vp.gx(from[0]), vp.gy(to[1]) - vp.gy(from[1])) : 0);
	/** Arrow stops short of both dots. */
	const ends = $derived.by(() => {
		if (!to || len < 22) return null;
		const [x0, y0, x1, y1] = [vp.gx(from[0]), vp.gy(from[1]), vp.gx(to[0]), vp.gy(to[1])];
		const ux = (x1 - x0) / len;
		const uy = (y1 - y0) / len;
		return { x0: x0 + ux * 9, y0: y0 + uy * 9, x1: x1 - ux * 11, y1: y1 - uy * 11, ux, uy };
	});
</script>

{#if opacity > 0}
	<g data-testid="landmark-{id}" data-x={to?.[0].toFixed(3)} data-y={to?.[1].toFixed(3)} opacity={opacity} pointer-events="none">
		{#if inside(from)}
			<circle cx={vp.gx(from[0])} cy={vp.gy(from[1])} r="4.5" fill="none" stroke={color} stroke-width="1.5" opacity="0.5" />
		{/if}
		{#if ends && arrow > 0}
			<g opacity={arrow} data-testid="arrow-{id}">
				<line x1={ends.x0} y1={ends.y0} x2={ends.x1} y2={ends.y1} stroke="var(--text-muted)" stroke-width="1.5" />
				<polygon
					points="{ends.x1 + ends.ux * 6},{ends.y1 + ends.uy * 6} {ends.x1 - ends.uy * 4},{ends.y1 + ends.ux * 4} {ends.x1 + ends.uy * 4},{ends.y1 - ends.ux * 4}"
					fill="var(--text-muted)"
				/>
			</g>
		{/if}
		{#if to && inside(to)}
			<circle cx={vp.gx(to[0])} cy={vp.gy(to[1])} r="6" fill={color} stroke="var(--bg)" stroke-width="2" />
		{/if}
	</g>
{/if}
