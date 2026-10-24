# Phase 4: Limits - Plan

**Written:** 2026-10-24 (without the GSD workflow)
**Decisions:** `04-CONTEXT.md` (L-01 … L-14)
**Requirements:** LIM-01 … LIM-06

Four slices, built in order. Each one ends green: `npm run check`, `npm test` and `npx playwright test` all pass. Each slice is then committed and pushed. Slices 2 and 3 are the two concepts, and each is playable as soon as it lands.

| # | Slice | Delivers | Requirements |
|---|-------|----------|--------------|
| 1 | Limits toolkit | Zoomable window, adaptive axes and sampling, the scenario model, approach primitives, tokens | (enables LIM-*) |
| 2 | Approaching a value | Concept 1 | LIM-01, LIM-02, LIM-03, LIM-06 |
| 3 | Limits & infinity | Concept 2 | LIM-04, LIM-05 |
| 4 | Journey & review | Catalog, Next chain, visual sign-off | all |

---

## Slice 1: Limits toolkit (`src/lib/graph/` + `src/lib/limits/`)

**Why first:** `viewport(S, half)` is a square window centred on 0. `GraphAxes` draws one line per unit, which would be 2000 lines at x ∈ [−1000, 1000]. `sampleRuns` uses a fixed n = 360. None of these survive zoom.

**Pure (`*.ts` + tests):**
- `graph/viewport.ts`: add `window(S, { cx, cy, hx, hy })`, a window with a centre and independent half-widths, which returns the same `Viewport` shape plus `x0, x1, y0, y1`.
  - `viewport(S, half)` becomes a thin wrapper, so Phase 3 scenes don't change.
  - `half` stays for the old callers. New code uses the bounds.
- `graph/ticks.ts`: `niceStep(range, target≈8)` gives a step from 1/2/5 × 10ⁿ, and `tickValues(lo, hi, step)`. Tick labels get enough decimals for the step (0.001 shows as 0.001, never 0).
- `graph/sample.ts`:
  - `sampleRuns` takes an optional `breaks: number[]`: runs always split at those x values, which covers jumps and asymptotes even when both sides stay inside the clip.
  - Add `n` scaling: samples per pixel, not per call.
  - Add `sampleDense` for oscillating functions. It refines where adjacent samples differ by more than a pixel threshold (bounded recursion, depth ≤ 8). This is used for sin(1/x).
- `limits/scenario.ts`: `Scenario = { id, f, a, left, right, value?: number, breaks, tex, domain? }`.
  - `left` and `right` are the declared one-sided limits: number, `+Infinity` or `-Infinity`, or `'osc'` for no limit.
  - `value` is f(a) as a filled dot; undefined means a hole or "undefined".
  - `limitOf(s)` returns L, ±∞, or `DNE`, all from the declared data. **f is never evaluated at a** (L-04).
  - Scenarios: `hole` ((x²−1)/(x−1), a = 1), `holeValue` (same, f(1) = 3), `jump` (piecewise: x + 1 for x < 1, x − 1 for x ≥ 1, so the limits are 2 and 0 and f(1) = 0), `osc` (sin(1/x), a = 0), `recip` (1/x), `recipSq` (1/(x−2)²), `rational` ((2x+1)/(x+1), x → ±∞ gives 2, plus its own vertical asymptote at x = −1).
- `limits/approach.ts`:
  - `zoomWindow(a, L, z)`: z is a log₁₀ zoom level, and the window is centred on (a, L), shrinking by 10^z.
  - `minGap(window)`: the smallest allowed |x − a|, at 1.5% of the x half-width, so the gap is always visible (L-06).
  - `clampSide(x, a, side, gap)` keeps a handle on its side of a.
  - `readout(s, x)` gives f(x), and switches to the declared limit when |x − a| < 1e-9 (float safety).
  - `digitsFor(window)`: readout precision grows with zoom.
- `limits/outward.ts` (x → ±∞, L-09): `outwardWindow(x)` maps the handle's math x to a window whose x half-width grows smoothly (piecewise log): the handle stays at ~80% of the half-width once it passes the first edge. y is fixed around the asymptote, with headroom. The values are continuous in x, so scrubbing and dragging never jump.

**Components:**
- `graph/GraphAxes.svelte`: uses `ticks.ts` when given a windowed viewport. Grid lines fade in and out by tick level as zoom changes, so steps don't pop.
- `limits/ApproachHandle.svelte`: a `DragHandle` on the x-axis, constrained to one side (`side: 'left' | 'right'`). It has a ◀ or ▶ glyph so color is not the only cue, a dashed drop line to its curve point, and a point on the curve.
- `limits/OutputTick.svelte`: a coloured tick and small glyph on the y-axis at f(x).
- `limits/OpenDot.svelte` / filled dot: the open dot has a `--bg` fill and a curve-coloured ring. These are stacked so a filled value never hides the hole.
- `limits/Asymptote.svelte`: a dashed line, vertical or horizontal.
- `limits/OffscreenArrow.svelte`: where a run exits the window toward ±∞, an arrowhead at the edge plus a "+∞ / −∞" label.

**Tokens and links:**
- `--c-left`, `--c-right` and `--c-lim`, plus the classes `t-left`, `t-right` and `t-lim`. Extend `tokens.test.ts` with contrast and color-blind distance tests, between left and right in particular, and against `--c-point`.
- **Palette risk:** if three more hues won't pass, reuse existing hues that never share a screen with limits (e.g. cos and sin for left and right). The ◀/▶ glyphs carry the meaning anyway.
- Add `left`, `right`, `lim` and `asym` to `LINK_IDS` and `roles.ts`.

**Tests:**
- `niceStep` over many ranges.
- Runs split at `breaks`, and the 1/x path never connects across 0.
- `sampleDense` resolves sin(1/x) without aliasing at deep zoom (sign changes counted between samples).
- `limitOf` for every scenario, and a guard test that `f(a)` is never called (a spy f throws at a).
- `clampSide` never lets a handle reach a.
- `outwardWindow` is continuous and monotone.
- `viewport(S, half)` stays unchanged, so Phase 3 tests still pass.

---

## Slice 2: Approaching a value (`high-school/limit-approach`, prefix `la_`, order 8)

Scaffolded with `npm run new-concept`. Layout `side`. Params: `xl`, `xr` (handle x), `z` (zoom), `scenario`.

| id | What happens | Student can drag |
|----|--------------|------------------|
| `predict` | Shows f(x) = (x²−1)/(x−1). **Predict pause** (L-11): "What is f(1)?" A guess marker is on the line x = 1, vertical only. Reveal: the formula substitutes 1, giving (1−1)/(1−1) = 0/0, which turns into "undefined", and an open dot appears at x = 1. | guess marker |
| `approach` | The two handles slide in from x = −1 and x = 3 toward 1. The ticks squeeze to 2. lim⁻ and lim⁺ fill in (L-07), then lim_{x→1} f(x) = 2. | both handles |
| `zoom` | z animates 0 → 2 in log space (constant perceived speed). The curve straightens into a line with a missing point, and the min gap shrinks with the window. A zoom slider and ± buttons appear (L-08). | handles, zoom |
| `value` | The scenario switches to `holeValue`: a filled dot pops up at (1, 3) above the open dot, and the formula becomes piecewise. The ticks still converge to 2, and the panel reads lim = 2 ≠ 3 = f(1). | handles, zoom |
| `jump` | Crossfade to `jump`. The handles approach again, and the ticks stop at 2 and 0. lim⁻ = 2 and lim⁺ = 0 are in their colors, then "lim does not exist". | handles, zoom |
| `oscillate` | Crossfade to sin(1/x), a = 0. Animated zoom-in: the curve keeps oscillating at every scale and the ticks keep sweeping across [−1, 1]. Result: "does not exist (no jump, it never settles)". Next link. | handles, zoom |

- **Policy:**
  - Restage per step: `xl`, `xr` and `scenario`.
  - `z` restages on scenario changes, so each example starts unzoomed.
  - Within `zoom`, `value` and `jump`, `z` carries over (`keep`).
- **Scenario crossfade:** the view reads `scenarioMix` from t. The old curve fades out while the new one draws on, and the dots and asymptote fade per scenario.
- **Panel:** step counter, title, caption, formula (piecewise when needed), one-sided limit lines colour-linked to the handles, live readouts (x, f(x) per side, `digitsFor(z)`), the zoom control from `zoom` onward, and NextLink.
- **Thumbnail:** a curve with an open dot and ◀ ▶ handles (replaces `LimitsThumb` as card art).
- **Catalog:** `limits.replacedBy = ['limit-approach']` in `upcoming.ts`.
- **e2e (`e2e/limit-approach.spec.ts`):**
  - The predict flow (awaiting → Reveal → 0/0 visible). Before the reveal, nothing shows the hole or the limit.
  - Dragging the left handle toward a stops before a (its data-x ≠ a), and its tick y-value goes to 2.
  - The zoom slider changes the axis tick step.
  - At `value`, the filled dot and the open dot are both present, at different y.
  - At `jump`, the readout says "does not exist" (EN) and "existiert nicht" (DE).
  - Hovering the lim⁻ term highlights the left handle.
  - Deep links to every step.

---

## Slice 3: Limits & infinity (`high-school/limit-infinity`, prefix `li_`, order 9)

| id | What happens | Student can drag |
|----|--------------|------------------|
| `intro` | f(x) = 1/x draws on, with both handles parked away from 0. Short recap caption. | handles |
| `predict` | **Predict pause** (L-12): "Which way does 1/x shoot off on each side of 0?" Two guess toggles (↑/↓), one per side, in the left and right colors. Reveal: the handles run toward 0, the curve leaves the window, and offscreen arrows read −∞ on the left and +∞ on the right. The vertical asymptote x = 0 fades in dashed. The panel shows lim⁻ = −∞ and lim⁺ = +∞, so the limit does not exist. | toggles, then handles |
| `both-up` | Crossfade to 1/(x−2)². Both sides give +∞, and lim_{x→2} = +∞ ("grows without bound"). The zoom control is available, and zooming in never catches the curve. | handles, zoom |
| `at-infinity` | Crossfade to (2x+1)/(x+1). The handles now point **outward**: ▶ runs to +∞ and ◀ to −∞. As a handle passes the edge, `outwardWindow` zooms the view out (10 → 100 → 1000). The horizontal asymptote y = 2 is dashed, and both ticks hug 2. lim_{x→±∞} = 2. The asymptote at x = −1 also shows (breaks correctly). | handles outward |
| `continuity` | "Can you draw it without lifting the pen?" One piecewise function with a hole, a jump and a vertical asymptote. A pen dot traces it left to right and lifts at each break, and each break gets a label: hole, jump, asymptote. Where the pen never lifts, the curve is continuous. Next link. | pen position (scrub along x) |

- **The `predict` guess UI:** a small `SideGuess` component (two ↑/↓ toggle chips in the panel, plus ghost arrows on the stage). If it generalizes, put it in `src/lib/ui/`.
- **Policy:** restage handles and scenario per step. In `at-infinity` the handles get their own outward defaults.
- **e2e (`e2e/limit-infinity.spec.ts`):**
  - The predict flow.
  - Near 0, the 1/x path has two runs, with none crossing x = 0 (a path data check via `data-runs`).
  - The offscreen arrows read ±∞.
  - Dragging the right handle to the edge grows the x tick step (the window zooms out), and the tick reads ≈ 2.
  - At `continuity`, there are three break labels in EN and DE.
  - Deep links.

---

## Slice 4: Journey & review

- `e2e/catalog.spec.ts`: 9 live cards (4 trig, 3 functions, 2 limits) and 1 Soon card (Derivatives).
- The journey spec's Next chain: Combine → Approaching a value → Limits & infinity → catalog. Check one predict moment per concept.
- Full suite green, then your visual review on desktop and phone, in EN and DE.

---

## Risks & open points

- **Palette crowding** (slice 1): fallback above. The color-blind test decides, not the eye.
- **Deep zoom precision:** z is capped at 4 (10⁴×). At that point the gap is about 1e-5, which is fine in double precision. `readout` switches to the declared limit below 1e-9 anyway.
- **sin(1/x) cost:** dense sampling near 0 could reach thousands of points. Cap samples at about 4 per pixel, and below one pixel of x, draw the oscillation as a filled band (an honest picture at screen resolution).
- **Handle collisions on phones:** at high zoom, both handles sit near a in screen space. That is fine because the min gap is screen-relative (1.5% of the width on each side), and the hit areas of the two handles must not overlap. Check this on a phone in slice 2.
- **Outward zoom vs. scrubbing:** the window is a pure function of the handle x, so scrubbing reproduces it exactly. No state is kept between frames.
- **Message budget:** EN ≤ 18 words and DE ≤ 25 per caption. "Does not exist" and "grows without bound" are message keys, never inline.
