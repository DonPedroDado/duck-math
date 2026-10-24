---
phase: 01-foundation-playable-unit-circle
verified: 2026-10-24T15:00:00Z
status: gaps_found
score: 5/6 roadmap criteria verified (criterion 3 partial)
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 5/6
  gaps_closed:
    - "Keyboard theta below 0 deg now wraps (norm in DragPoint.key and page boundary)"
    - "WR-02 unit toggle bound to real unit (Panel.svelte)"
    - "WR-03 keyboard pauses playback and hides hint (ondragstart called in key())"
  gaps_remaining:
    - "Keyboard wrap upward through 360 deg leaves theta at 2pi - epsilon"
  regressions: []
gaps:
  - truth: "Visual is always correct while the student manipulates the point (criterion 3, keyboard path)"
    status: partial
    reason: "norm() in derive.ts only maps exactly TAU to 0 (r === TAU is never true because % TAU yields < TAU). Keyboard steps accumulate float error, so stepping up to 360 deg lands at TAU - epsilon. Reproduced in node with the exact code path: 20x Shift+ArrowRight from 60 deg gives 6.283185307179581 (TAU - 5.3e-15); 300x ArrowRight gives 6.283185307179323 (TAU - 2.6e-13). Then Scene's theta >= 1e-3 gate is true and arcPath's sweep >= TAU - 1e-6 draws a full circle, the theta label sits at ~180 deg, fmtDeg snaps to 0 deg, and aria-valuenow = Math.round(359.99...) = 360 while aria-valuetext says 0 deg. Visual and number disagree, the original CR-01 symptom."
    artifacts:
      - path: "src/concepts/high-school/unit-circle/derive.ts"
        issue: "norm() lines 3-6: `r === TAU ? 0 : r` is dead logic; no near-TAU snap"
      - path: "src/lib/stage/DragPoint.svelte"
        issue: "key() lines 64-67 adds float radian step to float theta; drift accumulates"
    missing:
      - "Snap keyboard steps to the integer-degree grid (compute in degrees, convert once) and/or snap values within ~1e-9 of TAU to 0 inside norm()"
      - "Unit test: repeated keyboard stepping up through 360 deg yields 0 (not just norm(a) < TAU); e2e: Shift+ArrowRight x20 from default keeps arc consistent with 0 deg readout"
human_verification: []
---

# Phase 1: Foundation + Playable Unit Circle - Verification Report

**Phase Goal:** A visitor can open the publicly deployed site, pick the Trig concept from the catalog, and play through and drag a beautiful dark-themed unit-circle explainer in English or German.
**Verified:** 2026-10-24
**Status:** gaps_found
**Re-verification:** Yes, after gap closure 01-11

## CR-01 independent check

The review's claim is correct. I read `norm()` (`derive.ts:3-6`) and `DragPoint.key()` (`DragPoint.svelte:63-72`), then reproduced the arithmetic in node using the same `norm(theta + step)` loop:

| Scenario | Final theta | TAU - theta | Consequence |
| --- | --- | --- | --- |
| 20 x Shift+ArrowRight from 60 deg (15 deg steps) | 6.283185307179581 | 5.3e-15 | arc full circle, label ~180 deg, readout 0 deg, aria-valuenow 360 |
| 300 x ArrowRight from 60 deg (1 deg steps) | 6.283185307179323 | 2.6e-13 | same |

Both satisfy `theta >= 1e-3` (arc drawn) and `TAU - theta < 1e-6` (geom.ts full-circle branch). The `r === TAU` check can never fire, since `x % TAU` is always strictly less than TAU. The downward wrap (below 0) is genuinely fixed. Pointer and touch drag are unaffected because `angleFromPoint` takes `atan2` of the actual pointer position. I did not run Playwright; the arithmetic is deterministic and sufficient. The existing tests (`derive.test.ts` asserts only `norm(a) < TAU`; `drag.spec.ts` covers only the downward wrap) do not catch this.

Severity: BLOCKER for criterion 3 ("visual is always correct", "see angle in degrees or radians"), because it sits on the keyboard route of the core interaction (A11Y-01). It is small and localized (a few lines plus a test).

## Roadmap success criteria

| # | Criterion | Status | Evidence |
| - | --------- | ------ | -------- |
| 1 | Public URL, catalog, University coming later, open Trig and return | VERIFIED | Prior verification: live site 200 in en/de; catalog code, e2e/catalog.spec.ts; code unchanged by 01-11 |
| 2 | Play, pause, step, reset, scrub; caption per step | VERIFIED | engine/timeline, player, PlayerBar, Scrubber, unit tests; WR-01 timing drift is a warning only |
| 3 | Drag at any step, deg/rad toggle, radian on arc, projections, live KaTeX | PARTIAL (FAILED on keyboard upward wrap) | Pointer drag, toggle (WR-02 fixed), RadianLayer, projections, formulas verified; CR-01 upward wrap defect above |
| 4 | Dragging pauses playback; step change re-stages | VERIFIED | ondragstart pauses; WR-03 now fixed for keyboard (DragPoint.svelte:70) |
| 5 | EN/DE URLs, decimal comma, step deep link, build fails on missing key | VERIFIED | format.ts, urls.ts, check-i18n in prebuild; unchanged |
| 6 | Phone/tablet fit and drag | VERIFIED (human, prior) | User approved in 01-10; not re-run |

**Score:** 5/6

## Requirements coverage

All 21 phase IDs appear in plan frontmatter and REQUIREMENTS.md; no orphans.

| Requirement | Status | Note |
| --- | --- | --- |
| SHELL-01..05 | SATISFIED | |
| PLAY-01..06 | SATISFIED | PLAY-05 keyboard-pause gap now closed |
| MATH-01, MATH-02 | SATISFIED | |
| I18N-01..04 | SATISFIED | |
| TRIG-01, TRIG-02 | SATISFIED | |
| TRIG-03 | PARTIAL | Marked ticked by 01-11, but keyboard at 360 deg shows a full-circle angle arc against a 0 deg readout |
| A11Y-01 | PARTIAL | Keyboard operation works, but aria-valuenow reports 360 vs valuetext 0 deg at the wrap point |

## Anti-patterns / warnings (non-blocking)

WR-01 (clock re-arm), WR-04 (Panel KaTeX boundary), WR-05 (lib-to-concept import, DragPoint imports from #concepts), WR-06 (caption live region), unguarded localStorage in +layout.svelte. Unchanged from the review.

## Gaps Summary

One gap remains: CR-01 is only partially fixed. Wrapping below 0 works. Wrapping upward past 360 deg leaves theta at TAU minus a few ulps, because `norm()` lacks a tolerance snap and keyboard steps are float radians. Fix by stepping in integer degrees and/or snapping near-TAU to 0, then add a test that steps up through 360. Everything else in the phase is verified.

---

_Verified: 2026-10-24_
_Verifier: Claude (gsd-verifier)_
