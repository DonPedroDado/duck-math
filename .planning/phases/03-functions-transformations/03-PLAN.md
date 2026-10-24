# Phase 3: Functions & Transformations - Plan

**Written:** 2026-10-24 (without the GSD workflow)
**Decisions:** `03-CONTEXT.md` (F-01 … F-14)
**Requirements:** FUNC-01 … FUNC-05, MOD-01 … MOD-03

Seven slices, built and merged in order. Each one ends green: `npm run check`, `npm test` and `npx playwright test` all pass. Slices 3–5 are the three concepts. Each is playable on its own as soon as it lands.

| # | Slice | Delivers | Requirements |
|---|-------|----------|--------------|
| 1 | Contract & message auto-discovery | No shell edits to add a concept, frozen types | MOD-01, MOD-02 |
| 2 | Graph toolkit | Shared pure math + SVG primitives for function graphs | (enables FUNC-*) |
| 3 | Shifts | Concept 1 | FUNC-01, FUNC-02 |
| 4 | Stretches & reflections | Concept 2 | FUNC-03, FUNC-04 |
| 5 | Combine | Concept 3 | FUNC-05 |
| 6 | Template & authoring docs | `npm run new-concept`, AUTHORING.md, contract test | MOD-03 |
| 7 | Journey & review | Catalog order, Next chain, visual sign-off | all |

---

## Slice 1: Contract & message auto-discovery (MOD-01, MOD-02)

**Problem found while planning:** every concept's message files are listed by hand in `project.inlang/settings.json` (`pathPattern`). That is a shell edit per concept, which breaks MOD-02.

1. `scripts/i18n-paths.mjs`: globs `src/concepts/*/*/messages/` and returns the sorted pattern list (`./messages/{locale}.json` first). Running `--write` rewrites `pathPattern` in `project.inlang/settings.json` and leaves everything else untouched.
2. Wire it in front of everything that reads messages: `predev`, `prebuild`, the `paraglide` script (so `npm run check` gets it), and `prepare`.
3. `scripts/check-i18n.mjs` fails with a clear message when `settings.json` is out of date with the folders. This is a safety net for anyone who runs Paraglide directly.
4. `src/concepts/types.ts`: remove the "Provisional" notes and freeze `ConceptManifest`, `ConceptRuntime`, `SceneProps` and `PanelProps`. Keep the shape (all four trig concepts already satisfy it). Add doc comments for every field, because AUTHORING.md will point at them.
5. Catalog "Soon" cards: `UpcomingDef` gets an optional `replacedBy: string[]` of concept ids. `catalog` hides a Soon card once any of those concepts exists, so shipping a concept never needs a catalog edit. Set `functions.replacedBy = ['function-shifts']`.

**Tests:** unit test for the path list (fixtures dir) and for the stale-settings error. Unit test that a Soon card disappears when its concept is registered. The existing e2e still passes.

---

## Slice 2: Graph toolkit (`src/lib/graph/`)

Pure modules first (unit-tested), then thin SVG components.

**Pure (`*.ts` + `*.test.ts`):**
- `viewport.ts`: square math window, default x, y ∈ [−6, 6]. Gives `gx(u)` and `gy(v)` for the Stage size, plus the inverse, for drags. Equal aspect, so stretches look honest.
- `base.ts`: the base curve f (F-04), a smooth spline through hand-picked points (monotone cubic or Catmull-Rom).
  - **Shape constraints:** the peak is higher than the valley is deep, nothing sits at x = 0, f(0) ≠ 0 (so the fixed point of f(bx) is visible), and there is one clear zero crossing between peak and valley. It flattens gently toward the edges.
  - **Exports:** `f(x)`, its domain, and `LANDMARKS = { peak, valley, zero, yInt }`.
  - **Alternate bases for explore (F-06):** `x²`, `√x` (domain x ≥ 0), `2ˣ`, `sin x`. Each has its own landmarks and a domain the sampler respects.
- `transform.ts`: `Params = { a, b, c, d }`, `g = (p, f) => x => a·f(b(x−c))+d`. Also:
  - `mapPoint(p, [x, y])` gives `[x/b + c, a·y + d]`, for landmarks and arrows.
  - `lookupSource(p, x)` gives `b(x−c)`, the input f is read at (F-11).
  - `b = 0` degenerates to the constant a·f(0)+d. This is defined, never NaN.
- `grid.ts`: rubber-sheet grid lines (F-10). The vertical line x = k maps to x = k/b + c and the horizontal line y = k maps to y = a·k + d. Lines fully off-screen are culled. When b → 0, vertical lines run off to infinity and are culled; they are not drawn at huge coordinates.
- `sample.ts`: domain-aware sampling into path segments that break where f is undefined or leaves the window by a margin, so there are no spikes. Reuses `curvePath` from `sine-cosine-graphs/graph.ts` (move that file to `src/lib/graph/` and re-export it from the old path).
- `tex.ts`: formula builder for `a·f(b(x−c))+d` with colored `\htmlClass` terms and link roles `a b c d`. Identity terms are hidden (a = 1, b = 1, c = 0, d = 0), signs read naturally (x − (−2) shows as x + 2, with an explicit `f(x+2) = f(x-(-2))` line used by Shifts), and numbers are locale-aware.

**Components (`*.svelte`):**
- `FunctionPlot.svelte`: path for a sampled function; `ghost` variant (dashed, dim); glow while animating.
- `RubberGrid.svelte`: draws `grid.ts` lines. `fixedAxis: 'x' | 'y' | null` makes the unchanged axis glow.
- `Landmark.svelte`: dot + label; optional arrow from the ghost position to the new one.
- `LookupArrows.svelte`: for sample x values, an arrow from (x, g(x)) back to (b(x−c), f(…)) on the ghost (F-11).
- `DragHandle.svelte`: generic pointer + keyboard drag on one or two axes, with ARIA slider semantics. Built from the `DragPoint` patterns (pointer capture, oninteract, no snap on keys), but in plane coordinates instead of an angle. Also used to drag the whole curve (wide transparent hit stroke).
- `ParamSlider.svelte` (`src/lib/ui/`): colored panel slider with a label term, a range, snapping to friendly values (0.5 steps; snap on pointer, fine steps on keys) and a live number. Keyboard and ARIA complete.

**Tokens:** `--c-pa`, `--c-pb`, `--c-pc`, `--c-pd` in `tokens.css`, plus classes `t-a … t-d`. Extend `tokens.test.ts`: contrast on `--bg`, and color-blind distance from each other and from `--c-point` and `--c-guess`.
- **Palette risk:** seven hues are already taken. If four more distinct ones don't pass the color-blind check, the fallback is to pair vertical params (a, d) and horizontal params (b, c) by hue family, distinguished by lightness, and say so in the formula.

**Link ids:** add `a b c d f ghost` to `LINK_IDS`.

**Tests:** unit tests for every pure module, including: landmark mapping equals g at mapped points (property check over random params); the `lookupSource` round trip; grid at identity equals the plain grid; b → 0 and a → 0 give no NaN.

---

## Slice 3: Shifts (`high-school/function-shifts`, prefix `sh_`, order 5)

**Steps (~13 s total)**, layout `side`:

| id | What happens | Student can drag |
|----|--------------|------------------|
| `intro` | Axes, then f draws on, then landmarks (peak, valley, zero) pop in. Caption: this is f. | nothing yet (hint at end) |
| `vertical` | d animates 0 → 2. Ghost f stays, landmark arrows point straight up. The `+d` term lights up. | curve up/down, d slider |
| `predict` | Shows `f(x+2)`. **Predict pause:** "Which way does the graph move?" Guess marker on the ghost peak, horizontal only. Reveal → c animates 0 → −2. | guess marker, then c |
| `lookup` | Lookup arrows for 3–4 new-graph points: to get g at x, f is read at x + 2. The line `f(x+2) = f(x-(-2))` ties it to c. | c slider (arrows follow) |
| `horizontal` | Free c. Arrows on landmarks. | curve sideways, c slider |
| `both` | c and d together. The curve drags freely in 2D. | curve in 2D, both sliders |

- **Policy:** c and d `restage` per step (each step starts from its own defaults), `moved` `keep`.
- **Panel:** step counter, title, caption, formula (`g(x) = f(x−c)+d` with live numbers), sliders for the params active in the step, NextLink.
- **Thumbnail:** move `FunctionsThumb` here (or redraw it from the real f).
- **e2e (`e2e/function-shifts.spec.ts`):** catalog card in position 5; the predict flow (awaiting → Reveal → after); deep link to `lookup` never blocks; dragging the curve changes d and the readout; slider keyboard steps; hover `c` term dims other roles; DE labels.

---

## Slice 4: Stretches & reflections (`high-school/function-stretches`, prefix `sr_`, order 6)

| id | What happens | Student can drag |
|----|--------------|------------------|
| `intro` | Recap: f, its landmarks and the grid. | — |
| `vertical` | a animates 1 → 2. The rubber grid stretches vertically, the x-axis glows, zeros are marked fixed, and arrows run from the x-axis outward. | peak/valley handles vertically, a slider |
| `horizontal` | **Predict pause:** "f(2x): wider or narrower?" Guess marker on the peak's new x. Reveal → b animates 1 → 2. The grid squeezes horizontally, the y-axis glows and the y-intercept is fixed. | handles horizontally, b slider |
| `reflect-x` | a animates 1 → 0 → −1, slowly through 0: the curve flattens onto the x-axis and the grid squashes flat, then both flip. The mirror line (x-axis) appears and the result is named −f(x). | a slider and handle through 0 |
| `reflect-y` | Same for b with the y-axis, named f(−x). | b slider and handle through 0 |
| `explore` | a and b free, ghost and grid on. | both handles, both sliders |

- **Handles:** dragging a landmark vertically sets a = (y − d)/y₀; dragging it horizontally sets b = x₀/(x − c). Clamp to the slider range, and allow crossing 0 continuously. When a handle hits 0, the curve sits flat and the handle stays grabbable on the axis.
- **e2e:** predict flow; a slider through 0 flips the sign of the peak's y and shows the mirror line; fixed points stay put under a and b; deep links.

---

## Slice 5: Combine (`high-school/function-combine`, prefix `cb_`, order 7)

| id | What happens |
|----|--------------|
| `intro` | The full formula `a·f(b(x−c))+d` with all terms dim. |
| `build-c` | c = 2 applied. Its term lights up and the curve shifts. |
| `build-b` | b = 2 applied on top, with the grid. |
| `build-a` | a = −1.5 applied (a reflection inside the combination). |
| `build-d` | d = 1 applied. All four terms are lit. |
| `order` | **Predict pause:** "where does the peak of f(2x−1) land?" Reveal: two curves, f(2(x−1)) and f(2x−1), each with its own ghost. The panel shows f(2x−1) = f(2(x−½)), so c = ½, not 1. |
| `explore` | All four sliders and handles, plus base-curve chips: f, x², √x, 2ˣ, sin x (F-06). |

- Each `build-*` step keeps the earlier params (`keep` within the build-up), so scrubbing back undoes them one at a time.
- **e2e:** each build step's lit term matches its param; the order predict flow; base-curve chips change the plotted curve (√x breaks cleanly at x < 0); deep links.

---

## Slice 6: Template & authoring docs (MOD-03)

- `scripts/templates/concept/`: a minimal working concept with a 2-step `intro` → `explore`, one draggable point, a formula line, EN/DE messages and one view test. The placeholders are `__ID__`, `__PREFIX__`, `__CATEGORY__` and `__ORDER__`. It lives outside `src/concepts/`, so the registry glob never picks it up.
- `scripts/new-concept.mjs <category>/<id> [--prefix xx] [--title "…"]`: validates the slug and prefix (no clash with existing message keys), copies the template, fills in the placeholders, puts `order` after the last concept, and runs `i18n-paths --write`. It prints the URL to open. `npm run new-concept` points at it.
- `src/concepts/AUTHORING.md`: folder contract (required files and what each exports), the step/view/policy model ("view reads only t", keep vs restage, predict pauses), message key conventions and word budgets, hover-link roles, test expectations, and a walkthrough of the template.
- `scripts/concept-contract.test.ts`: every concept folder has the required files, its `index.ts` path matches the folder, `stepIds` equal `step-ids.ts`, and EN/DE message files exist. This enforces "Trig and Functions follow the same contract" (success criterion 4).
- **Test of the scaffold:** vitest runs the script with `--out <tmpdir>` and checks the files and placeholders. An e2e smoke test, run manually and noted in the docs: scaffold, build, the card appears, then delete.

---

## Slice 7: Journey & review

- Extend `e2e/catalog.spec.ts` order to 7 live cards (4 trig + 3 functions) and 2 Soon cards (Limits, Derivatives).
- Extend `e2e/trig-journey.spec.ts` (or a new `functions-journey.spec.ts`) so the Next chain continues: Identities → Shifts → Stretches → Combine → catalog. Also check one predict moment per concept and hover linking for a/b/c/d.
- Full suite green, then your visual review on desktop and phone, in EN and DE.

---

## Risks & open points

- **Palette crowding** (slice 2): there is a fallback plan; decided by the color-blind test, not by eye.
- **Dragging the curve vs dragging a handle** on touch: handles take priority, and the curve drag uses a wide invisible stroke. Check on a phone in slice 3 before copying the pattern.
- **b → 0** gets visually extreme (grid lines fly off). The animation passes through 0 quickly, b is clamped to ±0.1 while dragging, and the slider jumps across 0 without resting there.
- **Message budget:** captions stay within the existing word limits (EN 18, DE 25), which `check-i18n` enforces.
