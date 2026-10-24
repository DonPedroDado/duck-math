<script lang="ts">
	let {
		x,
		y,
		label,
		valuetext,
		valuenow,
		valuemin,
		valuemax,
		onx,
		onstep,
		onhome,
		onend,
		oninteract,
		scale = 1,
		glow,
		testid = 'graph-point',
		datatheta
	}: {
		x: number;
		y: number;
		label: string;
		valuetext: string;
		valuenow: number;
		valuemin: number;
		valuemax: number;
		/** Pointer x in this element's user space (graph coordinates). */
		onx: (px: number) => void;
		onstep: (dir: -1 | 1, big: boolean) => void;
		onhome?: () => void;
		onend?: () => void;
		/** Any user manipulation (pointer down or key). */
		oninteract?: () => void;
		scale?: number;
		glow?: string;
		testid?: string;
		datatheta?: string;
	} = $props();

	let dragging = $state(false);
	let hover = $state(false);
	let focused = $state(false);
	const lit = $derived(hover || focused || dragging);
	/** Nothing is drawn while scale is 0, so the hit target must not be operable either. */
	const live = $derived(scale > 0);

	function update(e: PointerEvent) {
		const ctm = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
		if (!ctm) return;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		onx(p.x);
	}

	function down(e: PointerEvent) {
		if (!live) return;
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		dragging = true;
		oninteract?.();
		update(e);
	}
	function move(e: PointerEvent) {
		if (dragging) update(e);
	}
	function end() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		if (!live) return;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onstep(-1, e.shiftKey);
		else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onstep(1, e.shiftKey);
		else if (e.key === 'PageDown') onstep(-1, true);
		else if (e.key === 'PageUp') onstep(1, true);
		else if (e.key === 'Home' && onhome) onhome();
		else if (e.key === 'End' && onend) onend();
		else return;
		e.preventDefault();
		oninteract?.();
	}
</script>

<g data-testid={testid} data-x={x.toFixed(1)} data-theta={datatheta} filter={lit ? glow : undefined}>
	<circle
		class="halo"
		class:lit
		class:dragging
		cx={x}
		cy={y}
		r="18"
		fill="var(--c-point)"
		pointer-events="none"
		opacity={live ? 1 : 0}
	/>
	<circle cx={x} cy={y} r={10 * scale} fill="var(--c-point)" stroke="var(--bg)" stroke-width="2" pointer-events="none" />
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<circle
		cx={x}
		cy={y}
		r="24"
		fill="transparent"
		role="slider"
		tabindex={live ? 0 : -1}
		pointer-events={live ? 'auto' : 'none'}
		aria-label={label}
		aria-valuemin={valuemin}
		aria-valuemax={valuemax}
		aria-valuenow={valuenow}
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
