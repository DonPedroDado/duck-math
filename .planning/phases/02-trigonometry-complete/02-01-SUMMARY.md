---
phase: 02-trigonometry-complete
plan: 01
subsystem: routing
tags: [routing, prerender, concept-runtime, migration]
requires: []
provides:
  - generic /{locale}/high-school/[concept]/[[step]] route
  - ConceptRuntime / SceneProps / PanelProps contract (provisional)
  - conceptRoutes() folder scan used by prerender and e2e
affects: [all later Phase 2 concept plans]
key-files:
  created:
    - scripts/concept-routes.mjs
    - scripts/concept-routes.test.ts
    - src/concepts/runtimes.ts
    - src/lib/player/ConceptPage.svelte
    - src/concepts/high-school/unit-circle/runtime.ts
    - src/routes/high-school/[concept]/[[step]]/+page.ts
    - src/routes/high-school/[concept]/[[step]]/+page.svelte
  modified:
    - vite.config.ts
    - src/app.d.ts
    - src/concepts/types.ts
    - src/lib/player/ConceptLayout.svelte
    - src/concepts/high-school/unit-circle/Scene.svelte
    - src/concepts/high-school/unit-circle/Panel.svelte
    - e2e/deeplink.spec.ts
    - e2e/mobile.spec.ts
    - e2e/catalog.spec.ts
  deleted:
    - src/routes/high-school/unit-circle/[[step]]/+page.svelte
    - src/routes/high-school/unit-circle/[[step]]/+page.ts
decisions:
  - Folder name is the URL slug; a concept needs index.ts + step-ids.ts + runtime.ts
  - History state key renamed ucStep to conceptStep, foreign ids ignored
metrics:
  tasks: 3
  completed: 2026-10-24
---

# Phase 2 Plan 01: Generic concept route Summary

One generic `[concept]/[[step]]` route plus a shared `ConceptPage` now serve every concept folder, with prerender entries derived from a filesystem scan, and the unit circle migrated with no behaviour change.

## Commits
- a77e810 feat: generic route, ConceptPage, ConceptRuntime contract, concept-routes scan
- e2b324f refactor: unit circle migrated to runtime contract, old route removed
- Task 3 test commit: unit + e2e specs iterate discovered concepts

## Verification
`npm run check` clean; `npx vitest run src scripts` passes; `npm run build` produces en/de unit-circle step pages; full Playwright run: 149 passed, 41 skipped (project-conditional), 0 failed.

## Deviations from Plan
**1. [Rule 3 - Blocking]** Scene/Panel prop types needed explicit optional `step` / `stepId` entries so the components satisfy `Component<SceneProps|PanelProps>`. No behaviour change.
**2. [Rule 1 - Bug]** `concept-routes.mjs` needed JSDoc types to pass `svelte-check` (implicit any).

Otherwise the plan was executed as written. STATE.md and ROADMAP.md intentionally untouched (orchestrator-owned).

## Known Stubs
None.

## Self-Check: PASSED
