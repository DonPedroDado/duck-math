---
phase: 01-foundation-playable-unit-circle
reviewed: 2026-10-24T00:00:00Z
depth: standard
files_reviewed: 62
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
  warning: 5
  info: 11
  total: 16
status: issues_found
---

# Phase 01: Code Review Report (re-review after gap closure 01-12)

**Reviewed:** 2026-10-24
**Depth:** standard
**Files Reviewed:** 62
**Status:** issues_found

## Summary

This is a re-review after gap-closure plan 01-12 (commits `40fd100`, `e6f6893`, `c84d069`, `5aae4fd`). Since the previous review (`f3b7d2c`), only six files in scope changed: `derive.ts`, `derive.test.ts`, `format.ts`, `format.test.ts`, `DragPoint.svelte` and `e2e/drag.spec.ts`. The other 56 files are unchanged and were re-checked against the earlier findings.

**Gap-closure verification:**

| Prior ID | Status | Evidence |
|----------|--------|----------|
| CR-01 (keyboard upward wrap leaves theta at 2π − ε) | **Resolved** | `norm()` now snaps values within 1e-9 of 0 or TAU to exactly 0 (`derive.ts:6-9`). `keyStep()` puts keyboard steps on the integer-degree grid and converts to radians once, so drift cannot build up (`derive.ts:12-16`, `DragPoint.svelte:63-72`). `aria-valuenow` now comes from the same `degValue()` as the readout (`DragPoint.svelte:100`, `format.ts:30-36`). The unit tests cover 20 × +15° and 300 × +1° landing on exactly 0. The e2e test covers the readout, `data-theta`, aria attributes and arc presence after the wrap (`drag.spec.ts:109-129`). |

There are no critical findings left. One new warning: the pointer path can still show the same arc/readout mismatch as CR-01 in a narrow band just below 360°. The fix rounds only the *displayed* value, not the model value. All earlier warnings and info items are still open, because their files did not change. WR-04 (lib-to-concept coupling) got slightly worse: `DragPoint` now imports `keyStep` from the concept, and the wrap tolerance is copied in two places.

Prior items in files outside this file list (`src/routes/+layout.svelte:22` unguarded `localStorage.setItem`, `package.json`, `ci.yml`) are not re-reported. A spot check shows the `localStorage` call is still unguarded.

No new security issues. `{@html}` in `Tex.svelte` still only receives KaTeX output of repo-authored TeX, and trust is limited to `\htmlClass`.

## Warnings

### WR-01: Pointer drag just below 360° still shows "0°" while the angle arc is an almost full circle (new, remaining CR-01 symptom)

**File:** `src/lib/engine/format.ts:32`, `src/concepts/high-school/unit-circle/Scene.svelte:93-104`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:104`, `src/concepts/high-school/unit-circle/derive.ts:43-45`
**Issue:** 01-12 made the *display* snap to 0 for anything ≥ 359.95° (`degValue`, `format.ts:32`). The *model* only snaps within 1e-9 rad (`norm`). Pointer drags go through `angleFromPoint` → `norm`, so theta can be anywhere in `(TAU − 8.7e-4, TAU − 1e-9)`. This happens when the pointer is slightly below the positive x-axis. The band is easier to hit when the pointer is captured and far to the right of the circle, or when the device reports fractional `clientY`, which Chrome does on HiDPI, touch and pen. In that band:
- The readout, `aria-valuenow` and `aria-valuetext` say `0°`.
- `Scene.svelte:93` passes `theta >= 1e-3`, so `angle-arc` draws a ~359.95° arc (a full circle when theta > TAU − 1e-6, `geom.ts:13`). The θ label sits at `theta / 2` ≈ 180°, on the far side.
- In radian mode the readout says `6.28` (`fmtRad` does not apply the 359.95° snap, as `format.test.ts:36` confirms). So the two units disagree about the same theta.

The same mismatch also exists at the low end: theta in `[0.05°, 0.057°)` displays `0.1°`, but `Scene.svelte:93` hides the arc.
**Fix:** Snap the model so that all consumers agree. Do not snap only in the formatter. For example, export a single display-tolerance snap and apply it where theta is stored:
```ts
// shared (e.g. #lib/stage/geom.ts or #lib/engine/angle.ts)
export const DISPLAY_EPS = (0.05 * Math.PI) / 180;
export function snapTheta(t: number): number {
	const r = norm(t);
	return r < DISPLAY_EPS || TAU - r < DISPLAY_EPS ? 0 : r;
}
// +page.svelte
onthetachange={(t) => (user.theta = snapTheta(t))}
```
Then make the arc threshold in `Scene.svelte:93` the same constant, or `theta > 0`. Add a unit test: `degValue(snapTheta(TAU - 5e-4)) === 0` and `snapTheta(TAU - 5e-4) === 0`.

### WR-02: The rAF loop still restarts itself every frame, so the frame timestamp is discarded and playback runs slow (prior WR-01, still open)

**File:** `src/lib/engine/clock.svelte.ts:27,30-42`
**Issue:** Unchanged:
1. `loop` sets `this.raf = 0` and then dispatches `tick`.
2. `dispatch` (line 27) sees `playing && !this.raf` and calls `start()`.
3. `start()` resets `this.last = performance.now()` and schedules a new frame.

As a result, `this.last = ts` (line 37) is always overwritten and the re-schedule on line 39 is dead code. Each frame's `dt` loses the latency between the rAF timestamp and the callback, so authored step durations play back longer than intended.
**Fix:** Add a `running` flag. `dispatch` should call `start()` only when `!this.running`. `loop` should own re-scheduling and clear `running` when playback stops. In the test, mock `performance.now()` to return `ts + latency`.

### WR-03: A KaTeX throw in the Panel still takes down the whole page, because only the Scene has a boundary (prior WR-04, still open)

**File:** `src/lib/tex/tex.ts:8`, `src/concepts/high-school/unit-circle/Panel.svelte:57-65`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:96-127`
**Issue:** `tex()` uses `throwOnError: true` and runs on every theta change with live, locale-formatted numbers. The `<svelte:boundary>` wraps only the `stage` snippet. If any formula line throws, `Panel` fails to render and the concept page breaks.
**Fix:** Wrap the `panel` snippet in its own `<svelte:boundary>` with a minimal fallback. Alternatively, catch inside `Tex.svelte` and render the escaped source text. Keep throwing in unit tests.

### WR-04: `#lib/stage/DragPoint` depends on concept internals, and 01-12 deepened it (prior WR-05 / WR-03, still open)

**File:** `src/lib/stage/DragPoint.svelte:2,38-45`, `src/lib/engine/format.ts:4-9`, `src/concepts/high-school/unit-circle/derive.ts:3-9`
**Issue:** The shared primitive now imports `angleFromPoint` and `keyStep` from `#concepts/high-school/unit-circle/derive.ts`, which reverses the lib-to-concept dependency direction. 01-12 also duplicated the new `WRAP_EPS` tolerance and `norm` logic into `format.ts` ("private copy"), so the wrap behaviour that CR-01 depends on now lives in two places that must be kept in sync by hand. `update()` still ignores the `cx`/`cy` props and uses the bounding-rect center, which is only correct while `Stage` puts the origin at the viewBox center.
**Fix:** Move `TAU`, `WRAP_EPS`, `norm`, `keyStep` and `angleFromPoint` into one lib module (for example `#lib/stage/geom.ts` or a new `#lib/engine/angle.ts`). Import from there in `format.ts`, `DragPoint.svelte` and the concept's `derive.ts`. In `update()`, map client coordinates through `svg.getScreenCTM()!.inverse()` and subtract `cx`/`cy`.

### WR-05: The caption's live region is recreated on every step (prior WR-06, still open)

**File:** `src/concepts/high-school/unit-circle/Panel.svelte:47-49`
**Issue:** `aria-live="polite"` sits on the `<p>` inside `{#key step}`, so each step change inserts a new live region instead of updating an existing one. Many screen readers do not announce content in a newly inserted live region, so step captions can be silent.
**Fix:**
```svelte
<div aria-live="polite">
  {#key step}<p class="caption" data-testid="caption">{CAPTIONS[STEP_IDS[step]]()}</p>{/key}
</div>
```

## Info

### IN-01: The keyboard path reuses the `ondragstart` callback, with no matching end event

**File:** `src/lib/stage/DragPoint.svelte:70`
**Issue:** `ondragstart` fires on every arrow keydown, including auto-repeat, and nothing ever calls `ondragend` for keyboard input. This is harmless today. A future consumer that pairs start and end calls would get unbalanced calls.
**Fix:** Add a dedicated `oninteract?.()` callback for "user manipulated the value". Keep `ondragstart`/`ondragend` for pointer drags only.

### IN-02: The angle slider does not handle the standard ARIA slider keys

**File:** `src/lib/stage/DragPoint.svelte:63-72,98-99`
**Issue:** The element has `role="slider"`, but it only handles the arrow keys. The ARIA slider pattern also expects Home/End and PageUp/PageDown. Shift+Arrow is not discoverable. `aria-valuemax="360"` can never be reached, because 360 always displays as 0.
**Fix:** Map PageUp/PageDown to `keyStep(theta, ±15)` and Home/End to 0°/359°. Set `aria-valuemax="359"`, or document the wrap.

### IN-03: The invisible drag point is still focusable, draggable and keyboard-operable (prior IN-03)

**File:** `src/lib/stage/DragPoint.svelte:90-113`
**Issue:** When `scale === 0` (start of intro, or after Home on the scrubber), the 24 px hit target still has `tabindex="0"` and pointer handlers. A keypress on it pauses playback and changes theta while nothing is drawn.
**Fix:** Use `tabindex={scale > 0 ? 0 : -1}` and `pointer-events={scale > 0 ? 'auto' : 'none'}`, and return early from `key()`/`down()` when `scale === 0`.

### IN-04: `{#if true}` blocks used only to host `{@const}` (prior IN-04)

**File:** `src/concepts/high-school/unit-circle/Scene.svelte:103,212`
**Fix:** Move the label and hint positions into `$derived` values in the script block.

### IN-05: Zero-length windows or steps produce NaN in timeline helpers (prior IN-05)

**File:** `src/lib/engine/timeline.ts:16,38`
**Issue:** `seg(p, a, a)` and `locate` on a step with `dur === 0` divide by zero. `clamp01(NaN)` returns NaN, which would then reach SVG attributes.
**Fix:** Use `b === a ? (p >= a ? 1 : 0) : ...`, and guard `steps[i].dur > 0`.

### IN-06: The dev static server allows a protocol-relative redirect and has no stream error handler (prior IN-06)

**File:** `scripts/serve-build.mjs:47-48,58`
**Issue:** `/%2Fen` decodes to `//en`, which resolves to the `build/en` directory and redirects to `//en/`, a protocol-relative URL to host `en`. `createReadStream(...).pipe(res)` has no `error` listener.
**Fix:** Build `Location` from the raw `url.pathname`, reject paths that start with `//`, and add `.on('error', () => res.destroy())`.

### IN-07: The root-redirect allowlist lookup also matches prototype keys (prior IN-07)

**File:** `scripts/postbuild.mjs:18-19`
**Issue:** `ok[s]` is true for `s = 'constructor'` or `'__proto__'`, so a tampered `dm-locale` value gives a redirect to `/constructor/`, which is a 404.
**Fix:** `var l = (s === 'en' || s === 'de') ? s : null;`, and the same check for `c`.

### IN-08: `check-i18n` assumes flat string messages and crashes on `--dir` without a value (prior IN-08)

**File:** `scripts/check-i18n.mjs:45,68-69`
**Fix:** Report non-string message values as errors. Fail with a usage message when `--dir` has no value (`process.argv[i + 1]` is `undefined`).

### IN-09: `aria-disabled` on a role-less `div`, and step URLs have no canonical link (prior IN-09)

**File:** `src/lib/catalog/SoonCard.svelte:9`, `vite.config.ts:10`
**Issue:** `aria-disabled` has no effect on a generic `div`. `/…/unit-circle/` and `/…/unit-circle/intro/` are prerendered as duplicate pages with no `rel=canonical` or hreflang alternates.
**Fix:** Remove `aria-disabled`, or add a role and visually hidden "coming soon" text. Emit canonical and hreflang `<link>`s in the concept page's `<svelte:head>`.

### IN-10: `keyStep` from an off-grid angle skips the next integer degree (new)

**File:** `src/concepts/high-school/unit-circle/derive.ts:12-16`, `src/concepts/high-school/unit-circle/derive.test.ts:106`
**Issue:** `keyStep` rounds to the nearest degree and then adds the step. After a pointer drag to 134.6° (displayed as `134.6°`), ArrowRight goes to 136°, which skips 135° and moves 1.4°. Shift+ArrowRight goes to 150° (15.4°). The test `keyStep(r(134.6), 1) === r(136)` treats this as intended, but the readout makes the skip visible.
**Fix:** Snap in the direction of travel: `const d = deg(norm(theta)); const cur = Number.isInteger(d) ? d : (delta > 0 ? Math.floor(d) : Math.ceil(d));`, with a small tolerance before the integer check. Then 134.6 +1 gives 135 and 134.6 −1 gives 134.

### IN-11: The slider's accessible name contains the live value, so screen readers say it twice (new)

**File:** `src/concepts/high-school/unit-circle/Scene.svelte:254-255`, `messages/en.json:44`, `messages/de.json:44`
**Issue:** `label={m.uc_point_aria({ value: val })}` puts the current angle into `aria-label` ("Angle of the point, 60°"), and `aria-valuetext` contains the same value. Screen readers read the value twice, and the accessible name changes on every key press, which some screen readers announce as a name change.
**Fix:** Use a static name (for example "Angle of the point" / "Winkel des Punkts") and let `aria-valuetext` carry the value. Remove the `{value}` placeholder from both catalogs.

---

_Reviewed: 2026-10-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
