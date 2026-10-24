# Authoring a concept

A concept is one folder. Adding the folder is all it takes for it to appear in the catalog and get prerendered pages in every locale. You never edit the shell.

```bash
npm run new-concept -- high-school/my-concept --title "My concept" --title-de "Mein Konzept"
npm run dev   # open http://localhost:5173/en/high-school/my-concept/
```

The script copies `scripts/templates/concept/`, which is a working two-step concept (a line you can tilt). It fills in the id, the message prefix (the initials of the id, or `--prefix xx`) and the catalog order (last in its category). It also registers the message files. Then you edit the pieces below.

## The folder contract

`scripts/concept-contract.test.ts` checks this for every concept.

| File | Exports | Role |
|------|---------|------|
| `index.ts` | `default: ConceptManifest` | The catalog entry: `id` (= folder), `category` (= parent folder), `path`, `order`, `title`, `hook`, `stepIds`, `thumbnail`. It is loaded eagerly, so keep it tiny. |
| `step-ids.ts` | `STEP_IDS`, `StepId` | Step ids in order. They are URL segments (`/en/high-school/my-concept/<step>/`), so keep them stable, lowercase and English. |
| `steps.ts` | `STEPS`, `POLICY`, `stepDefaults`, `initialUser`, the user type | Durations, the predict pause, and what the student can drag. |
| `view.ts` | `view(t, user)`, the view type | The animation schedule. |
| `runtime.ts` | `default: ConceptRuntime` | Ties it together. It is loaded lazily when the page opens. |
| `Scene.svelte` | `SceneProps` | The stage visual. |
| `Panel.svelte` | `PanelProps` | Counter, title, caption, formulas and controls. |
| `Thumbnail.svelte` | — | Card art, a 160×90 SVG using color tokens. |
| `messages/{en,de}.json` | — | All text. Every key starts with the concept's prefix (`xx_`). |
| `*.test.ts` | — | At least a view test. |

The types are documented in `src/concepts/types.ts`.

## The model: everything is a function of time

The player owns one number, `t` (seconds). Scrubbing, deep links and Play all just set `t`.

- **`view(t, user)` is pure.** It computes every opacity and every animated value from `t` alone, never from frame history. Use `locate(STEPS, t)` to get the step `i` and its progress `p`, then `seg(p, a, b)` and `easeMath` to shape fades. This is why scrubbing backward works for free.
- **Continuity:** every value must match on both sides of a step boundary. The template's view test checks this, so keep that test.
- **Dragged values win.** A user param is `null` while the animation drives it and a number once the student drags it. In the view: `k: user.k ?? scheduled`.
- **`POLICY`:** `restage` resets a param from `stepDefaults` when a step is entered; `keep` carries it over. Restage gives every step a predictable start.
- **Interaction:** call `oninteract()` on every drag or key step (Scene) and on every slider or chip use (Panel). It pauses playback and hands control to the student.
- **"Animate, then hand over":** play stops at the end of each step. The student can drag at any time.

## Predict moments (optional)

Add `pause: seconds` to one step in `STEPS`. Playback stops there, the Play button reads "Reveal", and Scene and Panel get `predict.phase` (`'before' | 'awaiting' | 'after'`). Use `GuessMarker` for the guess and `PredictPrompt` for the question. Nothing of the answer may show before the pause; test it. Deep links and scrubbing never block.

## Text

- Write keys as `xx_step_<id>_title` and `xx_step_<id>_caption`. Captions are capped at 18 words in English and 25 in German (`npm run check:i18n`).
- No UI words inside components. Math notation (`f(x)`, `x²`) is not text and can live in a `notation.ts`.
- Use the locale-aware number helpers: `fmt` from `#lib/engine/format.ts`, and `num` / `texNum` inside TeX.

## Visuals and formulas

- Draw with plain SVG inside `<Stage>`. For function graphs, use `#lib/graph`: `viewport`, `GraphAxes`, `FunctionPlot`, `DragHandle`, `CurveDrag`, `Landmark`, `RubberGrid`. Circles and trig live in `#lib/stage` and `#lib/trig`.
- Colors come only from tokens in `src/lib/styles/tokens.css`; a test rejects hex literals. If a new token appears on screen together with others, test that it stays distinguishable for color-blind users (see `tokens.test.ts`).
- For formulas, use `<Tex src>` with `\htmlClass{t-<color> link-<role>}{…}` on terms. Put `{...linkAttrs(role)}` on the matching SVG group and `linkOpacity(role, link.id)` on what should dim. Hovering then links term and visual both ways. Roles are a closed list in `src/lib/link/ids.ts`, and each needs a name in `roles.ts`.

## Tests

- **Unit:** cover `view` (continuity, values at step ends, opacities within [0, 1]) and any pure math you add.
- **e2e:** add `e2e/<id>.spec.ts`, importing `test` from `./helpers/test` (it waits for hydration), and assert on `data-*` attributes rather than pixels. Running Playwright in parallel sessions? Set `E2E_PORT` so the servers don't collide.
- **The catalog order test** in `e2e/catalog.spec.ts` lists every live concept, so add yours there.
