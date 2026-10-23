# Architecture Research

**Domain:** Modular interactive math-visualization web app (concept modules, guided scrubbable steps, live draggable visuals)
**Researched:** 2026-10-24
**Confidence:** MEDIUM. The structural recommendations come from well-established patterns (Mafs, JSXGraph, Desmos, Explorable Explanations, Motion Canvas/Manim-web). I did not verify library versions or APIs against Context7 or official docs in this pass. Verify versions at scaffold time.

## Recommendation in One Paragraph

Build a TypeScript single-page app (Vite) that is a static bundle. The shell knows only a `ConceptModule` contract and a registry built with `import.meta.glob`. Each concept is a folder exporting a `defineConcept({...})` object: a typed parameter schema, a pure `derive()` function, a `scene()` that renders primitives from params, and an ordered list of `steps`. Each step is a state target plus a layer visibility plan. The player owns a single `t` (timeline position). User drags write directly to the parameter store. Steps are keyframes for params, not scripts, so scrubbing and dragging use the same store. Visual primitives are thin SVG components, not a heavy graphing library. LaTeX is rendered with KaTeX, with color tokens bound to the same palette the primitives use. Text lives in per-concept locale files, loaded lazily. Output is `dist/` on any static host.

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           SHELL (stable)                         │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ Router   │ │ Catalog / │ │ Language   │ │ Layout / theme │   │
│  │          │ │ Home UI   │ │ switcher   │ │ (dark, tokens) │   │
│  └────┬─────┘ └─────┬─────┘ └─────┬──────┘ └───────┬────────┘   │
│       │             │             │                │            │
├───────┴─────────────┴─────────────┴────────────────┴────────────┤
│                      CONCEPT REGISTRY                            │
│   import.meta.glob('/src/concepts/**/index.ts')  → manifest      │
│   (metadata eager, module body lazy)                             │
├─────────────────────────────────────────────────────────────────┤
│                       CONCEPT RUNTIME (engine)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ Player/      │  │ Param store  │  │ Step resolver         │  │
│  │ transport UI │→ │ (reactive)   │← │ (t → step, progress,  │  │
│  │ play/scrub   │  │ + overrides  │  │  targets, layer vis.) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────────┘  │
│         │                 │                                      │
│  ┌──────┴─────────────────┴──────┐   ┌──────────────────────┐   │
│  │ Scene host (viewport, coord   │   │ Text panel + i18n    │   │
│  │ transforms, pointer/drag)     │   │ (step caption, KaTeX)│   │
│  └──────────────┬────────────────┘   └──────────────────────┘   │
├─────────────────┴───────────────────────────────────────────────┤
│                      PRIMITIVES LIBRARY (shared)                 │
│  Axes · Grid · UnitCircle · FunctionPlot · Point(Draggable) ·    │
│  Segment · Ray · AngleArc · Label · TeX · Trace · Slider · Area  │
├─────────────────────────────────────────────────────────────────┤
│                      CONCEPT MODULES (content)                   │
│  trig-unit-circle/  functions-transformations/  limits/          │
│  derivatives/  ... (each: params, derive, scene, steps, locales) │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Router | Maps URL to catalog or concept (and optional step) | `react-router` (or equivalent) with category/slug routes |
| Registry | Discovers concepts at build time; exposes metadata (id, category, titleKey, order) and a lazy `load()` | `import.meta.glob` (metadata eager, concept body lazy) |
| Concept contract | Types + `defineConcept()` helper; the only thing the shell depends on | TypeScript interfaces, validated at dev time |
| Player | Owns `t` (0..total), play/pause/step/scrub, speed; drives the clock via `requestAnimationFrame` | Small custom store + transport component |
| Param store | Single source of truth for live parameters (angle, a, h, x0...), plus per-param ownership | Signals/Zustand-style store, one per concept instance |
| Step resolver | Pure function: `(steps, t) → {stepIndex, localProgress, targets, layerVisibility}` | Pure TS, unit-tested |
| Scene host | Provides SVG viewport, math-to-pixel transforms (`Coords`), pointer capture, resize | React component + context |
| Primitives | Stateless renderers of geometry from props; draggables report intents upward | SVG React components |
| TeX | Renders KaTeX with named color tokens bound to palette | KaTeX `\htmlClass` / `\color` with token map |
| i18n | Namespaced messages per concept, lazy-loaded; shell namespace separate | i18next or a small custom loader; ICU only if plurals needed |
| Build/deploy | Static bundle plus prerender or SPA fallback | Vite build, GitHub Pages/Cloudflare Pages/Netlify |

## Recommended Project Structure

```
src/
├── shell/                    # app chrome; never imports from concepts/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── Catalog.tsx           # category lists built from registry
│   ├── ConceptPage.tsx       # mounts runtime for one concept
│   └── LanguageSwitcher.tsx
├── core/                     # concept-agnostic engine (no math content)
│   ├── contract.ts           # ConceptModule, Step, ParamDef types + defineConcept()
│   ├── registry.ts           # import.meta.glob → manifest
│   ├── player/               # clock, transport UI, t store
│   ├── params/               # param store, ownership/override logic, tween
│   ├── steps/                # resolveStep(), keyframe interpolation (pure)
│   ├── scene/                # SceneHost, Coords, drag hooks
│   └── i18n/                 # setup, loader, useConceptT()
├── primitives/               # shared visual library (math-aware, content-free)
│   ├── Axes.tsx  Grid.tsx  UnitCircle.tsx  FunctionPlot.tsx
│   ├── Point.tsx  DraggablePoint.tsx  Segment.tsx  AngleArc.tsx
│   ├── TeX.tsx  Label.tsx  Trace.tsx  Area.tsx
│   └── palette.ts            # semantic color tokens (sin, cos, tan, angle, ...)
├── math/                     # pure helpers: sampling functions, numeric derivative,
│                             # limits sampling, angle conversions, clamp/snap
├── concepts/                 # one folder per concept, grouped by category
│   ├── high-school/
│   │   ├── trig-unit-circle/
│   │   │   ├── index.ts      # defineConcept({...}) default export
│   │   │   ├── params.ts     # param schema
│   │   │   ├── derive.ts     # pure: params → derived geometry/values
│   │   │   ├── Scene.tsx     # composes primitives from params + derived
│   │   │   ├── steps.ts      # step list (targets, layers, captionKey)
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       └── de.json
│   │   ├── functions-transformations/
│   │   ├── limits/
│   │   └── derivatives/
│   └── university/           # reserved, empty at first
└── styles/                   # tokens (dark theme), global css
```

### Structure Rationale

- **shell/ vs core/ vs concepts/:** enforce a one-way dependency: `concepts → primitives, core, math`; `shell → core`; nothing imports from `concepts` except `registry.ts` via glob. Add a lint rule (eslint `no-restricted-imports` or dependency-cruiser) so the "adding a concept never touches the shell" requirement is enforced, not just intended.
- **primitives/ separate from core/:** primitives are content-aware (math), core is not. Keeps the engine reusable for the University category.
- **Category is a folder plus a metadata field.** Folder gives organization; `meta.category` is the source of truth the catalog reads. University is "add a folder", not a code change.
- **Locales co-located with concept:** a contributor adds a concept and its translations in one directory; lazy-loaded so each concept page only ships its own language file.

## Architectural Patterns

### Pattern 1: Concept contract with a registry (build-time discovery)

**What:** Each concept default-exports a declarative object. The shell sees only metadata until the user opens the concept.
**When to use:** Always; this is the platform's backbone.
**Trade-offs:** Glob-based discovery is zero-config but makes ordering implicit, so use an explicit `meta.order`. A typed contract catches mistakes at compile time.

```typescript
// core/contract.ts
export interface ConceptMeta {
  id: string;                 // 'trig-unit-circle' (also URL slug)
  category: 'high-school' | 'university';
  order: number;
  titleKey: string;           // i18n key within concept namespace
  summaryKey?: string;
  thumbnail?: string;
}

export interface ParamDef<T = number> {
  default: T;
  range?: [number, number];   // clamps user drag
  snap?: number | ((v: T) => T);
}

export interface Step<P> {
  id: string;
  captionKey: string;               // text lives in locale files
  duration: number;                 // seconds of timeline this step occupies
  targets?: Partial<P>;             // state the params animate TO on entering this step
  layers: string[];                 // which scene layers are visible
  draggable?: (keyof P)[];          // which params the user may grab in this step
  ease?: 'inOut' | 'linear';
}

export interface ConceptModule<P extends Record<string, number>> {
  meta: ConceptMeta;
  params: { [K in keyof P]: ParamDef<P[K]> };
  derive?: (p: P) => Record<string, unknown>;   // pure, no side effects
  Scene: React.FC<SceneProps<P>>;               // receives params, derived, layerVis, bindDrag
  steps: Step<P>[];
  locales: Record<string, () => Promise<{ default: Messages }>>;
}
export const defineConcept = <P extends Record<string, number>>(c: ConceptModule<P>) => c;

// core/registry.ts
const metas = import.meta.glob('/src/concepts/**/index.ts', { import: 'default' }); // lazy
```

Note: for metadata-only catalog rendering without loading the full module, export `meta` as a named export and glob it eagerly (`import: 'meta', eager: true`) while the default export stays lazy.

### Pattern 2: Parameters as reactive state; steps as keyframe targets (core scene/state model)

**What:** The truth of the scene is a small vector of numeric parameters (`theta`, `a`, `h`, `x0`...) plus the timeline position `t`. Everything drawn is a pure function of `(params, derived, layerVisibility)`. A step does not script drawing; it declares the parameter values it wants and which layers show. Dragging writes the same parameters the timeline writes, so the visual is automatically live at every step.

**How timeline and user drag coexist (recommended rule set):**

1. Every param has an owner at any moment: `timeline` or `user`.
2. Playing or scrubbing across a step boundary: the resolver computes the target for the step being entered. Params move from the previous step's resting value to the new target via an eased tween over that step's `duration` (progress is a pure function of `t`, so scrubbing is deterministic and reversible).
3. Pointer-down on a draggable param: ownership flips to `user`. Any in-flight tween for that param is cancelled. The player auto-pauses (configurable) so the animation does not fight the finger.
4. While the user owns a param, timeline progress does not write it. Layer visibility and other presentation (draw-on progress, opacity) still follow `t`, because those are timeline-only and never user-touched.
5. Crossing a step boundary (play or scrub) releases user ownership: params resume tweening to the new step's targets. This is the simple, predictable rule ("moving to another step re-stages the scene"). A "keep my value" alternative is possible per step by omitting that param from `targets`, which leaves it where the user left it.
6. Scrubbing backward re-resolves from step start state: to keep scrubbing pure, compute a step's start value as the previous step's targets (a fixed chain), not from "whatever the user did". User overrides are stored separately and simply layered on top while ownership is `user`.

```typescript
// core/steps/resolve.ts (pure, unit-testable)
export function resolve<P>(steps: Step<P>[], t: number, base: P) {
  const { index, local } = locate(steps, t);              // local in 0..1
  const from = restingState(steps, index - 1, base);      // chain of targets
  const to   = { ...from, ...steps[index].targets };
  const p    = ease(steps[index].ease, local);
  return {
    index, local,
    params: lerpParams(from, to, p),                      // timeline value
    layers: new Set(steps[index].layers),
    draggable: steps[index].draggable ?? [],
  };
}

// core/params/store.ts
// effective(p) = owner[p] === 'user' ? userValue[p] : timelineValue[p]
// onSteChange(): owner[*] = 'timeline'
```

**When to use:** Anything where "explain it" and "let me play with it" must be the same view. This is the dominant model in interactive explorables.
**Trade-offs:** Numeric-parameter keyframes cover this project's v1 (angle, shift, stretch, x0, h). Concepts needing discrete structural changes (e.g. add/remove objects) handle them via `layers`, not params. If a later University concept needs non-numeric state (vectors, matrices), generalize `lerpParams` to a per-param interpolator `ParamDef.lerp`.

### Pattern 3: Pure derive layer between params and rendering

**What:** `derive(params)` computes all dependent quantities (sin, cos, tan, secant slope, tangent line, limit table values). Scene components only draw.
**When to use:** Always.
**Trade-offs:** Keeps math testable (Vitest on `derive`), and lets caption text embed live values (for example "sin θ = 0.71"). Slight indirection for trivial concepts.

### Pattern 4: Primitives as stateless SVG with a shared coordinate context

**What:** `SceneHost` supplies `Coords` (`toPx`, `toMath`, viewBox, scale) via context. Primitives take math-space props, so they never do pixel math. Draggable primitives call `onDrag(mathPos)`; the concept maps that into a param (for example `theta = atan2(y, x)` for a point constrained to the circle).

```tsx
<Scene>
  <Axes xRange={[-1.5,1.5]} yRange={[-1.5,1.5]} />
  <UnitCircle />
  <AngleArc theta={p.theta} color="angle" label={<TeX>{'\\theta'}</TeX>} />
  <Segment from={[0,0]} to={[d.cos, d.sin]} />
  <Segment from={[d.cos,0]} to={[d.cos,d.sin]} color="sin" />
  <DraggablePoint pos={[d.cos,d.sin]} constrain="circle" onDrag={setTheta} />
</Scene>
```

**Why SVG, not Canvas/WebGL:** v1 scenes are tens of elements and a handful of sampled curves. SVG gives crisp scaling, accessible DOM, free hit-testing, easy CSS theming and KaTeX interop (via `foreignObject` or overlaid HTML). Reserve Canvas for a specific high-sample primitive later (for example dense plot). Primitives hide the renderer, so swapping is local. Optionally evaluate Mafs (React/SVG) or JSXGraph as primitive internals, but own the primitive API so the concept contract does not leak a third-party library.

### Pattern 5: Semantic color tokens linking math and visual

**What:** `palette.ts` defines tokens (`sin`, `cos`, `tan`, `angle`, `fx`, `tangent`, `delta`). Primitives take `color="sin"`. The `TeX` component accepts the same tokens: `<TeX tokens={{sin:'sin'}}>{'\\tok{sin}{\\sin\\theta}'}</TeX>` is expanded to KaTeX `\textcolor{var-resolved}{...}` (KaTeX macros or `\htmlClass` with CSS variables so colors follow the theme). Locale strings may embed `$...$` TeX with `\tok{}` markers so translators keep the color links.
**Trade-offs:** Needs a tiny preprocessor and a KaTeX `trust`/macro configuration for `\htmlClass`; keep it in one file (`TeX.tsx`).

### Pattern 6: Text and i18n pipeline

**What:** Shell strings in a `shell` namespace; each concept owns a namespace (its `locales/*.json`), loaded lazily by `ConceptPage`. Steps reference `captionKey` only. Math in text: strings may contain inline TeX and `{{value}}` interpolations fed from `derive()`. Number formatting uses `Intl.NumberFormat(locale)` (decimal comma in German). Fallback: English; a dev-time script (or test) checks every concept has every key in every enabled language and warns about orphan keys.
**Trade-offs:** i18next brings plural/interpolation for free; a custom ~50 line loader is enough if only simple interpolation is needed. Recommend i18next (plus `react-i18next`) for maturity, with namespaces per concept. Keep TeX itself language-neutral and put only words in translations.

### Pattern 7: Routing and deep links

**What:** Routes: `/` (catalog), `/:lang?/:category/:conceptId`, optional `?step=derive-3` or hash `#step-3` for sharing a specific step. Language either in path prefix (`/de/...`, better for SEO and sharing) or stored preference.
**Static hosting concern:** SPA fallback required (`404.html` copy of `index.html` on GitHub Pages, `_redirects` on Netlify/Cloudflare). Hash routing avoids this at the cost of ugly URLs and no SEO. Recommend history routing plus fallback. If SEO matters later, prerender the catalog and concept shells (vite-ssg or similar); not needed for v1.

## Data Flow

### Interaction flow (the core loop)

```
 pointer-down/drag on primitive          transport: play / scrub / step
          │                                         │
          ▼                                         ▼
  onDrag(mathPos) → concept maps          Player.setT(t)  (rAF clock when playing)
  to param value (clamp/snap)                       │
          │                                         ▼
          ▼                                 resolve(steps, t) [pure]
   ParamStore.setUser(p, v) ─────────┐        │ index, local, timeline params,
   (owner[p]='user', maybe pause)    │        │ layers, draggable
                                     ▼        ▼
                              effective params = user override ⊕ timeline
                                     │
                                     ▼
                              derive(params) [pure]
                                     │
                       ┌─────────────┴───────────────┐
                       ▼                             ▼
                 Scene (primitives)          Caption (t(captionKey, derived))
                 re-render SVG                + KaTeX
```

### State Management

```
  Player (t, playing, speed) ──► resolve() ──► timeline params ─┐
                                                                ├─► effective params ─► derive ─► render
  Pointer drags ──► ParamStore user overrides (per-param) ──────┘
  Step boundary crossing ──► clears user overrides (ownership → timeline)
```

State is per concept instance (created on mount, destroyed on unmount); there is no global concept state. The only global state is language and (optionally) reduced-motion preference.

### Key Data Flows

1. **Catalog:** build-time glob → manifest of metas → grouped by category → rendered with `t(titleKey)` loaded from each concept namespace (or a metadata title map to avoid loading every concept's locale for the catalog; recommend a small `meta` locale file per concept for the catalog).
2. **Open concept:** route → registry `load(id)` → dynamic import of concept chunk plus locale chunk → runtime mounts with param defaults → `t=0`.
3. **Scrub:** slider input → `setT` → `resolve` → params → render. Pure and idempotent, so any `t` can be jumped to (needed for deep-linked steps).
4. **Drag:** pointer event → coordinate inverse transform → concept constraint → store → derive → render. Does not go through the player except to pause it.
5. **Language change:** i18n language set → concept namespace re-fetched if needed → captions and TeX labels re-render; scene unaffected.

## Build Order (dependency-driven)

1. **Scaffold and tooling:** Vite + TS + lint rules for the import boundary + Vitest + deploy pipeline to a public static URL on day one (proves static deployment early, and catches SPA fallback issues).
2. **Contract + registry + routing + shell stub:** `defineConcept`, glob registry, catalog, a trivial "hello" concept to prove "add a concept without touching the shell".
3. **i18n skeleton:** shell namespace and per-concept namespace loading, en + de, language switcher, the missing-key check. Done before real content so no text is ever hard-coded.
4. **Scene host + core primitives:** `SceneHost/Coords`, `Axes`, `Point`, `Segment`, `DraggablePoint` with constraint, `Label`, `TeX` with color tokens, palette and dark theme.
5. **Param store + step resolver + player (the state model):** pure `resolve` with unit tests; ownership/override rules; transport UI (play/pause/step/scrub); keyboard shortcuts; reduced-motion handling.
6. **First real concept: Trig / Unit Circle.** This forces `UnitCircle`, `AngleArc`, tan/sec segments, and the unrolling into a sine graph (`FunctionPlot`, `Trace`). Treat it as the contract's acceptance test; adjust the contract here, while there is only one consumer.
7. **Second concept: Functions and Transformations.** Exercises `FunctionPlot` with sampled expressions and several draggable params (a, h, k); proves reuse.
8. **Limits then Derivatives.** Add `Secant/Tangent`, one-sided approach markers, discontinuity glyphs (open/closed dots), `math/` numeric helpers (sampling with asymptote/discontinuity breaks). Derivatives reuses the Functions plot and the Limits approach mechanic (secant to tangent as `h→0`).
9. **Polish and hardening:** mobile touch targets, a11y (keyboard-draggable points, captions as live region), perf pass, thumbnails, SEO prerender if wanted, authoring docs and a `create-concept` generator script.

Primitives are extracted when a second concept needs them, but designed up front for the first concept's needs. Do not build the whole primitive library before concept 1.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 4 to ~30 concepts | Glob registry plus per-concept lazy chunks is enough. Manual `order` in meta. |
| 30 to 200 concepts | Add catalog search, tags, prerequisites graph in `meta`; subfolders per topic; CI check for locale completeness; shared-chunk review. |
| Heavy University content | Optional additional renderer primitives (Canvas/WebGL, Three.js for 3D) shipped as separate lazily imported packages; the contract stays the same. Consider generalizing params from numbers to typed values. |
| Traffic | Static CDN hosting; effectively no server scaling concern. |

### Scaling Priorities

1. **First bottleneck:** bundle size per concept page (KaTeX fonts, locale files). Fix with route-level code splitting, KaTeX subset fonts, and preloading only the active language.
2. **Second bottleneck:** render cost from dense SVG plots re-sampled every frame while dragging. Fix by memoizing samples on param identity, adaptive sampling, and a Canvas variant of `FunctionPlot`.

## Anti-Patterns

### Anti-Pattern 1: Imperative animation scripts per step

**What people do:** Write each step as a sequence of "animate this, then that" calls (Manim-style) and run them forward.
**Why it's wrong:** Scrubbing backward, jumping to a step, and dragging mid-animation all break; state diverges from the timeline.
**Do this instead:** Steps declare target states; the visual is a pure function of `(t, params)`. Only the tween engine moves values.

### Anti-Pattern 2: Two sources of truth (animation values vs drag values)

**What people do:** Keep a separate "animated position" and "dragged position" and try to reconcile.
**Why it's wrong:** Jumps, fighting animations, impossible-to-reason edge cases.
**Do this instead:** One param store with explicit ownership (Pattern 2).

### Anti-Pattern 3: Shell importing concept internals / concepts importing each other

**What people do:** Add a concept by editing a router list, a menu file, and a translations file.
**Why it's wrong:** Breaks the core requirement of "adding a concept doesn't touch the shell".
**Do this instead:** Registry discovery plus lint-enforced boundaries; shared stuff goes to `primitives/` or `math/`.

### Anti-Pattern 4: Hard-coded strings and baked-in LaTeX colors

**What people do:** Put English text and `\color{red}` inside components.
**Why it's wrong:** Retrofitting i18n is expensive (already noted in PROJECT.md); colors diverge from the visual.
**Do this instead:** Keys only in code; color tokens from `palette.ts` used by both primitives and TeX.

### Anti-Pattern 5: Heavy graphing library as the concept API

**What people do:** Build concepts directly on a third-party graphing lib's objects.
**Why it's wrong:** The contract then inherits its constraints and upgrade risk; unusual overlays (unrolling circle, linked colors) get awkward.
**Do this instead:** Own a small primitive API; use a library internally only if it saves real effort.

### Anti-Pattern 6: Putting animation timing in React state at 60 fps through the whole tree

**What people do:** Update `t` in top-level state, re-rendering the whole page every frame.
**Why it's wrong:** Jank, especially on mobile.
**Do this instead:** Fine-grained subscriptions (signals/selectors) so only the scene and transport scrubber update per frame; the caption updates only on step change.

### Anti-Pattern 7: Floating-point and domain naivety in plotting

**What people do:** Sample tan(x) or 1/x naively and connect the points.
**Why it's wrong:** Vertical-line artifacts at asymptotes; problem for tan, limits, discontinuities (core to this product).
**Do this instead:** `FunctionPlot` splits paths at non-finite values or large jumps and supports explicit holes (open dots) for removable discontinuities.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Static host (GitHub Pages / Cloudflare Pages / Netlify) | CI builds `dist/` and publishes | Needs SPA fallback; set `base` in Vite config if hosted under a subpath (GitHub Pages project sites) |
| KaTeX | Bundled npm dependency, fonts self-hosted | Prefer KaTeX over MathJax for speed; define color macros once |
| Analytics (optional) | Privacy-friendly script, no accounts | Out of scope for v1 unless wanted |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| shell ↔ core | Direct function/component imports | Shell uses registry, `ConceptRuntime` component |
| core ↔ concept | Contract object only (`defineConcept`) | Concepts never import shell; engine never imports concepts |
| concept ↔ primitives | Props in math coordinates; callbacks for drag intents | Primitives are stateless and content-free |
| concept ↔ i18n | Keys in `steps`; `useConceptT()` in `Scene` | Derived values interpolated into strings |
| player ↔ param store | Player sets `t`; `resolve` outputs timeline params into store; store merges overrides | Store clears overrides on step change |

## Sources

- Patterns synthesized from established interactive-math tooling and explorable-explanation practice (Mafs, JSXGraph, Desmos, GeoGebra, Motion Canvas, Bartosz Ciechanowski / Nicky Case style explorables). Not individually re-verified in this pass. Confidence MEDIUM.
- Vite `import.meta.glob` for lazy/eager module discovery: https://vite.dev/guide/features#glob-import (not re-fetched this session; verify at scaffold).
- KaTeX trust/macro/`\htmlClass` support: https://katex.org/docs/supported.html (verify before depending on `\htmlClass`).
- i18next namespaces and lazy loading: https://www.i18next.com/ (verify).

## Open Questions for Phase Research

- UI framework choice (React vs Svelte/Solid): this document assumes React + SVG for illustration; the architecture is framework-agnostic, but signal-style fine-grained updates (Anti-Pattern 6) favor Solid/Svelte or a signals store. Decide in STACK.md.
- Whether to ship per-language URL prefixes plus prerender for SEO in v1.
- Whether to allow a "keep my dragged value across steps" default instead of re-staging (UX test with the first concept).
- Touch and keyboard accessibility conventions for draggable primitives.

---
*Architecture research for: modular interactive math-visualization platform*
*Researched: 2026-10-24*
