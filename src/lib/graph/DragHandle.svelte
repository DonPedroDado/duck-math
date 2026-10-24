<script lang="ts">
	import { inside, type Viewport } from './viewport.ts';

	/**
	 * A draggable point in plane coordinates (DragPoint's patterns, without the angle).
	 * Pointer drags report the math position under the pointer; keys report a step direction.
	 * Exposed as an ARIA slider over `value` (the param it drives).
	 */
	let {
		vp,
		x,
		y,
		label,
		value,
		min,
		max,
		valuetext,
		color = 'var(--c-point)',
		testid,
		axis = 'xy',
		glyph = 'dot',
		hitDx = 0,
		live = true,
		onpoint,
		onkey,
		oninteract
	}: {
		vp: Viewport;
		x: number;
		y: number;
		label: string;
		value: number;
		min: number;
		max: number;
		valuetext: string;
		color?: string;
		testid?: string;
		axis?: 'x' | 'y' | 'xy';
		/** Dot, or a triangle pointing left/right (limit handles: the direction of approach). */
		glyph?: 'dot' | 'left' | 'right';
		/** Shifts the hit area sideways (px) so two handles can sit close without overlapping. */
		hitDx?: number;
		live?: boolean;
		onpoint: (p: { x: number; y: number }) => void;
		/** dir: −1 or 1 along the slider; big: Shift/PageUp/PageDown. */
		onkey: (dir: -1 | 1, big: boolean) => void;
		oninteract?: () => void;
	} = $props();

	let dragging = $state(false);
	let hover = $state(false);
	let focused = $state(false);
	const lit = $derived(hover || focused || dragging);
	const px = $derived(vp.gx(x));
	const py = $derived(vp.gy(y));

	function update(e: PointerEvent) {
		const ctm = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
		if (!ctm) return;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		onpoint({ x: vp.ux(p.x), y: vp.uy(p.y) });
	}
	function down(e: PointerEvent) {
		if (!live) return;
		e.preventDefault();
		e.stopPropagation();
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		dragging = true;
		oninteract?.();
		update(e);
	}
	const move = (e: PointerEvent) => dragging && update(e);
	const end = () => (dragging = false);
	function key(e: KeyboardEvent) {
		if (!live) return;
		const big = e.shiftKey || e.key === 'PageUp' || e.key === 'PageDown';
		const up = ['ArrowRight', 'ArrowUp', 'PageUp'];
		const down_ = ['ArrowLeft', 'ArrowDown', 'PageDown'];
		if (![...up, ...down_].includes(e.key)) return;
		e.preventDefault();
		oninteract?.();
		onkey(up.includes(e.key) ? 1 : -1, big);
	}
</script>

{#if inside(vp, x, y)}
	<g data-testid={testid} data-x={x.toFixed(3)} data-y={y.toFixed(3)}>
		<circle class="halo" class:lit cx={px} cy={py} r="18" fill={color} pointer-events="none" />
		{#if glyph === 'dot'}
			<circle cx={px} cy={py} r="8" fill={color} stroke="var(--bg)" stroke-width="2" pointer-events="none" />
		{:else}
			{@const s = glyph === 'right' ? 1 : -1}
			<path
				d="M{px + s * 9},{py} L{px - s * 7},{py - 9} L{px - s * 7},{py + 9} Z"
				fill={color}
				stroke="var(--bg)"
				stroke-width="2"
				stroke-linejoin="round"
				pointer-events="none"
			/>
		{/if}
		{#if axis !== 'xy' && glyph === 'dot'}
			<path
				d={axis === 'y'
					? `M${px - 5},${py - 13} L${px},${py - 18} L${px + 5},${py - 13} M${px - 5},${py + 13} L${px},${py + 18} L${px + 5},${py + 13}`
					: `M${px - 13},${py - 5} L${px - 18},${py} L${px - 13},${py + 5} M${px + 13},${py - 5} L${px + 18},${py} L${px + 13},${py + 5}`}
				fill="none"
				stroke={color}
				stroke-width="2"
				stroke-linecap="round"
				opacity={lit ? 1 : 0.6}
				pointer-events="none"
			/>
		{/if}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<circle
			cx={px + hitDx}
			cy={py}
			r="22"
			fill="transparent"
			role="slider"
			tabindex={live ? 0 : -1}
			pointer-events={live ? 'auto' : 'none'}
			aria-label={label}
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={Math.round(value * 100) / 100}
			aria-valuetext={valuetext}
			style="cursor:{dragging ? 'grabbing' : 'grab'}; touch-action:none"
			onpointerdown={down}
			onpointermove={move}
			onpointerup={end}
			onpointercancel={end}
			onlostpointercapture={end}
			onkeydown={key}
			onpointerenter={() => (hover = true)}
			onpointerleave={() => (hover = false)}
			onfocus={(e) => (focused = e.currentTarget.matches(':focus-visible'))}
			onblur={() => (focused = false)}
		/>
	</g>
{/if}

<style>
	.halo {
		transform-box: fill-box;
		transform-origin: center;
		transform: scale(0.555);
		fill-opacity: 0;
		transition:
			transform var(--dur-ui) var(--ease-out),
			fill-opacity var(--dur-ui) var(--ease-out);
	}
	.halo.lit {
		transform: scale(1);
		fill-opacity: 0.18;
	}
</style>
