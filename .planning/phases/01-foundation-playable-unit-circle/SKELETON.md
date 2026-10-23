# Walking Skeleton — Duck Math

**Phase:** 1
**Generated:** 2026-10-24

## Capability Proven End-to-End

A visitor opens the public site (https://dm.ducksoft.ai), picks the Unit circle from the registry-driven catalog in English or German, and drags a point around the circle while a locale-formatted angle readout follows the pointer. The page is a prerendered static page served from GitHub Pages.

Delivered by plan 01-01 (scaffold, catalog, concept page, drag + readout) and plan 01-02 (deploy). Every later plan in Phase 1 adds one vertical slice on top: i18n guardrails + root redirect (01-03), guided player engine (01-04), player UI + intro/angle visuals (01-05), catalog cards + 404 (01-06), step URLs (01-07), cos/sin + formulas (01-08), radian + toggle (01-09), phone + polish (01-10).

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Language | TypeScript `~6.0` (never 7.x) | `@sveltejs/kit` 3.1 peers `typescript ^6` |
| Framework | SvelteKit 3.1 + Svelte 5.57 (runes forced via `compilerOptions.runes`), Vite 8 | Fine-grained reactivity for 60fps drag; static prerender; `import.meta.glob` registry |
| Kit 3 config | No `svelte.config.js`; all Kit options inside `sveltekit({...})` in `vite.config.ts`; alias `#lib/*` (NOT `$lib`) plus `#concepts/*` via package.json `imports` | Kit 3 removed `$lib` and the separate config file (verified by research spike) |
| Rendering | Own SVG primitives (`src/lib/stage/`: Stage, DragPoint, geom) in pixel space (`viewBox="0 0 S S"`, S = measured px, R = S/3 per unit) | CSS-px strokes and 14px labels without `vector-effect`; native pointer events; Svelte owns the DOM; d3 used only as pure modules (d3-ease, d3-scale, d3-interpolate, d3-shape) |
| Animation engine | Own pure timeline (`src/lib/engine/`): `locate(t)`, pure player reducer, keep/restage policy, ~40-line rAF clock; concept `view(t, user)` is a pure function | Scrub = play = deep link by construction; supports D-03 dynamic user state; no GSAP (start-value caching and `_gsap` mutation conflict with `$state`) |
| Param ownership | Each user param has exactly one writer (θ: pointer/keyboard; unit: toggle). The timeline never writes user params; per-param policy `keep`/`restage` applied on step change | PLAY-05 (no jumps) and D-03 / PLAY-06 |
| Staged semantics | Step i occupies `[start_i, end_i]`; staged = `end_i`. Deep link, tick click, Prev, initial load = `end_i`; Reset = `end_0`; Next = `start_{i+1}` and plays; Play stops at step end | User plan-time decision PD-2; one tested reducer |
| Math typesetting | KaTeX 0.19 `renderToString` (SSR + live), `trust` limited to `\htmlClass`, `strict: false`; `.t-*` classes map to palette tokens | Colored terms linked to visuals; prerendered first paint; only `{@html}` in the app |
| i18n | Paraglide JS 2.29 (+ `@inlang/plugin-message-format` loaded from node_modules), strategy `['url','baseLocale']`, all locales prefixed (`/en/`, `/de/`), `reroute` hook de-localizes; snake_case message keys `shell_*`, `catalog_*`, `player_*`, `uc_*`, `error_*` | Typed messages, URL is the source of truth |
| i18n completeness | `scripts/check-i18n.mjs` as `prebuild` (keys + placeholders + empty values + caption word budget EN 18 / DE 25); `npm run check` first compiles Paraglide via `scripts/paraglide-compile.mjs` (options shared with the Vite plugin in `paraglide.config.mjs`) so type checking works from a clean checkout | Paraglide silently falls back; I18N-04 needs a build gate |
| Numbers | `Intl.NumberFormat(locale)` via `src/lib/engine/format.ts` (`fmt`, `fmtDeg`, `fmtRad`), U+2212 minus, no negative zero | I18N-03 / MATH-02 |
| Data layer | None (static site). "Real data" = concept registry (`import.meta.glob('/src/concepts/*/*/index.ts')` manifests), message catalogs, URL state (locale + step id); only persisted value is `localStorage['dm-locale']` | No accounts, no server (PROJECT constraints) |
| Auth | None by design | Public site, no login (SHELL-04) |
| Routing | Unlocalized routes `src/routes/+page.svelte` (catalog) and `src/routes/high-school/unit-circle/[[step]]/` (concept, step validated against `STEP_IDS`); `prerender.entries` lists every locale x step; `trailingSlash = 'always'`; step changes via shallow routing (`pushState`/`replaceState`) | Every step URL prerendered as `index.html` for GitHub Pages; generic `[category]/[concept]` route comes with the Phase 3 contract |
| Root redirect | `scripts/postbuild.mjs` overwrites `build/index.html` with an allowlisted client redirect (stored pref -> browser language -> en) | Paraglide reroute makes `/` the same route as `/en/`; Pages has no server redirects |
| Theme | `src/lib/styles/tokens.css` CSS custom properties (UI-SPEC values); hex literals forbidden elsewhere (Vitest gate); Inter via `@fontsource-variable/inter`, KaTeX fonts bundled; dark only | SHELL-05, D-10..D-13, no external requests |
| Testing | Vitest ^4.1 (pure engine/math/format/i18n/tokens), Playwright 1.64 against `build/` served by `scripts/serve-build.mjs` (GitHub-Pages-like: dir index, 301 to slash, 404.html) on `E2E_PORT` (default 4173, never reusing a running server), projects `desktop` (all specs) + `mobile` (Pixel 7, allowlist: skeleton, catalog, notfound, mobile); touch drag via CDP | Tests run against the exact static artifact that ships |
| Deployment target | GitHub Pages via GitHub Actions (`actions/*` only), custom domain `dm.ducksoft.ai` (`static/CNAME`), DNS on Cloudflare (SSL Full). Workflow triggers on `main` and `master`; gates on check + unit + e2e + build | D-18, D-19 |
| Directory layout | `src/lib/{engine,stage,player,tex,ui,icons,styles,catalog}` = shared shell/engine; `src/concepts/<category>/<id>/` = concept module (`index.ts` manifest, `step-ids.ts`, `steps.ts`, `view.ts`, `derive.ts`, `Scene.svelte`, `Panel.svelte`, ...); `messages/{en,de}.json`; `scripts/`; `e2e/` | Adding a concept = adding a folder; Phase 3 freezes the contract without moving files |

## Stack Touched in Phase 1

- [x] Project scaffold (framework, build, type check, test runners) — 01-01
- [x] Routing — catalog + concept step routes for both locales, prerendered — 01-01, 01-07
- [x] Data — registry read (manifests via `import.meta.glob`), message catalogs, URL state read/write (step id via shallow routing), `localStorage` write (locale preference) — 01-01, 01-03, 01-07
- [x] UI — draggable point wired to live readout; player controls wired to the engine — 01-01, 01-04, 01-05
- [x] Deployment — GitHub Pages at https://dm.ducksoft.ai via Actions — 01-02

## Out of Scope (Deferred to Later Slices)

- tan/sec/csc/cot, unrolling into graphs, identities, symmetries, special-angle snapping, formula<->visual hover linking, predict-then-reveal, trails, multi-panel (Phase 2)
- Frozen module contract, generic `[category]/[concept]` route, scaffold template and authoring docs (Phase 3)
- Full keyboard audit, reduced-motion behavior beyond the `rate`/duration hook and pulse suppression, color-blind cue audit (Phase 6)
- Duck mascot/logo glyph (revisit Phase 6), light theme (not in v1)
- Any server, database, accounts, analytics

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Trigonometry complete (tan family, unrolled graphs in a synced panel, identities, symmetries, special angles, hover linking, predict-then-reveal) — reuses engine, stage, KaTeX, tokens
- Phase 3: Functions & Transformations concept; module contract frozen from the two real concepts; scaffold template
- Phase 4: Limits concept module
- Phase 5: Derivatives concept module
- Phase 6: Accessibility, reduced motion, color-blind cues, device audit, launch hardening
