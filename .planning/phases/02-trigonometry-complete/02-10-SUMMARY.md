---
phase: 02-trigonometry-complete
plan: 10
subsystem: concepts
tags: [trig, trail, cosine, periodicity, graph-drag, concept]
requires: [02-06, 02-07]
provides: ["sine-cosine-graphs complete: 6 steps, comet trail, two-way drag", "TrackPoint stage primitive"]
affects: [02-12]
key-files:
  created:
    - src/concepts/high-school/sine-cosine-graphs/trail.ts
    - src/concepts/high-school/sine-cosine-graphs/trail.test.ts
    - src/lib/stage/TrackPoint.svelte
  modified:
    - src/concepts/high-school/sine-cosine-graphs/{step-ids,steps,view,view.test,formulas,formulas.test,runtime}.ts
    - src/concepts/high-school/sine-cosine-graphs/messages/{en,de}.json
    - src/concepts/high-school/sine-cosine-graphs/{Scene,Panel}.svelte
    - e2e/sine-cosine.spec.ts
requirements-completed: [TRIG-06, MATH-04, MATH-05, MATH-03]
decisions:
  - "Trail is tail(theta), a pure function of the displayed theta; no frame history"
  - "Graph writes clamp to [0, v.range]; circle writes keep snapTheta (turn 1)"
metrics:
  tasks: 2
  completed: 2026-10-24
---

# Phase 2 Plan 10: Sine & cosine graphs (trail, cosine, periodic, explore) Summary

Completed the concept with a scrub-exact glowing comet trail (graph plus circle arc), the cosine step (projection rotates onto the vertical axis, cos curve drawn, pi/2 bracket), the periodic range extension from 2pi to 4pi, and an explore step with two-way dragging via the new `TrackPoint`.

## Commits
- 0eb6b76: trail module, 6-step schedule/staging, formulas, EN/DE copy, extended e2e
- 0d27b44: TrackPoint, Scene/Panel rendering

## Deviations from Plan

**1. [Rule 1 - Bug] `curvePath` signature**: the plan wrote `curvePath(Math.cos, ...)`, but the real API is `curvePath(curvePoints(f, ...))`. Used the existing API.

**2. [Rule 1 - Bug] View continuity**: the plan's field formulas jumped at step boundaries (`sweep`, `cosRotate`, `cosRot`), which the continuity test rejects. `sweep` and `cosRotate` now hold their previous end value in later steps (display still gated by `sweepOn`), and `cosRot` fades in over the first 5% of cosine. JUMP stays `['sweepOn', 'rewind']` as planned. `peak`, `sinTraced` and `cosTraced` follow the plan; `cosTraced` in periodic reuses `sweep`, which equals the planned formula.

**3. Step staging**: `stepDefaults(2, prev >= 3)` stages theta 2pi (the plan only specified prev = 3), so returning from any later step is continuous.

## Verification
- `npm run check`: 0 errors. `npx vitest run`: 272 passed. `check:i18n`: OK.
- `E2E_PORT=4175 playwright test e2e/sine-cosine.spec.ts`: 12/12 passed.
- `deeplink`, `mobile`, `catalog` specs: 138 passed, 65 skipped (project-gated).
- Smoothness/60fps and visual polish left to Plan 12's visual review. Filter count in Scene.svelte: 3.

## Known Stubs
None.

## Self-Check: PASSED
