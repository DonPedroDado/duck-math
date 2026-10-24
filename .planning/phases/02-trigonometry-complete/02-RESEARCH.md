# Phase 2: Trigonometry Complete - Research

**Researched:** 2026-10-24
**Domain:** Interactive SVG trig visuals in the existing SvelteKit 3 / Svelte 5 / KaTeX / Paraglide stack. No new libraries, only new engine and shell features.
**Confidence:** HIGH on the codebase and integration analysis (read directly). MEDIUM on visual design choices (squares orientation, trail rendering).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Three new, separate concepts (each a `src/concepts/high-school/<id>/` module with own route, steps, messages): "Tangent & friends", "Sine & cosine graphs", "Identities & special angles". Unit circle stays.
- **D-02:** Each concept is independent and starts fresh: own default angle, short recap first step. θ not carried between concepts.
- **D-03:** Catalog: ordered cards in High School (Unit circle → Tangent & friends → Sine & cosine graphs → Identities & special angles). Last step of each trig concept offers a "Next: <concept> →" link. No new catalog grouping. "Soon" cards remain.
- **D-04:** Unit circle keeps its 6-step story unchanged. It only gains hover linking on its cos/sin formulas (MATH-03) and the next-concept link.
- **D-05:** About 5-7 steps per new concept (Identities may run longer).
- **D-06:** All Phase 1 conventions carry over: stable English step IDs as URL path segments, each step prerendered, "animate, then hand over", play stops at end of each step, no autoplay, θ kept across steps within a concept (keep/restage), message keys only (EN + DE).
- **D-07:** Sine/cos desktop: circle left, graph right, sharing one horizontal axis line, dashed connector. Formula/caption panel under the stage; player bar at bottom.
- **D-08:** Phone: stacked, smaller circle on top, full-width graph below, elbow connector. Both panels visible while dragging.
- **D-09:** Literal unroll (arc of length θ peels off the circle and lies flat on the graph x-axis), then the point sweeps and traces sin θ. Scrubbable both ways.
- **D-10:** Sine first, then cosine (x-projection rotated 90° onto the graph). Both on one graph (sky/coral).
- **D-11:** Graph drag works both ways. One shared θ param, no second writer.
- **D-12:** x-range starts 0..2π; later step extends (~4π).
- **D-13:** Traced curve persists dimly; brighter comet tail (~¼ turn); matching arc trail on the circle. Trail derived from θ/progress, not accumulated frame history.
- **D-14:** tan uses the vertical tangent line x = 1; radius extended to meet it; similar triangles explicit.
- **D-15:** tan and sec on x = 1; cot and csc on y = 1. sec = O→(1, tan θ); csc = O→(cot θ, 1).
- **D-16:** One segment per step (tan → sec → csc → cot), earlier ones dim; final step shows all six labeled.
- **D-17:** Near 90°/270° tan grows and is clipped at the stage edge with an arrow. At exactly 90°/270° (small tolerance) the segment disappears and readout shows "undefined" / "nicht definiert". Large finite values show normally. Same for sec/csc/cot at their poles.
- **D-18:** Four new global color tokens `--c-tan --c-sec --c-csc --c-cot`, distinct and color-blind checked, same meaning everywhere.
- **D-19:** Sign of tan taught implicitly (segment below axis, readout sign, caption hint). No dedicated step.
- **D-20:** Predict pause: animation stops with a short question; student drags a guess marker and taps Reveal; animation plays true answer next to the guess. Ungraded.
- **D-21:** Play/Next wait for Reveal (button reads "Reveal"). Scrubbing past the pause or deep-linking to a later step simply shows the answer; nothing is ever blocked.
- **D-22:** About one predict moment per new concept; planner picks exact moments.
- **D-23:** sin²+cos²=1: squares on each side of the cos/sin/radius triangle (cos² sky, sin² coral, 1² white). Formula terms color-linked.
- **D-24:** One symmetry per step: −θ (x-axis), 180°−θ (y-axis), 90°−θ (diagonal y = x). Ghost moves live. Final step has chips toggling each ghost.
- **D-25:** Magnetic snap within about ±3° of 30/45/60 and quadrant mirrors, subtle pulse. Snapped readout switches to exact form. Chips jump to 30/45/60. Snap active throughout Identities & special angles.
- **D-26:** Exact values derived with animation (45°: half unit square; 30/60°: half equilateral triangle, then Pythagoras). One short step each, then triangle lands in the circle.

### Claude's Discretion
- Hover linking (MATH-03): default glow linked element + dim rest; tap toggles on touch; build once in shared layer (CSS classes / shared focus state, KaTeX `\htmlClass`); apply to all four trig concepts.
- Exact step lists, IDs, captions, durations, easing.
- Exact hues of the four new tokens (within D-18); style of guess marker, ghost points, off-stage arrow.
- Whether snap appears in other trig concepts (not Unit circle per D-04).
- How the second panel generalizes in `ConceptLayout`/Stage. Keep reusable (Phase 5 needs function + derivative panels).
- Concept slugs and catalog thumbnails.

### Deferred Ideas (OUT OF SCOPE)
- tan graph with vertical asymptotes (asymptote rendering in graphs is Phase 4).
- Trig laws and addition formulas (backlog 999.1).
- Carrying θ between concepts.
- Also out of phase: freezing module contract/scaffold (Phase 3); keyboard/reduced-motion/color-blind audits (Phase 6).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TRIG-04 | tan as segment on tangent line, undefined at 90/270 | `ratios.ts` pole-aware pure module, `clipToBox`, similar-triangle geometry (Patterns 3, 4) |
| TRIG-05 | sec, csc, cot as segments, one at a time | Same module; step schedule via `seg()` windows like `view.ts` |
| TRIG-06 | Watch/scrub circle unrolling into sin/cos graphs | `unroll.ts` per-sample lerp + single-SVG `PanelPair` (Patterns 5, 6) |
| TRIG-07 | sin²+cos²=1 visually | `squares.ts` pure geometry (Pattern 9) |
| TRIG-08 | Symmetries via reflected ghost points | `ghosts.ts` pure derived from θ (Pattern 10) |
| TRIG-09 | 30/45/60 snapping + exact values from special triangles | `special.ts` exact table, pointer-only `snapSpecial` (Pattern 11) |
| MATH-03 | Formula term ↔ visual hover linking | Shared `link.svelte.ts` + `Tex.svelte` delegation (Pattern 7) |
| MATH-04 | Fading trace trail | `trail.ts` pure function of θ (Pattern 6) |
| MATH-05 | Two synced panels | `PanelPair.svelte` (Pattern 5) + `ConceptLayout` variant |
| MATH-06 | Undefined values shown as "undefined" | `ratios.ts` + `format.ts` extension (Pattern 3). The "graphs break at asymptotes / open dots" half of the requirement text is Phase 4 per CONTEXT |
| PLAY-07 | Predict, then reveal | `player.ts` pause + `reveal` action, `GuessMarker` (Pattern 2) |
</phase_requirements>

## Summary

Phase 1 left a clean, pure-function architecture: `timeline.ts` (`locate`, `seg`, `easeMath`), `player.ts` (pure reducer), `clock.svelte.ts` (rAF wrapper), a per-concept `view(t, user)` schedule, `restage()` policy for user params, and thin Svelte scene/panel components. Phase 2 should extend those, not replace them. Nothing in this phase needs a new npm dependency: all new work is pure TS math modules (unit-testable in node) plus Svelte components. GSAP is not installed and not needed; the own `seg()`/d3-ease timeline already handles scrubbable steps. [VERIFIED: package.json, src/lib/engine/*]

The five real engineering problems are: (1) the player has no notion of a pause point, so PLAY-07 needs a small reducer extension (`StepDef.pause`, `revealed`, `reveal` action); (2) `Stage.svelte` is a hard-coded square (`viewBox 0 0 S S`, `R = S/3`), so two-panel needs a new `PanelPair`; (3) the sine/cosine unroll draws from the circle panel into the graph panel, so a single shared SVG (not two separate SVGs) is the only sane implementation; (4) KaTeX re-renders via `{@html}` on every θ change, which breaks naive hover/focus linking (stuck hover, lost focus); (5) routes, `vite.config.ts` prerender entries and `Panel` are hardcoded to unit-circle, so three more concepts need a generic concept route and a shared page/panel shell, or the work triples in copy-paste.

Two spec numbers need correction before implementation: `--c-tan #F06FB5` (6.87:1) and `--c-csc #7C8CFF` (6.34:1) fail the UI-SPEC's own 7:1 rule on `--bg` (measured); lightness-only bumps pass (see Standard Stack). And `tokens.test.ts` currently has no contrast check, so Wave 0 must add one.

**Primary recommendation:** Build in this order: (a) pure math modules + tests (`ratios`, `clip`, `special`, `ghosts`, `squares`, `unroll`, `trail`, `snapSpecial`, format extensions), (b) engine extensions (pause/reveal, link store, generic concept route + `ConceptPage`), (c) one-SVG `PanelPair` + `ConceptLayout variant='below'`, (d) the three concepts, (e) Unit-circle gains (hover link, Next link), (f) e2e and a11y smoke.

## Architectural Responsibility Map

Static site, no server; "tiers" are build-time vs client.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Prerender every concept/step/locale | Build (SvelteKit prerender, adapter-static) | — | Existing pattern; `entries` must list new routes |
| Trig value math, clipping, poles, exact table, ghosts, squares, unroll, trail | Client pure TS modules (`*.ts`, node-testable) | — | Everything is a function of (θ, t); scrubbable and deterministic |
| Step schedule (`view`) | Client pure TS | — | Reads only t (+unit), never θ (PD-1 convention in `view.ts`) |
| Predict/reveal gating | Client player reducer | Scene (marker UI) | Reducer owns pause/reveal; scene only draws marker |
| Hover linking | Client shared store + DOM delegation | KaTeX `\htmlClass` output | Class-based, no re-render of formula for highlighting |
| KaTeX formula text | Build/SSR + client | — | `tex()` runs in SSR and client |
| i18n | Build (Paraglide compile + `check-i18n.mjs`) | — | Missing key fails build |
| Next-concept ordering | Client registry (`ConceptManifest.order`) | — | Via `import.meta.glob` registry |

## Standard Stack

### Core (all already installed; no additions)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| svelte / @sveltejs/kit | ^5.57.1 / ^3.0.0 | UI, routing, prerender | Project stack [VERIFIED: package.json] |
| katex | ^0.19.1 (registry latest 0.19.1) | Formulas, `\htmlClass` linking | Verified: `\htmlClass{t-cos link-cos}{...}` renders `<span class="enclosing t-cos link-cos">` with multiple classes [VERIFIED: ran katex 0.19.1 locally] |
| d3-scale / shape / interpolate / ease | ^4 / ^3 / ^3 / ^3 | Scales, `line()` path strings, easing | Already used; use `d3-shape` `line()` for curve/trail paths |
| @inlang/paraglide-js | ^2.29.1 | Typed messages | Existing; `scripts/check-i18n.mjs` enforces parity and caption length (EN 18 / DE 25 words) |
| vitest | ^4.1.12 | Unit tests (node env) | 146 tests pass today [VERIFIED: ran `npx vitest run`] |
| @playwright/test | 1.64 | e2e vs built static site | Chromium installed locally [VERIFIED: ~/.cache/ms-playwright] |

### Not adding
| Instead of | Why not |
|------------|---------|
| GSAP (3.15.0 on registry) | Phase 1 shipped without it; the own `seg()` schedule is simpler, pure and testable. Everything here (including trail/unroll) is `f(t, θ)`, which GSAP's imperative tweens would complicate. |
| Any new geometry/curve lib | Trig geometry is a few dozen lines each. |

### Token changes (tokens.css + `math.css`)
Contrast measured against `--bg #0f1117` [VERIFIED: computed in this session]:

| Token | UI-SPEC value | Contrast | Verdict | Recommended value |
|-------|---------------|----------|---------|-------------------|
| `--c-tan` | `#F06FB5` | 6.87 | FAILS 7:1 | `#F57FBC` (7.77) |
| `--c-sec` | `#A8D957` | 11.44 | ok | keep |
| `--c-csc` | `#7C8CFF` | 6.34 | FAILS 7:1 | `#8F9EFF` (7.64) |
| `--c-cot` | `#E9A23B` | 8.71 | ok | keep |

UI-SPEC says "adjust lightness only, never hue", so these bumps comply. Add `.t-tan/.t-sec/.t-csc/.t-cot`, plus `.t-cos2/.t-sin2` or reuse `.t-cos/.t-sin` for the squares terms. Also add the other new tokens (`--ghost-opacity`, `--dim-opacity`, `--c-guess`, `--trail-tail`, `--trail-dim`, `--dur-link`, `--dur-snap`, `--sq-fill`) and extend `tokens.test.ts`'s `names` list (it only checks existence today) with a computed WCAG contrast test for all `--c-*`.

**No installation step.**

## Architecture Patterns

### Data flow (sine/cos graphs concept, the most complex)

```
URL /{locale}/high-school/sine-cosine-graphs/{step}
   |
   v
generic route [concept]/[[step]] +page.ts -> validate concept+step against registry -> {concept, step}
   |
   v
ConceptPage (shared): Player(STEPS, i0, onstep) + user $state + restage + URL sync
   |        t, step, awaiting(reveal?)                 user: theta (shared, single writer), unit, guess
   v                                                   ^
view(t) -> pure schedule numbers (axes, unroll, sine, cosine, range, ...)       |
   |                                                    |
   v                                                    |
Scene = ONE <svg> via PanelPair(layout row|column) -- circle frame + graph frame
   |   unroll(θ, v.unroll)  trail(θ) ratios(θ) clip(...)   |
   |   CirclePoint (DragPoint) --onchange--> user.theta ----+
   |   CurvePoint  (new, x->θ) --onchange--> user.theta ----+   (both write via the same handler)
   v
Panel (formulas via Tex + link store, readouts, chips, Next link)   PlayerBar (Reveal label when awaiting)
```

### Recommended structure (new files)
```
src/lib/engine/        player.ts (+pause/reveal), format.ts (+exact, undefined), special.ts? (no: concept-level)
src/lib/trig/          ratios.ts, clip.ts, special.ts, snap.ts      # shared across tangent + identities (+ tests)
src/lib/link/          link.svelte.ts, linkable.ts                  # MATH-03
src/lib/stage/         PanelPair.svelte, GuessMarker.svelte, AxisPoint.svelte (1-D constrained drag), SnapPulse.svelte
src/lib/player/        ConceptLayout.svelte (+variant), ConceptPage.svelte, NextLink.svelte
src/concepts/high-school/tangent/              index.ts step-ids.ts steps.ts view.ts Scene.svelte Panel.svelte formulas.ts Thumbnail.svelte
src/concepts/high-school/sine-cosine-graphs/   ... + unroll.ts trail.ts graph.ts
src/concepts/high-school/trig-identities/      ... + ghosts.ts squares.ts
src/routes/high-school/[concept]/[[step]]/     +page.ts +page.svelte (replaces hardcoded unit-circle route)
```
Rationale: `src/lib/trig/` holds math reused by 2+ concepts (undefined handling is needed by tangent, graphs readouts, and identities exact values). Per-concept folders keep pure modules next to their tests, as in `unit-circle/`.

### Pattern 1: Generic concept route (do this first)
**What:** Replace `src/routes/high-school/unit-circle/[[step]]` with `src/routes/high-school/[concept]/[[step]]`; `+page.ts` looks the concept up in `registry.ts` (manifest has `stepIds`), 404s on unknown concept or step (`error(404)` as today). Extract the current `+page.svelte` body into `ConceptPage.svelte`, parameterised by a per-concept "runtime" object `{ STEPS, POLICY, stepDefaults, initialUser, view, Scene, Panel, titles }`.
**Why:** The unit-circle page is ~150 lines of Player + URL sync (pushState/replaceState with `ucStep` state key, canonical/hreflang head, scene error boundary) that would otherwise be copied three times. CONTEXT explicitly calls out the generic route as attractive. Mark it provisional; Phase 3 freezes the contract.
**Gotchas (all concrete):**
- `ucStep` page-state key and `UC_BASE`/`stepPath` imports must become per-concept (`conceptStep`, `manifest.path`). `app.d.ts` has a `PageState` declaration to update [ASSUMED: it declares `ucStep`; grep before editing].
- `vite.config.ts` hardcodes prerender `entries` from unit-circle `STEP_IDS`. It cannot use `import.meta.glob`; either import each concept's `step-ids.ts` explicitly or scan `src/concepts/*/*/step-ids.ts` with `node:fs` in the config. A forgotten entry is a silent missing page until crawl; `deeplink.spec.ts` already asserts build output exists per step, so extend that over all concepts.
- Layout (`+layout.svelte`) finds the active concept by `pathname.startsWith(c.path)`; works unchanged.
- Unit-circle's existing e2e URLs must keep working; do the migration as its own task with all 146 tests + e2e green before adding concepts.
- Keep `Panel` generic parts (counter, h1, caption live region, formula block, Next link row) in a shared `PanelShell` with per-concept slots; the unit-circle `Panel` has `min-height` conventions (caption 4 lines, formula 96px) that carry over.

### Pattern 2: Predict, then reveal in the pure player (PLAY-07)
**What:** Extend `StepDef` with optional `pause?: number` (seconds from step start, strictly inside the step). Extend `PlayerState` with `revealed: boolean` and add action `{type:'reveal'}`.
- `tick`: if the current step has `pause`, `!revealed`, and `s.t < pauseT`: clamp `t` to `min(t+dt, pauseT)`; if it hits `pauseT`, set `playing:false`. Never advance past it while unrevealed.
- `awaiting(steps, s)` = `step has pause && !revealed && t >= pauseT - 1e-9 && t <= pauseT + 1e-9`.
- `reveal`: `revealed:true, playing:true` (continues the animation).
- `play`/`toggle`/`next` while awaiting: act as `reveal` (D-21). `play` on a staged step still advances; `next` from an unrevealed step before the pause should run to the pause only if the user plays; `next` navigates to the next step normally and the *previous* step becomes revealed history.
- `seek` to `t > pauseT` ⇒ `revealed:true`; `seek` to `t <= pauseT` ⇒ `revealed:false` (D-21 "scrubbing back resets"). Deep link (`initialState`) and `goto`/`prev` land at `stepEnd` ⇒ `revealed:true` (nothing blocked).
- Entering a step by `next`/auto-advance ⇒ `revealed:false`.
**Pure view stays pure:** `view(t)` is a function of `t` only; the pause point is just a window boundary in the schedule (e.g. 0..0.45 of the step is "before reveal", 0.45..1 is "reveal"). `revealed` only matters at exactly `t === pauseT`.
**Pitfalls:** (a) `isStaged` uses `stepEnd`; with a pause the step is not "playing" but also not staged, so `PlayerBar` must show "Reveal" from `awaiting`, not from `playing`. (b) The `Player` class (`clock.svelte.ts`) stops its loop when `playing` goes false; `reveal` must restart it (the existing `dispatch` start/stop logic already keys off `next.playing`, so setting `playing:true` suffices). (c) Existing `player.test.ts` fixtures construct `PlayerState` literals; adding a required field breaks them, so make `revealed` default through `initialState` and update tests, or make it optional (`revealed?: boolean`, treated true when undefined for steps without pause). (d) The scrubber's step ticks and the 6px "diamond" marker need `pauseT` from `StepDef`.
**Guess marker:** user-owned param `guess` (ownership model `user`), `restage` policy clears it on step change, never written by the timeline. New `GuessMarker.svelte` generalises `DragPoint`'s pointer-capture code (setPointerCapture, `getScreenCTM().inverse()` mapping, `oninteract` pausing the player) but constrained to a 1-D track: it takes `pos(value)->[x,y]` and `fromPoint([x,y])->value`. The same component backs the graph `CurvePoint`. Keyboard: arrow keys step along the constraint, Enter = reveal; `role="slider"`.

### Pattern 3: Trig ratios with poles (MATH-06) - `src/lib/trig/ratios.ts`
**Rule: detect poles by angular distance to the pole, never by the computed value.** `Math.tan(Math.PI/2)` is `1.633e16`, `Math.cos(Math.PI/2)` is `6.1e-17` (finite, huge, wrong-looking), so a `Number.isFinite` check never fires.
```ts
export type Fn = 'tan' | 'sec' | 'csc' | 'cot';
const POLES: Record<Fn, number> = { tan: 90, sec: 90, csc: 0, cot: 0 }; // degrees, period 180 for tan/cot, 360 for sec/csc
export const POLE_EPS_DEG = 0.5; // UI-SPEC
export function distToPoleDeg(fn: Fn, thetaRad: number): number {
  const deg = (thetaRad * 180) / Math.PI;
  const period = fn === 'tan' || fn === 'cot' ? 180 : 360;
  // sec: poles at 90 and 270 (=> period 180 as well). csc: poles at 0 and 180 (=> period 180).
  const p = 180; // all four have poles every 180 degrees
  const d = ((deg - POLES[fn]) % p + p) % p;
  return Math.min(d, p - d);
}
export function ratio(fn: Fn, theta: number): { kind: 'defined'; value: number } | { kind: 'undefined' } { ... }
```
(Note: all four functions have poles every 180°: tan/sec at 90°+k·180°, cot/csc at k·180°. The snippet's `period` line is dead; use only the 180 spacing.)
- Hysteresis (0.1° exit): a pure function of θ cannot have memory. Recommendation: drop hysteresis in the pure function; θ arrives snapped to a display grid anyway (`snapTheta`, 0.05° display eps), and flicker at ±0.5° exactly is a non-issue when the readout is a deterministic function of θ. If the planner insists, implement it as component-local state in the Scene (`undefinedLatched`) and test with Playwright. Flag in plan as an intentional simplification of UI-SPEC. [ASSUMED acceptable; confirm]
- Values with |v| ≥ 1000: show 0 decimals, no grouping, no exponent: extend `format.ts` with `fmtValue(v, locale)`; `Intl.NumberFormat` with `useGrouping:false`. Never print `Infinity`, `NaN`, `-0` (existing `fmt` already normalises −0 and uses U+2212).
- "undefined" is a message key (`undefined_readout`), not hard-coded; the formula line becomes `\tan\theta =` plus message text outside KaTeX (UI-SPEC).

### Pattern 4: Clipping segments at the stage edge (D-17) - `src/lib/trig/clip.ts`
**Finding that simplifies layout:** with the existing stage range ±1.5 (`R = S/3`), every segment is bounded in one coordinate: tan and sec lie on x ≤ 1, csc/cot on y ≤ 1; only the *other* coordinate diverges. So the tangent concept does NOT need the UI-SPEC's optional widened `viewBox -2.5..2.5`; keep `Stage` unchanged, clip to `±(1.5 − inset/R)` where inset = 12px converted to units (`12 / R`). That keeps the circle the same on-screen size as Unit circle (a UI-SPEC goal) at zero cost.
- tan: endpoint `(1, clamp(t, -L, L))`.
- sec: ray from O toward `(1, tan)`: scale `s = min(1, L/|tan|)`, endpoint `(s, s·tan)` (clip on the dominant axis; also x ≤ 1 so only y can overflow).
- cot: endpoint `(clamp(c, -L, L), 1)`; csc: `s = min(1, L/|cot|)`, endpoint `(s·cot, s)`.
- Return `{ x, y, clipped: boolean, dir }` so the Scene draws the 12px arrow triangle when `clipped`. Pure and unit-tested at 0.5°, 1°, 89.5°, 90.4°, 90.6°, 269.9°, negative values, and θ=0 (tan=0 gives a zero-length segment: hide, no NaN).
- The sec ray passes through the unit circle point only at the tan/sec line crossing; the radius extension from the point to the tangent line is the same ray; reuse the same clipped endpoint for the dashed extension.

### Pattern 5: Two panels = one SVG (MATH-05, D-07/D-08) - `PanelPair.svelte`
**Recommendation (deviation from UI-SPEC wording "two SVG panels"):** Implement `PanelPair` as a **single `<svg>`** containing two coordinate frames (groups with their own `x()/y()/R`), chosen by a layout (`row` ≥ 640px container width, `column` below). Expose per-panel `StageCtx` objects with the existing shape (`x, y, R, cx, cy, glow`) plus the graph's `gx(θ)` x-scale.
**Why:** the unroll animation draws an arc that physically leaves the circle and lands on the graph axis; the dashed connector crosses panels; the phone elbow connector crosses panels; trail glow uses shared filters. In two separate SVGs each of these needs cross-element coordinate sync and clipping hacks. With one SVG, the shared horizontal axis (D-07) is literally one `y` value; the phone stack is a different frame arrangement. `DragPoint` already maps pointer to user space with `getScreenCTM()` of its own `currentTarget`, so it works inside frame `<g transform>` groups without changes (verify with a test on a translated group).
**Layout switching:** use `bind:clientWidth` (as `Stage` does) and a JS breakpoint rather than CSS container queries, because the SVG's internal geometry (frame rectangles) changes, not just CSS. Keep sizes derived: row: circle frame square of side `W·5/12`, graph frame `W·7/12 × same height`; column: circle `min(W, 40dvh)` square, graph `W × min(36dvh, 200px)`.
**Phone sticky:** `ConceptLayout` already makes `.stage` sticky under 640px with a `max-width` based on dvh; the `below` variant needs a different max-height calc (UI-SPEC: ≤ `76dvh − 64px`). Add `variant: 'side' | 'below'` prop, leave `side` CSS untouched.
**Stage reuse:** do not rewrite `Stage.svelte` for existing concepts. Extract its `<defs>` filters (`glow-sm/md`, id from `$props.id()`) into a small `GlowDefs.svelte` so `PanelPair` shares them. Budget: max 2 glow filters active at once (UI-SPEC); SVG `filter` on large regions is the main perf risk during 60 fps drags, so keep filter regions tight (`x/y/width/height` percentages, already `-50%/200%`), and apply filters only to the comet-tail group and the active-link group.

### Pattern 6: Unroll, graph, trail as pure functions (TRIG-06, MATH-04)
All three are `f(θ, progress)`, no history:
- `graph.ts`: `xRange(vRange)` interpolates `2π → 4π` with `easeMath` over the `periodic` window (D-12). `gx(θ) = x0 + θ/range · width`. Curve samples: `sin`/`cos` at N = 240 points over `[0, min(θ_traced, range)]` via `d3-shape` `line()`; the curve is revealed up to the *current traced angle* (a function of step progress during `sine`, and ≥ range afterwards), never accumulated per-frame.
- `unroll.ts`: for N=64 samples `s_k = θ·k/N` along the arc: circle position `C_k = (cos s_k, sin s_k)` and flat position `F_k = (gx(s_k), axisY)`; position = `lerp(C_k, F_k, e_k)` where `e_k = easeMath(seg(q, k/N·0.6, k/N·0.6 + 0.4))` (sample k leaves later the farther it is along the arc, giving a peel). Pure, monotone, scrubbable both ways. This is simpler than reusing `bentPoint` (constant-curvature peel in `radian.ts`), which fits the radian copies but lands vertically from (1,0), not onto a horizontal axis with a different scale (graph x-scale ≠ circle scale: with 5/12 : 7/12 split, 2π·R ≈ 0.87·W exceeds the 0.58·W graph width, so a 1:1 flat copy would not fit; lerping to the graph scale is what D-09's "x on graph is arc length" needs). `radian.ts` constants (`COPY_LENGTHS`, `R_COPY`) are not reusable here; only the `seg`/`E` idiom is.
- `trail.ts`: `tail(θ, tailTurns=0.25, n=24)` returns points for `s ∈ [max(0, θ − π/2), θ]` plus an opacity ramp per segment (render as n short `<line>`/`<path>` segments with decreasing opacity inside one filtered `<g>`; an SVG `linearGradient` along a curved path does not follow the path, and `objectBoundingBox` gradients on near-vertical/horizontal segments degenerate). Same function feeds the graph tail (x = gx(s), y = sin s) and the circle arc tail. Under scrubbing it is exact by construction.
- Graph point drag: pointer x → θ via inverse `gx`, clamped to `[0, range]`; write `user.theta` (θ may exceed 2π only when range = 4π; circle shows `θ mod 2π`; `norm()` from `angle.ts`). **Caution:** `snapTheta` and `degValue` wrap into [0, 2π); do not run graph θ through `snapTheta` when θ ≥ 2π or the readout will wrap and the point will jump back. Store θ unwrapped in this concept, and wrap only for circle drawing/readouts, as UI-SPEC says. When the circle point is dragged, it writes `θ mod 2π` while range is 2π; at 4π range, keep the nearest-turn rule (add 2π if the previous θ was in the second turn) or accept that circle drags land in turn 1. Recommend the latter (simple, documented).
- Single-writer rule (D-11): both points call the same `setTheta`; the timeline never writes θ in this concept (θ is user-owned; the *sweep* in `sine`/`periodic` uses a view-derived `sweepθ(p)` that is displayed when the user has not interacted, see Open Question 2).

### Pattern 7: Hover/focus linking (MATH-03) - `src/lib/link/`
- `link.svelte.ts` (a `.svelte.ts` module so `$state` works at module level): `export const link = $state({ id: null as LinkId | null })`; helpers `setLink(id)`, `clearLink()`, `toggleLink(id)` (touch).
- **Formula side:** formulas already use `\htmlClass{t-cos}{...}` via the `cls()` helper in `formulas.ts`. Extend the helper to emit `\htmlClass{t-cos link-cos}{...}` (multiple space-separated classes verified). `Tex.svelte` attaches **delegated** `pointerover/pointermove/pointerout/pointerleave/focusin/focusout/click` listeners on its persistent wrapper `<span class="tex">`, resolving `e.target.closest('[class*="link-"]')`.
- **Pitfall (high): KaTeX DOM is replaced on every θ change** because `html = $derived(tex(src))` and `{@html html}` re-inserts nodes. (i) A hovered term that is replaced under a stationary pointer never fires `pointerleave`, so the link would stay stuck; fix by also resolving the link on `pointermove` over the wrapper and clearing on wrapper `pointerleave`; (ii) a focused term loses focus when replaced; fix by only making terms focusable (`tabindex=0`, `role="button"`) in an `$effect` after each render and restoring focus by link id if it was within the wrapper (`document.activeElement` check before swap). Simplest robust choice: do not try to preserve keyboard focus across live re-renders; terms are keyboard-focusable only in steps whose formula does not change with θ, or accept that Phase 6 owns the full keyboard audit (CONTEXT). Pointer/touch is the contract here.
- **Visual side:** helper `linkable(id)` returns attributes `{ 'data-link': id, class: ..., onpointerenter, onpointerleave, onclick }` and the Scene sets `opacity` from `link.id`, e.g. `style:opacity={link.id && link.id !== 'cos' ? 'var(--dim-opacity)' : 1}` with `transition: opacity var(--dur-link)`. CSS-only dimming through ancestor attribute selectors (`[data-active-link] [data-link]:not(...)`) cannot compare per-role values without enumerating roles, so use the Svelte-reactive approach.
- Drags win: never let the linkable hit area sit on top of the draggable point (use `pointer-events` on the lines' stroke only, draw `DragPoint` last as today).
- Touch toggle: `click` toggles; click on empty stage clears (Scene root `onclick` where `target === currentTarget`).
- Roles (UI-SPEC): `angle point cos sin tan sec csc cot cos2 sin2 one ghost-neg ghost-supp ghost-comp radian`.
- Unit circle (D-04): only its `cos`/`sin` terms are linked; add `link-*` to the `cosT/sinT` helpers and `data-link` on `P.showCos`/`showSin` groups; no other change.

### Pattern 8: Catalog / registry / Next link
- Add `order: 2,3,4` manifests; `conceptsIn()` already sorts. `NextLink` finds the successor via `conceptsIn(category)` index + 1; the last shows "Back to catalog" (UI-SPEC). The row reserves 44px in all steps; show it on the last step only (and on unit-circle's last step, `sine`).
- The link href must be locale-aware: use `localizeHref(next.path)` as the page already does for canonical URLs.
- Each concept's `index.ts` imports a `Thumbnail.svelte`; `ConceptCard` consumes `thumbnail` already (unit-circle ships one). `upcoming.ts` unchanged.

### Pattern 9: Squares on sides (TRIG-07) - `squares.ts`
Triangle `O=(0,0)`, `F=(cos,0)`, `P=(cos,sin)`. Squares: on `OF` (side |cos|), on `FP` (side |sin|), on `OP` (side 1). Compute each from a side segment `A→B` and a direction `n = ±perp(B−A)/|B−A|`; vertices `A, B, B+n·len, A+n·len`.
- **Degenerate sides** (cos = 0 or sin = 0 → a leg of length 0): hide when side px < 1 (UI-SPEC); do not divide by the zero length when computing `perp`. Compute `perp` from the *fixed* axis direction for legs (horizontal for `OF`, vertical for `FP`), not by normalising a vector that can be zero.
- **Orientation continuity (needs a design decision):** "outward from the triangle" flips side when the triangle crosses an axis: the sin² square on the vertical leg is on the right when cos > 0 and on the left when cos < 0, so it jumps across the y-axis at 90° while dragging; the hypotenuse square flips side at the same angles. This is inherent in "outward" squares. Recommendation: keep outward (that is what a student expects from the Pythagoras picture), and crossfade the flip over ~±2° or accept the instantaneous mirror. Raise it with the user as a cosmetic decision (see Open Questions 4); tests assert areas, not side, so either choice is safe to implement later.
- Area readout: `cos² + sin² = a + b = 1` with decimals from the formatter; check `a + b` rounding: displayed 2-decimal terms may not sum to `1,00` (0,41 + 0,59 fine, but 0,335 + 0,665 → 0,34 + 0,67 = 1,01). Compute `b = 1 − round(a)` for the displayed second term, or show 3 decimals. Unit-test over a sweep of angles that displayed terms sum to displayed 1,00.

### Pattern 10: Ghost points (TRIG-08) - `ghosts.ts`
`ghost(kind, θ)`: neg → `−θ`; supp → `π − θ`; comp → `π/2 − θ`; each returns `{angle, x, y, cosProj, sinProj}` computed by `Math.cos/sin` of the transformed angle (not by flipping signs), so quadrants are automatically right. Mirror axes are static lines (x-axis, y-axis, `y = x`). Coincidence cases (θ=90° for comp, 0/180° for neg, 90° for supp): ghost drawn beneath the real point with a dashed ring at 6px larger radius (UI-SPEC). Unit tests: for a θ sweep, `ghost.sin` equals the expected identity (`sin(−θ) = −sinθ` etc.) to 1e-12; this directly verifies the displayed formulas.

### Pattern 11: Special angles and snap (TRIG-09) - `src/lib/trig/special.ts`, `snap.ts`
- `special.ts`: table keyed by degrees for the 12 targets (30,45,60 and mirrors 120,135,150,210,225,240,300,315,330) → `{ sin, cos, tan }` as exact TeX strings (`\tfrac{\sqrt{3}}{2}`, signs with ASCII `-` for TeX), generated from the first-quadrant triple and the quadrant sign rules, then asserted numerically against `Math.sin/cos/tan` within 1e-12 by a unit test (this ties exact strings to real values). Provide `exactFor(thetaRad)` that returns the entry only when θ equals a target within 1e-9 (i.e. snapped).
- `snap.ts`: `snapSpecial(rawTheta, tolDeg=3)` returns the nearest target angle if within tolerance else `rawTheta`; stateless. Because `DragPoint.onchange` receives the raw pointer angle (`angleFromPoint(p.x-cx, cy-p.y)`) on every move, a stateless snap gives the "must drag past ±3° to leave" behaviour for free.
- **Pitfall: do not apply snap to keyboard input.** `DragPoint.key` computes `keyStep(theta, ±1)` from the stored (snapped) θ, so ArrowRight from 60° gives 61°, which is within ±3° and snaps back to 60°: the keyboard user is trapped. Add an optional `snap?: (t: number) => number` prop to `DragPoint` applied in the pointer `update()` path only, or a second callback argument `source: 'pointer' | 'key'` to `onchange`. Unit-test `snapSpecial` plus a `DragPoint` key test.
- Snap pulse: component state `snappedTo: number | null`; an `$effect` on change to non-null triggers a one-shot CSS animation ring (`--dur-snap`); disabled under reduced motion. Not part of pure state.
- Axes (0/90/180/270) are not targets (UI-SPEC) but `snapTheta` still snaps to 0 near 0°; no conflict.
- Chips: reuse `SegmentedToggle` visual for single-select jump chips (note it renders `aria-pressed` for the selected value; jump chips should have no persistent pressed state, so add a `momentary` mode or a sibling `ChipButton`). Ghost chips are independent toggles with `aria-pressed`. The 400ms animated jump writes a user-owned param, so animate it in the page with a small tween (d3-interpolate + rAF) that dispatches `setTheta` each frame and cancels on any user drag.

### Pattern 12: Step schedules
Follow `unit-circle/view.ts`: `layer(k, f)` helper, windows via `seg()` and `easeMath`, `view(t, user)` reading only t and unit. Step durations from UI-SPEC tables; steps with a predict pause: put `pause` at the point where the question should appear (e.g. tangent `tan`: after the line draws, before the tan segment). Tangent `tan`: restage θ to ~80° during the predict (see Open Question 1).

### Anti-Patterns to Avoid
- **Detecting poles with `isFinite`/magnitude checks** (cos(π/2) ≈ 6e-17 is finite).
- **Accumulating trail points per frame** (breaks scrubbing; D-13).
- **Letting the timeline write θ while the user drags** (two writers, a Phase 1 pitfall in PITFALLS.md).
- **Two separate SVGs for the unroll** (cross-panel animation and connector sync).
- **Putting event handlers inside KaTeX DOM nodes directly** (they are destroyed on each render).
- **Storing text in components** (all strings are message keys; `check-i18n.mjs` enforces parity and caption length).
- **`$state` module singleton read in SSR** for the link store: a module-level `$state` is shared across SSR requests; harmless here because `link.id` is only set from client events, but never write to it during prerender.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number/locale formatting | Custom string manipulation | Extend `src/lib/engine/format.ts` (`Intl.NumberFormat`, U+2212, −0 fix already there) | Decimal comma, minus, −0 already solved and tested |
| Angle wrapping/snap tolerances | New mod arithmetic | `norm`, `snapTheta`, `keyStep`, `angleFromPoint` in `angle.ts` | Single source of truth for wrap eps |
| Easing/windowing | New easing code | `seg`, `clamp01`, `easeMath` in `timeline.ts` | Handles zero-length windows without NaN |
| Curve/path strings | Manual string concat of thousands of points | `d3-shape` `line()` | Already a dependency |
| Pointer to SVG-space mapping | `getBoundingClientRect` math | `getScreenCTM().inverse()` as `DragPoint.update` does | Correct under any viewBox scaling or nested transform |
| Formula highlighting | Per-term custom DOM or a second renderer | KaTeX `\htmlClass` + delegated events | Verified to emit classes; no re-render needed to highlight |
| Missing translations | Runtime fallbacks | Paraglide + `scripts/check-i18n.mjs` | Build fails on missing/mismatched keys |
| Exact values at special angles | Float-to-fraction detection | Static exact table tested against `Math.*` | Float recognition of √3/2 is fragile |
| Predict-pause scheduling | `setTimeout` pauses in components | Reducer state (`pause`, `revealed`) | Must be testable, scrubbable, and survive deep links |

**Key insight:** every new behavior except the pointer/DOM glue is a pure function of `(t, θ, user)`. If a behavior cannot be written that way (hover link, snap pulse, guess marker position), it is component state with a documented owner.

## Runtime State Inventory

Not a rename/refactor phase. Closest analogue is the route/ID migration:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. No database; no localStorage keys beyond `dm-locale` (locale choice) | None |
| Live service config | None (static hosting; `vercel.json` has no per-concept rules [ASSUMED: not read]) | Check `vercel.json` rewrites/redirects before merging |
| OS-registered state | None | None |
| Secrets/env vars | None | None |
| Build artifacts | `build/` is stale after adding routes and `src/lib/paraglide/` is generated | Re-run `npm run paraglide` (also part of `npm run check`), rebuild before e2e |

## Common Pitfalls

### Pitfall 1: Poles that look finite
**What goes wrong:** tan 90° shows `1.6331239353195370e+16` or a giant segment; `-0`/`NaN` appear.
**Why:** floating point, `Math.PI/2` is not exactly π/2.
**How to avoid:** angular distance to pole (Pattern 3); unit tests at 89.4°, 89.5°, 90°, 90.5°, 269.5°, 270°, 0°, 180° for all four functions.
**Warning signs:** readout with `e+` or more than 4 digits; segment spanning beyond the stage.

### Pitfall 2: Discontinuity at the pole while dragging
**What goes wrong:** the tan segment flips from huge positive to huge negative across 90°, the segment sweeps through the whole stage in one frame.
**How to avoid:** this is mathematically correct; the ε-window hides the segment right at the pole (UI-SPEC). Make the stage clip arrow flip direction (up for positive, down for negative) and add a short `opacity` transition only if flicker is observed in UAT.

### Pitfall 3: Live-rendered KaTeX swallows hover/focus (see Pattern 7)
### Pitfall 4: Keyboard trapped by snap (see Pattern 11)

### Pitfall 5: Two θ writers in the graph concept
**What goes wrong:** the sweeping animation in `sine`/`periodic` and the user's drag both want to set θ; the point jumps.
**How to avoid:** the timeline never writes `user.theta`; the Scene draws the *sweep point* from view progress when `!user.moved`, and from `user.theta` once the user has dragged (the existing `moved` flag + `oninteract` pause pattern in `Scene`/`ConceptPage`). On step re-entry/scrub, `restage` clears `moved` (a deliberate difference from unit-circle's `moved: keep`, see Open Question 2).

### Pitfall 6: Trail wrong after scrub
**How to avoid:** `trail(θ)` is a pure function (Pattern 6); unit-test `tail` at θ=0, < π/2, = π/2, near 2π, and at 4π range.

### Pitfall 7: Prerender misses new pages
**What goes wrong:** build succeeds but `/de/high-school/tangent/all/` is a 404 on hosting (adapter fallback `404.html` hides it).
**How to avoid:** derive `entries` from all concepts' step-id modules; extend `e2e/deeplink.spec.ts`'s `fs.existsSync(build/...)` check to every concept x locale x step.

### Pitfall 8: German overflow
**What goes wrong:** `Aufdecken` on the Reveal button, long captions (≤ 25 words), `Identitäten & besondere Winkel` card/h1 overflow at 320px.
**How to avoid:** Playwright mobile spec at 320px in DE for each concept asserting `scrollWidth <= clientWidth` (the existing `mobile.spec.ts` shows the pattern); `min-width: 96px` on the button.

### Pitfall 9: Color pairs
**What goes wrong:** pink tan vs coral sin, amber cot vs yellow angle, periwinkle csc vs lavender radian are close under deuteranopia (UI-SPEC acknowledges). **Avoid** by always labeling and never letting risk pairs touch in `all` step. Full audit is Phase 6.

### Pitfall 10: SVG filter cost during drag
**How to avoid:** at most two filter groups active; the tail group and link-glow group only; test a 60 fps drag in Chromium DevTools profile on the graph concept (largest filtered area).

## Code Examples

### Reducer pause (sketch)
```ts
// player.ts additions (Source: extends existing reduce(); not yet implemented)
export interface StepDef { id: string; dur: number; pause?: number } // timeline.ts
const pauseT = (steps, i) => steps[i].pause === undefined ? null : stepStart(steps, i) + steps[i].pause!;
export const awaiting = (steps, s) => {
  const pt = pauseT(steps, s.step);
  return pt !== null && !s.revealed && Math.abs(s.t - pt) < 1e-9;
};
// tick: let end = stepEnd(...); const pt = !s.revealed ? pauseT(...) : null;
//       const cap = pt !== null && s.t < pt ? pt : end; t = Math.min(s.t + dt*rate, cap); playing = t < cap
```

### Linked formula term
```ts
// formulas.ts (Source: katex 0.19.1 verified output class="enclosing t-cos link-cos")
const cls = (role: string, body: string) => `\\htmlClass{t-${role} link-${role}}{${body}}`;
```

### Undefined readout
```ts
export function fmtRatio(fn: Fn, theta: number, locale: string, undefinedText: string): string {
  const r = ratio(fn, theta);
  if (r.kind === 'undefined') return undefinedText;       // message key at call site
  const a = Math.abs(r.value);
  return a >= 1000 ? fmt(r.value, 0, locale).replace(/[\s .]/g, '') : fmt(r.value, 2, locale);
}
```
(For ≥ 1000 prefer `new Intl.NumberFormat(locale,{useGrouping:false,maximumFractionDigits:0})`; the replace above is illustrative.)

## State of the Art

| Old Approach (project docs) | Current Approach | Impact |
|-----------------------------|------------------|--------|
| STACK.md suggests GSAP timeline | Phase 1 shipped an own pure `seg()` timeline | Keep it; do not introduce GSAP |
| UI-SPEC: two Stage-compatible SVG panels | One SVG with two frames (this research) | Cross-panel unroll/connector become trivial |
| UI-SPEC: widen tangent stage to ±2.5 "if needed" | Not needed with ±1.5 range and clipping | Same circle size as Unit circle for free |
| STACK.md "adapter-static 5.0.x" | package.json declares `^4.0.0` | Version drift between docs and manifest; do not change this phase |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `app.d.ts` declares a `PageState` with `ucStep` that must become generic | Pattern 1 | Minor: type error at check time, trivial fix |
| A2 | `vercel.json` has no per-concept rewrites needing updates | Runtime State | Missing redirect for new routes; low |
| A3 | Dropping the 0.1° exit hysteresis is acceptable to the user (pure function of θ) | Pattern 3 | If the user wants hysteresis, add component-local latch; small |
| A4 | Reusing `radian.ts` for the unroll is unnecessary (per-sample lerp chosen instead) | Pattern 6 | CONTEXT canonical text says "reusable for the unroll"; if user expects the identical peel feel, a bent-arc variant is a bounded alternative |
| A5 | Keyboard focus on live-rendered formula terms can be deferred to Phase 6 | Pattern 7 | If MATH-03 UAT expects keyboard focus linking now, extra work |

## Open Questions

1. **tan predict "point fixed at about 80°" vs "θ kept within concept" (D-06).**
   - Known: UI-SPEC says the point is fixed at ~80° during the `tan` predict; default θ is 35°; θ policy is `keep`.
   - Unclear: whether the student's dragged θ must be preserved.
   - Recommendation: `tan` step defaults restage θ to 80° on entry (`stepDefaults`), later steps keep. Document as an intentional exception; the predict only works at a steep angle where tan is dramatically off-screen.
2. **Does the point sweep in `sine`/`periodic` move `user.theta` or only a view-derived point?**
   - Recommendation: view-derived sweep point while `!moved`; user θ after first interaction; `restage moved:false` on step change for this concept. Needs UAT feel check.
3. **Do `explore`/`periodic` at 4π let the circle drag select the turn?** Recommend no (circle writes θ in turn 1). Confirm.
4. **Squares flip side when crossing axes** (Pattern 9). Recommend outward + short crossfade; user may prefer a fixed side.
5. **Chip jump animation owner.** A 400ms tween writing a user-owned param is a second writer; recommend a page-level tween that cancels on any drag/`oninteract`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build/tests | ✓ | v25.9.0 (engines `>=22.17`) | — |
| npm / vitest | unit tests | ✓ | 146 tests pass | — |
| Playwright Chromium | e2e | ✓ | chromium-1248 in `~/.cache/ms-playwright` | `PW_CHROMIUM` env var path |
| gsd-sdk CLI | GSD tooling | ✗ | — | `node ~/.claude/get-shit-done/bin/gsd-tools.cjs` (not needed for implementation) |
| GSAP | — | not installed, not needed | registry 3.15.0 | — |

No missing blocking dependencies.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1 (unit, node env, `src/**/*.test.ts` + `scripts/**/*.test.ts`); Playwright 1.64 (e2e against built static site) |
| Config file | `vite.config.ts` (`test` block), `playwright.config.ts` (projects: desktop; mobile for 4 specs) |
| Quick run command | `npx vitest run` (about 1.3 s now) |
| Full suite command | `npm run check && npx vitest run && npm run test:e2e` (e2e builds with `npm run build`, which runs `check-i18n.mjs`) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRIG-04 | tan segment length/sign, similar-triangle ratio `sin/cos = tan/1`; undefined within 0.5° of 90/270 | unit | `npx vitest run src/lib/trig/ratios.test.ts` | ❌ Wave 0 |
| TRIG-04/MATH-06 | clip at stage edge with arrow flag; `Infinity/NaN/e+` never in readout | unit | `npx vitest run src/lib/trig/clip.test.ts src/lib/engine/format.test.ts` | ❌ Wave 0 / extend |
| TRIG-05 | sec/csc/cot geometry and poles at 0/180 vs 90/270; one-at-a-time step schedule | unit | `npx vitest run src/concepts/high-school/tangent/view.test.ts` | ❌ Wave 0 |
| TRIG-06 | unroll samples monotone, endpoint on axis at q=1, scrub-invariant (`f(q)` same forward/backward) | unit | `npx vitest run src/concepts/high-school/sine-cosine-graphs/unroll.test.ts` | ❌ Wave 0 |
| TRIG-06 | circle drag and graph drag both change θ; deep link per step renders | e2e | `npx playwright test e2e/sine-cosine.spec.ts` | ❌ Wave 0 |
| MATH-04 | `tail(θ)` is pure, clamped at 0, length π/2, opacities monotone | unit | `npx vitest run src/concepts/high-school/sine-cosine-graphs/trail.test.ts` | ❌ Wave 0 |
| MATH-05 | PanelPair frames: shared axis y equal (row), no overflow at 320px (column) | unit (layout fn) + e2e | `npx vitest run src/lib/stage/panelpair.test.ts`; `npx playwright test e2e/mobile.spec.ts` | ❌ Wave 0 |
| TRIG-07 | square areas `cos²+sin²=1` for 0..360 sweep; displayed terms sum to 1,00 | unit | `npx vitest run src/concepts/high-school/trig-identities/squares.test.ts` | ❌ Wave 0 |
| TRIG-08 | ghost angles and sin/cos identities for all three symmetries over a sweep | unit | `npx vitest run src/concepts/high-school/trig-identities/ghosts.test.ts` | ❌ Wave 0 |
| TRIG-09 | exact table equals `Math.*` within 1e-12; `snapSpecial` zone ±3°, axes excluded, stateless; keyboard not snapped | unit + e2e | `npx vitest run src/lib/trig/special.test.ts src/lib/trig/snap.test.ts` | ❌ Wave 0 |
| MATH-03 | `\htmlClass` emits `link-*`; hover on term sets link id and dims others; stuck-link recovery | unit (tex) + e2e | `npx vitest run src/lib/tex/tex.test.ts src/lib/link/link.test.ts`; `npx playwright test e2e/link.spec.ts` | ❌ Wave 0 / extend |
| PLAY-07 | reducer: clamps at pause, `reveal` resumes, `next` at pause reveals first, seek/goto/deeplink reveal, scrub-back resets | unit | `npx vitest run src/lib/engine/player.test.ts` | ✅ extend |
| PLAY-07 | button label "Reveal" in EN/DE, marker drag then Reveal draws answer | e2e | `npx playwright test e2e/predict.spec.ts` | ❌ Wave 0 |
| D-03 | Next link target/order per concept; last shows Back to catalog | e2e | `npx playwright test e2e/catalog.spec.ts` | ✅ extend |
| i18n | EN/DE parity, caption word limits for all new keys | script | `npm run check:i18n` | ✅ (covers new keys automatically) |
| Tokens | new tokens exist; every `--c-*` is ≥ 7:1 on `--bg` | unit | `npx vitest run src/lib/styles/tokens.test.ts` | ✅ extend (contrast test new) |
| Deep links | every concept x locale x step prerendered | e2e | `npx playwright test e2e/deeplink.spec.ts` | ✅ extend |

### Sampling Rate
- **Per task commit:** `npx vitest run` (fast, node only).
- **Per wave merge:** `npm run check && npx vitest run` plus the relevant e2e spec.
- **Phase gate:** full suite green (`npm run test:e2e` builds and serves the site) before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `src/lib/trig/{ratios,clip,special,snap}.test.ts` (and sources), covers TRIG-04/05/09, MATH-06
- [ ] `src/lib/engine/format.test.ts` extension (exact forms, undefined, |v| ≥ 1000), `player.test.ts` extension (pause/reveal)
- [ ] Concept-level pure tests: `unroll`, `trail`, `squares`, `ghosts`, per-concept `view.test.ts`, `urls`/step-id tests
- [ ] `tokens.test.ts`: contrast assertions (the tokens as specified fail for tan and csc)
- [ ] `src/lib/link/link.test.ts` and `tex.test.ts` extension for multi-class `\htmlClass`
- [ ] e2e specs: `sine-cosine.spec.ts`, `predict.spec.ts`, `link.spec.ts`, `tangent.spec.ts` (undefined readout at 90°), identities snap/chip spec; extend `deeplink`, `catalog`, `mobile`, `i18n`
- [ ] e2e helper for dragging to a specific angle (see `e2e/helpers/`, `drag.spec.ts`)
- No framework install needed.

## Security Domain

`security_enforcement` is not set in config (absent = enabled). This phase is a static client-only app with no auth, accounts, network input, or storage beyond the locale preference.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | none (no accounts) |
| V3 Session Management | no | none |
| V4 Access Control | no | none |
| V5 Input Validation | yes (limited) | Route params (`concept`, `step`) validated against the registry in `+page.ts` with `error(404)`; numeric inputs from pointer/keyboard are clamped (`clamp01`, graph x clamp, `Number.isFinite` guards as in `reduce`) |
| V6 Cryptography | no | none |
| V14 Config/Content | yes | The only `{@html}` stays in `Tex.svelte` and receives KaTeX output of repo-authored TeX; user-visible numbers enter TeX only via `texNum(fmt(...))`. Keep KaTeX `trust` restricted to `\htmlClass` (do NOT enable `\htmlData`, `\href`, `\includegraphics`) |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via `{@html}` formulas | Tampering | Only `tex()` output; trust function allows `\htmlClass` only (existing, tested in `tex.test.ts`); never pass message strings/user input into `tex()` |
| Unknown route/step enumeration | Info disclosure | 404 via `error()`; existing |
| Link-store prototype/ID injection | Tampering | `LinkId` is a closed union; ignore unknown `link-*` class names |
| Locale URL tampering | Tampering | Paraglide `localizeHref` and typed locales (existing) |

## Sources

### Primary (HIGH confidence)
- Codebase read in this session: `src/lib/engine/{player,timeline,clock.svelte,angle,format}.ts`, `src/lib/stage/{Stage,DragPoint}.svelte`, `geom.ts`, `src/lib/player/ConceptLayout.svelte`, `src/lib/tex/{Tex.svelte,tex.ts}`, `src/concepts/**/unit-circle/*`, `src/concepts/{registry,types}.ts`, `src/routes/high-school/unit-circle/[[step]]/*`, `vite.config.ts`, `package.json`, `playwright.config.ts`, `tokens.css`, `tokens.test.ts`, `scripts/check-i18n.mjs`.
- KaTeX 0.19.1 executed locally (`npm`-installed): multi-class `\htmlClass` output confirmed.
- Contrast ratios computed locally (WCAG relative luminance) for all candidate tokens.
- `npx vitest run`: 15 files, 146 tests pass. `npm view katex version` = 0.19.1; `npm view gsap version` = 3.15.0.

### Secondary (MEDIUM confidence)
- `.planning/phases/02-trigonometry-complete/02-UI-SPEC.md`, `02-CONTEXT.md`, `CLAUDE.md` (project docs; internally consistent, with the exceptions noted above).

### Tertiary (LOW confidence)
- None used. Floating-point behaviour of `Math.tan(Math.PI/2)` stated from IEEE-754 knowledge [ASSUMED but standard]; confirm in the first `ratios.test.ts`.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, no new dependencies; versions read from the repo and registry.
- Architecture: HIGH for engine/route/layout analysis (read the code); MEDIUM for single-SVG PanelPair and trail rendering (design judgment, not yet prototyped).
- Pitfalls: HIGH for KaTeX re-render, snap/keyboard trap, prerender entries, contrast (each found in code or measured); MEDIUM for perf and squares orientation.

**Research date:** 2026-10-24
**Valid until:** 2026-11-23 (stable stack; code-derived findings hold until `src/lib` changes)
