# Phase 2: Trigonometry Complete - Pattern Map

**Mapped:** 2026-10-24
**Files analyzed:** 52 new/modified (grouped below)
**Analogs found:** 48 / 52 (all analogs are Phase 1 code under `src/`)

All paths below are relative to `/home/duck_ruler28/Documents/opt/Duck_Math`. Conventions seen in every analog: tabs for indentation, explicit `.ts` extensions in imports, `#lib/...` and `#concepts/...` aliases, Svelte 5 runes (`$props`, `$derived`, `$state`), no hex literals outside `src/lib/styles/tokens.css` (enforced by `tokens.test.ts`), all user text via `m.<key>()` from `#lib/paraglide/messages.js`.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `src/lib/trig/ratios.ts` (+test) | utility (pure math) | transform | `src/concepts/high-school/unit-circle/projection.ts` + `derive.ts` | role-match |
| `src/lib/trig/clip.ts` (+test) | utility | transform | `src/lib/stage/geom.ts` (`nudge`) + `projection.ts` | role-match |
| `src/lib/trig/special.ts` (+test) | utility (table) | transform | `src/concepts/high-school/unit-circle/radian.ts` (consts + pure fns) | partial |
| `src/lib/trig/snap.ts` (+test) | utility | transform | `src/lib/engine/angle.ts` (`snapTheta`, `keyStep`) | exact |
| `src/lib/engine/format.ts` (modify: `fmtValue`, `fmtRatio`, exact) | utility | transform | itself (`fmt`, `fmtDeg`) | exact |
| `src/lib/engine/player.ts` + `timeline.ts` (modify: `pause`, `revealed`, `reveal`) | service (reducer) | event-driven | itself (`reduce`, `play`, `tick`) | exact |
| `src/lib/engine/player.test.ts` (extend) | test | - | itself | exact |
| `src/lib/link/link.svelte.ts`, `linkable.ts` (+test) | store | pub-sub | `src/lib/engine/clock.svelte.ts` (module `.svelte.ts`) | partial |
| `src/lib/tex/Tex.svelte` (modify: delegated link events) | component | event-driven | itself | exact |
| `src/lib/styles/tokens.css`, `math.css`, `tokens.test.ts` (modify) | config | - | themselves | exact |
| `src/lib/stage/PanelPair.svelte` | component | request-response (render) | `src/lib/stage/Stage.svelte` | role-match |
| `src/lib/stage/GlowDefs.svelte` (extract) | component | - | `Stage.svelte` lines 41-50 | exact |
| `src/lib/stage/GuessMarker.svelte`, `AxisPoint.svelte` (1-D drag) | component | event-driven | `src/lib/stage/DragPoint.svelte` | exact |
| `src/lib/stage/DragPoint.svelte` (modify: `snap` prop / source) | component | event-driven | itself | exact |
| `src/lib/stage/SnapPulse.svelte` | component | event-driven | `DragPoint.svelte` `.halo` CSS transition | partial |
| `src/lib/player/ConceptLayout.svelte` (modify: `variant='below'`) | component (layout) | - | itself | exact |
| `src/lib/player/ConceptPage.svelte` (extract) | component | event-driven | `src/routes/high-school/unit-circle/[[step]]/+page.svelte` | exact |
| `src/lib/player/PanelShell.svelte` | component | - | `unit-circle/Panel.svelte` lines 44-69 | exact |
| `src/lib/player/NextLink.svelte` | component | - | `src/lib/catalog/ConceptCard.svelte` + `registry.ts` | role-match |
| `src/lib/player/PlayerBar.svelte` (modify: Reveal label, pause tick) | component | event-driven | itself | exact |
| `src/lib/ui/ChipButton.svelte` (or `momentary` mode) | component | event-driven | `src/lib/ui/SegmentedToggle.svelte` | exact |
| `src/routes/high-school/[concept]/[[step]]/+page.ts`, `+page.svelte` | route | request-response | `src/routes/high-school/unit-circle/[[step]]/+page.ts` / `+page.svelte` | exact |
| `src/app.d.ts` (modify: generic page-state key) | config | - | itself | exact |
| `vite.config.ts` (modify: prerender `entries` for all concepts) | config | batch | itself | exact |
| `src/concepts/high-school/{tangent,sine-cosine-graphs,trig-identities}/index.ts` | config (manifest) | - | `unit-circle/index.ts` | exact |
| `.../step-ids.ts`, `steps.ts`, `urls.ts` (x3) | model/config | - | `unit-circle/step-ids.ts`, `steps.ts`, `urls.ts` | exact |
| `.../view.ts` (+test) (x3) | utility (pure schedule) | transform | `unit-circle/view.ts`, `view.test.ts` | exact |
| `.../formulas.ts` (+test) (x3) | utility | transform | `unit-circle/formulas.ts` | exact |
| `.../Scene.svelte` (x3) | component | request-response (render + drag) | `unit-circle/Scene.svelte` | exact |
| `.../Panel.svelte` (x3) | component | request-response | `unit-circle/Panel.svelte` | exact |
| `.../Thumbnail.svelte` (x3) | component | - | `unit-circle/Thumbnail.svelte` | exact |
| `tangent/` pure geometry usage (`ratios`, `clip`) | utility | transform | `projection.ts` | role-match |
| `sine-cosine-graphs/unroll.ts`, `trail.ts`, `graph.ts` (+tests) | utility | transform | `unit-circle/radian.ts` (+`radian.test.ts`) | role-match |
| `trig-identities/ghosts.ts`, `squares.ts` (+tests) | utility | transform | `unit-circle/derive.ts`, `projection.ts` | role-match |
| `unit-circle/formulas.ts`, `Scene.svelte`, `index.ts` (modify: link ids, next link) | mixed | - | themselves | exact |
| `messages/en.json`, `messages/de.json` (new key prefixes) | config (i18n) | - | `uc_*` keys | exact |
| `e2e/{sine-cosine,predict,link,tangent,identities}.spec.ts`; extend `deeplink`, `catalog`, `mobile` | test | request-response | `e2e/drag.spec.ts`, `e2e/helpers/touch.ts` | role-match |

## Pattern Assignments

### Concept folder skeleton (x3): `index.ts`, `step-ids.ts`, `steps.ts`, `urls.ts`

**Analog:** `src/concepts/high-school/unit-circle/{index,step-ids,steps,urls}.ts`

**Manifest** (`index.ts` 1-15). Copy exactly; change `id`, `path`, `order` (2, 3, 4), message keys, thumbnail. The registry auto-discovers it via `import.meta.glob('/src/concepts/*/*/index.ts')` (`src/concepts/registry.ts`), no shell edit needed.
```typescript
import { m } from '#lib/paraglide/messages.js';
import type { ConceptManifest } from '../../types';
import { STEP_IDS } from './step-ids';
import Thumbnail from './Thumbnail.svelte';

export default {
	id: 'unit-circle',
	category: 'high-school',
	path: '/high-school/unit-circle/',
	order: 1,
	title: m.uc_title,
	hook: m.uc_hook,
	stepIds: STEP_IDS,
	thumbnail: Thumbnail
} satisfies ConceptManifest;
```

**Step ids** (`step-ids.ts` 1-3): `as const` tuple + `StepId` + `isStepId` guard.
```typescript
export const STEP_IDS = ['intro', 'angle', 'radian', 'radians', 'cosine', 'sine'] as const;
export type StepId = (typeof STEP_IDS)[number];
export const isStepId = (s: string): s is StepId => (STEP_IDS as readonly string[]).includes(s);
```

**Steps / user params / policy** (`steps.ts` 1-33). Copy the shape: `DURS` array mapped into `StepDef[]`, a `User` interface, `POLICY` (`keep`/`restage` per param), `stepDefaults(i, prev)`, `initialUser(i)`. New concepts add `pause` to `StepDef` for predict steps, `guess: 'restage'`, and (graphs) `moved: 'restage'` (deliberate difference from unit-circle's `moved: 'keep'`, Research Open Q2). Tangent `tan` step restages theta to ~80 deg (Research Open Q1).
```typescript
const DURS = [2.0, 2.5, 4.0, 2.0, 2.5, 2.5];
export const STEPS: readonly StepDef[] = STEP_IDS.map((id, k) => ({ id, dur: DURS[k] }));
export interface UCUser { theta: number; unit: 'deg' | 'rad'; moved: boolean; }
export const POLICY = { theta: 'keep', unit: 'restage', moved: 'keep' } as const;
export function stepDefaults(i: number, prev: number): Partial<UCUser> { ... }
export function initialUser(i: number): UCUser { return { theta: DEFAULT_THETA, unit: initialUnit(i), moved: false }; }
```
Each concept gets its own `DEFAULT_THETA` (D-02; tangent 35 deg per UI-SPEC).

**urls.ts** (1-4): `export const UC_BASE = '/high-school/unit-circle/'; export const stepPath = (id: StepId) => \`${UC_BASE}${id}/\`;`. With the generic route this can be derived from `manifest.path` instead; keep per-concept only if the generic route is not adopted.

---

### `src/concepts/high-school/<id>/view.ts` (utility, pure schedule) x3

**Analog:** `src/concepts/high-school/unit-circle/view.ts` (+ `view.test.ts`)

**Pattern** (view.ts 1-59): reads only `t` (+ non-theta user like `unit`); NEVER theta (PD-1 convention, asserted by a type-level test). `layer(k, f)` helper gives 0 before step k, 1 after, `f(p)` during. Windows via `seg()` and `easeMath as E`.
```typescript
import { locate, seg, easeMath as E } from '#lib/engine/timeline.ts';
export function view(t: number, user: Pick<UCUser, 'unit'>): UCView {
	const { i, p } = locate(STEPS, t);
	const layer = (k: number, f: (p: number) => number) => (i > k ? 1 : i < k ? 0 : f(p));
	const hint = i === 0 ? seg(p, 0.8, 1) : i === 1 ? 1 - seg(p, 0, 0.1) : 0;
	return { t, step: i, p, axes: layer(0, (q) => E(seg(q, 0, 0.2))), circle: layer(0, (q) => E(seg(q, 0.2, 0.6))), ... };
}
```
Interface lists every field as `number` so the continuity test can iterate them.

**Test pattern** (`view.test.ts` 1-40): copy the type-level `_noTheta` assertion, the `nums()`/`SKIP` helper, the "continuous across boundaries" test (`b +/- 1e-7`, tolerance 1e-3, boundaries computed from `stepEnd`), and "staged values" table. Use `stepEnd/stepStart` from `#lib/engine/timeline.ts`.

---

### `src/concepts/high-school/<id>/Scene.svelte` (component, render + drag) x3

**Analog:** `src/concepts/high-school/unit-circle/Scene.svelte` (261 lines)

**Imports + props** (1-40):
```svelte
<script lang="ts">
	import Stage from '#lib/stage/Stage.svelte';
	import DragPoint from '#lib/stage/DragPoint.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { fmt, fmtDeg } from '#lib/engine/format.ts';
	import { snapTheta } from '#lib/engine/angle.ts';
	import { arcPath, nudge, polar } from '#lib/stage/geom.ts';
	let { v, title, theta, moved, glowing = false, stepId = 'intro', onthetachange, oninteract }: {...} = $props();
```
**Glow-group idiom** (41-50): `GLOW_GROUP: Record<stepId, group>` + `glowOn(g)`/`gf(g, filter)` so only the active step's group is filtered while `glowing` (keeps max 2 filter groups, UI-SPEC/Research Pitfall 10).

**Stage snippet and layers** (53-66): `<Stage label={m.uc_stage_aria({ title })}>{#snippet children({ cx, cy, R, x, y, glow })}`, positions via `x(u)`/`y(u)`, layers `<g data-layer="grid" opacity={v.axes}>`; nudged labels with `paint-order="stroke" stroke="var(--bg)" stroke-width="3"`.

**Segment + label with data-testid** (sin segment, ~165-200): copy for tan/sec/csc/cot (color tokens `var(--c-tan)` etc.):
```svelte
<line data-testid="sin-seg" data-len={(Math.abs(P.sin) * v.sinSeg).toFixed(3)}
	x1={x(0)} y1={y(0)} x2={x(0)} y2={y(P.sin * v.sinSeg)}
	stroke="var(--c-sin)" stroke-width="4" stroke-linecap="round" />
```
Hide a degenerate segment via `{#if P.showSin}` (projection `showSin: Math.abs(sin) >= 1e-3`); reuse for the pole/zero-length hide rule (tan at theta=0, undefined epsilon).

**DragPoint last, so it wins hit-testing** (~232-258): 
```svelte
<DragPoint {cx} {cy} {R} {theta} scale={v.point} label={m.uc_point_aria()} valuetext={val}
	onchange={(t) => onthetachange(snapTheta(t))} {oninteract} glow={glow.md} />
```
For Identities, pass snap through the new `snap` prop (pointer path only), `onthetachange(snapSpecial(snapTheta(t)))`.

**Hint fades once the user has interacted**: `opacity={moved ? 0 : v.hint}`.

**Hover linking addition (new)**: set `style:opacity={link.id && link.id !== 'cos' ? 'var(--dim-opacity)' : 1}` + `style="transition: opacity var(--dur-link)"` on each `data-layer`/`data-link` group (Research Pattern 7). Linkable lines use stroke-only hit areas, DragPoint remains last.

---

### `src/concepts/high-school/<id>/Panel.svelte` (component) x3, plus shared `PanelShell`

**Analog:** `src/concepts/high-school/unit-circle/Panel.svelte` (146 lines)

**Caption map keyed by StepId with message functions** (21-31):
```typescript
const CAPTIONS: Record<StepId, () => string> = {
	intro: () => m.uc_step_intro_caption(),
	radians: () => m.uc_step_radians_caption({ pi: fmt(Math.PI, 2, locale) }),
	...
};
const id = $derived(STEP_IDS[step]);
const lines = $derived(formulaLines(id, theta, shownUnit, locale));
```
**Template skeleton to lift into `PanelShell`** (44-69): step counter, `<h1>`, persistent `aria-live="polite"` wrapper with `{#key step}` caption, readout with plain `<span>` (NOT `<output>`; comment explains why), formula block with `min-height: 96px`, per-line `<Tex {src} />`:
```svelte
<p class="counter" data-testid="step-counter">{m.player_step_counter({ n: step + 1, total: STEPS.length })}</p>
<h1>{m.uc_title()}</h1>
<div aria-live="polite">{#key step}<p class="caption" data-testid="caption">{CAPTIONS[STEP_IDS[step]]()}</p>{/key}</div>
<div data-testid="formula" class="formula" style="min-height: 96px">
	{#key id}<div class="formula-fade">{#each lines as src, i (`${id}-${i}`)}<div class="formula-line"><Tex {src} /></div>{/each}</div>{/key}
</div>
```
New in Panel: undefined readout uses a message key (`undefined_readout`) rendered outside KaTeX; Next-link row reserves 44px and renders on the last step only; chips via `ChipButton`/`SegmentedToggle`.

---

### `src/concepts/high-school/<id>/formulas.ts` (utility) x3

**Analog:** `src/concepts/high-school/unit-circle/formulas.ts`

**Core pattern** (1-50): a `cls` helper wraps `\htmlClass`; numbers pass through `texNum(fmt(...))`; a `switch(step)` returns `string[]` TeX lines; formulas carry no language; locale-specific separator for the point pair.
```typescript
import { fmt } from '#lib/engine/format.ts';
import { texNum } from '#lib/tex/tex.ts';
const cls = (c: string, body: string) => `\\htmlClass{${c}}{${body}}`;
const N = (x: number) => texNum(fmt(x, 2, locale));
const cosT = cls('t-cos', '\\cos\\theta');
const SEP = locale === 'de' ? '\\,;\\,' : ',\\ ';
```
**MATH-03 change**: make the helper emit both classes: `` `\\htmlClass{t-${role} link-${role}}{${body}}` `` (verified in Research). Apply this to unit-circle `cosT`/`sinT` (D-04) and keep `formulas.test.ts` in sync. Never put message strings or user text into `tex()` (only `\htmlClass` is trusted, `src/lib/tex/tex.ts` 4-11).

---

### `src/lib/trig/ratios.ts`, `clip.ts`, `snap.ts`, `special.ts`, `src/concepts/.../ghosts.ts`, `squares.ts`, `unroll.ts`, `trail.ts`, `graph.ts` (utility, transform)

**Analogs:** `unit-circle/projection.ts` (pure geometry returning a plain record), `unit-circle/radian.ts` (windowed pure geometry using `seg`/`E`), `src/lib/engine/angle.ts` (tolerances, wrap), `src/lib/stage/geom.ts` (px helpers).

**Pure record-returning function** (`projection.ts` 12-23):
```typescript
export function projection(theta: number): Projection {
	const { cos, sin } = derive(theta);
	return { cos, sin, showCos: Math.abs(cos) >= 1e-3, showSin: Math.abs(sin) >= 1e-3,
		cosLabelBelow: sin >= 0, sinLabelLeft: cos >= 0 };
}
```
**Windowed morph with `seg`/`E` and `lerp`** (`radian.ts` 1-40) is the idiom for `unroll.ts` (per-sample `e_k = easeMath(seg(q, k/N*0.6, k/N*0.6+0.4))`; copy only the idiom, not `COPY_LENGTHS`/`R_COPY`):
```typescript
import { seg, easeMath as E } from '#lib/engine/timeline.ts';
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const WINDOWS: [number, number][] = [[0, 0.42], [0.45, 0.62], ...];
```
**Angle helpers to reuse, never reimplement** (`angle.ts`): `TAU`, `norm`, `snapTheta`, `keyStep`, `angleFromPoint`, `DISPLAY_EPS_DEG`. `snapSpecial(raw, tolDeg = 3)` is stateless and builds on `norm`; do not run graph theta >= 2pi through `snapTheta`/`degValue` (they wrap).

**Stage px helpers** (`geom.ts` 6-31): `polar(cx, cy, r, a)`, `arcPath(...)`, `nudge(lx, ly, px, py, min)`; reuse for the comet-tail arc on the circle and off-stage arrow placement.

**Tests:** co-located `*.test.ts`, vitest node env (`include: src/**/*.test.ts`). Sweep tests (ghost identities to 1e-12, exact table vs `Math.*` within 1e-12, squares sum to displayed 1,00, tail at theta 0/pi/2/near 2pi, pole tests at 0.5/89.5/90/90.5/269.5/270 for all four functions). Use `const rad = (d) => (d*Math.PI)/180` as in `format.test.ts`.

---

### `src/lib/engine/format.ts` (modify)

**Analog:** itself (1-39).
- Add new helpers beside `fmt`; reuse the cached-formatter pattern for a `useGrouping: false, maximumFractionDigits: 0` formatter (|v| >= 1000):
```typescript
const cache = new Map<string, Intl.NumberFormat>();
function formatter(locale: string, digits: number): Intl.NumberFormat { const key = `${locale}|${digits}`; ... }
export function fmt(x: number, digits: number, locale: string): string {
	let r = Number(x.toFixed(digits));
	if (r === 0) r = 0;                         // never negative zero
	return formatter(locale, digits).format(r).replace('-', '−');  // U+2212
}
```
- `fmtRatio(fn, theta, locale, undefinedText)` takes the message text as an argument (no hard-coded strings; call site passes `m.undefined_readout()`).
- Extend `format.test.ts` using its existing `fmt('de'/'en')` assertions style.

---

### `src/lib/engine/player.ts` + `timeline.ts` (modify, PLAY-07)

**Analog:** itself.

**State/action/reducer shape** (player.ts 5-72): immutable `{...s, ...}` returns, `Number.isFinite` guards, `stepStart/stepEnd/locate` imports. Add `StepDef.pause?: number` (timeline.ts 3-6), `PlayerState.revealed` (make optional or default through `initialState`, since `player.test.ts` builds literals via `st(p: Partial<PlayerState>)` at line 8), and `{ type: 'reveal' }`.
```typescript
case 'tick': {
	if (!s.playing || !Number.isFinite(a.dt)) return s;
	const end = stepEnd(steps, s.step);
	const t = Math.min(s.t + Math.min(Math.max(a.dt, 0), MAX_DT) * s.rate, end);
	return { ...s, t, playing: t < end };           // cap at pause point while !revealed
}
```
`play`/`toggle`/`next` while awaiting delegate to `reveal`; `seek` sets `revealed` from `t > pauseT`; `goto`/`prev`/`initialState` land at `stepEnd` so `revealed: true`. `clock.svelte.ts` `Player.dispatch` already starts/stops its rAF loop from `next.playing`, so `reveal` setting `playing: true` suffices.

---

### `src/lib/stage/GuessMarker.svelte`, `AxisPoint.svelte` (1-D constrained drag) and `DragPoint.svelte` (modify)

**Analog:** `src/lib/stage/DragPoint.svelte` (150 lines)

**Pointer-capture drag core to copy** (44-70):
```typescript
function update(e: PointerEvent) {
	const ctm = (e.currentTarget as SVGGraphicsElement).getScreenCTM();
	if (!ctm) return;
	const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
	onchange(angleFromPoint(p.x - cx, cy - p.y));   // replace with fromPoint([p.x, p.y]) -> value
}
function down(e: PointerEvent) {
	if (!live) return;
	e.preventDefault();
	(e.currentTarget as Element).setPointerCapture(e.pointerId);
	dragging = true; oninteract?.(); ondragstart?.(); update(e);
}
function end() { if (dragging) { dragging = false; ondragend?.(); } }
```
**Slider a11y + handlers** (106-130): transparent r=24 hit circle with `role="slider"`, `aria-valuemin/max/now/text`, `touch-action:none`, `onpointerdown/move/up/cancel`, `onlostpointercapture={end}`, `onkeydown`, hover/focus flags (`:focus-visible` check). GuessMarker: arrows step along track, Enter triggers reveal. Visual `halo` CSS (133-149) uses `var(--dur-ui) var(--ease-out)`.

**Snap change** (Research Pattern 11): add `snap?: (t:number)=>number` applied only inside `update()` (pointer path), not `key()` (lines 74-88), to avoid the keyboard trap at snapped angles. Add a `DragPoint` key test. `getScreenCTM()` already works inside translated `<g>` frames (verify with a test for `PanelPair`).

---

### `src/lib/stage/PanelPair.svelte` and `GlowDefs.svelte` (component)

**Analog:** `src/lib/stage/Stage.svelte` (73 lines)

**Snippet-with-ctx contract + sizing + unique filter ids** (4-61):
```svelte
export interface StageCtx { S: number; cx: number; cy: number; R: number; x: (u:number)=>number; y: (u:number)=>number; glow: { sm: string; md: string }; }
let { size = $bindable(600), label, children }: { size?: number; label: string; children: Snippet<[StageCtx]> } = $props();
const uid = $props.id();
let w = $state(0);
const S = $derived(w || size);
<div class="stage" bind:clientWidth={w}>
	<svg data-testid="stage" viewBox="0 0 {S} {S}" role="group" aria-label={label}
		style="touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none; display:block">
		<title>{label}</title>
		<defs><filter id="{uid}-glow-sm" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
			<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter> ... </defs>
		{@render children({ S, cx: c, cy: c, R, x: (u) => c + u*R, y: (u) => c - u*R, glow: {...} })}
```
Extract `<defs>` into `GlowDefs.svelte` (do not rewrite `Stage` behavior for unit-circle). `PanelPair` is a single `<svg>` with two frames; expose per-frame `StageCtx`-shaped objects plus `gx(theta)`; switch row/column using `bind:clientWidth` + JS breakpoint (640px). Keep `data-testid="stage"`, the touch-action style, and `.stage` border/radius CSS (63-72) so existing mobile/drag e2e helpers keep working.

---

### `src/lib/player/ConceptLayout.svelte` (modify: `variant: 'side' | 'below'`)

**Analog:** itself (96 lines). Props are three snippets (`stage`, `panel`, `bar`); breakpoints at 640 and 1024; desktop is a 62fr/38fr grid with `height: calc(100dvh - var(--header-h) - var(--bar-h))`; phone makes `.stage` sticky with `max-width: calc(100dvh - var(--header-h) - var(--bar-h-phone) - 96px)`.
```svelte
let { stage, panel, bar }: { stage: Snippet; panel: Snippet; bar: Snippet } = $props();
```
Add `variant = 'side'` prop and a `class:below` branch; leave `side` CSS untouched. For `below`, desktop stacks (stage then panel) and phone sticky max-height uses UI-SPEC `76dvh - 64px`. Keep `.stage :global(.stage)` overrides.

---

### `src/lib/player/ConceptPage.svelte` + generic route `src/routes/high-school/[concept]/[[step]]/`

**Analog:** `src/routes/high-school/unit-circle/[[step]]/+page.ts` (8 lines) and `+page.svelte` (172 lines)

**Route load with 404** (`+page.ts`):
```typescript
export const load = ({ params }: { params: { step?: string } }) => {
	const step = params.step ?? STEP_IDS[0];
	if (!isStepId(step)) error(404, 'Unknown step');
	return { step };
};
```
Generic version: look up `concepts.find(c => c.path === \`/high-school/${params.concept}/\`)` from `#concepts/registry.ts` (404 if missing), validate step against `manifest.stepIds`.

**Page logic to extract verbatim into `ConceptPage`** (+page.svelte 25-87): `Player(STEPS, i0, (i, prev) => { user = restage(user, POLICY, stepDefaults(i, prev)); syncUrl(i); })`; `historyMode` push/replace/none with `pushState(url, { ucStep: id })` (rename key; update `src/app.d.ts` `PageState.ucStep`); `$effect` reading `page.state.<key> ?? data.step` with `untrack` to dispatch `goto`; `glowing` effect with 600ms timeout; `view(player.state.t, user)`; `onDestroy(() => player.destroy())`; canonical + `hreflang` `<svelte:head>` block (89-96, `localizeHref`, `locales`, `baseLocale`); step 0 canonical is the bare concept URL. Also the `<svelte:boundary>` with `failed` snippet and `.scene-error` CSS (106-126, 149-171) and `data-testid="concept"` with `data-step`, `data-t`, `data-playing` wrapper (98-103), which e2e specs rely on. Parameterize with a per-concept runtime object `{ STEPS, POLICY, stepDefaults, initialUser, view, Scene, Panel, titles }`.

**Scene `oninteract` convention** (114-119): `player.dispatch({ type: 'pause' }); user.moved = true;`.

**Prerender entries** (`vite.config.ts` 8-10): currently imports unit-circle `STEP_IDS` and builds
```typescript
const entries = ['*', ...locales.flatMap((l) => [`/${l}/`, `/${l}${ucBase}`, ...STEP_IDS.map((s) => `/${l}${ucBase}${s}/`)])] as ('*' | `/${string}`)[];
```
Generalise by importing each concept's `step-ids.ts` explicitly (or scanning with `node:fs`; `import.meta.glob` is unavailable in the config). Include the bare concept URL per locale.

---

### Hover linking: `src/lib/link/link.svelte.ts`, `linkable.ts`, `Tex.svelte` (modify)

**Analog:** `src/lib/tex/Tex.svelte` (37 lines) and `src/lib/engine/clock.svelte.ts` (module-level runes pattern, `.svelte.ts` suffix).

**Tex wrapper to extend** (Tex.svelte 6-37): `html = $derived.by(...)` with SSR/dev rethrow and prod fallback `<code class="tex tex-error" data-testid="tex-error">`; sole `{@html}`. Attach delegated `pointerover/pointermove/pointerleave/focusin/focusout/click` on the persistent `<span class="tex">`, resolving `(e.target as Element).closest('[class*="link-"]')`, ignoring unknown ids (closed `LinkId` union). Since the DOM is replaced each theta change, also resolve on `pointermove` and clear on wrapper `pointerleave` (Research Pitfall 3). Do not write the store during SSR.

**Color classes** (`math.css` 1-19): add `.t-tan/.t-sec/.t-csc/.t-cot` (+ `.t-cos2/.t-sin2` or reuse) with `color: var(--c-...)` in the same one-class-per-rule format.

**Tokens** (`tokens.css` 12-18): add `--c-tan: #F57FBC; --c-sec: #A8D957; --c-csc: #8F9EFF; --c-cot: #E9A23B;` (Research-corrected for 7:1 contrast vs `--bg`) and `--ghost-opacity`, `--dim-opacity`, `--c-guess`, `--trail-tail`, `--trail-dim`, `--dur-link`, `--dur-snap`, `--sq-fill`. Extend `tokens.test.ts` `names` array (lines 8-14) and add a WCAG contrast test reading `tokens.css` with the same `fs.readFileSync` + regex approach. Hex literals are only legal in `tokens.css`.

---

### `src/lib/ui/ChipButton.svelte` (or `momentary` prop on SegmentedToggle)

**Analog:** `src/lib/ui/SegmentedToggle.svelte`
```svelte
let { label, value, options, onchange }: { label: string; value: string; options: { value: string; label: string; testid: string }[]; onchange: (v: string) => void } = $props();
<div role="group" aria-label={label} class="seg">
	{#each options as o (o.value)}
		<button type="button" data-testid={o.testid} aria-pressed={o.value === value} onclick={() => onchange(o.value)}>{o.label}</button>
	{/each}
</div>
```
Special-angle jump chips must not keep a persistent `aria-pressed`; ghost toggle chips do (independent booleans). Keep `type="button"`, `data-testid`, 44px target (`--target`).

---

### `src/lib/player/NextLink.svelte` (component)

**Analog:** `src/lib/catalog/ConceptCard.svelte` (not read in full; planner should open it for link markup) plus `registry.ts` `conceptsIn(category)` (sorted by `order`) and `localizeHref` usage in `+page.svelte` 91-94. Successor = `conceptsIn(category)[index+1]`; last concept shows "Back to catalog". Link text via message keys with `{title}` param.

---

### Messages (`messages/en.json`, `messages/de.json`)

**Analog:** `uc_*` keys (en.json 41-60). Pattern: `<prefix>_title`, `<prefix>_hook`, `<prefix>_stage_aria` (with `{title}` param), `<prefix>_point_aria`, `<prefix>_step_<id>_title`, `<prefix>_step_<id>_caption` (params like `{pi}` allowed). Use new prefixes (e.g. `tn_`, `sg_`, `ti_`) plus shared keys (`undefined_readout`, `player_reveal`, `next_concept`, link/ghost labels). EN and DE must both exist; `scripts/check-i18n.mjs` enforces parity and caption length (EN 18 / DE 25 words) and fails the build.

---

### E2E specs

**Analog:** `e2e/drag.spec.ts` (188 lines) and `e2e/helpers/touch.ts`.
```typescript
const U = '/en/high-school/unit-circle/';
async function pointAt(page: Page, deg: number) {
	const b = (await page.getByTestId('stage').boundingBox())!;
	const R = b.width / 3;
	const a = (deg * Math.PI) / 180;
	return { x: b.x + b.width / 2 + R * Math.cos(a), y: b.y + b.height / 2 - R * Math.sin(a) };
}
const concept = (page: Page) => page.getByTestId('concept');
const readout = (page: Page) => page.getByTestId('theta-readout');
```
Pattern: `page.goto(U + 'step/')`, `mouse.move/down/move(steps: 8)/up`, assert `data-playing`/`data-t` attrs on `concept`, readout with regex. For PanelPair the circle frame is no longer `stage.width/3`; export a layout fn or expose `data-testid` frame bounds for a shared `pointAt` helper in `e2e/helpers/`. Also extend `deeplink.spec.ts` (existsSync over concept x locale x step), `catalog.spec.ts`, `mobile.spec.ts` (320px DE `scrollWidth <= clientWidth`).

## Shared Patterns

### Pure view + user params ownership
**Source:** `unit-circle/view.ts`, `steps.ts`, `src/lib/engine/player.ts` `restage`.
**Apply to:** all three new concepts. Timeline never writes `user.theta` (single writer rule, D-11); `restage(user, POLICY, stepDefaults(i, prev))` runs in the Player step-change callback.
```typescript
export function restage<P extends object>(user: P, policy: { [K in keyof P]?: ParamPolicy }, defaults: Partial<P>): P
```

### i18n (message keys only)
**Source:** `messages/en.json` `uc_*`, `scripts/check-i18n.mjs`. **Apply to:** every user-visible string, ARIA labels, captions, "undefined", Reveal, Next link. Import `m` from `#lib/paraglide/messages.js`, locale from `#lib/paraglide/runtime.js` (`getLocale`, `localizeHref`). Re-run `npm run paraglide` after adding keys (generated `src/lib/paraglide/`).

### Number formatting
**Source:** `src/lib/engine/format.ts`, `src/lib/tex/tex.ts` (`texNum`). **Apply to:** every readout and formula number; U+2212 minus in text, ASCII minus + `{,}` for TeX; no `Infinity`/`NaN`/`-0`/`e+`.

### Color via tokens only
**Source:** `src/lib/styles/tokens.css`, enforced by `tokens.test.ts` SHELL-05 (no hex outside tokens). **Apply to:** all SVG `stroke`/`fill` use `var(--c-*)`.

### Draggable point last, pointer capture, `oninteract` pauses player
**Source:** `DragPoint.svelte` 53-70, `+page.svelte` 114-119. **Apply to:** circle point, graph curve point, guess marker, ghost interactions.

### Persistent live region for step captions
**Source:** `Panel.svelte` 49-54 (`aria-live="polite"` + `{#key step}`). **Apply to:** the shared `PanelShell`.

### Test layout
**Source:** co-located `*.test.ts` (vitest, node), e2e in `e2e/*.spec.ts`. Run `npx vitest run` (146 tests today), `npm run check`, `npm run test:e2e`.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `src/lib/link/link.svelte.ts` | store | pub-sub | No module-level shared `$state` store exists; closest is `clock.svelte.ts` (class wrapper). Use RESEARCH Pattern 7. |
| `src/lib/stage/SnapPulse.svelte` | component | event-driven | No one-shot CSS pulse animation exists; reuse `.halo` transition tokens (`--dur-ui`, `--ease-out`) and add `--dur-snap`; disable under reduced motion. |
| `src/lib/trig/special.ts` exact-value table | utility | transform | No static exact-value data exists; use RESEARCH Pattern 11 and a numeric cross-check test. |
| Comet-tail trail rendering (`trail.ts` + segments in Scene) | utility/component | transform | No trail/gradient rendering exists; RESEARCH Pattern 6 (n short segments with decreasing opacity in one filtered `<g>`). |

## Metadata

**Analog search scope:** `src/lib/**`, `src/concepts/**`, `src/routes/**`, `e2e/**`, `messages/**`, `vite.config.ts`, `src/app.d.ts`.
**Files scanned:** ~75 (tracked `src`, `e2e`, `messages`); ~30 read in full or in targeted ranges.
**Not read in full (planner should open before editing):** `src/lib/player/PlayerBar.svelte`, `Scrubber.svelte` (need pause tick marker), `src/lib/catalog/ConceptCard.svelte`, `unit-circle/Thumbnail.svelte`, `RadianLayer.svelte`, `scripts/check-i18n.mjs`, `src/lib/engine/clock.svelte.ts`.
**Pattern extraction date:** 2026-10-24
