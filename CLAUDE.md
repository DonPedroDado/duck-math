<!-- GSD:project-start source:PROJECT.md -->
## Project

**Duck Math**

Duck Math is a public math education web app that **visualizes concepts** so high school (and later university) students actually understand them. It is not a problem/exercise app and not a textbook: each concept is an animated, interactive visual explainer with short, minimal text alongside. The architecture is modular — the shell stays the same while new concept modules are added continuously.

**Core Value:** A student opens a concept and, through guided animated steps they can also grab and manipulate, *sees* why the math works — with only as much text as needed.

### Constraints

- **Interaction**: Visuals must render live in the browser and be manipulable at any step — rules out pre-rendered video as the primary medium.
- **Tech stack**: Python preferred but not required — best tool for interactive visuals wins.
- **Content**: Text minimal; the visual carries the explanation.
- **i18n**: English + German. Text externalized from day one; layouts must survive longer German strings.
- **Look**: It must look beautiful — polished 3Blue1Brown-style visuals are part of the core value, not an afterthought. User will try it and give feedback on problems.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Verdict on Python (stated plainly)
- **Manim / ManimCE in Pyodide:** Manim is a video renderer (Cairo/FFmpeg). Running it in Pyodide is not a supported path, and it would still emit frames or video, not a draggable scene graph. Already ruled out in PROJECT.md. (HIGH)
- **PyScript/Pyodide for the visuals:** it works technically, but it costs a ~10 MB+ runtime download and several seconds of cold start. Every drag would cross a Python-to-JS bridge, and you would still need a JS renderer (SVG/Canvas) to draw. All cost, no benefit for 60fps dragging. (HIGH on reasoning, MEDIUM on exact sizes)
- **Reflex / NiceGUI / Streamlit:** these are server-roundtrip frameworks (websocket or rerun). They need a live Python server, which breaks "static public deployment, no accounts". They also cannot do client-side 60fps drag or scrub. Reject. (HIGH)
- **manim-web (JS port, npm 0.40.0, MIT):** very active (modified 2026-10-23). It gives a Manim-like API in the browser, and its Typst peer deps suggest Typst is used for math. It is a young, single-maintainer project, and its animation model is "play a scripted animation", not "state is a function of params, and the user can drag anything". Treat it as an optional Phase-0 spike and not as the foundation. (LOW to MEDIUM)
- **Where Python can still help:** build-time only, for example generating precomputed data or checking formulas with SymPy. This is not needed for v1.
## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| TypeScript | **6.x (pin ~6.0)** | Language | `@sveltejs/kit` 3.1.0 peers `typescript ^6`. The registry's latest is 7.0.2, so do NOT take 7.x until Kit/svelte-check support it. (HIGH on the peer constraint) |
| Svelte | 5.57.x (runes) | UI and reactivity | Fine-grained reactivity (`$state`/`$derived`) fits "params drive everything": a drag mutates one `$state`, and only the affected SVG attributes and KaTeX spans update. There is no virtual DOM diff on 60fps drags, and the component syntax is compact for the many small concept authors will write. |
| SvelteKit | 3.1.x + `@sveltejs/adapter-static` 5.0.x | Routing, prerendering, static deploy | Prerenders every `/{locale}/{category}/{concept}` page to static HTML (works on GitHub Pages, Netlify or Cloudflare Pages) with no server. `import.meta.glob` gives the plugin-style concept registry. Peers `vite ^8.0.12`. |
| Vite | 8.3.x | Build/dev | Required by Kit 3. |
| `@sveltejs/vite-plugin-svelte` | 7.x | Svelte compile | Required peer of Kit 3. |
- **React (Next 16 / Vite):** the only thing React has that Svelte lacks here is **Mafs** (React-only). Mafs is excellent but its last release was 2025-03 (0.21.0), and it is a 2D plot-oriented API. Staying inside Mafs's limits (custom 3B1B styling, unit-circle unrolling, secant-to-tangent) would cost more than writing a small SVG layer. Next adds SSR and server concepts that this static site does not need.
- **Astro 7:** great for content sites and islands, but this app is almost entirely interactive islands sharing a timeline and params. Astro's value (mostly-static content) is low, and you would still pick an island framework (Svelte) inside it. SvelteKit alone is simpler.
- Confidence: MEDIUM-HIGH. This is a judgement call. React plus Mafs is the credible runner-up (see Alternatives).
### Rendering (the visual layer)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Plain SVG, rendered by Svelte components (own thin "Stage" library)** | n/a | All 2D visuals: axes, curves, unit circle, tangent lines, draggable points | SVG gives crisp scaling at any DPR, CSS styling for the dark 3B1B look (glow via `filter`, color via CSS variables), native pointer events for dragging (no hit-testing code), and DOM-based a11y. Concepts here (unit circle, graphs, secants) are tens to a few thousand elements, well within SVG's range. Build `<Stage>`, `<Axes>`, `<FunctionPlot>`, `<Point draggable>`, `<Segment>`, `<Arc>`, `<Label>` once, and every concept reuses them. |
| d3-scale, d3-shape, d3-interpolate, d3-ease | 3.x / 3.x / 3.x / 3.x (modular, from the d3 7.9.0 family) | Coordinate scales, path generation (`line`), color/number interpolation, easings | Use the small modules for math-to-pixel scales and path strings. Do NOT use D3's DOM selection or data-join: Svelte owns the DOM. (HIGH: d3 7.9.0 is stable and mature) |
| Canvas 2D (escape hatch only) | n/a | Dense plots (thousands of points, heatmaps) if SVG gets slow | Add per concept only when measured. Do not start with it. |
| three / PixiJS | skip for v1 | 3D and WebGL | The v1 concepts are all 2D. Revisit for the University category. (PixiJS is at 8.x, three at 0.186) |
### Animation / Timeline (guided steps + scrub + drag at any step)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **GSAP** | 3.15.x | Seekable timeline engine (play/pause/`seek`/`progress`/`timeScale`) | A GSAP timeline is deterministic and scrubbable: `tl.progress(x)` renders any frame. Per Webflow's 2025 acquisition announcement, the whole GSAP package, including plugins, became free for commercial use (verify the current license text before shipping). It animates plain JS objects, so it can tween the `$state` params object directly, not just DOM. (MEDIUM: license from memory, verify) |
| (Fallback) own ~150-line timeline | n/a | If GSAP licensing or size is a concern | Steps are `{from params -> to params, duration, easing}` tweened with d3-interpolate and d3-ease. Viable and dependency-free. |
| Motion Canvas / Remotion / Theatre.js | do not use | | See "What NOT to use". |
### Math Typesetting
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **KaTeX** | 0.19.x | LaTeX rendering | Synchronous, fast, SSR-prerenderable (`katex.renderToString` at build, so no flash and no layout shift), small. Supports `\textcolor`/`\color`, and with `trust` enabled the `\htmlClass`, `\htmlData` and `\htmlId` macros, which put CSS classes or data attributes on individual terms. |
| CSS variables for term colors | n/a | Color-linking terms to visuals | Give each concept a palette (`--c-sin`, `--c-cos`, `--c-tan`). Write `\htmlClass{t-sin}{\sin\theta}` in the formula, and give the SVG segment the same class. Highlight/hover linking is then pure CSS or a shared "focus" state, with no re-render of the formula. |
| MathJax 4.1.x | skip | | Heavier and async. Its only advantage is wider LaTeX/a11y coverage, which is not needed here. Revisit only if a macro KaTeX lacks is required. |
| MathLive 0.111 | skip for v1 | | Math *input* editor. The project has no exercises, so there is no input. |
### Internationalization
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Paraglide JS (`@inlang/paraglide-js`)** | 2.29.x | Compile-time i18n, tree-shaken typed message functions, URL-based locale | Messages compile to typed functions (`m.trig_step3_title()`), so a missing key is a compile error. URL locale strategy (`/de/...`) is the right fit for static prerendering and SEO. Supports Vite plus SvelteKit. Peers `vite >=5`. (MEDIUM-HIGH: package is actively released, modified 2026-10-19; check the SvelteKit integration docs because the API changed between v1 and v2, and the old `@inlang/paraglide-sveltekit` package no longer resolves on npm) |
| Message convention | n/a | `concept.<id>.step.<n>.text` keys, one JSON file per locale per concept if the tooling allows, otherwise prefixed keys in a shared file | Concepts stay self-contained. Formulas contain no language, so they are shared. Only labels and step text are translated. |
| svelte-i18n 4.0.1 | fallback | Runtime store-based i18n | Mature but untyped and runtime-loaded. Use it only if Paraglide blocks on the Kit 3 integration. |
### Content Authoring / Concept Module API
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Convention: `src/concepts/<category>/<id>/` containing `index.ts` (manifest), `Scene.svelte`, `steps.ts`, `messages/{en,de}.json` | n/a | Shared module contract | Shell uses `import.meta.glob('/src/concepts/*/*/index.ts')` to build the catalog and routes. Adding a concept = adding a folder (no shell edits). Define the contract as a TS interface (`ConceptModule { id, category, title key, params schema, steps[], Scene }`). |
| Zod (optional) | 4.x | Validate manifests at build | Optional safety net for contributors. |
### Infrastructure
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Cloudflare Pages / Netlify / GitHub Pages | n/a | Static hosting | Output is plain static files from adapter-static, so any host works. Cloudflare Pages or Netlify give free HTTPS, previews and good caching. No server, DB or accounts. |
| Node | 22 LTS or newer | Build | Required by Vite 8 / Kit 3 (confirm the engines field at install). |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 4.3.x | Utility styling | Optional. Plain CSS variables plus Svelte scoped styles are enough for a dark theme. Use Tailwind only if the team prefers it. |
| Vitest | 4.x | Unit tests of math/step logic | Test pure functions (params-at-step, unit-circle math). Cheap and valuable. |
| Playwright | 1.64.x | E2E and visual smoke tests | Verify every locale and concept route renders, and that a drag changes the SVG. |
| JSXGraph | 1.14.x (MIT or LGPL) | Draggable geometry/graphs with built-in constructions | Optional per-concept island for heavy constructions, for example the secant-to-tangent limit demo. It is actively released (2026-10-21), but it is imperative, owns its own DOM and styling, and is hard to theme and sync with a shared timeline. Do not make it the foundation. |
| mathjs | 15.x | Expression parsing/evaluation | Only if students or authors type functions. Plain TS lambdas suffice for authored concepts. |
| mdsvex | 0.12.x | Markdown in Svelte | Skip: text is message keys, not markdown pages. |
| `@fontsource` fonts (for example Inter + KaTeX fonts self-hosted) | latest | Offline, consistent fonts | Self-host to avoid external requests. KaTeX ships its own fonts. |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | SvelteKit 3 + Svelte 5 | React 19 + Vite (or Next 16) + Mafs 0.21 | Credible runner-up. Pick it if the team strongly prefers React or wants Mafs's ready-made `<Plot>`/`<Theme>` components. Cost: Mafs is React-only, last released Mar 2025, and plot-centric. Next adds server concepts you do not need. |
| Framework | SvelteKit | Astro 7 | Content-first. This app is interactive-first, so you would end up with SvelteKit-like islands anyway. |
| Visual lib | Own SVG components | Mafs | See above. Mafs is the best-looking off-the-shelf option, but you would be fighting it for non-graph visuals (unrolled circle, colored arcs). Study its component API as design inspiration. |
| Visual lib | Own SVG components | JSXGraph | Powerful and has built-in drag, but imperative and hard to style or keep in sync with the timeline and KaTeX color-linking. Good as an island, not a base. |
| Visual lib | Own SVG components | Motion Canvas 3.17 | Generator-based timeline editor for rendering *videos*. Last npm release Feb 2025, the playback is not designed around user-draggable state, and it is oriented to export. Wrong tool. |
| Visual lib | Own SVG components | manim-web 0.40 | Manim-style scripted animations (good look), but young, a single maintainer, and scripted rather than state-driven, so drag-at-any-step is awkward. Optional experiment only. |
| Visual lib | SVG | D3 as renderer | D3's selection/data-join model fights Svelte's DOM ownership. Use only its pure modules. |
| Visual lib | SVG | Raw Canvas / PixiJS / three | Lose free hit-testing, CSS styling and a11y. Only needed for density or 3D, so add per concept when measured. |
| Animation | GSAP timeline | Svelte `tweened`/`Tween` | Fine for single transitions, but it has no seekable multi-step timeline. |
| Animation | GSAP | Framer Motion / `motion` 14 | React-leaning and focused on UI transitions. Not a scrubbable scene timeline. |
| Math | KaTeX | MathJax 4 | Slower and async. Not needed. |
| i18n | Paraglide JS 2 | svelte-i18n / i18next 26 | Runtime, untyped keys, and no compile-time missing-key checks. Fine as fallback. |
| Python | none | Pyodide/PyScript, Reflex, NiceGUI, Streamlit, Manim | See "Verdict on Python". |
## What NOT to Use
- **Manim (any form) as the live renderer**: video pipeline, not interactive. (HIGH)
- **Streamlit / NiceGUI / Reflex**: need a live server and round-trip on interaction, so there is no 60fps drag and no static deploy. (HIGH)
- **Pyodide for core visuals**: heavy cold start and a JS bridge per interaction, with no rendering benefit. (HIGH)
- **Motion Canvas / Remotion**: video-export tools. (MEDIUM-HIGH)
- **TypeScript 7.x for now**: Kit 3 peers `typescript ^6`. (HIGH)
- **Mixing a second DOM-owning library (D3 selections, JSXGraph) as the main renderer**: it duplicates ownership of the DOM with Svelte. (HIGH)
- **Storing UI strings or step text inline in components**: breaks the i18n-from-day-one requirement. (HIGH)
- **Rendering formulas as images or screenshots**: not translatable, not colorable, not accessible. (HIGH)
## Installation
# Scaffold (choose Svelte + SvelteKit + TypeScript; minimal template)
# Core
# Runtime libraries
# Types / dev
# Optional per-concept islands
## Confidence Summary
| Recommendation | Confidence | Note |
|----------------|------------|------|
| TypeScript, no Python for core | HIGH | Architectural reasoning, plus PROJECT.md already rules out Manim |
| Svelte 5 + SvelteKit 3 static | MEDIUM-HIGH | Versions verified on npm. Svelte-vs-React is a preference with a real runner-up |
| Own SVG component layer + d3 modules | MEDIUM-HIGH | Best fit for state-driven drag plus timeline. It costs one up-front build phase |
| GSAP timeline | MEDIUM | Technically fits. Verify the license text and bundle size, and the own-timeline fallback exists |
| KaTeX + `\htmlClass` color linking | MEDIUM-HIGH | Established pattern. Verify the exact `trust` API in the 0.19 docs |
| Paraglide JS 2 | MEDIUM | Active and typed, but verify the SvelteKit 3 integration docs in the i18n phase |
| JSXGraph / Mafs / manim-web judgments | MEDIUM / MEDIUM / LOW | Based on registry metadata and training knowledge, not hands-on testing |
## Sources
- npm registry (`npm view`, 2026-10-24): svelte 5.57.2, @sveltejs/kit 3.1.0 (peers vite ^8.0.12, typescript ^6, vite-plugin-svelte ^7), adapter-static 5.0.5, astro 7.4.2, react 19.3.1, next 16.4.3, mafs 0.21.0 (modified 2025-03-30), @motion-canvas/core 3.17.2 (modified 2025-02-16), jsxgraph 1.14.1 (2026-10-21), manim-web 0.40.0 (2026-10-23), d3 7.9.0, gsap 3.15.0, katex 0.19.1, mathjax 4.1.3, @inlang/paraglide-js 2.29.1, svelte-i18n 4.0.1, i18next 26.5.7, vite 8.3.5, typescript 7.0.2 (latest tag), vitest 4.0.0, playwright 1.64.1, tailwindcss 4.3.3
- Repos: github.com/stevenpetryk/mafs, github.com/jsxgraph/jsxgraph, github.com/maloyan/manim-web, github.com/motion-canvas/motion-canvas, github.com/opral/paraglide-js, github.com/KaTeX/KaTeX
- Not verified through Context7 or official docs in this pass. Do that before implementing GSAP licensing, the KaTeX `trust` option and the Paraglide-Kit integration.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
