---
phase: 01-foundation-playable-unit-circle
plan: 12
subsystem: unit-circle keyboard interaction
tags: [gap-closure, keyboard, a11y, bugfix, float]
requires: []
provides:
  - norm() with 1e-9 tolerance snap (derive.ts and private copy in format.ts)
  - keyStep(theta, deltaDeg) integer-degree keyboard stepping
  - degValue(theta) shared rounding rule for readout and aria-valuenow
affects: [src/lib/stage/DragPoint.svelte]
key-files:
  modified:
    - src/concepts/high-school/unit-circle/derive.ts
    - src/concepts/high-school/unit-circle/derive.test.ts
    - src/lib/engine/format.ts
    - src/lib/engine/format.test.ts
    - src/lib/stage/DragPoint.svelte
    - e2e/drag.spec.ts
decisions:
  - "Fix CR-01 twice: integer-degree grid in keyStep plus tolerance snap in norm"
requirements: [TRIG-03, A11Y-01]
metrics:
  tasks: 2
  completed: 2026-10-24
---

# Phase 1 Plan 12: CR-01 upward keyboard wrap Summary

Keyboard steps now run on the integer-degree grid (`keyStep`) and `norm()` snaps values within 1e-9 of 0 or TAU to exactly 0, so stepping up through 360 degrees lands on exactly 0 with matching arc, readout and aria values.

## Commits
- 40fd100: test(01-12): failing upward-wrap unit tests (RED, 5 failures confirmed)
- e6f6893: fix(01-12): norm snap, keyStep, degValue (GREEN, 136 unit tests pass)
- c84d069: test(01-12): upward keyboard wrap e2e regression
- 5aae4fd: fix(01-12): DragPoint uses keyStep; aria-valuenow from degValue; unused `deg` removed

## Deviations from Plan

**e2e RED did not fail.** The e2e test was added after Task 1 landed (the norm snap alone already fixes the stored value, since DragPoint.key still called norm), so it passed before the DragPoint wiring. It was run before the DragPoint change and passes after as well; the DragPoint change is defense in depth and provides the shared degValue rule for aria-valuenow. The RED gate for Task 2 is therefore not demonstrated; the RED commit for the behavior is the unit-test commit 40fd100.

Playwright was run with E2E_PORT=4391 because 4173 was occupied.

## Verification
- `npm run check`: 0 errors
- `npx vitest run`: 14 files, 136 tests pass
- `playwright e2e/drag.spec.ts --project=desktop`: 7/7 pass (full all-project run not executed)

## Known Stubs
None.

## Self-Check: PASSED
All four commits present in git log; modified files exist.
