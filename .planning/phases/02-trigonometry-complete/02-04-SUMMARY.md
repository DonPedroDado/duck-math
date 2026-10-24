---
phase: 02-trigonometry-complete
plan: 04
subsystem: player
tags: [player, predict-reveal, next-concept, reducer]
requires: ["02-01", "02-02"]
provides:
  - "StepDef.pause, PlayerState.revealed, reveal action, awaiting/predictPhase/pauseTime"
  - "Reveal button, scrubber pause diamonds, GuessMarker, PredictPrompt"
  - "optional predict ctx (PredictCtx) on SceneProps/PanelProps; data-predict hook on concept wrapper"
  - "NextLink + nextConcept, reserved next-row on every step"
affects: [02-05, 02-07, 02-08]
key-files:
  created:
    - src/lib/stage/GuessMarker.svelte
    - src/lib/player/PredictPrompt.svelte
    - src/lib/player/NextLink.svelte
    - src/lib/player/next.ts
    - src/lib/player/next.test.ts
    - e2e/next-link.spec.ts
  modified:
    - src/lib/engine/timeline.ts
    - src/lib/engine/player.ts
    - src/lib/engine/player.test.ts
    - src/lib/engine/clock.svelte.ts
    - src/lib/player/PlayerBar.svelte
    - src/lib/player/Scrubber.svelte
    - src/lib/player/ConceptPage.svelte
    - src/lib/icons/Icon.svelte
    - src/concepts/types.ts
key-decisions:
  - "Pause/reveal lives entirely in the pure reducer; seek/goto/prev/reset always land revealed so nothing blocks"
requirements-completed: [PLAY-07]
duration: ~12min
completed: 2026-10-24
---

# Phase 2 Plan 04: Predict pause and Next link Summary

Reducer-owned predict pauses (play stops at `StepDef.pause`, Play/Next/Reveal continue, scrubbing never blocks) plus Reveal button, scrubber marks, GuessMarker, PredictPrompt and a last-step "Next: concept" link.

## Tasks
1. Reducer pause/reveal + tests - e4510c8
2. PlayerBar Reveal, Scrubber pause marks, GuessMarker, PredictPrompt, ConceptPage predict wiring - d52dc75
3. nextConcept, NextLink, arrow-right icon, next-row, e2e spec - 53bf0b4

## Verification
- `npx vitest run src/lib/engine src/lib/player` green (engine 46 tests, next 3 tests); `npm run check` 0 errors.
- `playwright test --list e2e/next-link.spec.ts` parses 3 tests.
- Plan-level Playwright run (player, deeplink, next-link) NOT executed: port 4173 was occupied by a parallel wave agent's server. Must be run after the wave completes.

## Deviations from Plan
- Worktree base was corrected with `git reset --hard b9466ee` per the startup check (no work lost).
- GuessMarker uses `data-testid="guess-marker"` on the hit circle only (single occurrence per acceptance criterion).

## Known Stubs
None. GuessMarker and PredictPrompt are not yet consumed by a concept; Plans 05/07/08 wire them.

## Self-Check: PASSED
