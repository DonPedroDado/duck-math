---
phase: 01-foundation-playable-unit-circle
reviewed: 2026-10-24T00:00:00Z
depth: standard
files_reviewed: 97
files_reviewed_list:
  - docs/DEPLOY.md
  - e2e/catalog.spec.ts
  - e2e/deeplink.spec.ts
  - e2e/drag.spec.ts
  - e2e/formulas.spec.ts
  - e2e/helpers/touch.ts
  - e2e/i18n.spec.ts
  - e2e/mobile.spec.ts
  - e2e/notfound.spec.ts
  - e2e/player.spec.ts
  - e2e/radian.spec.ts
  - e2e/root-redirect.spec.ts
  - e2e/skeleton.spec.ts
  - .github/workflows/ci.yml
  - .gitignore
  - messages/de.json
  - messages/en.json
  - .npmrc
  - .nvmrc
  - package.json
  - paraglide.config.mjs
  - playwright.config.ts
  - project.inlang/settings.json
  - scripts/check-i18n.mjs
  - scripts/check-i18n.test.ts
  - scripts/paraglide-compile.mjs
  - scripts/postbuild.mjs
  - scripts/serve-build.mjs
  - src/app.d.ts
  - src/app.html
  - src/concepts/high-school/unit-circle/derive.test.ts
  - src/concepts/high-school/unit-circle/derive.ts
  - src/concepts/high-school/unit-circle/formulas.test.ts
  - src/concepts/high-school/unit-circle/formulas.ts
  - src/concepts/high-school/unit-circle/index.ts
  - src/concepts/high-school/unit-circle/notation.ts
  - src/concepts/high-school/unit-circle/Panel.svelte
  - src/concepts/high-school/unit-circle/projection.test.ts
  - src/concepts/high-school/unit-circle/projection.ts
  - src/concepts/high-school/unit-circle/RadianLayer.svelte
  - src/concepts/high-school/unit-circle/radian.test.ts
  - src/concepts/high-school/unit-circle/radian.ts
  - src/concepts/high-school/unit-circle/Scene.svelte
  - src/concepts/high-school/unit-circle/step-ids.ts
  - src/concepts/high-school/unit-circle/steps.ts
  - src/concepts/high-school/unit-circle/Thumbnail.svelte
  - src/concepts/high-school/unit-circle/urls.test.ts
  - src/concepts/high-school/unit-circle/urls.ts
  - src/concepts/high-school/unit-circle/view.test.ts
  - src/concepts/high-school/unit-circle/view.ts
  - src/concepts/locales.ts
  - src/concepts/registry.ts
  - src/concepts/types.ts
  - src/hooks.server.ts
  - src/hooks.ts
  - src/lib/assets/favicon.svg
  - src/lib/catalog/categories.ts
  - src/lib/catalog/ConceptCard.svelte
  - src/lib/catalog/SoonCard.svelte
  - src/lib/catalog/thumbs/DerivativesThumb.svelte
  - src/lib/catalog/thumbs/FunctionsThumb.svelte
  - src/lib/catalog/thumbs/LimitsThumb.svelte
  - src/lib/catalog/upcoming.ts
  - src/lib/engine/clock.svelte.ts
  - src/lib/engine/clock.test.ts
  - src/lib/engine/format.test.ts
  - src/lib/engine/format.ts
  - src/lib/engine/player.test.ts
  - src/lib/engine/player.ts
  - src/lib/engine/timeline.test.ts
  - src/lib/engine/timeline.ts
  - src/lib/icons/Icon.svelte
  - src/lib/index.ts
  - src/lib/player/ConceptLayout.svelte
  - src/lib/player/PlayerBar.svelte
  - src/lib/player/Scrubber.svelte
  - src/lib/stage/DragPoint.svelte
  - src/lib/stage/geom.test.ts
  - src/lib/stage/geom.ts
  - src/lib/stage/Stage.svelte
  - src/lib/styles/math.css
  - src/lib/styles/tokens.css
  - src/lib/styles/tokens.test.ts
  - src/lib/tex/Tex.svelte
  - src/lib/tex/tex.test.ts
  - src/lib/tex/tex.ts
  - src/lib/ui/SegmentedToggle.svelte
  - src/routes/+error.svelte
  - src/routes/high-school/unit-circle/[[step]]/+page.svelte
  - src/routes/high-school/unit-circle/[[step]]/+page.ts
  - src/routes/+layout.svelte
  - src/routes/+layout.ts
  - src/routes/+page.svelte
  - static/robots.txt
  - tsconfig.json
  - vercel.json
  - vite.config.ts
findings:
  critical: 1
  warning: 6
  info: 9
  total: 16
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-10-24
**Depth:** standard
**Files Reviewed:** 97
**Status:** issues_found

## Summary

I reviewed the Phase 1 shell, engine (timeline, reducer, rAF clock), stage primitives, the unit-circle concept, i18n tooling, build and deploy scripts, and CI/Vercel config. The pure modules (timeline, reducer, derive, projection, radian, view, format) are mostly sound and well tested.

The defects sit at the boundaries between modules:
- Keyboard input on the draggable point writes an un-normalized angle into state, and part of the scene does not tolerate that (CR-01).
- The rAF clock restarts itself on every frame, which throws away the frame timestamp (WR-01).
- The unit toggle can stop responding during the radians blend (WR-02).

The rest are robustness, a11y and layering issues. No security issue relevant to a static, no-user-data deployment was found. The `{@html}` sink in `Tex.svelte` only receives KaTeX output from repo-authored TeX, and trust is limited to `\htmlClass`.

## Critical Issues

### CR-01: Keyboard angle input is not normalized, so the angle arc disappears or turns into a full circle

**File:** `src/lib/stage/DragPoint.svelte:63-69`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:103`, `src/concepts/high-school/unit-circle/Scene.svelte:93-104`, `src/concepts/high-school/unit-circle/formulas.ts:33`
**Issue:** Pointer drags go through `angleFromPoint`, which normalizes to [0, 2π). The keyboard handler does not: it emits `theta ± step` raw, and the page stores it as is (`onthetachange={(t) => (user.theta = t)}`). Several consumers rely on theta being in [0, 2π):
- `Scene.svelte:93`: `{#if theta >= 1e-3}`. Press ArrowLeft past 0° and theta becomes negative (for example −1°). The angle arc and the θ label vanish, but the readout (which normalizes in `fmtDeg`) shows 359°.
- `Scene.svelte:97`: `arcPath(cx, cy, 0.25 * R, 0, theta * v.arc)`. Press ArrowRight past 360° and the sweep is at least 2π, so `arcPath` draws a full circle while the readout says 1°. The θ label at `polar(..., theta / 2)` lands on the opposite side of the circle (185° for θ = 370°).
- `formulas.ts:33`: the exact-π/3 branch compares the raw theta, so θ = π/3 + 2π does not show `\tfrac{\pi}{3}`.

Keyboard is the a11y path for the core interaction of the app, so the main visual is wrong for keyboard users.
**Fix:** Normalize at the source and at the state boundary.
```ts
// DragPoint.svelte (lib must not import from a concept, see WR-05, so normalize locally)
const TAU = 2 * Math.PI;
const wrap = (a: number) => ((a % TAU) + TAU) % TAU;
if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onchange(wrap(theta - step));
else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onchange(wrap(theta + step));
// +page.svelte (defense in depth)
onthetachange={(t) => (user.theta = norm(t))}
```
Add an e2e or unit case: press ArrowLeft 61 times from 60° and expect `angle-arc` to exist with a ~359° sweep.

## Warnings

### WR-01: The rAF loop calls `start()` again on every frame and replaces the frame timestamp with `performance.now()`, so animations run slow

**File:** `src/lib/engine/clock.svelte.ts:33-41`
**Issue:** In `loop`, `this.raf` is set to 0 before `this.dispatch({type:'tick'})`. `dispatch` then sees `next.playing && !this.raf` and calls `this.start()`. That sets `this.last = performance.now()` and schedules the next frame. So:
- The `this.last = ts` on line 37 is overwritten every frame.
- Line 39 never runs while playing (dead code).
- The next `dt` is `ts_next - performance.now()_at_previous_callback`, not `ts_next - ts_prev`.

The rAF timestamp is the frame start time. The callback runs later in the frame, so every frame loses that latency. A 4 ms latency at 60 Hz makes step durations about 25% longer than authored, and the error grows with main-thread load. The unit test hides this because it mocks `performance.now()` to equal `ts`.
**Fix:** Do not let `dispatch` start a loop that is already running:
```ts
private running = false;
dispatch(a) { ...; if (next.playing && !this.running) this.start(); }
private start() {
  if (typeof requestAnimationFrame === 'undefined') return;
  this.running = true;
  this.last = performance.now();
  const loop = (ts: number) => {
    this.raf = 0;
    if (this.destroyed) { this.running = false; return; }
    const dt = Math.max(0, (ts - this.last) / 1000);
    this.last = ts;
    this.dispatch({ type: 'tick', dt });
    if (this.state.playing && !this.destroyed) this.raf = requestAnimationFrame(loop);
    else this.running = false;
  };
  this.raf = requestAnimationFrame(loop);
}
```
In the test, make `performance.now()` return `ts + latency` so the test catches this.

### WR-02: The unit toggle shows the blended unit, not the chosen one, so "rad" can do nothing and `aria-pressed` can be wrong

**File:** `src/concepts/high-school/unit-circle/Panel.svelte:35,74-81`, `src/concepts/high-school/unit-circle/view.ts:34`
**Issue:** `value={shownUnit}` comes from `v.unitBlend >= 0.5`. On the `radians` step, `user.unit` is already `'rad'` while `unitBlend = E(seg(p, 0, 0.4))` is still below 0.5 for roughly the first 20% of the step. If the user scrubs or pauses there:
- The toggle shows and announces `deg` as pressed.
- Clicking `rad` calls `onunitchange('rad')`. That is a no-op because `user.unit` is already `'rad'`, so nothing changes.

The control is dead and its ARIA state does not match the real state.
**Fix:** Bind the toggle to the real state and use the blend only for the readout morph:
```svelte
<SegmentedToggle value={unit} ... />   <!-- pass user.unit into Panel -->
```

### WR-03: Keyboard manipulation does not pause playback and does not dismiss the drag hint

**File:** `src/lib/stage/DragPoint.svelte:63-69`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:104-107`
**Issue:** A pointer drag calls `ondragstart`, which pauses the player and sets `user.moved = true`. The keyboard path only calls `onchange`. A keyboard user who adjusts the angle during playback does not pause the timeline, and the "Drag me" hint (`opacity={moved ? 0 : v.hint}`) stays visible after they have clearly interacted. The two input paths behave differently.
**Fix:** In `key()`, call `ondragstart?.()` (or a dedicated `oninteract`) before `onchange`, guarded so it fires once per keydown.

### WR-04: A KaTeX error in the Panel crashes the whole page, because the error boundary only wraps the Scene

**File:** `src/lib/tex/tex.ts:8`, `src/concepts/high-school/unit-circle/Panel.svelte:56-62`, `src/routes/high-school/unit-circle/[[step]]/+page.svelte:95-125`
**Issue:** `tex()` uses `throwOnError: true` and is evaluated in a `$derived` on every theta change, with live, locale-formatted numbers. The `<svelte:boundary>` covers only the `stage` snippet. Some inputs can make KaTeX throw, for example an unexpected locale format that `texNum` does not escape, or a future formula edit. The throw then happens while rendering `Panel`, and the whole concept page fails (or hydration aborts) instead of degrading.
**Fix:** Wrap the panel snippet in its own `<svelte:boundary>`. Alternatively, catch in `Tex.svelte` and fall back to the escaped source text in dev and an empty span in prod. Keep `throwOnError: true` in unit tests so authoring errors are still caught.

### WR-05: `#lib/stage/DragPoint` imports from a concept, and it ignores its own `cx`/`cy` props when computing the drag angle

**File:** `src/lib/stage/DragPoint.svelte:2,38-45`
**Issue:**
1. A shared stage primitive imports `angleFromPoint` from `#concepts/high-school/unit-circle/derive.ts`. That reverses the dependency direction the project states (`format.ts:4`: "the engine must not depend on a concept"). Any second concept that uses `DragPoint` would be coupled to unit-circle internals.
2. `update()` takes the rotation center from the SVG bounding-rect center, not from the `cx`/`cy` props. This is only correct while `Stage` places the origin exactly at the viewBox center and the SVG is not letterboxed. Any concept that uses a different origin gets wrong angles silently.

**Fix:** Move `angleFromPoint`/`norm` into `#lib/stage/geom.ts`, and import it into the concept from there. In `update()`, map the client point into viewBox coordinates (`svg.getScreenCTM().inverse()`) and subtract `cx`/`cy`.

### WR-06: The caption's live region is recreated on every step, so screen readers may not announce it

**File:** `src/concepts/high-school/unit-circle/Panel.svelte:45-47`
**Issue:** `aria-live="polite"` is on a `<p>` inside `{#key step}`. Each step change destroys the element and inserts a new one. Many screen readers (VoiceOver and NVDA in common configurations) only announce changes inside a live region that already existed, not a newly inserted one. Step captions, which are the minimal text that explains each step, can therefore be silent.
**Fix:** Keep a persistent live-region wrapper and key only the inner content:
```svelte
<div aria-live="polite" data-testid="caption-live">
  {#key step}<p class="caption" data-testid="caption">{CAPTIONS[STEP_IDS[step]]()}</p>{/key}
</div>
```

## Info

### IN-01: `localStorage.setItem` in the locale switcher is not guarded

**File:** `src/routes/+layout.svelte:22`
**Issue:** `localStorage` access throws `SecurityError` when storage is blocked (Safari with cookies disabled, some embedded webviews). The handler then throws before it rewrites `href`. Navigation still falls back to the template `href`, but the user gets an uncaught error, and the code is inconsistent with `postbuild.mjs`, which wraps the same access in `try`.
**Fix:** `try { localStorage.setItem('dm-locale', locale); } catch {}`

### IN-02: The dev static server allows a protocol-relative redirect and has no stream error handler

**File:** `scripts/serve-build.mjs:46-49,58`
**Issue:** `pathname` is decoded before it is used in `Location`. A request like `/%2Fen` resolves to the `build/en` directory and redirects to `//en/`, a protocol-relative URL to host `en`. `createReadStream(...).pipe(res)` has no `error` listener, so a read error crashes the process. This is a dev/test-only server, so impact is low.
**Fix:** Redirect using the raw `url.pathname` (still encoded) and reject paths that start with `//`. Add `.on('error', () => res.destroy())`.

### IN-03: The root redirect's allowlist lookup also accepts prototype keys

**File:** `scripts/postbuild.mjs:18-19`
**Issue:** `ok[s]` on an object literal is truthy for `constructor`, `toString` and similar keys. A stored value of `'constructor'` would redirect to `/constructor/` (a 404). Exploiting this requires same-origin storage writes, so it is hardening only.
**Fix:** `var ok = {en:1,de:1}` -> `Object.prototype.hasOwnProperty.call(ok, s)`, or use `s === 'en' || s === 'de'`.

### IN-04: `{#if true}` blocks used only to host `{@const}`

**File:** `src/concepts/high-school/unit-circle/Scene.svelte:103,212`
**Issue:** These always-true blocks exist only to scope `{@const}`. They hide intent and are easy to "clean up" by mistake.
**Fix:** Compute the label and hint positions in `$derived` values in the script block (they depend only on `theta`, `cx`, `cy` and `R`), or extract small snippets.

### IN-05: The `adapter-static` version differs from the documented stack

**File:** `package.json:22`
**Issue:** `@sveltejs/adapter-static` is `^4.0.0` (4.0.0 installed, peer `kit ^3.0.0-next.0`). CLAUDE.md specifies 5.0.x for Kit 3. It works today, but the pin will never pick up 5.x fixes, and it diverges from the recorded stack decision.
**Fix:** Bump to `^5.0.5` and re-verify, or update CLAUDE.md to record the deliberate choice.

### IN-06: Zero-length windows or steps produce NaN in timeline helpers

**File:** `src/lib/engine/timeline.ts:16,38`
**Issue:** `seg(p, a, a)` and `locate` with a step where `dur === 0` divide by zero. `clamp01(NaN)` returns NaN (both comparisons are false), and the NaN would propagate into SVG attributes. All current callers use non-degenerate values, but concept authors will add more.
**Fix:** Guard: `b === a ? (p >= a ? 1 : 0) : ...` and `steps[i].dur > 0 ? ... : 1`. Optionally assert `dur > 0` when the concept is registered.

### IN-07: CI builds the site twice

**File:** `.github/workflows/ci.yml:25-28`, `playwright.config.ts:16`
**Issue:** Playwright's `webServer` already runs `npm run build`. The final `npm run build` step repeats it.
**Fix:** Drop the last step, or build once and point `webServer.command` at `serve-build.mjs` only.

### IN-08: `check-i18n` assumes flat string messages and crashes on `--dir` without a value

**File:** `scripts/check-i18n.mjs:45,68-69`
**Issue:** For nested or variant message objects, which inlang message-format supports, `String(v)` gives `[object Object]`, so the placeholder parity check is silently meaningless. `--dir` given as the last argument passes `undefined` to `path.join`, which throws.
**Fix:** Reject non-string values explicitly with an error. Validate that `--dir` has a value.

### IN-09: An invisible point is still draggable and focusable, `aria-disabled` is on a non-interactive element, and step URLs have no canonical link

**File:** `src/lib/stage/DragPoint.svelte:87-110`, `src/lib/catalog/SoonCard.svelte:9`, `vite.config.ts:10`
**Issue:**
- When `v.point === 0` (start of intro, or after Home on the scrubber), the 24 px hit target is still focusable and draggable while nothing is drawn.
- `aria-disabled` on a role-less `div` has no effect.
- `/…/unit-circle/` and `/…/unit-circle/intro/` are prerendered as identical pages with no `rel=canonical` or hreflang alternates.

**Fix:** Set `tabindex={scale > 0 ? 0 : -1}` and `pointer-events` on the hit target based on `scale`. Remove `aria-disabled`, or add `role="article"` plus visually hidden "coming soon" text. Emit `<link rel="canonical">` and hreflang links in `+page.svelte`'s `<svelte:head>`.

---

_Reviewed: 2026-10-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
