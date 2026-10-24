---
phase: 01-foundation-playable-unit-circle
reviewed: 2026-10-24T13:45:00Z
depth: standard
files_reviewed: 64
files_reviewed_list:
  - e2e/catalog.spec.ts
  - e2e/deeplink.spec.ts
  - e2e/drag.spec.ts
  - e2e/formulas.spec.ts
  - e2e/i18n.spec.ts
  - e2e/notfound.spec.ts
  - e2e/player.spec.ts
  - e2e/radian.spec.ts
  - e2e/root-redirect.spec.ts
  - e2e/skeleton.spec.ts
  - messages/de.json
  - messages/en.json
  - paraglide.config.mjs
  - scripts/check-i18n.mjs
  - scripts/check-i18n.test.ts
  - scripts/paraglide-compile.mjs
  - scripts/postbuild.mjs
  - scripts/serve-build.mjs
  - src/concepts/high-school/unit-circle/derive.test.ts
  - src/concepts/high-school/unit-circle/derive.ts
  - src/concepts/high-school/unit-circle/formulas.ts
  - src/concepts/high-school/unit-circle/index.ts
  - src/concepts/high-school/unit-circle/Panel.svelte
  - src/concepts/high-school/unit-circle/projection.ts
  - src/concepts/high-school/unit-circle/RadianLayer.svelte
  - src/concepts/high-school/unit-circle/radian.test.ts
  - src/concepts/high-school/unit-circle/radian.ts
  - src/concepts/high-school/unit-circle/Scene.svelte
  - src/concepts/high-school/unit-circle/steps.ts
  - src/concepts/high-school/unit-circle/Thumbnail.svelte
  - src/concepts/high-school/unit-circle/urls.test.ts
  - src/concepts/high-school/unit-circle/urls.ts
  - src/concepts/high-school/unit-circle/view.ts
  - src/concepts/registry.ts
  - src/lib/catalog/categories.ts
  - src/lib/catalog/ConceptCard.svelte
  - src/lib/catalog/SoonCard.svelte
  - src/lib/catalog/thumbs/DerivativesThumb.svelte
  - src/lib/catalog/thumbs/FunctionsThumb.svelte
  - src/lib/catalog/thumbs/LimitsThumb.svelte
  - src/lib/catalog/upcoming.ts
  - src/lib/engine/angle.test.ts
  - src/lib/engine/angle.ts
  - src/lib/engine/clock.svelte.ts
  - src/lib/engine/format.test.ts
  - src/lib/engine/format.ts
  - src/lib/engine/player.ts
  - src/lib/engine/timeline.ts
  - src/lib/icons/Icon.svelte
  - src/lib/player/ConceptLayout.svelte
  - src/lib/player/PlayerBar.svelte
  - src/lib/player/Scrubber.svelte
  - src/lib/stage/DragPoint.svelte
  - src/lib/stage/geom.ts
  - src/lib/stage/Stage.svelte
  - src/lib/styles/math.css
  - src/lib/styles/tokens.css
  - src/lib/tex/Tex.svelte
  - src/lib/tex/tex.ts
  - src/lib/ui/SegmentedToggle.svelte
  - src/routes/+error.svelte
  - src/routes/high-school/unit-circle/[[step]]/+page.svelte
  - src/routes/+page.svelte
  - vite.config.ts
findings:
  critical: 0
  warning: 1
  info: 15
  total: 16
status: issues_found
---

# Phase 01: Code Review Report (re-review after code-review-fix iteration 1)

**Reviewed:** 2026-10-24T13:45:00Z
**Depth:** standard
**Files Reviewed:** 64
**Status:** issues_found

## Summary

This re-review follows the fix commits for the previous review's warnings: `ed1d8e9` (WR-01), `9e34afa` (WR-02), `f48f6f8` (WR-03), `0f0e73d` (WR-04) and `a32e886` (WR-05). Files changed since the last review: `angle.ts` (new), `angle.test.ts` (new), `format.ts`, `clock.svelte.ts`, `clock.test.ts`, `derive.ts`, `DragPoint.svelte`, `Tex.svelte`, `Panel.svelte`, `Scene.svelte` and the concept `+page.svelte`. `clock.test.ts` is not in the file list. I read it only as evidence for WR-02. `npx vitest run` passes: 15 files, 143 tests.

**Verification of the fixes:**

| Prior ID | Status | Evidence |
|----------|--------|----------|
| WR-01 (readout says 0° while the arc is almost a full circle) | **Resolved** | `snapTheta` (`angle.ts:23-28`) uses the same degree expression and `DISPLAY_EPS_DEG` threshold as `degValue` (`format.ts:24-30`). It is applied at the only write site for `user.theta` (`+page.svelte:104`). The arc condition is now `theta > 0` (`Scene.svelte:93`). The smallest stored non-zero theta is about 8.7e-4 rad, which is far above the 1e-6 empty/full-circle thresholds in `arcPath`, so the arc can never be drawn as a full circle. The sweep test (`angle.test.ts:32-39`) covers both ends of the range. No regression found. One placement concern is noted in IN-13. |
| WR-02 (rAF loop restarts every frame) | **Resolved** | The `running` flag and session token (`clock.svelte.ts:29-58`) leave rescheduling to the loop, and `last = ts` now carries over from one frame to the next. I traced stop-from-inside-tick (a tick ends playback, `dispatch` calls `stop()` while `raf === 0`, and the loop falls through to `running = false`), pause/play while a stale frame is queued, and `destroy`. All three behave correctly. If the first frame's `ts` is earlier than the `performance.now()` captured at start, `dt` is clamped to 0, so at most one frame is lost per play session. That is acceptable. |
| WR-03 (a KaTeX throw takes down the panel) | **Resolved** | `Tex.svelte:9-16` catches the error and renders the source as escaped text. There is no new XSS vector, because the fallback uses `{src}` and not `{@html}`. A side effect on observability is noted in IN-14. |
| WR-04 (lib imports from concept internals) | **Resolved** | `DragPoint` now imports from `#lib/engine/angle.ts`. `update()` maps the pointer through `getScreenCTM().inverse()` and subtracts `cx`/`cy` (`DragPoint.svelte:38-45`). The only remaining `#concepts` imports in non-test `src/lib` files are type-only (`catalog/categories.ts:2`, `catalog/upcoming.ts:3`, `ConceptCard.svelte:4`). `geom.ts` still keeps its own `TAU` (IN-13). |
| WR-05 (caption live region recreated on every step) | **Resolved** | `aria-live="polite"` is now on a persistent `<div>`, and only the `<p>` inside it is keyed (`Panel.svelte:48-52`). However, the panel also contains an implicit live region that was not flagged before (WR-01 below). |

There are no critical findings. One new warning: an implicit live region in the theta readout makes screen readers repeat every angle change. All prior Info items IN-01 to IN-11 were re-checked, and all of them still apply. Line references are updated where code moved (IN-10 now points to `angle.ts`). There are four new Info items (IN-12 to IN-15).

There are no security regressions. The only `{@html}` (`Tex.svelte:21`) still receives KaTeX output from repo-authored TeX only, and trust is still limited to `\htmlClass` (`tex.ts:6`).

## Warnings

### WR-01: The theta readout `<output>` is an implicit live region, so every drag or arrow step is announced again (new)

**File:** `src/concepts/high-school/unit-circle/Panel.svelte:53-59`
**Issue:** The HTML `<output>` element maps to `role="status"`, which implies `aria-live="polite"`. The readout `<output data-testid="theta-readout">` changes on every `user.theta` update. During a pointer drag that means every `pointermove`. With the keyboard it means every arrow press. A screen-reader user operating the angle slider therefore hears the value from the slider's `aria-valuetext`, then the same value again from the `<output>` status region, and the slider's changing accessible name adds a third repeat (IN-11). During a drag, polite announcements queue up and keep coming after the pointer stops. These announcements also compete with the step-caption live region that WR-05 fixed, so captions can be delayed or dropped. The wrapper's `aria-hidden={v.readout === 0}` only suppresses this before the `angle` step.
**Fix:** The slider already exposes the value, so make the readout a plain element instead of a live region:
```svelte
<span data-testid="theta-readout" data-unit={shownUnit}>
  {shownUnit === 'rad' ? fmtRad(theta, locale) : fmtDeg(theta, locale)}
</span>
```
If `<output>` is kept for its semantics, add `aria-live="off"` to it. Update any e2e selectors that rely on the `output` tag; they currently use `data-testid`, so they are unaffected.

## Info

### IN-01: The keyboard path reuses the `ondragstart` callback, with no matching end event (prior IN-01)

**File:** `src/lib/stage/DragPoint.svelte:70`
**Issue:** `ondragstart` fires on every arrow keydown, including auto-repeat, and nothing ever calls `ondragend` for keyboard input. A consumer that pairs start and end calls would get unbalanced calls.
**Fix:** Add a dedicated `oninteract?.()` callback for keyboard and pointer manipulation. Keep `ondragstart`/`ondragend` for pointer drags only.

### IN-02: The angle slider does not handle the standard ARIA slider keys (prior IN-02)

**File:** `src/lib/stage/DragPoint.svelte:63-72,98-99`
**Issue:** The element has `role="slider"`, but it only handles the arrow keys. The ARIA slider pattern also expects Home/End and PageUp/PageDown. `aria-valuemax="360"` can never be reached, because `degValue` maps 360 to 0.
**Fix:** Map PageUp/PageDown to `keyStep(theta, ±15)` and Home/End to 0°/359°. Set `aria-valuemax="359"`, or document the wrap.

### IN-03: The invisible drag point is still focusable, draggable and keyboard-operable (prior IN-03)

**File:** `src/lib/stage/DragPoint.svelte:90-113`
**Issue:** When `scale === 0` (start of the intro step, or after Home on the scrubber), the 24 px hit target still has `tabindex="0"` and its pointer handlers. A keypress or tap on it pauses playback and changes theta while nothing is drawn.
**Fix:** Use `tabindex={scale > 0 ? 0 : -1}` and `pointer-events={scale > 0 ? 'auto' : 'none'}`, and return early from `key()`/`down()` when `scale === 0`.

### IN-04: `{#if true}` blocks are used only to host `{@const}` (prior IN-04)

**File:** `src/concepts/high-school/unit-circle/Scene.svelte:103,212`
**Fix:** Move the label and hint positions into `$derived` values in the script block.

### IN-05: Zero-length windows or steps produce NaN in the timeline helpers (prior IN-05)

**File:** `src/lib/engine/timeline.ts:16,38`
**Issue:** `seg(p, a, a)`, and `locate` on a step with `dur === 0`, divide by zero. `clamp01(NaN)` returns NaN, which then reaches SVG attributes.
**Fix:** In `seg`, use `b === a ? (p >= a ? 1 : 0) : ...`. In `locate`, guard with `steps[i].dur > 0`.

### IN-06: The dev static server allows a protocol-relative redirect and has no stream error handler (prior IN-06)

**File:** `scripts/serve-build.mjs:47-48,58`
**Issue:** `/%2Fen` decodes to `//en`, which resolves to the `build/en` directory. The server then redirects to `//en/`, which is a protocol-relative URL pointing at host `en`. `createReadStream(...).pipe(res)` has no `error` listener.
**Fix:** Build `Location` from the raw `url.pathname`, reject paths that start with `//`, and add `.on('error', () => res.destroy())`.

### IN-07: The root-redirect allowlist lookup also matches prototype keys (prior IN-07)

**File:** `scripts/postbuild.mjs:18-19`
**Issue:** `ok[s]` is truthy for `s = 'constructor'`, `'toString'` and similar keys. A tampered `dm-locale` value therefore redirects to `/constructor/`, which is a 404.
**Fix:** Use `var l = (s === 'en' || s === 'de') ? s : null;`, and apply the same check to `c`.

### IN-08: `check-i18n` assumes flat string messages and crashes when `--dir` has no value (prior IN-08)

**File:** `scripts/check-i18n.mjs:45,68-69`
**Issue:** `String(v)` turns an object or array value into `"[object Object]"`, so a structured message passes the empty check. When `--dir` is the last argument, `process.argv[i + 1]` is `undefined`, and `path.join` then throws.
**Fix:** Report non-string values as errors. Exit with a usage message when `--dir` has no value.

### IN-09: `aria-disabled` is set on a role-less `div`, and step URLs have no canonical link (prior IN-09)

**File:** `src/lib/catalog/SoonCard.svelte:9`, `vite.config.ts:10`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:84-86`
**Issue:** `aria-disabled` has no effect on a generic `div`. `/…/unit-circle/` and `/…/unit-circle/intro/` are prerendered as duplicate pages. The concept page's `<svelte:head>` contains only `<title>`, with no `rel=canonical` and no hreflang alternates.
**Fix:** Remove `aria-disabled`, or add a role plus visually hidden "coming soon" text. Emit canonical and hreflang `<link>`s in the concept page's `<svelte:head>`.

### IN-10: `keyStep` from an off-grid angle skips the next integer degree (prior IN-10, moved)

**File:** `src/lib/engine/angle.ts:31-35`, `src/concepts/high-school/unit-circle/derive.test.ts:106`
**Issue:** `keyStep` rounds to the nearest degree before adding the step. After a pointer drag to 134.6°, ArrowRight goes to 136°: it skips 135° and moves 1.4°. The test pins this behaviour as intended (`keyStep(r(134.6), 1) === r(136)`).
**Fix:** Snap in the direction of travel. Compute `d = deg(norm(theta))`, then use `cur = isNearInt(d) ? Math.round(d) : (delta > 0 ? Math.floor(d) : Math.ceil(d))`, and update the test.

### IN-11: The slider's accessible name contains the live value, so screen readers say it twice (prior IN-11)

**File:** `src/concepts/high-school/unit-circle/Scene.svelte:254-255`, `messages/en.json:44`, `messages/de.json:44`
**Issue:** `label={m.uc_point_aria({ value: val })}` puts the angle into `aria-label`, and `aria-valuetext` repeats it. The accessible name also changes on every value change. Together with WR-01, the value is now announced three times.
**Fix:** Use a static name ("Angle of the point" / "Winkel des Punkts") and remove the `{value}` placeholder from both catalogs.

### IN-12: The Scrubber does not clear `capturing` on `lostpointercapture` (new)

**File:** `src/lib/player/Scrubber.svelte:32-41,73-76`
**Issue:** `capturing` is cleared only on `pointerup`/`pointercancel`. If capture is lost any other way (for example, capture is released by the browser or an element takes focus mid-gesture), or if `setPointerCapture` throws after a synthetic event, `capturing` stays `true`. Later hover `pointermove` events then seek the timeline with no button pressed. `DragPoint` already handles this case (`onlostpointercapture={end}`).
**Fix:** Add `onlostpointercapture={up}` to the track. You can also guard `move` with `e.buttons !== 0` for mouse pointers.

### IN-13: The angle "single source of truth" is still incomplete (new, follow-up to the WR-01/WR-04 fixes)

**File:** `src/lib/stage/geom.ts:1`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:104`, `src/concepts/high-school/unit-circle/Scene.svelte:93`
**Issue:** `geom.ts` still declares its own private `const TAU`, although `angle.ts:1` says it is the single source. The display snap that the Scene's `theta > 0` arc condition depends on is applied only in the route's `onthetachange`. `DragPoint` and `Scene` themselves emit and accept unsnapped values. A second route or embed that reuses `Scene` without `snapTheta` would bring back the "0° readout with a near-full arc" mismatch.
**Fix:** Import `TAU` from `#lib/engine/angle.ts` in `geom.ts`. Apply `snapTheta` inside `Scene`, so the concept owns its invariant: `onchange={(t) => onthetachange(snapTheta(t))}`.

### IN-14: The Tex fallback hides build-time errors and logs on every frame (new, side effect of the WR-03 fix)

**File:** `src/lib/tex/Tex.svelte:9-16,23`
**Issue:** Because of the catch, a broken formula no longer fails prerendering. The prerendered HTML ships with the raw TeX source in `<code>`, and nothing fails in CI. The only e2e check is indirect: `.t-angle` colour and `0,50` text assertions in `formulas.spec.ts`. The `formulas.test.ts:55` sweep through `tex()` mitigates this for the current concept, but not for future concepts. In the browser, an error in a theta-dependent line runs `console.error` on every pointermove during a drag.
**Fix:** In dev/SSR, rethrow: `if (import.meta.env.DEV || import.meta.env.SSR) throw err;`. Alternatively, add an e2e assertion `await expect(page.getByTestId('tex-error')).toHaveCount(0)` on each step. Log at most once per distinct `src`.

### IN-15: The theta readout `<output>` and the caption together put two live regions in one panel (new, a11y design note)

**File:** `src/concepts/high-school/unit-circle/Panel.svelte:48-56`
**Issue:** Even after WR-01 is fixed, the panel should have only one intentional live region: the caption. No test asserts this. Without one, a later edit (for example, adding `role="status"` to the formula block) could bring back competing announcements.
**Fix:** Add an e2e check that the panel contains exactly one element with `aria-live` or `role=status` (`page.locator('aside [aria-live], aside [role=status], aside output')` should have count 1).

---

_Reviewed: 2026-10-24T13:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
