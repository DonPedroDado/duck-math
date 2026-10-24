# Phase 4: Limits - Context

**Gathered:** 2026-10-24 (discussed directly, without the GSD workflow)
**Status:** Ready for planning

## Phase Boundary

Visual intuition for what a limit is: where it exists, where it differs from the function value, and where it fails. The phase adds **two new catalog concepts** in High School:

1. **Approaching a value**: approach from the left and right in two colors, hole vs. value, a jump where the limit does not exist, sin(1/x) oscillation, and zoom (LIM-01, LIM-02, LIM-03, LIM-06)
2. **Limits & infinity**: vertical asymptotes going to ±∞, then limits at infinity and horizontal asymptotes, then a continuity summary (LIM-04, LIM-05)

Out of this phase: the formal ε-δ definition or an informal ε-band, typed-in functions, derivatives and secant→tangent (Phase 5), and the accessibility/devices audit (Phase 6).

## Implementation Decisions

### Concept split & catalog
- **L-01:** Two concepts under `src/concepts/high-school/`: **Approaching a value** → **Limits & infinity**. About 5–6 steps each, the same pace as earlier concepts. Catalog placement is after the three function concepts, replacing the "Limits" Soon card if there is one.
- **L-02:** Phase 2/3 conventions carry over: stable English step IDs in the URL, each step prerendered, "animate, then hand over", play stops at the end of each step, the keep/restage param policy, message keys only (EN + DE), hover linking (MATH-03), one predict moment per concept (PLAY-07), a "Next: <concept>" link on the last step, and the frozen module contract (`npm run new-concept`, `src/concepts/AUTHORING.md`).

### Example functions
- **L-03:** **Real textbook formulas**, shown in KaTeX:
  - Hole: f(x) = (x²−1)/(x−1), with a → 1 and L = 2. A variant redefines f(1) as a different filled value (piecewise) to show that the limit ≠ the value.
  - Jump: a piecewise function with different one-sided limits.
  - Oscillation: sin(1/x) at a → 0.
  - Vertical asymptotes: 1/x (opposite signs on the two sides) and 1/(x−2)² (+∞ on both sides).
  - At infinity: a rational function such as (2x+1)/(x+1) → 2.
  - Exact choices are at Claude's discretion within this spirit.
- **L-04 (Pitfall 4):** Each scenario is **data**: `{ f, a, left, right, value | undefined }` with the limits declared analytically. **Never evaluate f at a** to get a limit. Holes are drawn explicitly as open circles, and filled values as filled dots. Readouts near a take the declared limit when the gap is below float safety.

### Approach interaction
- **L-05:** **Two handles** on the x-axis. The left handle is in one color and the right handle in another, and each slides toward a from its own side. Each handle has its own point on the curve, a dashed drop line, and an **output tick on the y-axis** in its color. A live readout in the panel shows x and f(x) per side. The two ticks squeeze toward L, or stop at two different heights at a jump.
- **L-06:** **Handles stop just short of a.** They can't land on a or cross it. The minimum gap shrinks with zoom, so the gap always stays visible but small. f(a) is shown separately (filled dot or an "undefined" label). The message is: the limit never looks at a.
- **L-07:** **One-sided notation** lim_{x→a⁻} and lim_{x→a⁺}, colour-linked to the left and right handles (with hover linking). The two-sided lim_{x→a} appears when both sides agree, and "does not exist" appears when they don't.

### Zoom
- **L-08:** **A zoom control centred on a** (slider or buttons, with no free pan, pinch or wheel), plus a guided step that animates a smooth 3B1B-style zoom-in. Zoom is part of the params, so step state stays deterministic and scrubbable. Zooming into the hole shows the curve "looks like a line with a missing point". Zooming into sin(1/x) shows endless oscillation.

### Infinity
- **L-09:** **x → ∞ uses auto zoom-out.** As the handle is dragged to the right edge, the view smoothly zooms out (x range 10 → 100 → 1000 …) while the curve hugs the dashed horizontal asymptote ever closer. The y-scale stays readable. Plots must **break at vertical asymptotes** (no connecting spikes) and show arrows or "→ +∞ / −∞" labels where the curve leaves the view.
- **L-10:** No ε-band and no ε-δ. The user judged it would confuse high-school students.

### Predict moments
- **L-11:** Concept 1: "What is (x²−1)/(x−1) at x = 1?" The formula substitutes 1 and lands on **0/0**, then the handles show the curve heading to 2 anyway.
- **L-12:** Concept 2: "Which way does 1/x shoot off on each side of 0?"

### Extras
- **L-13:** **sin(1/x)** is an example where the limit fails without a jump. It goes in concept 1, after the jump step, using zoom. Plotting it needs adaptive or dense sampling near 0 to avoid aliasing.
- **L-14:** **Continuity summary step** at the end of concept 2: "Can you draw it without lifting the pen?" It ties together the hole, the jump and the asymptote as the three ways continuity breaks.

### Claude's Discretion
- Exact step lists, IDs, captions (EN/DE, minimal), durations and easing.
- Exact example functions and values within L-03, including the jump function and the redefined value for the hole.
- Color tokens for left, right and limit L: distinct from existing tokens, color-blind safe, and ideally also different in shape (e.g. ◀/▶ handle glyphs) so color is not the only cue.
- Zoom range, slider vs. buttons, how the minimum gap scales, and the auto-zoom-out curve and its thresholds.
- Layout (single graph plus the side panel by default) and phone behavior.
- Slugs and thumbnails.

## Canonical References

- `.planning/ROADMAP.md`: Phase 4 goal and success criteria
- `.planning/REQUIREMENTS.md`: LIM-01..06
- `.planning/research/FEATURES.md` §3 Limits: visual moments and pitfalls ("gets close" vs. "reaches", smooth zoom, no value tables)
- `.planning/research/PITFALLS.md` Pitfall 4: declared analytic limits, explicit holes, path breaks at discontinuities
- `.planning/phases/03-functions-transformations/03-CONTEXT.md`: conventions to keep
- `src/concepts/AUTHORING.md`: module folder contract

## Existing Code Insights

- `src/lib/graph`: `viewport(S, half)` is a **square window centred on the origin**. Limits needs a viewport with a centre (zoom around a, and the zoom-out for x → ∞ with independent x and y scales). Extend it, don't fork it.
- `sampleRuns` already breaks runs on `defined === false` and on clip exits, which covers asymptotes. It samples uniformly (n = 360), so sin(1/x) and deep zoom need denser or adaptive sampling. A jump needs an explicit break at a (mark it with `defined`, or split the domain).
- Reusable: FunctionPlot, GraphAxes, DragHandle (handles constrained to one side of a), Landmark (for dots), `tex.ts` number formatting (`num` with the German decimal comma), PredictPrompt/GuessMarker, NextLink, hover linking (`src/lib/link`), and the e2e helper `e2e/helpers/test`.
- New concepts are scaffolded with `npm run new-concept high-school/<id>`.
