---
phase: 01-foundation-playable-unit-circle
plan: 01
subsystem: ui
tags: [sveltekit, paraglide, svg, walking-skeleton, vitest, playwright]

requires: []
provides:
  - SvelteKit 3 static app with Paraglide EN/DE URL routing and prerendered locale x step pages
  - tokens.css design tokens, header with locale switcher
  - Stage and DragPoint SVG primitives, registry-driven catalog, draggable unit-circle slice
  - derive/format pure modules, Vitest + Playwright (desktop + mobile) harness
affects: [all later Phase 1 plans]

tech-stack:
  added: [sveltekit 3, svelte 5, vite 8, typescript 6.0, adapter-static 4, paraglide-js 2.29, plugin-message-format, vitest 4.1, playwright 1.64, katex, d3 modules, fontsource inter]
  patterns:
    - "Paraglide options shared between Vite plugin and standalone compile script (npm run check works on clean checkout)"
    - "Concept registry via import.meta.glob"
    - "Pixel-space SVG Stage; pointer capture drag; no hex literals outside tokens.css (gated by test)"

key-files:
  created:
    - vite.config.ts
    - paraglide.config.mjs
    - scripts/paraglide-compile.mjs
    - scripts/serve-build.mjs
    - messages/en.json
    - messages/de.json
    - src/lib/styles/tokens.css
    - src/lib/engine/format.ts
    - src/lib/stage/Stage.svelte
    - src/lib/stage/DragPoint.svelte
    - src/concepts/registry.ts
    - src/concepts/high-school/unit-circle/derive.ts
    - src/concepts/high-school/unit-circle/Scene.svelte
    - e2e/skeleton.spec.ts
  modified: []

key-decisions:
  - "Stage SVG uses role=group (not img) so the focusable slider child stays accessible"
  - "Cross-folder imports from #concepts/* and engine files need explicit .ts extensions (package.json imports field has no extension resolution)"
  - "Reroute and Handle types come from @sveltejs/kit/hooks in Kit 3, not @sveltejs/kit"

patterns-established:
  - "Use #lib/* and #concepts/*.ts, never $lib"
  - "All UI strings via m.* messages; colors via var(--token)"

requirements-completed: [SHELL-01, SHELL-02, SHELL-03, SHELL-05, PLAY-04, TRIG-01, MATH-02, I18N-01, I18N-02, I18N-03]

duration: 15min
completed: 2026-10-24
---

# Phase 1 Plan 01: Walking Skeleton Summary

**SvelteKit 3 static app with Paraglide EN/DE routing, dark token theme, registry catalog and a draggable unit-circle point with locale-formatted live angle readout, verified by unit and e2e tests.**

## Accomplishments
- Build prerenders `/{en,de}/` plus the unit-circle base and all 6 step pages per locale, with correct `<html lang>`.
- Drag slice works in EN and DE (decimal comma in DE); skeleton e2e green on desktop and mobile (10/10); 45 unit assertions pass.
- `npm run check` passes from a clean checkout (Paraglide compiled first).

## Task Commits
1. Task 1 scaffold: f4e7fa0
2. Task 2 RED tests: see `test(01-01)` commit; GREEN: e6f72e4
3. Task 3 interactive slice: bb5e6ed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kit 3 type locations and node types**
- `Handle`/`Reroute` import from `@sveltejs/kit/hooks`; added `@types/node` (Paraglide server.js needs async_hooks types).

**2. [Rule 3 - Blocking] Typing of shared Paraglide options and prerender entries**
- Added JSDoc `CompilerOptions` type to `paraglide.config.mjs`; cast prerender entries in `vite.config.ts`.

**3. [Rule 3 - Blocking] `#concepts/*` extension resolution**
- Imports use explicit `.ts` extensions (e.g. `#concepts/.../step-ids.ts`); also added `.ts` to vite.config.ts local imports to silence the native config loader warning.

**4. [Rule 1 - Spec deviation] Stage role=group** instead of `img` per UI-SPEC, to keep the slider focusable.

Paraglide `compile()` was exported by 2.29.1, so no CLI fallback needed. Playwright's bundled chromium launched fine (no `PW_CHROMIUM` needed). The sv scaffold used `--no-install`, then `npm install`.

## Known Stubs
- Catalog is a plain link list and the concept page shows only the circle + readout; richer cards, steps and player are built in later plans (intentional).

## Self-Check: PASSED
