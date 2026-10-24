<script lang="ts">
	import { angleFromPoint } from '#concepts/high-school/unit-circle/derive.ts';

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
		scale = 1
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
	} = $props();

	let dragging = $state(false);
	const px = $derived(cx + R * Math.cos(theta));
	const py = $derived(cy - R * Math.sin(theta));
	const deg = $derived((((theta * 180) / Math.PI) % 360 + 360) % 360);

	function update(e: PointerEvent) {
		const svg = (e.currentTarget as SVGElement).ownerSVGElement;
		if (!svg) return;
		const r = svg.getBoundingClientRect();
		const dx = e.clientX - (r.left + r.width / 2);
		const dyUp = r.top + r.height / 2 - e.clientY;
		onchange(angleFromPoint(dx, dyUp));
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
		const step = ((e.shiftKey ? 15 : 1) * Math.PI) / 180;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onchange(theta - step);
		else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onchange(theta + step);
		else return;
		e.preventDefault();
	}
</script>

<g data-testid="drag-point" data-theta={theta.toFixed(4)}>
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
		aria-valuenow={Math.round(deg)}
		aria-valuetext={valuetext}
		style="cursor:{dragging ? 'grabbing' : 'grab'}; touch-action:none"
		onpointerdown={down}
		onpointermove={move}
		onpointerup={end}
		onpointercancel={end}
		onlostpointercapture={end}
		onkeydown={key}
	/>
</g>
