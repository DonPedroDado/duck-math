<script lang="ts">
	import { fmt } from '#lib/engine/format.ts';
	import { polar } from '#lib/stage/geom.ts';
	import { SYM } from './notation.ts';
	import { radianCopies } from './radian.ts';
	import type { UCView } from './view.ts';

	let { v, cx, cy, R, locale }: { v: UCView; cx: number; cy: number; R: number; locale: string } =
		$props();

	const copies = $derived(radianCopies(v.radian, v.copiesDim));
	const scr = (p: [number, number]): [number, number] => [cx + p[0] * R, cy - p[1] * R];
	const d = (pts: [number, number][]) =>
		pts
			.map((p, i) => {
				const [x, y] = scr(p);
				return `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
			})
			.join('');
	/** 8px tick perpendicular to the path at `at`, direction from `from` to `at`. */
	function tick(from: [number, number], at: [number, number]) {
		const [x0, y0] = scr(from);
		const [x1, y1] = scr(at);
		const dx = x1 - x0;
		const dy = y1 - y0;
		const n = Math.hypot(dx, dy) || 1;
		const nx = (-dy / n) * 4;
		const ny = (dx / n) * 4;
		return `M${(x1 + nx).toFixed(2)},${(y1 + ny).toFixed(2)}L${(x1 - nx).toFixed(2)},${(y1 - ny).toFixed(2)}`;
	}
	const label = {
		'font-size': 14,
		'font-weight': 600,
		fill: 'var(--c-radian)',
		stroke: 'var(--bg)',
		'stroke-width': 3,
		'paint-order': 'stroke'
	};
	const [ox, oy] = $derived(polar(cx, cy, 1.18 * R, 0.5));
	const [px, py] = $derived(polar(cx, cy, 1.18 * R, Math.PI));
</script>

{#each copies as c (c.j)}
	{@const n = c.points.length}
	<path
		data-testid="radian-copy"
		data-landed={c.landed}
		data-end-angle={c.endAngle.toFixed(3)}
		d={d(c.points)}
		fill="none"
		stroke="var(--c-radian)"
		stroke-width="4"
		stroke-linecap="butt"
		stroke-linejoin="round"
		style="opacity: {c.opacity}"
	/>
	<path
		d={tick(c.points[0], c.points[1]) + tick(c.points[n - 2], c.points[n - 1])}
		fill="none"
		stroke="var(--c-radian)"
		stroke-width="2"
		style="opacity: {c.opacity}"
	/>
{/each}
<text
	data-testid="one-rad-label"
	x={ox}
	y={oy}
	text-anchor="middle"
	dominant-baseline="middle"
	{...label}
	opacity={v.oneRadLabel * (1 - 0.6 * v.copiesDim)}>{fmt(1, 0, locale)} {SYM.rad}</text
>
<text
	data-testid="pi-label"
	x={px}
	y={py}
	text-anchor="middle"
	dominant-baseline="middle"
	{...label}
	opacity={v.piLabel}>{SYM.pi}</text
>
