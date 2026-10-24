---
phase: 02-trigonometry-complete
plan: 07
subsystem: concepts
tags: [trig, unroll, two-panels, predict, concept]
requires: [02-03, 02-04, 02-06]
provides: ["sine-cosine-graphs concept (intro, unroll, sine), order 3"]
affects: [02-10]
key-files:
  created:
    - e2e/sine-cosine.spec.ts
    - src/concepts/high-school/sine-cosine-graphs/step-ids.ts
    - src/concepts/high-school/sine-cosine-graphs/steps.ts
    - src/concepts/high-school/sine-cosine-graphs/view.ts
    - src/concepts/high-school/sine-cosine-graphs/view.test.ts
    - src/concepts/high-school/sine-cosine-graphs/formulas.ts
    - src/concepts/high-school/sine-cosine-graphs/formulas.test.ts
    - src/concepts/high-school/sine-cosine-graphs/messages/en.json
    - src/concepts/high-school/sine-cosine-graphs/messages/de.json
    - src/concepts/high-school/sine-cosine-graphs/Thumbnail.svelte
    - src/concepts/high-school/sine-cosine-graphs/Scene.svelte
    - src/concepts/high-school/sine-cosine-graphs/Panel.svelte
    - src/concepts/high-school/sine-cosine-graphs/runtime.ts
    - src/concepts/high-school/sine-cosine-graphs/index.ts
decisions:
  - "moved is restaged per step so each sweep starts view-driven (Open Question 2)"
  - "Registration (runtime.ts, index.ts) done last so sibling plans never see a half-built concept"
metrics:
  tasks: 3
  completed: 2026-10-24
---

# Phase 2 Plan 07: Sine & cosine graphs (first slice) Summary

Synced circle plus graph concept: the arc literally unrolls onto the x-axis, then a predict moment ("where is the sine peak?") leads to a sweep that traces the sine wave, in EN and DE.

## Commits
- c6a1112: step ids, steps/policy, view schedule, e2e spec (prior executor)
- a48f123: formulas, EN/DE copy, thumbnail (prior executor)
- 954f9f3: Scene, Panel, runtime (layout below), manifest

## Deviations from Plan

**1. [Rule 3 - Blocking] `{@const}` inside `<g>` invalid in Svelte**
- Found during: Task 3 (`npm run check`)
- Fix: hoisted `sinD` to the snippet-level consts in Scene.svelte
- Commit: 954f9f3

The uncommitted Scene/Panel from the prior executor were reviewed and found otherwise complete. The e2e spec already imports from `./helpers/test`.

## Verification
- `npm run check`: 0 errors. `vitest run`: 222 passed.
- `E2E_PORT=4175 playwright test e2e/sine-cosine.spec.ts`: 8/8 passed (catalog, intro layout, unroll deep link, predict flow, DE label, sine deep link, circle drag, phone sticky/elbow).
- Full deeplink/mobile/catalog specs not re-run (left to wave-level verification).

## Known Stubs
None. Graph-point dragging, trail, cosine, periodic and explore are deferred to Plan 10 by design.

## Self-Check: PASSED
