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
	import { clipLimit, secEnd, tanEnd } from '#lib/trig/clip.ts';
	import type { PredictCtx } from '#concepts/types.ts';
	import { GUESS_DEFAULT, type TNUser } from './steps.ts';
	import type { TNView } from './view.ts';

	const SYM_TAN = 'tan';

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
					style:opacity={linkOpacity('tan', link.id)}
					style="transition: opacity var(--dur-link)"
					filter={link.id === 'tan' || (glowing && stepId === 'tan') ? glow.sm : undefined}
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
					<text
						data-testid="tan-label"
						x={x(1) + 12}
						y={y((end.y * v.tanSeg) / 2)}
						dominant-baseline="middle"
						fill="var(--c-tan)"
						font-size="14"
						font-weight="600"
						paint-order="stroke"
						stroke="var(--bg)"
						stroke-width="3"
						opacity={v.tanLabel}>{SYM_TAN}</text
					>
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
