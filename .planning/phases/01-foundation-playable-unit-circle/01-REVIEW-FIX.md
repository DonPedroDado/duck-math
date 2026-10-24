---
phase: 01-foundation-playable-unit-circle
fixed_at: 2026-10-24T13:52:48+02:00
review_path: .planning/phases/01-foundation-playable-unit-circle/01-REVIEW.md
iteration: 1
findings_in_scope: 16
fixed: 16
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-10-24T13:52:48+02:00
**Source review:** .planning/phases/01-foundation-playable-unit-circle/01-REVIEW.md
**Iteration:** 1
**Fix scope:** all (1 Warning and 15 Info)

**Summary:**
- Findings in scope: 16
- Fixed: 16 (IN-10 is marked "requires human verification" because it changes stepping logic)
- Skipped: 0

**Verification after all fixes (worktree at 71b9db1, fast-forwarded onto master):**
- `npx vitest run`: 15 files, 146 tests passed.
- `npm run check`: 880 files, 0 errors, 0 warnings.
- `npx playwright test` against a production build (`npm run build` plus `scripts/serve-build.mjs`): 130 passed, 37 skipped, 0 failed. The 37 skips are the existing `test.skip(project !== 'desktop', 'run once')` guards in `mobile.spec.ts`.
- The first full e2e run had 1 failure: `drag.spec.ts` "drag during intro animation pauses and hides the hint". That test grabbed the point 300 ms into the intro, when nothing is drawn yet, which the IN-03 fix now deliberately blocks. The test now waits until the point is drawn (halo opacity 1) while the intro is still playing, and a new test covers the inert state (commit 71b9db1). The drag spec then passed 3 times in a row (`--repeat-each=3`), and so did the full suite.

## Fixed Issues

### WR-01: The theta readout `<output>` is an implicit live region

**Files modified:** `src/concepts/high-school/unit-circle/Panel.svelte`
**Commit:** 3451705
**Applied fix:** Replaced `<output data-testid="theta-readout">` with a plain `<span class="value">` that keeps the same testid and `data-unit`. Updated the `.readout output` CSS selector to `.readout .value`. The step caption is now the panel's only live region.

### IN-01: The keyboard path reuses the `ondragstart` callback, with no matching end event

**Files modified:** `src/lib/stage/DragPoint.svelte`, `src/concepts/high-school/unit-circle/Scene.svelte`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte`
**Commit:** b2cf2bb
**Applied fix:** Added an `oninteract` callback to `DragPoint`. It fires on pointerdown and on every key step. `ondragstart`/`ondragend` now fire for pointer drags only, always as a pair. `Scene` and the route now use `oninteract` for the pause-and-hide-hint behaviour.

### IN-02: The angle slider does not handle the standard ARIA slider keys

**Files modified:** `src/lib/stage/DragPoint.svelte`, `e2e/drag.spec.ts`
**Commit:** 52a7a9a
**Applied fix:** PageUp/PageDown step ±15° through `keyStep`. Home goes to 0° and End to 359°. `aria-valuemax` is now 359 (`MAX_DEG`). Added an e2e test for all four keys and the new `aria-valuemax`.

### IN-03: The invisible drag point is still focusable, draggable and keyboard-operable

**Files modified:** `src/lib/stage/DragPoint.svelte`, `e2e/drag.spec.ts`
**Commits:** 69de9c1 (fix), 71b9db1 (e2e adaptation and coverage)
**Applied fix:** Added `live = scale > 0`. The hit target now uses `tabindex={live ? 0 : -1}` and `pointer-events={live ? 'auto' : 'none'}`, and `down()`/`key()` return early when the point is not live. The existing intro-drag e2e test now grabs the point once it is drawn, and a new test checks that at t = 0 the slider has tabindex -1 and a click does not change theta.

### IN-04: `{#if true}` blocks are used only to host `{@const}`

**Files modified:** `src/concepts/high-school/unit-circle/Scene.svelte`
**Commit:** 022a2fe
**Applied fix:** I adapted the suggested fix. The label and hint positions depend on the Stage geometry (`cx`, `cy`, `R`), which only exists as snippet arguments, so they cannot be `$derived` values in the script block. Instead, the `{@const}` declarations moved to the top of the snippet next to the existing `ppx`/`ppy`, and both `{#if true}` wrappers are gone.

### IN-05: Zero-length windows or steps produce NaN in the timeline helpers

**Files modified:** `src/lib/engine/timeline.ts`, `src/lib/engine/timeline.test.ts`
**Commit:** 2796cf2
**Applied fix:** `seg` now behaves as a step function when `b === a`. `locate` returns `p = 1` for a zero-duration step. Added unit tests for both cases, including a check that no `p` is NaN.

### IN-06: The dev static server allows a protocol-relative redirect and has no stream error handler

**Files modified:** `scripts/serve-build.mjs`
**Commit:** c55e945
**Applied fix:** Paths that start with `//`, before or after decoding, now return 404. The trailing-slash `Location` is built from the raw `url.pathname`. The read stream gets `.on('error', () => res.destroy())`. Smoke test: `/%2Fen` gives 404, `/en` gives 301 to `/en/`, `/en/` gives 200, and `/%2F%2Fevil` gives 404.

### IN-07: The root-redirect allowlist lookup also matches prototype keys

**Files modified:** `scripts/postbuild.mjs`, `e2e/root-redirect.spec.ts`
**Commit:** 3561db5
**Applied fix:** Replaced the `ok[s]` object lookup with a strict-equality `ok(x)` function (`x === 'en' || x === 'de'`). It is used for both the stored value and the navigator languages. Added an e2e test where a stored value of `constructor` falls back to the browser locale.

### IN-08: `check-i18n` assumes flat string messages and crashes when `--dir` has no value

**Files modified:** `scripts/check-i18n.mjs`, `scripts/check-i18n.test.ts`
**Commit:** a45e60f
**Applied fix:** Non-string values are now reported as `not a string in <locale>: <key> (object|array|...)`, and the placeholder comparison only runs when the base value is a string. A `--dir` with no value, or followed by another flag, prints a usage message and exits with code 2. Added unit and CLI tests.

### IN-09: `aria-disabled` on a role-less `div`, and no canonical link on step URLs

**Files modified:** `src/lib/catalog/SoonCard.svelte`, `e2e/catalog.spec.ts`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte`, `e2e/deeplink.spec.ts`
**Commit:** d4d3b41
**Applied fix:** Removed `aria-disabled` from `SoonCard`; the visible, translated "Soon"/"Bald" badge already shows the status, and the e2e check now asserts the attribute is gone. The concept page's `<svelte:head>` now emits `rel=canonical` plus hreflang alternates for each locale and `x-default` (the base locale). The bare `/unit-circle/` URL is canonical for the intro step, so `/unit-circle/` and `/unit-circle/intro/` both point to it. I checked this in the prerendered HTML, and a new e2e test asserts it. No user-visible strings were added.

### IN-10: `keyStep` from an off-grid angle skips the next integer degree

**Files modified:** `src/lib/engine/angle.ts`, `src/concepts/high-school/unit-circle/derive.test.ts`
**Commit:** 42b90fe
**Status:** fixed: requires human verification (stepping logic changed)
**Applied fix:** An angle within 1e-6° of a whole degree counts as on the grid and is rounded. Otherwise it is floored when stepping up and ceiled when stepping down, then the step is added. 134.6° now goes to 135° on +1 and to 134° on -1. The test that pinned `r(136)` now expects `r(135)`, and new tests cover -1, 134.4° and both sides of the 0/360 wrap. Note that a ±15 step from an off-grid angle moves less than 15° (for example 134.6° to 149°), because it lands on the integer grid.

### IN-11: The slider's accessible name contains the live value

**Files modified:** `messages/en.json`, `messages/de.json`, `src/concepts/high-school/unit-circle/Scene.svelte`, `e2e/drag.spec.ts`
**Commit:** 7d1b649
**Applied fix:** `uc_point_aria` is now static in both catalogs ("Angle of the point" / "Winkel des Punkts"), with no `{value}` placeholder, and `Scene` calls `m.uc_point_aria()`. The value is carried only by `aria-valuetext`. `check-i18n` passes (58 keys). Added an e2e test that the name stays the same while the value changes.

### IN-12: The Scrubber does not clear `capturing` on `lostpointercapture`

**Files modified:** `src/lib/player/Scrubber.svelte`
**Commit:** 0ad7ee3
**Applied fix:** Added `onlostpointercapture={up}`. `setPointerCapture` is now in a try block: if it throws, the scrubber seeks once without entering capture mode. `move` also clears `capturing` when a mouse pointer reports `buttons === 0`.

### IN-13: The angle "single source of truth" is still incomplete

**Files modified:** `src/lib/stage/geom.ts`, `src/concepts/high-school/unit-circle/Scene.svelte`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte`
**Commit:** 2848a98
**Applied fix:** `geom.ts` imports `TAU` from `#lib/engine/angle.ts`. `Scene` now applies `snapTheta` itself (`onchange={(t) => onthetachange(snapTheta(t))}`) and documents the invariant on the prop. The route no longer snaps, which would now be redundant, and its `snapTheta` import is removed.

### IN-14: The Tex fallback hides build-time errors and logs on every frame

**Files modified:** `src/lib/tex/Tex.svelte`, `e2e/formulas.spec.ts`
**Commit:** ecbe87c
**Applied fix:** In dev and during SSR/prerender, the KaTeX error is now rethrown, so a broken formula fails the build. In the production browser the component still falls back to `<code data-testid="tex-error">`, and it logs at most once per distinct `src`, tracked in a module-level `Set`. Added e2e tests that every step has no `tex-error` in both locales.

### IN-15: Two live regions in one panel; no test guards this

**Files modified:** `e2e/player.spec.ts`
**Commit:** 278b096
**Applied fix:** Added an e2e test that checks four steps. On each, `aside` must contain exactly one element matching `[aria-live]`, `[role=status]`, `[role=alert]`, `[role=log]` or `output`, and that element must hold the caption.

---

_Fixed: 2026-10-24T13:52:48+02:00_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
