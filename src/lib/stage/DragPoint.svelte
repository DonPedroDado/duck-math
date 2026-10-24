<script lang="ts">
	import { angleFromPoint, keyStep } from '#lib/engine/angle.ts';
	import { degValue } from '#lib/engine/format.ts';

	let {
		cx,
		cy,
		R,
		theta,
		label,
		valuetext,
		onchange,
		ondragstart,
		ondragend,
		scale = 1,
		glow
	}: {
		cx: number;
		cy: number;
		R: number;
		theta: number;
		label: string;
		valuetext: string;
		onchange: (theta: number) => void;
		ondragstart?: () => void;
		ondragend?: () => void;
		scale?: number;
		glow?: string;
	} = $props();

	let dragging = $state(false);
	let hover = $state(false);
	let focused = $state(false);
	const lit = $derived(hover || focused || dragging);
	const px = $derived(cx + R * Math.cos(theta));
	const py = $derived(cy - R * Math.sin(theta));

	function update(e: PointerEvent) {
		// Map the pointer into this element's user space (the space cx/cy/px/py live in, including any
		// ancestor transforms) and measure from the actual centre, whatever the Stage's origin or scaling is.
		const ctm = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
		if (!ctm) return;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		onchange(angleFromPoint(p.x - cx, cy - p.y));
	}

	function down(e: PointerEvent) {
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		dragging = true;
		ondragstart?.();
		update(e);
	}
	function move(e: PointerEvent) {
		if (dragging) update(e);
	}
	function end() {
		if (dragging) {
			dragging = false;
			ondragend?.();
		}
	}
	function key(e: KeyboardEvent) {
		const stepDeg = e.shiftKey ? 15 : 1;
		let dir: number;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') dir = -1;
		else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') dir = 1;
		else return;
		e.preventDefault();
		ondragstart?.();
		onchange(keyStep(theta, dir * stepDeg));
	}
</script>

<g data-testid="drag-point" data-theta={theta.toFixed(4)} filter={lit ? glow : undefined}>
	<circle
		data-testid="point-halo"
		class="halo"
		class:lit
		class:dragging
		cx={px}
		cy={py}
		r="18"
		fill="var(--c-point)"
		pointer-events="none"
		opacity={scale > 0 ? 1 : 0}
	/>
	<circle cx={px} cy={py} r={10 * scale} fill="var(--c-point)" stroke="var(--bg)" stroke-width="2" pointer-events="none" />
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<circle
		cx={px}
		cy={py}
		r="24"
		fill="transparent"
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuemin="0"
		aria-valuemax="360"
		aria-valuenow={degValue(theta)}
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
		fill-opacity: 0.15;
	}
	.halo.dragging {
		fill-opacity: 0.25;
	}
</style>
