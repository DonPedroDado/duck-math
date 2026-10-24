---
phase: 02-trigonometry-complete
plan: 11
subsystem: concepts
tags: [trig, special-angles, snap, exact-values, chips, concept]
requires: ["02-08"]
provides:
  - "Identities & special angles completed: magnetic snap, exact values, 45 and 30/60 derivations, free exploration chips"
affects: [catalog]
key-files:
  created:
    - src/lib/trig/special.ts
    - src/lib/trig/snap.ts
    - src/lib/ui/ChipButton.svelte
    - src/lib/stage/SnapPulse.svelte
    - src/concepts/high-school/trig-identities/jump.ts
  modified:
    - src/lib/stage/DragPoint.svelte
    - src/concepts/high-school/trig-identities/{steps,step-ids,view,formulas,notation,runtime}.ts
    - src/concepts/high-school/trig-identities/{Scene,Panel}.svelte
    - src/concepts/high-school/trig-identities/messages/{en,de}.json
    - e2e/identities.spec.ts
requirements-completed: [TRIG-09, TRIG-08, TRIG-07, MATH-03]
completed: 2026-10-24
---

# Phase 2 Plan 11: Special Angles Summary

Identities concept now has 8 steps: a static exact-value table cross-checked against Math.sin/cos/tan, a stateless pointer-only snap (3 degrees, 12 targets, axes excluded) with a one-shot pulse, half-square and half-equilateral-triangle derivations, and a free-exploration step with jump chips, ghost toggles and a squares toggle.

## Commits
- cbe8696: exact table, snap, jump tween, DragPoint `snap` prop, failing e2e (Task 1)
- 42768f1: 8-step schedule, exact formulas, chip state, EN/DE copy (Task 2)
- Task 3 commit: ChipButton, SnapPulse, Scene and Panel wiring (e2e green)

## Deviations from Plan
- [Rule 3] Panel captions for the three new steps were added in Task 2 (not Task 3) so `npm run check` stayed green between commits.
- `halfFade` and `halfFade60` are cumulative (`layer`) rather than `only`, so a faded half does not reappear while the step fades out.
- The `exact` block shows the radian label and tan; sin/cos exact forms live in the formula lines (single place, hover-linked).
- The 30-degree result lines in triangle3060 are shown unconditionally (they are part of the derivation).
- Jump tween applies the target unnormalised when already in [0, 2pi) to avoid a 1-ulp drift from `norm`.

## Verification
- `npm run check` clean; `npx vitest run`: 274 passed.
- Full `playwright test` (E2E_PORT=4176): 245 passed, 65 skipped by project config, 0 failed (includes drag.spec.ts, identities, deeplink, mobile, catalog).

## Known Stubs
None.

## Self-Check: PASSED
