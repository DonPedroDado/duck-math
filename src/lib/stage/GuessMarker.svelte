<script lang="ts">
	let {
		x,
		y,
		label,
		valuetext,
		onpoint,
		onstep,
		onreveal,
		oninteract,
		pulse = false
	}: {
		x: number;
		y: number;
		label: string;
		valuetext: string;
		/** Pointer position in this element's user space; the Scene projects it onto its constraint. */
		onpoint: (p: { x: number; y: number }) => void;
		onstep: (dir: -1 | 1, big: boolean) => void;
		onreveal: () => void;
		oninteract?: () => void;
		pulse?: boolean;
	} = $props();

	let dragging = $state(false);
	let hover = $state(false);
	let focused = $state(false);
	const lit = $derived(hover || focused || dragging);

	function update(e: PointerEvent) {
		const ctm = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
		if (!ctm) return;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		onpoint({ x: p.x, y: p.y });
	}
	function down(e: PointerEvent) {
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
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onstep(-1, e.shiftKey);
		else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onstep(1, e.shiftKey);
		else if (e.key === 'Enter' || e.key === ' ') onreveal();
		else return;
		e.preventDefault();
		oninteract?.();
	}
</script>

<g class:pulse>
	<circle class="halo" class:lit class:dragging cx={x} cy={y} r="18" fill="var(--c-guess)" pointer-events="none" />
	<g class="ring">
		<circle cx={x} cy={y} r="10" fill="none" stroke="var(--c-guess)" stroke-width="2" pointer-events="none" />
		<text
			{x}
			{y}
			text-anchor="middle"
			dominant-baseline="central"
			font-size="14"
			font-weight="600"
			fill="var(--c-guess)"
			pointer-events="none">?</text
		>
	</g>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<circle
		data-testid="guess-marker"
		cx={x}
		cy={y}
		r="24"
		fill="transparent"
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuenow={0}
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
	.ring {
		transform-box: fill-box;
		transform-origin: center;
	}
	.pulse .ring {
		animation: guess-pulse 600ms var(--ease-out) 1;
	}
	@keyframes guess-pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
		100% {
			transform: scale(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse .ring {
			animation: none;
		}
	}
</style>
