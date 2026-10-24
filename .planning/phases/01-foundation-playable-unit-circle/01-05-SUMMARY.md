---
phase: 01-foundation-playable-unit-circle
plan: 05
subsystem: player-ui
tags: [player, ui, svg, layout]
requires: [01-04]
provides:
  - PlayerBar (reset/prev/play/next) with continuous Scrubber and step ticks
  - ConceptLayout (desktop/tablet/phone), Panel (counter, caption, readout, reserved formula/toggle slots)
  - Scene intro + angle schedule (draw-on circle, theta arc and label, drag hint)
  - Concept page wired to Player + restage policy; drag pauses playback
affects: [01-07, 01-08, 01-09]
key-files:
  created:
    - src/lib/icons/Icon.svelte
    - src/lib/player/PlayerBar.svelte
    - src/lib/player/Scrubber.svelte
    - src/lib/player/ConceptLayout.svelte
    - src/concepts/high-school/unit-circle/Panel.svelte
    - e2e/player.spec.ts
    - e2e/drag.spec.ts
  modified:
    - src/concepts/high-school/unit-circle/Scene.svelte
    - src/routes/high-school/unit-circle/[[step]]/+page.svelte
requirements-completed: [PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05, PLAY-06, A11Y-01]
duration: ~25min
completed: 2026-10-24
---

# Phase 1 Plan 05: Player UI and Intro/Angle Visuals Summary

Guided, scrubbable six-step player on the 01-04 engine: staged-at-end initial state, play-to-step-end, one continuous scrubber with step ticks, translated captions, responsive layout, and drag that pauses playback without moving the timeline-independent angle.

## Commits
- 25cc87c: player bar, scrubber, panel, layout, page wiring, player e2e
- 336c72b: Scene intro/angle schedule, drag e2e

## Verification
- `npm run check`: 0 errors, 0 warnings
- `npx vitest run`: 93 passing
- Playwright desktop (all specs): 36/36 pass, including player (10), drag (4 tests) and skeleton

## Deviations from Plan
- **[Rule 3 - Blocking] Layout breaks out of shell `<main>` padding** via negative margins in ConceptLayout, so the player bar and stage can reach viewport edges without modifying the shared layout.
- Drag e2e is 4 test blocks (the plan's cases 1 and 2 are one continuous flow, sharing state) and the drag-hint testid sits on the hint `<g>` so computed opacity can be asserted.
- Added a `svelte-ignore state_referenced_locally` on the initial-step constant in the page (intentional one-time read; no in-route navigation changes the step).

## Known Stubs
- `data-testid="formula"` and `data-testid="toggle-slot"` in Panel.svelte are intentionally empty reserved regions, filled by plans 01-08 and 01-09.
- Radian/cosine/sine layers in `view()` are not rendered by Scene yet (later plans).

## Self-Check: PASSED
