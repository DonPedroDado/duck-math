---
phase: 01-foundation-playable-unit-circle
fixed_at: 2026-10-24T13:35:30Z
review_path: .planning/phases/01-foundation-playable-unit-circle/01-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-10-24T13:35:30Z
**Source review:** .planning/phases/01-foundation-playable-unit-circle/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (WR-01 to WR-05; Info findings out of scope)
- Fixed: 5
- Skipped: 0

**Verification after all fixes:**
- `npx vitest run`: 15 files, 143 tests passed (was 136; 7 new tests added).
- `npx playwright test` (desktop and mobile, against a production build): 122 passed, 37 skipped (skips come from the config's per-project `testMatch`), 0 failed.
- `npm run check` in the main repo after the fast-forward: 0 errors, 0 warnings (880 files). In the isolated `/tmp` worktree it reported 2 `Cannot find module './$types'` errors. The same 2 errors appeared on the unmodified base commit there, so they came from the worktree environment and not from these fixes.

## Fixed Issues

### WR-01: Pointer drag just below 360° still shows "0°" while the angle arc is an almost full circle

**Files modified:** `src/lib/engine/angle.ts` (new), `src/lib/engine/angle.test.ts` (new), `src/lib/engine/format.ts`, `src/concepts/high-school/unit-circle/derive.ts`, `src/concepts/high-school/unit-circle/Scene.svelte`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte`
**Commit:** ed1d8e9
**Applied fix:** Added a shared `#lib/engine/angle.ts` with `TAU`, `norm`, `DISPLAY_EPS_DEG`/`DISPLAY_EPS` and `snapTheta`. The concept page now stores `user.theta = snapTheta(t)`. `snapTheta` uses the same degree expression and threshold as `degValue` (which now reads `DISPLAY_EPS_DEG`), so the two agree at the boundary. In the first attempt the radian comparison disagreed with `degValue` by float rounding, and a sweep test caught it. The angle-arc condition in `Scene.svelte` is now `theta > 0`. After the snap, the arc shows exactly when the readout is not 0°. This fixes both the high-end and the low-end mismatch. `format.ts` and `derive.ts` now share `norm` and no longer keep private copies. New tests cover `snapTheta(TAU - 5e-4) === 0`, `degValue(snapTheta(...)) === 0`, `fmtRad` giving `0.00`, and a sweep showing that no non-zero snapped theta displays as 0°. **Logic change, so it needs human verification.**

### WR-02: The rAF loop restarts itself every frame, so the frame timestamp is discarded

**Files modified:** `src/lib/engine/clock.svelte.ts`, `src/lib/engine/clock.test.ts`
**Commit:** 9e34afa
**Applied fix:** Added a `running` flag. `dispatch` calls `start()` only when no play session is running, and calls the new `stop()` when playback stops. The loop handles re-scheduling itself, so `last = ts` carries over from frame to frame. Pausing cancels the pending frame. A session token turns frames left over from a stopped session into no-ops (the test's `cancelAnimationFrame` mock does not drop callbacks, which exposed this). New tests: (a) with `performance.now()` running 5 ms ahead of the rAF timestamp, 10 × 16 ms frames advance `t` by exactly 0.160 s; (b) pause then play leaves exactly one pending frame. **Logic change, so it needs human verification.**

### WR-03: A KaTeX throw in the Panel takes down the whole page

**Files modified:** `src/lib/tex/Tex.svelte`
**Commit:** f48f6f8
**Applied fix:** I chose the review's alternative fix: `Tex.svelte` catches errors from `tex()`, logs them with `console.error`, and renders the escaped TeX source in a `<code class="tex tex-error" data-testid="tex-error">` fallback. A bad formula line now degrades only that line. `tex()` itself still uses `throwOnError: true`, so unit tests still throw. No `<svelte:boundary>` was added around the `panel` snippet. It would need new i18n fallback strings, and the KaTeX path was the risk named in the finding.

### WR-04: `#lib/stage/DragPoint` depends on concept internals

**Files modified:** `src/lib/engine/angle.ts`, `src/concepts/high-school/unit-circle/derive.ts`, `src/lib/stage/DragPoint.svelte`
**Commit:** 0f0e73d
**Applied fix:** Moved `keyStep` and `angleFromPoint` into `#lib/engine/angle.ts`, next to `TAU`/`norm`. `TAU`/`norm` and the single `WRAP_EPS` already moved there in WR-01. The concept's `derive.ts` re-exports them, so existing concept code and tests are unchanged. `DragPoint` imports from `#lib/engine/angle.ts`. `update()` now maps the pointer through the hit-target element's `getScreenCTM().inverse()` (so ancestor transforms are included) and subtracts the `cx`/`cy` props, instead of assuming the bounding-rect centre is the origin. Drag e2e tests pass. Remaining `#concepts` imports under `src/lib` are only in test files and type-only imports in `catalog`. Those are outside this finding.

### WR-05: The caption's live region is recreated on every step

**Files modified:** `src/concepts/high-school/unit-circle/Panel.svelte`
**Commit:** a32e886
**Applied fix:** Moved `aria-live="polite"` to a persistent wrapper `<div>`. Only the caption `<p>` inside it is re-keyed with `{#key step}`, so the fade animation and `data-testid="caption"` are kept. The panel still has one flex child in that position, so the layout is unchanged. The desktop and mobile caption e2e tests pass.

---

_Fixed: 2026-10-24T13:35:30Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
