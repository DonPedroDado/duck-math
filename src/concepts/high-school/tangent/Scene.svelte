<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import DragPoint from '#lib/stage/DragPoint.svelte';
	import GuessMarker from '#lib/stage/GuessMarker.svelte';
	import CircleBase from '#lib/stage/CircleBase.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmt, fmtDeg } from '#lib/engine/format.ts';
	import { snapTheta } from '#lib/engine/angle.ts';
	import { polar } from '#lib/stage/geom.ts';
	import LinkReset from '#lib/link/LinkReset.svelte';
	import { link } from '#lib/link/link.svelte.ts';
	import { linkOpacity } from '#lib/link/ids.ts';
	import { linkAttrs } from '#lib/link/linkable.ts';
	import { ratio } from '#lib/trig/ratios.ts';
	import { clipLimit, cotEnd, cscEnd, secEnd, tanEnd } from '#lib/trig/clip.ts';
	import type { PredictCtx } from '#concepts/types.ts';
	import { GUESS_DEFAULT, type TNUser } from './steps.ts';
	import type { TNView } from './view.ts';
	import { separate, type Lbl } from './labels.ts';

	let {
		v,
		title,
		user,
		glowing = false,
		stepId = 'intro',
		update,
		oninteract,
		predict
	}: {
		v: TNView;
		title: string;
		user: TNUser;
		glowing?: boolean;
		stepId?: string;
		update: (patch: Partial<TNUser>) => void;
		oninteract?: () => void;
		predict?: PredictCtx;
		step?: number;
	} = $props();

	const theta = $derived(user.theta);
	const locale = getLocale();
	const r = $derived(ratio('tan', theta));
	const clamp = (g: number, L: number) => Math.max(-L, Math.min(L, g));
	const rSec = $derived(ratio('sec', theta));
	const rCsc = $derived(ratio('csc', theta));
	const rCot = $derived(ratio('cot', theta));

	/** Opacity of a segment group: the formula link wins, otherwise the step dim factor (D-16). */
	const dimStyle = (d: number) => `calc(1 - (1 - var(--dim-opacity)) * ${d})`;
	const opOf = (id: 'tan' | 'sec' | 'csc', d: number) =>
		link.id ? linkOpacity(id, link.id) : dimStyle(d);
	const dimAttr = (d: number) => d.toFixed(0);
	const glowFor = (id: string, glow: { sm: string }) =>
		link.id === id || (glowing && stepId === id) ? glow.sm : undefined;

	/** Triangle tip marker at (tx, ty) pointing along the unit vector (ux, uy). */
	const arrowPts = (tx: number, ty: number, ux: number, uy: number) =>
		`${tx + ux * 10},${ty + uy * 10} ${tx - uy * 6},${ty + ux * 6} ${tx + uy * 6},${ty - ux * 6}`;
	const unit = (dx: number, dy: number): [number, number] => {
		const n = Math.hypot(dx, dy);
		return n < 1e-6 ? [0, 0] : [dx / n, dy / n];
	};

	type Pt = { x: number; y: number };
	interface LabelOut extends Lbl {
		text: string;
		color: string;
		opacity: number;
	}
	const LBL_COLOR = {
		tan: 'var(--c-tan)',
		sec: 'var(--c-sec)',
		csc: 'var(--c-csc)',
		cot: 'var(--c-cot)',
		sin: 'var(--c-sin)',
		cos: 'var(--c-cos)'
	} as const;

	/** All visible segment labels, separated by priority (D-18: every segment has a text label). */
	function buildLabels(
		x: (u: number) => number,
		y: (u: number) => number,
		cx: number,
		cy: number,
		L: number
	): LabelOut[] {
		const out: LabelOut[] = [];
		const dimOp = (d: number) => 1 - (1 - 0.25) * d;
		const add = (id: Lbl['id'], px: number, py: number, ux: number, uy: number, opacity: number) =>
			out.push({ id, x: px, y: py, ux, uy, text: id, color: LBL_COLOR[id], opacity });
		const mid = (end: Pt, k: number): Pt => ({
			x: cx + ((x(end.x) - cx) * k) / 2,
			y: cy + ((y(end.y) - cy) * k) / 2
		});
		const r = ratio('tan', theta);
		const live = r.kind === 'defined' && Math.abs(r.value) >= 1e-3;
		if (r.kind === 'defined' && live && v.tanSeg > 0) {
			const e = tanEnd(r.value, L);
			add('tan', x(1) + 20, y((e.y * v.tanSeg) / 2), 1, 0, v.tanLabel * dimOp(v.dimTan));
		}
		if (rCot.kind === 'defined' && Math.abs(rCot.value) >= 1e-3 && v.cotSeg > 0) {
			const e = cotEnd(rCot.value, L);
			add('cot', x((e.x * v.cotSeg) / 2), y(1) - 12, 0, -1, v.cotLabel);
		}
		if (r.kind === 'defined' && rSec.kind === 'defined' && v.secSeg > 0) {
			const e = secEnd(r.value, L);
			const [ux, uy] = unit(x(e.x) - cx, y(e.y) - cy);
			const p = mid(e, v.secSeg);
			add('sec', p.x + uy * 12, p.y - ux * 12, uy, -ux, v.secLabel * dimOp(v.dimSec));
		}
		if (rCot.kind === 'defined' && rCsc.kind === 'defined' && v.cscSeg > 0) {
			const e = cscEnd(rCot.value, L);
			const [ux, uy] = unit(x(e.x) - cx, y(e.y) - cy);
			const p = mid(e, v.cscSeg);
			add('csc', p.x - uy * 12, p.y + ux * 12, -uy, ux, v.cscLabel * dimOp(v.dimCsc));
		}
		if (stepId === 'all' && live) {
			const c = Math.cos(theta);
			const s = Math.sin(theta);
			add('sin', x(c) + (c >= 0 ? 12 : -12), y(s / 2), c >= 0 ? 1 : -1, 0, 1);
			add('cos', x(c / 2), y(0) + (s >= 0 ? 14 : -14), 0, s >= 0 ? 1 : -1, 1);
		}
		return separate(out, 16);
	}
	const showGuess = $derived(
		stepId === 'tan' &&
			(predict?.phase === 'awaiting' || (predict?.phase === 'after' && user.guess !== null))
	);
</script>

<LinkReset />
<Stage label={m.tn_stage_aria({ title })}>
	{#snippet children({ cx, cy, R, x, y, glow })}
		{@const L = clipLimit(R)}
		{@const c = Math.cos(theta)}
		{@const s = Math.sin(theta)}
		{@const ppx = x(c)}
		{@const ppy = y(s)}
		{@const live = r.kind === 'defined' && Math.abs(r.value) >= 1e-3}
		{@const end = r.kind === 'defined' ? tanEnd(r.value, L) : tanEnd(0, L)}
		{@const ray = r.kind === 'defined' ? secEnd(r.value, L) : secEnd(0, L)}
		{@const gy = user.guess ?? GUESS_DEFAULT}
		{@const [hx, hy] = polar(cx, cy, R + 28, theta)}
		<CircleBase {x} {y} {cx} {cy} {R} axes={v.axes} circle={v.circle} {locale} />

		<g data-layer="x-line" data-testid="x-line">
			<line
				x1={x(1)}
				y1={y(-1.5)}
				x2={x(1)}
				y2={y(-1.5 + 3 * v.xLine)}
				stroke="var(--axis)"
				stroke-width="1.5"
			/>
			<path
				d="M{x(1) - 8},{cy}L{x(1) - 8},{cy - 8}L{x(1)},{cy - 8}"
				fill="none"
				stroke="var(--axis)"
				stroke-width="1.5"
				opacity={v.xTick}
			/>
		</g>

		{#if live}
			<g data-layer="triangles" opacity={v.triangles}>
				<path
					data-testid="tri-small"
					d="M{x(0)},{y(0)}L{x(c)},{y(0)}L{ppx},{ppy}Z"
					fill="none"
					stroke="var(--c-point)"
					stroke-width="1.5"
					opacity="0.6"
				/>
				<path
					data-testid="tri-big"
					d="M{x(0)},{y(0)}L{x(1)},{y(0)}L{x(1)},{y(end.y)}{end.clipped ? '' : 'Z'}"
					fill="none"
					stroke="var(--c-point)"
					stroke-width="1.5"
					opacity="0.6"
				/>
			</g>
			<g data-layer="small-legs" opacity={v.triangles}>
				<g
					{...linkAttrs('cos')}
					style:opacity={linkOpacity('cos', link.id)}
					style="transition: opacity var(--dur-link)"
				>
					<line x1={x(0)} y1={y(0)} x2={x(c)} y2={y(0)} stroke="var(--c-cos)" stroke-width="2" />
				</g>
				<g
					{...linkAttrs('sin')}
					style:opacity={linkOpacity('sin', link.id)}
					style="transition: opacity var(--dur-link)"
				>
					<line x1={x(c)} y1={y(0)} x2={ppx} y2={ppy} stroke="var(--c-sin)" stroke-width="2" />
				</g>
			</g>
			<line
				data-testid="radius-ext"
				x1={ppx}
				y1={ppy}
				x2={ppx + (x(ray.x) - ppx) * v.radiusExt}
				y2={ppy + (y(ray.y) - ppy) * v.radiusExt}
				stroke="var(--c-point)"
				stroke-width="1.5"
				stroke-dasharray="4 4"
				opacity={0.6}
			/>
			{#if v.tanSeg > 0}
				<g
					{...linkAttrs('tan')}
					data-dim={dimAttr(v.dimTan)}
					style:opacity={opOf('tan', v.dimTan)}
					style="transition: opacity var(--dur-link)"
					filter={glowFor('tan', glow)}
				>
					<line
						x1={x(1)}
						y1={y(0)}
						x2={x(1)}
						y2={y(end.y * v.tanSeg)}
						stroke="transparent"
						stroke-width="16"
						pointer-events="stroke"
					/>
					<!-- A 4px rounded rect (not a stroked line): a vertical line has a zero-width bbox. -->
					<rect
						data-testid="tan-seg"
						data-clipped={end.clipped}
						data-dir={end.dir}
						x={x(1) - 2}
						y={Math.min(y(0), y(end.y * v.tanSeg)) - 2}
						width="4"
						height={Math.abs(y(end.y * v.tanSeg) - y(0)) + 4}
						rx="2"
						fill="var(--c-tan)"
					/>
					{#if end.clipped && v.tanSeg === 1}
						<polygon
							data-testid="tan-arrow"
							points="{x(1) - 6},{y(end.y)} {x(1) + 6},{y(end.y)} {x(1)},{y(end.y) - end.dir * 10}"
							fill="var(--c-tan)"
						>
							<title>{m.offstage_title()}</title>
						</polygon>
					{/if}
				</g>
			{/if}
		{/if}

		{#if v.yLine > 0}
			<g data-layer="y-line" data-testid="y-line">
				<line
					x1={x(-1.5)}
					y1={y(1)}
					x2={x(-1.5 + 3 * v.yLine)}
					y2={y(1)}
					stroke="var(--axis)"
					stroke-width="1.5"
				/>
				<path
					d="M{cx + 8},{y(1)}L{cx + 8},{y(1) + 8}L{cx},{y(1) + 8}"
					fill="none"
					stroke="var(--axis)"
					stroke-width="1.5"
					opacity={v.yTick}
				/>
			</g>
		{/if}

		{#if rSec.kind === 'defined' && r.kind === 'defined' && v.secSeg > 0}
			{@const e = secEnd(r.value, L)}
			{@const tx = cx + (x(e.x) - cx) * v.secSeg}
			{@const ty = cy + (y(e.y) - cy) * v.secSeg}
			{@const [ux, uy] = unit(x(e.x) - cx, y(e.y) - cy)}
			<g
				{...linkAttrs('sec')}
				data-dim={dimAttr(v.dimSec)}
				style:opacity={opOf('sec', v.dimSec)}
				style="transition: opacity var(--dur-link)"
				filter={glowFor('sec', glow)}
			>
				<line
					x1={cx}
					y1={cy}
					x2={tx}
					y2={ty}
					stroke="transparent"
					stroke-width="16"
					pointer-events="stroke"
				/>
				<line
					data-testid="sec-seg"
					data-clipped={e.clipped}
					data-dir={e.dir}
					x1={cx}
					y1={cy}
					x2={tx}
					y2={ty}
					stroke="var(--c-sec)"
					stroke-width="4"
					stroke-dasharray="10 5"
				/>
				{#if e.clipped && v.secSeg === 1}
					<polygon data-testid="sec-arrow" points={arrowPts(tx, ty, ux, uy)} fill="var(--c-sec)">
						<title>{m.offstage_title()}</title>
					</polygon>
				{/if}
			</g>
		{/if}

		{#if rCsc.kind === 'defined' && rCot.kind === 'defined' && v.cscSeg > 0}
			{@const e = cscEnd(rCot.value, L)}
			{@const tx = cx + (x(e.x) - cx) * v.cscSeg}
			{@const ty = cy + (y(e.y) - cy) * v.cscSeg}
			{@const [ux, uy] = unit(x(e.x) - cx, y(e.y) - cy)}
			<g
				{...linkAttrs('csc')}
				data-dim={dimAttr(v.dimCsc)}
				style:opacity={opOf('csc', v.dimCsc)}
				style="transition: opacity var(--dur-link)"
				filter={glowFor('csc', glow)}
			>
				<line
					x1={cx}
					y1={cy}
					x2={tx}
					y2={ty}
					stroke="transparent"
					stroke-width="16"
					pointer-events="stroke"
				/>
				<line
					data-testid="csc-seg"
					data-clipped={e.clipped}
					data-dir={e.dir}
					x1={cx}
					y1={cy}
					x2={tx}
					y2={ty}
					stroke="var(--c-csc)"
					stroke-width="4"
					stroke-dasharray="10 5"
				/>
				{#if e.clipped && v.cscSeg === 1}
					<polygon data-testid="csc-arrow" points={arrowPts(tx, ty, ux, uy)} fill="var(--c-csc)">
						<title>{m.offstage_title()}</title>
					</polygon>
				{/if}
			</g>
		{/if}

		{#if rCsc.kind === 'defined' && rCot.kind === 'defined' && v.cscExt > 0}
			{@const e = cscEnd(rCot.value, L)}
			<line
				data-testid="csc-ext"
				x1={ppx}
				y1={ppy}
				x2={ppx + (x(e.x) - ppx) * v.cscExt}
				y2={ppy + (y(e.y) - ppy) * v.cscExt}
				stroke="var(--c-point)"
				stroke-width="1.5"
				stroke-dasharray="4 4"
				opacity={0.6}
			/>
		{/if}

		{#if rCot.kind === 'defined' && Math.abs(rCot.value) >= 1e-3 && v.cotSeg > 0}
			{@const e = cotEnd(rCot.value, L)}
			{@const tx = x(0) + (x(e.x) - x(0)) * v.cotSeg}
			<g
				{...linkAttrs('cot')}
				data-dim="0"
				style:opacity={link.id ? linkOpacity('cot', link.id) : '1'}
				style="transition: opacity var(--dur-link)"
				filter={glowFor('cot', glow)}
			>
				<line
					x1={x(0)}
					y1={y(1)}
					x2={tx}
					y2={y(1)}
					stroke="transparent"
					stroke-width="16"
					pointer-events="stroke"
				/>
				<line
					data-testid="cot-seg"
					data-clipped={e.clipped}
					data-dir={e.dir}
					x1={x(0)}
					y1={y(1)}
					x2={tx}
					y2={y(1)}
					stroke="var(--c-cot)"
					stroke-width="4"
				/>
				{#if e.clipped && v.cotSeg === 1}
					<polygon data-testid="cot-arrow" points={arrowPts(tx, y(1), e.dir, 0)} fill="var(--c-cot)">
						<title>{m.offstage_title()}</title>
					</polygon>
				{/if}
			</g>
		{/if}

		<g data-layer="labels" pointer-events="none">
			{#each buildLabels(x, y, cx, cy, L) as l (l.id)}
				<text
					data-testid="lbl-{l.id}"
					x={l.x}
					y={l.y}
					text-anchor="middle"
					dominant-baseline="middle"
					fill={l.color}
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3"
					opacity={l.opacity}>{l.text}</text
				>
			{/each}
		</g>

		{#if showGuess}
			<GuessMarker
				x={x(1)}
				y={y(gy)}
				label={m.predict_marker_aria()}
				valuetext={m.tn_guess_valuetext({ value: fmt(gy, 2, locale) })}
				pulse={predict?.phase === 'awaiting'}
				onpoint={(p) => update({ guess: clamp((cy - p.y) / R, L) })}
				onstep={(d, big) => update({ guess: clamp(gy + d * (big ? 0.25 : 0.05), L) })}
				onreveal={() => predict?.onreveal()}
				{oninteract}
			/>
		{/if}
		{#if predict?.phase === 'after' && user.guess !== null && live && v.tanSeg === 1}
			<g data-testid="guess-connector" stroke="var(--c-guess)" stroke-width="1.5" pointer-events="none">
				<line x1={x(1) + 40} y1={y(gy)} x2={x(1) + 40} y2={y(end.y)} stroke-dasharray="4 4" />
				<line x1={x(1) + 36} y1={y(gy)} x2={x(1) + 44} y2={y(gy)} />
				<line x1={x(1) + 36} y1={y(end.y)} x2={x(1) + 44} y2={y(end.y)} />
			</g>
		{/if}

		<g
			data-layer="hint"
			data-testid="drag-hint"
			opacity={user.moved ? 0 : v.hint}
			pointer-events="none"
			style="transition: opacity 300ms var(--ease-out)"
		>
			<text
				x={hx}
				y={hy}
				text-anchor="middle"
				dominant-baseline="middle"
				fill="var(--text-muted)"
				font-size="14"
				font-weight="600"
				paint-order="stroke"
				stroke="var(--bg)"
				stroke-width="3">{m.uc_drag_hint()}</text
			>
		</g>

		<g data-layer="point">
			<line
				x1={cx}
				y1={cy}
				x2={ppx}
				y2={ppy}
				stroke="var(--c-point)"
				stroke-width="2"
				stroke-linecap="round"
				opacity={v.point}
			/>
			<DragPoint
				{cx}
				{cy}
				{R}
				{theta}
				scale={v.point}
				label={m.tn_point_aria()}
				valuetext={fmtDeg(theta, locale)}
				onchange={(t) => update({ theta: snapTheta(t) })}
				{oninteract}
				glow={glow.md}
			/>
		</g>
	{/snippet}
</Stage>
