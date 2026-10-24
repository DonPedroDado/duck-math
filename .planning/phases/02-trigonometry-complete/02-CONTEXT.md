# Phase 2: Trigonometry Complete - Context

**Gathered:** 2026-10-24
**Status:** Ready for planning

<domain>
## Phase Boundary

The rest of core high-school trig, shown geometrically and split across **three new catalog concepts** that sit next to the existing Unit circle:

1. **Tangent & friends**: tan, sec, csc and cot as segments, undefined at 90°/270° (TRIG-04, TRIG-05, MATH-06)
2. **Sine & cosine graphs**: the circle literally unrolls into synced sin/cos graphs in a second panel, with a glowing trail (TRIG-06, MATH-04, MATH-05)
3. **Identities & special angles**: sin²+cos²=1, symmetries via ghost points, and 30/45/60° snapping with exact values from the special triangles (TRIG-07, TRIG-08, TRIG-09)

Shared features built in this phase and used across concepts: formula↔visual hover linking (MATH-03), "predict, then reveal" pauses (PLAY-07), a second synced panel (MATH-05), fading trails (MATH-04), and correct handling of undefined values (MATH-06).

Out of this phase: the law of sines/cosines and addition formulas (backlog 999.1), tan graphs and asymptote plotting for graphs in general (asymptote/hole rendering beyond tan is Phase 4), freezing the module contract and the scaffold template (Phase 3), and keyboard/reduced-motion/color-blind audits (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Concept split & catalog
- **D-01:** Three **new, separate concepts** (each a `src/concepts/high-school/<id>/` module with its own route, steps and messages): "Tangent & friends", "Sine & cosine graphs", "Identities & special angles". The existing Unit circle concept stays.
- **D-02:** Each concept is **independent and starts fresh**: its own default angle, and a short recap first step (the circle and the draggable point). θ is not carried between concepts, which keeps deep links predictable.
- **D-03:** Catalog: ordered cards inside High School (Unit circle → Tangent & friends → Sine & cosine graphs → Identities & special angles). The **last step of each trig concept offers a "Next: <concept> →" link**. No new catalog grouping structure. The "soon" cards for Functions, Limits and Derivatives remain.
- **D-04:** The **Unit circle concept keeps its 6-step story unchanged**. It only gains the shared features: hover linking on its cos/sin formulas (MATH-03) and the next-concept link.
- **D-05:** About **5–7 steps per new concept**, similar in pace to Unit circle (about 1–2 min to play through). Identities may run slightly longer if the symmetry and special-triangle steps need it.
- **D-06:** All Phase 1 conventions carry over: stable English step IDs as URL path segments, each step prerendered, "animate, then hand over" steps, play stops at the end of each step, no autoplay, θ kept across steps *within* a concept (keep/restage policy), and message keys only (EN + DE).

### Sine & cosine graphs (unrolling + two panels)
- **D-07:** Desktop: **circle on the left and graph on the right, sharing one horizontal axis line**, so the point's height carries straight across to the graph through a dashed connector. The formula and caption panel moves **under** the stage for this concept, and the player bar stays at the bottom.
- **D-08:** Phone (portrait): **stacked**, with a smaller circle on top and the full-width graph below. The connector goes from vertical to horizontal. Both panels stay visible while dragging (no scroll-away, same rule as Phase 1 D-06).
- **D-09:** **Literal unroll** (3B1B, like the Phase 1 radian peel): the arc of length θ peels off the circle and lays flat on the graph's x-axis, so x on the graph *is* the arc length. After that the point sweeps and traces sin θ. Scrubbable both ways.
- **D-10:** **Sine first, then cosine.** A later step brings in cos by rotating the x-projection 90° onto the graph, so it reads as the same wave shifted by π/2. Both curves end on **one graph** in their own colors (sky/coral).
- **D-11:** **Graph drag works both ways:** dragging the point along the curve sets θ, and the circle point follows (and vice versa). Both panels share one θ param, with no second writer (follow the ownership model).
- **D-12:** x-range starts at **0..2π** (one period). A later step extends it (e.g. to ~4π) as the point keeps circling, which shows periodicity.
- **D-13:** Trail: the **traced curve persists dimly**, and a **brighter glowing comet tail** (~¼ turn) follows the point. A matching short arc trail follows the point on the circle. Must stay correct under scrubbing (trail is derived from θ/progress, not accumulated frame history).

### Tangent & friends
- **D-14:** tan uses the **vertical tangent line at x = 1**. The radius is extended to meet it, and the height there is tan θ. Similar triangles (sin/cos ↔ tan/1) are shown explicitly. This matches German school books.
- **D-15:** **tan and sec use the line x = 1; cot and csc use the line y = 1.** sec is the hypotenuse O→(1, tan θ), and csc is O→(cot θ, 1), which makes the co-function pairing visible.
- **D-16:** Reveal order: **one segment per step (tan → sec → csc → cot)**. Each draws on in its own color while earlier ones dim. A **final step shows all six together**, labeled, for free exploration.
- **D-17:** Undefined: near 90°/270° the tan segment grows and is **clipped at the stage edge with an arrow**. At exactly 90°/270° (within a small tolerance) the segment disappears and the readout shows **"undefined" / "nicht definiert"** in muted text. Large finite values show normally (e.g. 57,29). The same rule applies to sec/csc/cot at their own poles.
- **D-18:** **Four new global color tokens** `--c-tan`, `--c-sec`, `--c-csc`, `--c-cot`. They must be distinct from the existing θ/point/cos/sin/radian colors and checked for color-blind safety, and they keep the same meaning everywhere.
- **D-19:** The sign of tan per quadrant is taught **implicitly**: the segment points below the axis when tan < 0, the readout shows the sign, and the free-exploration caption gives a hint. No dedicated quadrant step.

### Predict, then reveal (PLAY-07)
- **D-20:** At a predict pause the animation stops with a short question. The student **drags a ghost/guess marker** to their prediction and taps **Reveal**. The animation then plays the true answer next to the guess. Ungraded, with no score, only the visual comparison.
- **D-21:** **Play/Next wait for Reveal** at that moment (the button reads "Reveal"). Scrubbing past the pause or opening a deep link to a later step simply shows the answer, so nothing is ever blocked.
- **D-22:** About **one predict moment per new concept**, for example: where is the tan segment at ~80°?; where does the sine wave peak?; where does the ghost for 180°−θ land? The planner picks the exact moments.

### Identities & special angles
- **D-23:** sin²+cos²=1: the cos/sin/radius right triangle gets **squares on each side** (cos² sky, sin² coral, 1² point white). While dragging, the two small squares change, but together they always match the unit square's area. Formula terms are color-linked to the squares.
- **D-24:** Symmetries: **one symmetry per step**. −θ mirrors in the x-axis, 180°−θ mirrors in the y-axis, and 90°−θ mirrors in the diagonal y = x (which swaps sin and cos). Each ghost point moves live with the real point, shows its projections, and has its matching formula (e.g. sin(−θ) = −sin θ). The **final step has chips to toggle each ghost**.
- **D-25:** Special angles: **magnetic snap** within about ±3° of 30°/45°/60° and their quadrant mirrors, with a subtle pulse on snap. When snapped, the readout switches from decimals to **exact form** (e.g. sin 60° = √3/2). Chips jump straight to 30/45/60. Snapping is active throughout the Identities & special angles concept.
- **D-26:** Exact values are **derived with animation**. For 45°, half a unit square gives legs of √2/2. For 30°/60°, half an equilateral triangle with side 1 gives a short leg of 1/2, then Pythagoras gives √3/2. Each derivation is one short step, and then the triangle lands in the circle.

### Claude's Discretion
- **Hover linking (MATH-03), user deferred.** Default: hovering, focusing or tapping a formula term glows its visual element and dims the rest, and hovering or tapping a visual element highlights its term. On touch a tap toggles the link. Build it once in the shared layer (CSS classes / shared focus state, per the KaTeX `\htmlClass` approach) and apply it to all four trig concepts.
- Exact step lists, IDs, captions (EN/DE, minimal), animation durations and easing for each concept.
- The exact hues of the four new tokens (within D-18) and the visual style of the guess marker, the ghost points and the off-stage arrow.
- Whether magnetic snap also appears in the other trig concepts (not Unit circle, per D-04).
- How the second panel generalizes in `ConceptLayout`/Stage (e.g. a layout variant with the panel under the stage). Keep it reusable, because Phase 5 needs function + derivative panels.
- Concept slugs (e.g. `tangent`, `sine-cosine-graphs`, `trig-identities`) and catalog thumbnails.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope & requirements
- `.planning/PROJECT.md`: vision, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md`: Phase 2 IDs TRIG-04..09, MATH-03..06, PLAY-07
- `.planning/ROADMAP.md` § Phase 2: goal and success criteria. § Backlog 999.1: trig laws, explicitly out of scope here

### Prior phase decisions & design contract
- `.planning/phases/01-foundation-playable-unit-circle/01-CONTEXT.md`: Phase 1 decisions (storyboard style, keep/restage, layout, palette, URLs, hosting)
- `.planning/phases/01-foundation-playable-unit-circle/01-UI-SPEC.md`: established visual/interaction design contract (tokens, spacing, typography, player)
- `.planning/phases/01-foundation-playable-unit-circle/01-REVIEW.md` and `01-UAT.md`: issues found and fixed in Phase 1 (keyboard wrap, inert hidden point) to avoid repeating

### Research (stack, architecture, pitfalls)
- `.planning/research/ARCHITECTURE.md`: param store with ownership, pure step resolver, scene host, primitives
- `.planning/research/PITFALLS.md`: two-writers, scrubbability, math edge cases (tan poles), i18n/mobile pitfalls
- `.planning/research/FEATURES.md`: table stakes and differentiators (trails, predict-reveal, linked panels)
- `.planning/research/STACK.md` and `CLAUDE.md`: pinned versions and "What NOT to use"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/engine/timeline.ts`, `player.ts` (with `ParamPolicy` 'keep' | 'restage' and `restage()`), `clock.svelte.ts`: the step timeline, player reducer and rAF clock. Predict-pause gating (D-21) extends the player.
- `src/lib/engine/angle.ts`, `format.ts`: angle normalization and locale number formatting (decimal comma). Extend the formatter for exact forms (√3/2) and "undefined".
- `src/lib/stage/Stage.svelte`, `DragPoint.svelte`, `geom.ts`: SVG stage and draggable point. The graph panel needs a draggable point constrained to a curve.
- `src/lib/tex/Tex.svelte`, `tex.ts`, `src/lib/styles/math.css`: KaTeX rendering and color classes. This is the hook for `\htmlClass` hover linking.
- `src/lib/styles/tokens.css`: global color tokens (add `--c-tan/sec/csc/cot`). `tokens.test.ts` guards them.
- `src/lib/player/ConceptLayout.svelte`, `PlayerBar.svelte`, `Scrubber.svelte`: page layout and controls. The layout currently has one stage plus a side panel, and needs a two-panel / panel-below variant.
- `src/lib/ui/SegmentedToggle.svelte`: usable for the ghost and special-angle chips.
- `src/concepts/high-school/unit-circle/*`: reference implementation (`view.ts` schedule, `projection.ts`, `radian.ts` peel geometry, which is reusable for the unroll, plus `derive.ts`, `formulas.ts`, `urls.ts`).
- `src/lib/catalog/*`: catalog cards and the `upcoming.ts` "soon" list.

### Established Patterns
- Concept folder `src/concepts/<category>/<id>/` with `index.ts` manifest (provisional `ConceptManifest` in `src/concepts/types.ts`), auto-discovered via `import.meta.glob` in `src/concepts/registry.ts`.
- Pure, unit-tested math/view modules (`*.test.ts` beside each), with Svelte components kept thin.
- Imports with explicit `.ts` extensions under `#concepts`/`#lib`.
- State is a function of params (θ, step progress), so everything must be scrubbable and deterministic.

### Integration Points
- Routes are currently **hardcoded per concept** (`src/routes/high-school/unit-circle/[[step]]/`). Each new concept needs a route (or a generic `[concept]/[[step]]` route; Phase 3 freezes the contract, but three more concepts now make a generic route attractive).
- Paraglide message keys per concept (`uc_*` prefix pattern). New prefixes for the three concepts. The build-failing missing-key check covers them automatically.
- The "next concept" link needs ordering data from the registry (`order`).

</code_context>

<specifics>
## Specific Ideas

- 3B1B "unroll": the arc literally flattens onto the x-axis, echoing the Phase 1 radian peel.
- Classic German textbook tangent picture (Tangente an x = 1).
- The co-function pairing should be *visible*: tan/sec on x = 1 and cot/csc on y = 1, and the 90°−θ ghost mirrors in y = x and swaps sin and cos.
- Predictions are physical (drag a guess marker), not multiple choice. The product is not a quiz.
- The squares-on-sides picture for sin²+cos²=1.

</specifics>

<deferred>
## Deferred Ideas

- tan graph with vertical asymptotes. Not requested for Phase 2; asymptote rendering in graphs comes in Phase 4 (Limits).
- Trig laws and addition formulas are already in backlog 999.1.
- Carrying θ between concepts (rejected for now in favor of predictable deep links).

</deferred>

---

*Phase: 02-trigonometry-complete*
*Context gathered: 2026-10-24*
