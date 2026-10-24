<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import CircleBase from '#lib/stage/CircleBase.svelte';
	import DragPoint from '#lib/stage/DragPoint.svelte';
	import GuessMarker from '#lib/stage/GuessMarker.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { degValue, fmtDeg } from '#lib/engine/format.ts';
	import { angleFromPoint, norm, snapTheta } from '#lib/engine/angle.ts';
	import { polar } from '#lib/stage/geom.ts';
	import LinkReset from '#lib/link/LinkReset.svelte';
	import { link } from '#lib/link/link.svelte.ts';
	import { linkOpacity, type LinkId } from '#lib/link/ids.ts';
	import { linkAttrs } from '#lib/link/linkable.ts';
	import type { SceneProps } from '../../types';
	import { SYM } from './notation.ts';
	import { squares, visible, type Sq } from './squares.ts';
	import { coincides, ghost, type GhostKind } from './ghosts.ts';
	import { GUESS_DEFAULT, SPECIAL_STEP, type IDUser } from './steps.ts';
	import SnapPulse from '#lib/stage/SnapPulse.svelte';
	import { snapSpecial } from '#lib/trig/snap.ts';
	import { exactFor } from '#lib/trig/special.ts';
	import { cancelJump } from './jump.ts';
	import type { IDView } from './view.ts';


	let {
		v,
		title,
		user,
		stepId = 'intro',
		update,
		oninteract,
		predict
	}: SceneProps<IDUser, IDView> = $props();

	const theta = $derived(user.theta);
	const locale = getLocale();
	const val = $derived(fmtDeg(theta, locale));
	const c = $derived(Math.cos(theta));
	const s = $derived(Math.sin(theta));
	const sq = $derived(squares(theta));
	const ga = $derived(user.guess ?? GUESS_DEFAULT);
	const guessShown = $derived(
		stepId === 'supplement' &&
			(predict?.phase === 'awaiting' || (predict?.phase === 'after' && user.guess !== null))
	);

	/** Final step: the student's toggles replace the scripted schedule (D-24). */
	const inSpecial = $derived(v.step === SPECIAL_STEP);
	const mirX = $derived(inSpecial ? (user.ghosts.neg ? 1 : 0) : v.mirrorX);
	const mirY = $derived(inSpecial ? (user.ghosts.supp ? 1 : 0) : v.mirrorY);
	const mirD = $derived(inSpecial ? (user.ghosts.comp ? 1 : 0) : v.mirrorD);
	const sqOp = $derived(inSpecial ? (user.squares ? 1 : 0) : v.squares);
	const ex = $derived(exactFor(theta));
	// Step 7 draws the triangle that proves the current special angle (first quadrant only).
	const q1 = $derived(ex && ex.deg < 90 ? ex.deg : null);
	const interact = () => {
		cancelJump();
		oninteract();
	};
	const S2 = Math.SQRT2 / 2;
	const S3 = Math.sqrt(3) / 2;

	const KINDS: { kind: GhostKind; op: (v: IDView) => number }[] = [
		{ kind: 'neg', op: (w) => w.ghostNeg },
		{ kind: 'supp', op: (w) => w.ghostSupp },
		{ kind: 'comp', op: (w) => w.ghostComp }
	];

	function label(kind: GhostKind): string {
		const rad = user.unit === 'rad';
		return kind === 'neg' ? SYM.negDeg : kind === 'supp' ? (rad ? SYM.suppRad : SYM.suppDeg) : rad ? SYM.compRad : SYM.compDeg;
	}
	const centroid = (q: Sq): [number, number] => [
		q.pts.reduce((a, p) => a + p[0], 0) / 4,
		q.pts.reduce((a, p) => a + p[1], 0) / 4
	];
</script>

<LinkReset />
<Stage label={m.id_stage_aria({ title })}>
	{#snippet children({ cx, cy, R, x, y, glow })}
		{@const ppx = x(c)}
		{@const ppy = y(s)}
		{@const pts = (q: Sq, dx = 0, dy = 0) =>
			q.pts.map(([a, b]) => `${x(a + dx).toFixed(1)},${y(b + dy).toFixed(1)}`).join(' ')}
		{@const cen = centroid(sq.one)}
		<CircleBase {x} {y} {cx} {cy} {R} axes={v.axes} circle={v.circle} {locale} />

		<!-- Mirror axes -->
		<!-- The transparent rects give the axis lines a real box (a zero-height line counts as hidden). -->
		<g data-testid="mirror-x" opacity={mirX} pointer-events="none">
			<line
				x1={x(-1.5)}
				y1={cy}
				x2={x(1.5)}
				y2={cy}
				stroke="var(--axis)"
				stroke-width="1.5"
				stroke-dasharray="6 4"
			/>
			<rect x={x(-1.5)} y={cy - 6} width={x(1.5) - x(-1.5)} height="12" fill="transparent" />
		</g>
		<g data-testid="mirror-y" opacity={mirY} pointer-events="none">
			<line
				x1={cx}
				y1={y(-1.5)}
				x2={cx}
				y2={y(1.5)}
				stroke="var(--axis)"
				stroke-width="1.5"
				stroke-dasharray="6 4"
			/>
			<rect x={cx - 6} y={y(1.5)} width="12" height={y(-1.5) - y(1.5)} fill="transparent" />
		</g>
		<g data-testid="mirror-d" opacity={mirD} pointer-events="none">
			<line
				x1={x(-1.5)}
				y1={y(-1.5)}
				x2={x(1.5)}
				y2={y(1.5)}
				stroke="var(--axis)"
				stroke-width="1.5"
				stroke-dasharray="6 4"
			/>
		</g>

		<!-- Triangle -->
		<g data-testid="tri" opacity={v.triangle}>
			{#if Math.abs(c) >= 1e-3}
				<g
					{...linkAttrs('cos')}
					style:opacity={linkOpacity('cos', link.id)}
					style="transition: opacity var(--dur-link)"
				>
					<line x1={x(0)} y1={y(0)} x2={x(c)} y2={y(0)} stroke="var(--c-cos)" stroke-width="3" stroke-linecap="round" />
				</g>
			{/if}
			{#if Math.abs(s) >= 1e-3}
				<g
					{...linkAttrs('sin')}
					style:opacity={linkOpacity('sin', link.id)}
					style="transition: opacity var(--dur-link)"
				>
					<line x1={x(c)} y1={y(0)} x2={x(c)} y2={y(s)} stroke="var(--c-sin)" stroke-width="3" stroke-linecap="round" />
				</g>
			{/if}
			<line x1={x(0)} y1={y(0)} x2={ppx} y2={ppy} stroke="var(--c-point)" stroke-width="2" stroke-linecap="round" />
		</g>

		<!-- 45 degrees: half a unit square (x^2 + x^2 = 1) -->
		{#if v.sq45 > 0 || (v.eqTri > 0 && q1 === 45)}
			{@const half = 1 - v.halfFade}
			<g data-testid="sq45" opacity={Math.max(v.sq45, q1 === 45 ? v.eqTri : 0)} pointer-events="none">
				<polygon
					points="{x(0)},{y(0)} {x(0)},{y(S2)} {x(S2)},{y(S2)}"
					fill="var(--c-point)"
					fill-opacity={0.12 * half}
					stroke="var(--c-point)"
					stroke-width="1.5"
					stroke-opacity={half}
					stroke-linejoin="round"
				/>
				<polygon
					points="{x(0)},{y(0)} {x(S2)},{y(0)} {x(S2)},{y(S2)}"
					fill="var(--c-point)"
					fill-opacity="0.06"
					stroke="var(--c-point)"
					stroke-width="1.5"
					stroke-linejoin="round"
				/>
				<line
					x1={x(0)}
					y1={y(0)}
					x2={x(S2)}
					y2={y(S2)}
					stroke="var(--c-point)"
					stroke-width="3"
					stroke-linecap="round"
					opacity={v.diag}
				/>
				<text
					x={x(S2 / 2)}
					y={y(0) + 16}
					text-anchor="middle"
					fill="var(--text)"
					font-size="14"
					font-weight="600"
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3">x</text
				>
				<text
					x={x(0) - 12}
					y={y(S2 / 2)}
					text-anchor="middle"
					dominant-baseline="middle"
					fill="var(--text)"
					font-size="14"
					font-weight="600"
					opacity={half}
					paint-order="stroke"
					stroke="var(--bg)"
					stroke-width="3">x</text
				>
			</g>
		{/if}

		<!-- 30 and 60 degrees: half an equilateral triangle of side 1 (mirrored for 30) -->
		{#if v.eqTri > 0 || v.mirror30 > 0}
			{@const at30 = q1 === 30}
			<!-- Reflection across y = x maps the 60 degree drawing onto the 30 degree one. -->
			{@const swapXY = `matrix(0 -1 -1 0 ${cx + cy} ${cx + cy})`}
			{@const fit = q1 === 30 || q1 === 60 ? 1 : 0}
			<g
				data-testid="tri3060"
				data-fit={fit}
				style:opacity={fit}
				style="transition: opacity var(--dur-ui)"
				pointer-events="none"
			>
				<g transform={at30 ? swapXY : undefined}>
					{#if v.eqTri > 0}
						{@const rest = 1 - v.halfFade60}
						<g opacity={v.eqTri} pointer-events="none">
							<polygon
								data-testid="eq-tri"
								points="{x(0)},{y(0)} {x(0.5)},{y(0)} {x(0.5)},{y(S3)}"
								fill="var(--c-point)"
								fill-opacity="0.06"
								stroke="var(--c-point)"
								stroke-width="1.5"
								stroke-linejoin="round"
							/>
							<polygon
								points="{x(0.5)},{y(0)} {x(1)},{y(0)} {x(0.5)},{y(S3)}"
								fill="var(--c-point)"
								fill-opacity={0.12 * rest}
								stroke="var(--c-point)"
								stroke-width="1.5"
								stroke-opacity={rest}
								stroke-linejoin="round"
							/>
							<g data-testid="alt-60" opacity={v.alt}>
								<line
									x1={x(0.5)}
									y1={y(0)}
									x2={x(0.5)}
									y2={y(S3)}
									stroke={at30 ? 'var(--c-cos)' : 'var(--c-sin)'}
									stroke-width="2"
									stroke-dasharray="6 4"
								/>
								<rect x={x(0.5) - 6} y={y(S3)} width="12" height={y(0) - y(S3)} fill="transparent" />
							</g>
						</g>
					{/if}
					{#if v.mirror30 > 0}
						<g data-testid="pt-30" opacity={v.mirror30} pointer-events="none">
							<line
								x1={x(-0.2)}
								y1={y(-0.2)}
								x2={x(1.2)}
								y2={y(1.2)}
								stroke="var(--axis)"
								stroke-width="1.5"
								stroke-dasharray="6 4"
							/>
							<line
								x1={x(S3)}
								y1={y(0)}
								x2={x(S3)}
								y2={y(0.5)}
								stroke={at30 ? 'var(--c-cos)' : 'var(--c-sin)'}
								stroke-width="2"
								style="opacity: calc(var(--ghost-opacity) * 0.6)"
							/>
							<circle cx={x(S3)} cy={y(0.5)} r="10" fill="var(--c-point)" style="fill-opacity: var(--ghost-opacity)" />
							<circle
								cx={x(S3)}
								cy={y(0.5)}
								r="10"
								fill="none"
								stroke="var(--c-point)"
								stroke-width="2"
								stroke-dasharray="4 3"
							/>
						</g>
					{/if}
				</g>
				<!-- Text stays upright: placed outside the reflection. -->
				{#if v.eqTri > 0}
					<text
						x={at30 ? x(0) - 14 : x(0.25)}
						y={at30 ? y(0.25) : y(0) + 16}
						text-anchor="middle"
						dominant-baseline={at30 ? 'middle' : 'auto'}
						fill="var(--text)"
						font-size="14"
						font-weight="600"
						opacity={v.eqTri}
						paint-order="stroke"
						stroke="var(--bg)"
						stroke-width="3">½</text
					>
				{/if}
			</g>
		{/if}

		<!-- Pythagoras squares -->
		{#if sqOp > 0}
			{#each [{ id: 'cos2', q: sq.cos2, color: 'var(--c-cos)', sym: SYM.cos2 }, { id: 'sin2', q: sq.sin2, color: 'var(--c-sin)', sym: SYM.sin2 }, { id: 'one', q: sq.one, color: 'var(--c-point)', sym: SYM.one }] as it (it.id)}
				{#if visible(it.q.side, R)}
					{@const [qx, qy] = centroid(it.q)}
					<g
						{...linkAttrs(it.id as LinkId)}
						style:opacity={linkOpacity(it.id as LinkId, link.id)}
						style="transition: opacity var(--dur-link)"
					>
						<polygon
							data-testid={`sq-${it.id}`}
							data-area={it.q.area.toFixed(4)}
							points={pts(it.q)}
							style={`fill: ${it.color}; fill-opacity: var(--sq-fill)`}
							stroke={it.color}
							stroke-width="2"
							stroke-linejoin="round"
							opacity={sqOp * it.q.fade}
						/>
						<text
							x={x(qx)}
							y={y(qy)}
							text-anchor="middle"
							dominant-baseline="middle"
							fill={it.color}
							font-size="14"
							font-weight="600"
							paint-order="stroke"
							stroke="var(--bg)"
							stroke-width="3"
							opacity={sqOp * it.q.fade}>{it.sym}</text
						>
					</g>
				{/if}
			{/each}
			{#if v.slide > 0}
				{#each [sq.cos2, sq.sin2] as q, i (i)}
					{@const [qx, qy] = centroid(q)}
					{#if visible(q.side, R)}
						<polygon
							points={pts(q, (cen[0] - qx) * v.slide, (cen[1] - qy) * v.slide)}
							style="fill: {i === 0 ? 'var(--c-cos)' : 'var(--c-sin)'}; fill-opacity: var(--sq-fill)"
							stroke={i === 0 ? 'var(--c-cos)' : 'var(--c-sin)'}
							stroke-width="2"
							opacity={0.6 * v.slide * q.fade}
							pointer-events="none"
						/>
					{/if}
				{/each}
			{/if}
		{/if}

		<!-- Ghosts (before the real point) -->
		{#each KINDS as k (k.kind)}
			{@const op = inSpecial ? (user.ghosts[k.kind] ? 1 : 0) : k.op(v)}
			{#if op > 0}
				{@const g = ghost(k.kind, theta)}
				{@const gx = x(g.cos)}
				{@const gy = y(g.sin)}
				{@const co = coincides(k.kind, theta)}
				{@const swapped = k.kind === 'comp' && (inSpecial || v.swap > 0.5)}
				{@const id = `ghost-${k.kind}` as LinkId}
				{@const [lx, ly] = polar(cx, cy, R + 24, g.angle)}
				<g
					data-testid={`ghost-${k.kind}`}
					data-deg={degValue(g.angle)}
					data-coincide={co}
					{...linkAttrs(id)}
					style:opacity={linkOpacity(id, link.id)}
					style="transition: opacity var(--dur-link)"
					opacity={op}
				>
					<line
						x1={x(0)}
						y1={gy}
						x2={gx}
						y2={gy}
						stroke={swapped ? 'var(--c-sin)' : 'var(--c-cos)'}
						stroke-width="2"
						style="opacity: calc(var(--ghost-opacity) * 0.6)"
					/>
					<line
						x1={gx}
						y1={y(0)}
						x2={gx}
						y2={gy}
						stroke={swapped ? 'var(--c-cos)' : 'var(--c-sin)'}
						stroke-width="2"
						style="opacity: calc(var(--ghost-opacity) * 0.6)"
					/>
					<circle cx={gx} cy={gy} r="10" fill="var(--c-point)" style="fill-opacity: var(--ghost-opacity)" />
					<circle
						cx={gx}
						cy={gy}
						r={co ? 13 : 10}
						fill="none"
						stroke="var(--c-point)"
						stroke-width="2"
						stroke-dasharray="4 3"
					/>
					<circle cx={gx} cy={gy} r="20" fill="transparent" />
					<text
						x={lx}
						y={ly}
						text-anchor="middle"
						dominant-baseline="middle"
						fill="var(--c-point)"
						font-size="14"
						font-weight="600"
						paint-order="stroke"
						stroke="var(--bg)"
						stroke-width="3">{label(k.kind)}</text
					>
					<title>{m.id_ghost_title({ label: label(k.kind) })}</title>
				</g>
			{/if}
		{/each}

		<!-- Prediction guess and reveal connector -->
		{#if guessShown}
			{#if predict?.phase === 'after' && user.guess !== null}
				{@const gs = ghost('supp', theta)}
				<line
					data-testid="guess-connector"
					x1={x(Math.cos(ga))}
					y1={y(Math.sin(ga))}
					x2={x(gs.cos)}
					y2={y(gs.sin)}
					stroke="var(--c-guess)"
					stroke-width="2"
					stroke-dasharray="6 4"
				/>
			{/if}
			<GuessMarker
				x={cx + R * Math.cos(ga)}
				y={cy - R * Math.sin(ga)}
				label={m.id_point_aria()}
				valuetext={m.id_guess_valuetext({ value: fmtDeg(ga, locale) })}
				onpoint={(p) => update({ guess: angleFromPoint(p.x - cx, cy - p.y) })}
				onstep={(d, big) => update({ guess: norm(ga + (d * (big ? 15 : 1) * Math.PI) / 180) })}
				onreveal={() => predict?.onreveal()}
				oninteract={interact}
				pulse={predict?.phase === 'awaiting'}
			/>
		{/if}

		<!-- Drag hint -->
		{@const [hx, hy] = polar(cx, cy, R + 28, theta)}
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

		<SnapPulse x={ppx} y={ppy} trigger={ex ? ex.deg : null} />
		<DragPoint
			{cx}
			{cy}
			{R}
			{theta}
			scale={v.point}
			label={m.id_point_aria()}
			valuetext={val}
			onchange={(t) => update({ theta: snapTheta(t) })}
			snap={(t) => snapSpecial(t)}
			oninteract={interact}
			glow={glow.md}
		/>
	{/snippet}
</Stage>
