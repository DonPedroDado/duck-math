# Phase 3: Functions & Transformations - Context

**Gathered:** 2026-10-24 (discussed directly, without the GSD workflow)
**Status:** Ready for planning

## Phase Boundary

How shifts, stretches and reflections change a graph, split across **three new catalog concepts** in High School, plus a frozen module contract with a scaffold script.

1. **Shifts**: f(x)+d and f(x−c), including why a horizontal shift moves "the opposite way" (FUNC-01, FUNC-02)
2. **Stretches & reflections**: a·f(x) and f(bx) with fixed points, then dragging a and b continuously through 0 into negatives (FUNC-03, FUNC-04)
3. **Combine**: a·f(b(x−c))+d built up one transformation at a time, why order matters, and free exploration (FUNC-05)
4. **Module contract and template**: every concept (trig and functions) follows one documented folder contract, and `npm run new-concept` scaffolds a working concept that shows up in the catalog (MOD-01, MOD-02, MOD-03)

Out of this phase: Limits and Derivatives (Phases 4–5), asymptotes and holes on general graphs (Phase 4), typed-in functions (no expression parser), and the accessibility/devices audit (Phase 6).

## Implementation Decisions

### Concept split & catalog
- **F-01:** Three new concepts under `src/concepts/high-school/`: Shifts → Stretches & reflections → Combine. About 5–6 steps each, the same pace as the trig concepts.
- **F-02:** Phase 2 conventions carry over: stable English step IDs in the URL, each step prerendered, "animate, then hand over", play stops at the end of each step, keep/restage param policy within a concept, message keys only (EN + DE), hover linking (MATH-03), one predict moment per concept (PLAY-07), and a "Next: <concept>" link on each last step.
- **F-03:** Each concept starts fresh (default params, short recap step). Params are not carried between concepts.

### Base curve
- **F-04:** A **hand-designed asymmetric smooth curve** f: an obvious peak, a lower/deeper valley, and a zero crossing. Asymmetric so that every reflection is visible (no even or odd shape). These three are named **landmark points** used throughout.
- **F-05:** Formulas are written in terms of **f**; the curve has no expanded formula on screen.
- **F-06:** The final explore step (at least in Combine) lets the student **swap the base curve** for x², √x, 2ˣ or sin x.

### Notation & controls
- **F-07:** One notation everywhere: **a·f(b(x−c))+d** (German school standard). a = vertical stretch, b = horizontal stretch, c = horizontal shift, d = vertical shift. The same letter keeps the same color in all three concepts and is color-linked to its formula term.
- **F-08:** Params are changed **both by dragging the graph and by sliders, kept in sync**. Dragging the curve or a landmark up/down sets d, sideways sets c, edge handles stretch (a, b). The panel has one colored slider per active parameter, in the color of its term. Both inputs write the same param (one source of truth, no second writer).

### How changes are shown
- **F-09:** The original f stays visible as a **faint dashed ghost**. Each landmark has an **arrow from its old to its new position**.
- **F-10:** Stretches use a **rubber-sheet grid** (3B1B style): the coordinate grid stretches with the curve, vertically for a·f(x) and horizontally for f(bx). The axis that stays put glows, and points on it are marked as fixed. As a parameter goes to 0 the grid squashes flat, and past 0 it flips.

### Shifts: "the opposite way"
- **F-11:** First a **predict moment**: which way does f(x+2) move? Then **input-lookup arrows** for a few points of the new graph: "to get g at x, look up f at x+2", which is 2 units ahead, so the graph lands 2 units back. The example is written as f(x+2) = f(x−(−2)) to tie it to the c notation.

### Reflections
- **F-12:** **Own steps with a mirror line.** One step drags a from 1 continuously through 0 to −1: the curve flattens onto the x-axis, then flips, the x-axis mirror line appears and the result is named −f(x). Another step does the same for b with the y-axis and f(−x).

### Combine
- **F-13:** **Build-up, then order matters.** Apply c, b, a, d one at a time (each animated, each term lighting up in a·f(b(x−c))+d). Then a step showing that order matters: f(2(x−1)) and f(2x−1) land differently. Final step: free explore with all four parameters and the swappable base curves (F-06).

### Module contract & template
- **F-14:** `npm run new-concept <category>/<id>` copies a **minimal working template** (manifest, step ids, steps, Scene, Panel, runtime, EN/DE messages, a unit test) and the new concept appears in the catalog right away with no shell edits. An **AUTHORING.md** documents the module folder contract. Trig and Functions concepts must all match that contract.

### Claude's Discretion
- Exact step lists, IDs, captions (EN/DE, minimal), durations and easing per concept.
- The exact base curve (e.g. a spline through hand-picked points), its x/y range, and landmark positions.
- The four new param color tokens for a, b, c, d: distinct from the existing θ/point/cos/sin/radian/tan/sec/csc/cot tokens and checked for color-blind safety.
- The predict moments for Stretches & reflections and Combine (Shifts is fixed by F-11).
- Slider ranges and snapping to friendly values (integers, halves), and how handles look and where they sit.
- Layout (single graph with the side panel is the default; switch to the 'below' layout if sliders need the width) and phone behavior.
- Catalog placement: after the four trig concepts, replacing the "Functions" Soon card. Slugs and thumbnails.

## Canonical References

- `.planning/ROADMAP.md`: Phase 3 goal and success criteria
- `.planning/REQUIREMENTS.md`: FUNC-01..05, MOD-01..03
- `.planning/phases/02-trigonometry-complete/02-CONTEXT.md` and `02-UI-SPEC.md`: conventions and visual language to keep
- `.planning/research/SUMMARY.md`: Phase 3 notes (asymmetric base curve, "input must be earlier", contract extraction)

## Existing Code Insights

- Concepts are folders under `src/concepts/<category>/<id>/` (index.ts manifest, step-ids.ts, steps.ts, view.ts, formulas.ts, Scene.svelte, Panel.svelte, runtime.ts, messages/{en,de}.json), discovered by `import.meta.glob`. The generic route and `ConceptPage` (Phase 2, Plan 01) already need no shell edits per concept. Phase 3 freezes and documents that contract.
- Reusable: Stage, CircleBase, PanelPair and the 'below' layout, DragPoint/TrackPoint, curve sampling (`sine-cosine-graphs/graph.ts`), trails, hover linking (`src/lib/link`), predict pauses (`PredictPrompt`, `GuessMarker`), NextLink, ChipButton, SegmentedToggle, KaTeX `Tex` with `\htmlClass` terms.
- e2e specs import `test` from `e2e/helpers/test` (waits for hydration). Zero-width/height SVG lines need a hit rect to count as visible in Playwright.
