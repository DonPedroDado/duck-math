---
phase: 01-foundation-playable-unit-circle
reviewed: 2026-10-24T00:00:00Z
depth: standard
files_reviewed: 61
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
  critical: 1
  warning: 4
  info: 9
  total: 14
status: issues_found
---

# Phase 01: Code Review Report (re-review after gap closure 01-11)

**Reviewed:** 2026-10-24
**Depth:** standard
**Files Reviewed:** 61
**Status:** issues_found

## Summary

This is a re-review after gap-closure plan 01-11 (commits `cba3f9c`, `cb15f23`). It checks the three fixes and re-checks the listed files.

**Gap-closure verification:**

| Prior ID | Status | Evidence |
|----------|--------|----------|
| CR-01 (keyboard theta not normalized) | **Partially resolved** | `DragPoint.key()` and `+page.svelte` now call `norm()`. Wrapping below 0° works and has an e2e test. Wrapping **upward past 360°** still leaves theta a few ulps below 2π, which reproduces the original full-circle and misplaced-label symptoms. See CR-01 below. |
| WR-02 (toggle bound to blended unit) | Resolved | `Panel.svelte:76` now binds `value={unit}` (the real `user.unit`). `radian.spec.ts:232-244` covers the blend window. |
| WR-03 (keyboard does not pause or hide hint) | Resolved | `DragPoint.svelte:70` calls `ondragstart?.()` before `onchange`. `drag.spec.ts:109-122` covers both effects. |

The other prior findings in reviewed files are **still open and unchanged**: WR-01 clock re-arm, WR-04 Panel KaTeX boundary, WR-05 lib-to-concept import (now one import worse), WR-06 caption live region, and the Info items. They are carried forward below with new IDs.

Prior IN-01 (`src/routes/+layout.svelte:22`, unguarded `localStorage`), IN-05 (`package.json`) and IN-07 (`ci.yml`) are in files outside this review's file list, so they are not re-reported. A spot check shows IN-01 is still unfixed.

No new security issues. `{@html}` in `Tex.svelte` still only receives KaTeX output of repo-authored TeX, with trust limited to `\htmlClass`.

## Critical Issues

### CR-01: Keyboard wrap upward through 360° leaves theta at 2π − ε, so the angle arc becomes a full circle and the θ label flips to 180° (CR-01 not fully resolved)

**File:** `src/concepts/high-school/unit-circle/derive.ts:3-6`, `src/lib/stage/DragPoint.svelte:36,63-72,100`, `src/concepts/high-school/unit-circle/Scene.svelte:93-104`, `src/lib/stage/geom.ts:13`
**Issue:** `norm()` only maps exactly `TAU` to 0. Each keyboard step adds a floating-point `step` to the previous floating-point theta, so error builds up. When the user steps upward to 360°, theta lands a few ulps *below* `TAU` instead of on it, and `norm` leaves it unchanged. Measured with the exact code path (`theta = norm(theta + step)`, starting at the default π/3):

- 20 × Shift+ArrowRight (60° + 300°): theta = `6.283185307179581` (TAU − 5e-15)
- 300 × ArrowRight: theta = `6.283185307179323` (TAU − 2.6e-13)

Downstream effects at that point:
- `Scene.svelte:93`: `theta >= 1e-3` is true. `arcPath(cx, cy, 0.25R, 0, theta * v.arc)` gets a sweep ≥ `TAU - 1e-6` (`geom.ts:13`), so it draws a **full circle**.
- `Scene.svelte:104`: the θ label sits at `theta / 2` ≈ 180°, on the opposite side of the circle.
- `Panel` readout / `fmtDeg` snaps to `0°`, so the visual (full turn) and the number (0°) disagree. This is the same mismatch CR-01 was opened for.
- `DragPoint.svelte:36,100`: `aria-valuenow = Math.round(359.99999…) = 360`, while `aria-valuetext` says `0°`.

Rotating a full turn with Shift+Arrow is a normal thing for a keyboard user to do, and this is the a11y path for the app's core interaction. The new e2e test (`drag.spec.ts:90-107`) only covers the downward wrap. The new unit test (`derive.test.ts:57-67`) only asserts `norm(a) < TAU`, which TAU − ε passes.
**Fix:** Do both of the following. Snap keyboard steps to the integer-degree grid, which also stops drift. Then snap near-TAU values in `norm`:
```ts
// derive.ts
const EPS = 1e-9;
export function norm(theta: number): number {
	const r = ((theta % TAU) + TAU) % TAU;
	return r >= TAU - EPS ? 0 : r;
}
// DragPoint.svelte key()
const stepDeg = e.shiftKey ? 15 : 1;
const cur = Math.round((theta * 180) / Math.PI);
const nextDeg = dir < 0 ? cur - stepDeg : cur + stepDeg;
next = norm((nextDeg * Math.PI) / 180);
```
Add regression coverage:
- unit: `norm(TAU - 5e-15) === 0`
- e2e: from `angle/`, press Shift+ArrowRight 20 times. Expect the readout to show `0°`, and expect `angle-arc` to be absent or empty (not a two-`A` full circle).

## Warnings

### WR-01: The rAF loop still restarts itself every frame, so the frame timestamp is discarded and playback runs slow (prior WR-01, still open)

**File:** `src/lib/engine/clock.svelte.ts:27,30-42`
**Issue:** The code has not changed:
1. `loop` sets `this.raf = 0` and then dispatches `tick`.
2. `dispatch` (line 27) sees `playing && !this.raf` and calls `start()`.
3. `start()` resets `this.last = performance.now()` and schedules the next frame.

As a result, `this.last = ts` (line 37) is always overwritten and the re-schedule on line 39 is dead code. Each frame's `dt` loses the time between the frame timestamp and the moment the callback runs, so authored step durations play back longer than intended.
**Fix:** Add a `running` flag. `dispatch` should only call `start()` when `!this.running`. `loop` should own re-scheduling and clear `running` when playback stops. In the test, mock `performance.now()` to return `ts + latency` so the test can catch this.

### WR-02: A KaTeX throw in the Panel still takes down the whole page, because only the Scene has a boundary (prior WR-04, still open)

**File:** `src/lib/tex/tex.ts:12`, `src/concepts/high-school/unit-circle/Panel.svelte:57-65`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:96-127`
**Issue:** `tex()` uses `throwOnError: true` and runs on every theta change with live, locale-formatted numbers. The `<svelte:boundary>` wraps only the `stage` snippet. If a formula throws, `Panel` fails to render and the concept page breaks.
**Fix:** Wrap the `panel` snippet in its own `<svelte:boundary>` with a minimal fallback. Alternatively, catch inside `Tex.svelte` and render the escaped source text as a fallback. Keep throwing in unit tests.

### WR-03: `#lib/stage/DragPoint` depends on concept internals, and 01-11 added a second import from the concept (prior WR-05, still open)

**File:** `src/lib/stage/DragPoint.svelte:2,38-45`
**Issue:** The shared primitive now imports both `angleFromPoint` and `norm` from `#concepts/high-school/unit-circle/derive.ts`. That reverses the lib-to-concept dependency direction (compare `format.ts:4`). The CR-01 fix made this coupling deeper instead of fixing it. `update()` also still ignores the `cx`/`cy` props and uses the bounding-rect center, which is only correct while `Stage` puts the origin at the viewBox center.
**Fix:** Move `TAU`, `norm` and `angleFromPoint` into `#lib/stage/geom.ts`, and re-export or import them in the concept from there. In `update()`, map client coordinates through `svg.getScreenCTM()!.inverse()` and subtract `cx`/`cy`.

### WR-04: The caption's live region is recreated on every step (prior WR-06, still open)

**File:** `src/concepts/high-school/unit-circle/Panel.svelte:47-49`
**Issue:** `aria-live="polite"` is on the `<p>` inside `{#key step}`. Each step change inserts a new live region instead of updating an existing one. Many screen readers do not announce content in a newly inserted live region, so step captions can be silent.
**Fix:**
```svelte
<div aria-live="polite">
  {#key step}<p class="caption" data-testid="caption">{CAPTIONS[STEP_IDS[step]]()}</p>{/key}
</div>
```

## Info

### IN-01: The keyboard path reuses the `ondragstart` callback, with no matching end event

**File:** `src/lib/stage/DragPoint.svelte:70`
**Issue:** WR-03 was fixed by calling `ondragstart` on every arrow keydown, including auto-repeat, and nothing ever calls `ondragend`. Today the page only uses `ondragstart`, so this is harmless. A future consumer that pairs start/end (for example to show a "dragging" state or to resume playback) would get unbalanced calls.
**Fix:** Add a dedicated `oninteract?.()` callback for "user manipulated the value", and keep `ondragstart`/`ondragend` for pointer drags only.

### IN-02: The angle slider does not handle the standard ARIA slider keys

**File:** `src/lib/stage/DragPoint.svelte:63-72`
**Issue:** The element has `role="slider"`, but it only handles the arrow keys. The ARIA slider pattern also expects Home/End (min/max) and PageUp/PageDown (large step). Shift+Arrow is not discoverable.
**Fix:** Map PageUp/PageDown to ±15° and Home/End to 0°/359°, and route them through the same snapped-step code as CR-01.

### IN-03: The invisible drag point is still focusable, draggable and keyboard-operable (prior IN-09)

**File:** `src/lib/stage/DragPoint.svelte:90-113`
**Issue:** When `scale === 0` (start of intro, after Home on the scrubber), the 24 px hit target still has `tabindex="0"` and pointer handlers. After 01-11, a keypress on it now also pauses playback and changes theta, while nothing is drawn.
**Fix:** Use `tabindex={scale > 0 ? 0 : -1}`, `pointer-events={scale > 0 ? 'auto' : 'none'}`, and return early from `key()`/`down()` when `scale === 0`.

### IN-04: `{#if true}` blocks used only to host `{@const}` (prior IN-04)

**File:** `src/concepts/high-school/unit-circle/Scene.svelte:103,212`
**Fix:** Move the label and hint positions into `$derived` values in the script block.

### IN-05: Zero-length windows or steps produce NaN in timeline helpers (prior IN-06)

**File:** `src/lib/engine/timeline.ts:16,38`
**Issue:** `seg(p, a, a)` and `locate` on a `dur === 0` step divide by zero. `clamp01(NaN)` returns NaN, which would then reach SVG attributes.
**Fix:** `b === a ? (p >= a ? 1 : 0) : ...`. Also guard `steps[i].dur > 0`.

### IN-06: The dev static server allows a protocol-relative redirect and has no stream error handler (prior IN-02)

**File:** `scripts/serve-build.mjs:47-48,58`
**Issue:** `/%2Fen` decodes to `//en`, which matches the `build/en` directory and redirects to `//en/`, a protocol-relative URL to host `en`. `createReadStream(...).pipe(res)` has no `error` listener.
**Fix:** Build `Location` from the raw `url.pathname`, reject paths that start with `//`, and add `.on('error', () => res.destroy())`.

### IN-07: The root-redirect allowlist lookup also matches prototype keys (prior IN-03)

**File:** `scripts/postbuild.mjs:18-19`
**Fix:** `var l = (s === 'en' || s === 'de') ? s : null;`, and the same check for `c`.

### IN-08: `check-i18n` assumes flat string messages and crashes on `--dir` without a value (prior IN-08)

**File:** `scripts/check-i18n.mjs:45,68-69`
**Fix:** Report non-string message values as errors. Fail with a usage message when `--dir` has no value.

### IN-09: `aria-disabled` on a role-less `div`, and step URLs have no canonical link (prior IN-09 remainder)

**File:** `src/lib/catalog/SoonCard.svelte:9`, `vite.config.ts:10`
**Issue:** `aria-disabled` has no effect on a generic `div`. `/…/unit-circle/` and `/…/unit-circle/intro/` are prerendered as duplicate pages with no `rel=canonical` or hreflang alternates.
**Fix:** Remove `aria-disabled`, or add a role and visually hidden "coming soon" text. Emit canonical and hreflang `<link>`s in the concept page's `<svelte:head>`.

---

_Reviewed: 2026-10-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
