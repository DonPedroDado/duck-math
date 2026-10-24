---
phase: 02-trigonometry-complete
plan: 09
subsystem: concepts/tangent
tags: [trig, sec, csc, cot, poles, concept]
requires: ["02-05"]
provides:
  - "Tangent & friends completed: steps sec, csc, cot, all (6 steps)"
  - "labels.ts separate(): priority-based label separation"
affects: [catalog]
key-files:
  created:
    - src/concepts/high-school/tangent/labels.ts
    - src/concepts/high-school/tangent/labels.test.ts
  modified:
    - src/concepts/high-school/tangent/{step-ids,steps,view,view.test,formulas,formulas.test,runtime}.ts
    - src/concepts/high-school/tangent/{Scene,Panel}.svelte
    - src/concepts/high-school/tangent/messages/{en,de}.json
    - e2e/tangent.spec.ts
requirements-completed: [TRIG-05, MATH-06, MATH-03]
completed: 2026-10-24
---

# Phase 2 Plan 09: Tangent & friends (sec/csc/cot/all) Summary

Sec, csc and cot appear one segment per step with earlier ones dimmed, a y = 1 line for the co-functions, undefined handling at every pole, and a fully labeled six-function free-exploration step.

## Commits
- f308d3e: schedule, view dims, formulas, label separation, EN/DE copy, tests, extended e2e
- see git log for Task 2 (Scene + Panel)

## Deviations from Plan

**1. [Rule 1 - Bug] Dashed segments use butt caps, not round caps.** With 4px strokes, round caps on a `10 5` dash close the 5px gap to about 1px, so the dash cue (D-18) would be nearly invisible. Butt caps keep the dash legible.

**2. [Rule 3 - Blocking] `separate()` made generic (`<T extends Lbl>`)** so Scene can carry text/color/opacity through separation.

**3. Tan label moved** out of the tan group into a shared labels layer (`lbl-tan`) so every label goes through `separate()`; offset 20px from x = 1.

## Verification
- `npm run check`: 0 errors; full `vitest run`: 270 pass; `check:i18n` OK
- `E2E_PORT=4174 playwright test` tangent, deeplink, mobile specs: all pass (148 passed, 65 skipped by project filters)

## Known Stubs
None.

## Self-Check: PASSED
