---
phase: 1
slug: foundation-playable-unit-circle
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-10-24
updated: 2026-10-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1 (unit) + Playwright 1.64.x (e2e against `build/` served by `scripts/serve-build.mjs`, GitHub-Pages-like) |
| **Config file** | `vite.config.ts` (`test` block) and `playwright.config.ts`, both created by 01-01 Task 1 |
| **E2E server** | port from `E2E_PORT` (default 4173), `reuseExistingServer: false`; every plan's e2e commands use a distinct port `4300 + plan number` (01-01 -> 4301 ... 01-10 -> 4310) so parallel waves never collide; specs derive the origin from `baseURL`, never a hardcoded `localhost:4173`; locale switcher links are located by `data-testid="locale-en"` / `"locale-de"`; projects `desktop` (all specs) and `mobile` (allowlist: skeleton, catalog, notfound, mobile) |
| **Quick run command** | `npx vitest run` (plus the one spec named in the task's `<verify>`) |
| **Full suite command** | `rm -rf src/lib/paraglide .svelte-kit && npm run check && npx vitest run && npx playwright test` |
| **Estimated runtime** | ~15 s quick unit / ~40-60 s per single spec (includes one build) / ~120 s full |

---

## Sampling Rate

- **After every task commit:** the task's `<verify>` command: scoped Vitest plus at most one relevant e2e spec.
- **After every plan wave:** the plan's `<verification>` wave gate (unit suite + check + the regression specs it lists).
- **Before `/gsd-verify-work`:** full suite green (run once in 01-10 before its checkpoint), plus the manual look-through at 3 viewports.
- **Max feedback latency:** ~60 s per task, 120 s per wave gate.

---

## Per-Task Verification Map

| Task ID | Requirement(s) | Behavior | Test Type | Automated Command | Test File Created By |
|---------|----------------|----------|-----------|-------------------|----------------------|
| 01-01-T1 | SHELL-03, I18N-02, SHELL-05 | Clean-checkout check passes; 12 locale x step pages + bases prerendered with correct `<html lang>` | build + fs | `rm -rf src/lib/paraglide .svelte-kit && npm run check && npm run build && test -f build/de/high-school/unit-circle/cosine/index.html` | 01-01-T1 (`e2e/skeleton.spec.ts` written red) |
| 01-01-T2 | TRIG-01, MATH-02, I18N-03, SHELL-05 | `derive` at 0/90/180/270/360; `fmt` DE `0,87` / EN `0.87`, U+2212, no `−0`, 359.95 -> 0; no hex literals outside tokens.css | unit | `npx vitest run src/concepts/high-school/unit-circle/derive.test.ts src/lib/engine/format.test.ts src/lib/styles/tokens.test.ts` | 01-01-T2 |
| 01-01-T3 | SHELL-01, SHELL-02, PLAY-04, I18N-01 | Catalog link -> concept -> drag -> live locale readout; switcher writes `dm-locale`; zero cross-origin requests | e2e | `npx vitest run && E2E_PORT=4301 npx playwright test e2e/skeleton.spec.ts` | 01-01-T1 |
| 01-02-T1 | SHELL-04 | Workflow structure, CNAME in build, clean-checkout check in CI order | static + build | `rm -rf src/lib/paraglide .svelte-kit && npm run check && grep -q "actions/deploy-pages@v5" .github/workflows/deploy.yml` | n/a |
| 01-02-T2 | SHELL-04 | User repo / Pages / DNS setup | checkpoint | `git remote get-url origin` | n/a |
| 01-02-T3 | SHELL-04 | Public URL returns 200 without login | live curl | `test "$(curl -s -o /dev/null -w '%{http_code}' https://dm.ducksoft.ai/en/)" = "200"` | n/a |
| 01-03-T1 | I18N-04, PLAY-03 | Build fails on missing key, placeholder mismatch, empty value, caption over budget (EN 18 / DE 25 words) | unit + CLI | `npx vitest run scripts/check-i18n.test.ts && node scripts/check-i18n.mjs && ! node scripts/check-i18n.mjs --dir scripts/fixtures/i18n-missing` | 01-03-T1 |
| 01-03-T2 | I18N-01, I18N-02 | Root redirect by stored pref -> browser language -> en, allowlisted; `/en/` `/de/` lang + switcher keeps step | e2e | `npm run build && E2E_PORT=4303 npx playwright test e2e/root-redirect.spec.ts e2e/i18n.spec.ts` | 01-03-T2 |
| 01-04-T1 | PLAY-01, PLAY-02, PLAY-05, PLAY-06 | Reducer semantics (PD-2), seek == play-through both directions, boundary continuity, no θ in `view` (PD-1), keep/restage (D-03) | unit | `npx vitest run src/lib/engine src/lib/stage src/concepts` | 01-04-T1 |
| 01-04-T2 | PLAY-01 | Clock stops at step end, dt clamp, onstep, destroy, SSR guard | unit | `npx vitest run src/lib/engine/clock.test.ts` | 01-04-T2 |
| 01-05-T1 | PLAY-01, PLAY-02, PLAY-03, A11Y-01 | Play/pause/next/prev/reset/scrub/ticks, captions + counter EN/DE, >= 44px controls, desktop layout | e2e | `npm run check && E2E_PORT=4305 npx playwright test e2e/player.spec.ts --project=desktop` | 01-05-T1 |
| 01-05-T2 | PLAY-04, PLAY-05, PLAY-06 | Drag pauses without jump, play resumes same step with θ kept, unit re-staged, intro/angle draw-on | e2e | `npx vitest run src/lib/styles && E2E_PORT=4305 npx playwright test e2e/drag.spec.ts --project=desktop` | 01-05-T2 |
| 01-06-T1 | SHELL-01, SHELL-02, SHELL-05 | Category sections, live card, Soon cards not links, University placeholder | e2e | `E2E_PORT=4306 npx playwright test e2e/catalog.spec.ts e2e/skeleton.spec.ts && npx vitest run src/lib/styles/tokens.test.ts` | 01-06-T1 |
| 01-06-T2 | SHELL-02 | Localized 404 for unknown step/path with link back | e2e | `E2E_PORT=4306 npx playwright test e2e/notfound.spec.ts` | 01-06-T2 |
| 01-07-T1 | SHELL-03 | 12 deep links open staged at their step; `stepPath` unit | unit + e2e | `npx vitest run src/concepts/high-school/unit-circle/urls.test.ts && E2E_PORT=4307 npx playwright test e2e/deeplink.spec.ts --project=desktop -g "deep link"` | 01-07-T1 |
| 01-07-T2 | SHELL-03, I18N-02 | Address bar push/replace, Back/Forward without reload, locale switch keeps step | e2e | `npm run check && E2E_PORT=4307 npx playwright test e2e/deeplink.spec.ts --project=desktop` | 01-07-T1 |
| 01-08-T1 | MATH-01, MATH-02, I18N-03 | KaTeX output carries `t-cos`/`t-sin`, trust limited to `\htmlClass`, locale numbers in formulas | unit | `npx vitest run src/lib/tex src/concepts/high-school/unit-circle/formulas.test.ts` | 01-08-T1 |
| 01-08-T2 | TRIG-03, MATH-01, MATH-02 | Cos/sin segments draw on, color-matched live formulas, prerendered KaTeX | e2e | `npx vitest run src/lib/tex src/concepts && E2E_PORT=4308 npx playwright test e2e/formulas.spec.ts --project=desktop` | 01-08-T2 |
| 01-09-T1 | TRIG-02 | Bend continuity at k -> 0, arc length 1 at k = 1, copies to π independent of θ (PD-3) | unit | `npx vitest run src/concepts/high-school/unit-circle/radian.test.ts && npm run check` | 01-09-T1 |
| 01-09-T2 | TRIG-01, TRIG-02, PLAY-02 | Deg/rad toggle, copies unwind/replay on scrub | e2e | `npx vitest run src/concepts && E2E_PORT=4309 npx playwright test e2e/radian.spec.ts --project=desktop` | 01-09-T2 |
| 01-10-T1 | A11Y-01, PLAY-04 | 320/390 px EN+DE: no overflow, >= 44px, touch drag does not scroll, sticky stage/bar | e2e | `E2E_PORT=4310 npx playwright test e2e/mobile.spec.ts --project=desktop` | 01-10-T1 |
| 01-10-T2 | SHELL-05, A11Y-01 | Group glow (<= 2 filters), halo, pulse (reduced-motion off), label nudge, error boundary | unit + e2e | `npx vitest run src/lib/stage src/lib/styles && E2E_PORT=4310 npx playwright test e2e/mobile.spec.ts --project=desktop` | 01-10-T1/T2 |
| 01-10-T3 | all (visual) | User visual approval; full suite run once before pausing | checkpoint | `E2E_PORT=4310 npx playwright test e2e/mobile.spec.ts --project=desktop` (full suite = wave gate) | n/a |
| 01-11-T1 | PLAY-04, PLAY-05, TRIG-01 | Keyboard θ wraps to [0, 2π) with arc kept; keyboard pauses playback and hides hint (CR-01, WR-03) | unit + e2e | `npx vitest run src/concepts/high-school/unit-circle/derive.test.ts && npx playwright test e2e/drag.spec.ts --project=desktop` | 01-11-T1 |
| 01-11-T2 | TRIG-02 | Deg/rad toggle shows the real user unit during the radians blend (WR-02) | e2e | `npm run check && npx playwright test e2e/radian.spec.ts --project=desktop` | 01-11-T2 |
| 01-11-T3 | TRIG-03, MATH-01, I18N-04 | Stale requirements ticked; full suite green | full suite | `npm run check && npx vitest run && npx playwright test` | n/a |
| 01-12-T1 | TRIG-03, A11Y-01 | `norm()` tolerance snap at 2π, integer-degree `keyStep()`, shared `degValue()` | unit | `npx vitest run src/concepts/high-school/unit-circle/derive.test.ts src/lib/engine/format.test.ts` | 01-12-T1 |
| 01-12-T2 | TRIG-03, A11Y-01 | Keyboard up through 360° lands on exactly 0 with consistent arc and aria-valuetext | e2e | `npm run check && npx vitest run && npx playwright test e2e/drag.spec.ts --project=desktop` | 01-12-T2 |

*Status is tracked per task in each plan SUMMARY.*

---

## Wave 0 Requirements

All test scaffolds are created inside the plans that need them (test-first tasks), so there are no MISSING references:

- [x] Vitest config (`test` block in vite.config.ts) + `playwright.config.ts` (E2E_PORT, no server reuse, desktop + mobile allowlist) — 01-01-T1
- [x] `e2e/skeleton.spec.ts` written red before implementation — 01-01-T1
- [x] Unit test files for derive/format/tokens — 01-01-T2; engine `timeline/player/view/geom` — 01-04-T1; `clock.test.ts` — 01-04-T2
- [x] `scripts/check-i18n.mjs` + missing-key / placeholder / caption-budget fixtures — 01-03-T1
- [x] Every other e2e spec is created by the task that verifies it (see the last column above)
- [x] `npm i -D vitest@^4.1 @playwright/test@1.64 && npx playwright install chromium` — 01-01-T1

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 3B1B visual polish (glow, easing, typography) | SHELL-05 / core value | Subjective | 01-10-T3: open EN+DE at desktop, tablet, phone; play all steps, drag; judge against UI-SPEC |
| iOS Safari touch drag | A11Y-01 | Not automatable here | 01-10-T3 step 7: drag the point on a real iPhone; the page must not scroll |
| Public deploy reachable | SHELL-04 | Needs user's repo/DNS | 01-02-T2 checkpoint, then 01-02-T3 curl checks |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** planner sign-off 2026-10-24; Nyquist audit 2026-10-24 (all automated checks green)

---

## Validation Audit 2026-10-24

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

Every Phase 1 requirement (SHELL-01..05, PLAY-01..06, TRIG-01..03, MATH-01..02, I18N-01..04, A11Y-01) maps to at least one automated test, and all of them pass:

- `npm run check`: 0 errors, 0 warnings
- `npx vitest run`: 15 files, 146 tests passed
- `node scripts/check-i18n.mjs`: 58 keys OK in en, de
- `npx playwright test`: 130 passed, 37 skipped (the `mobile` project allowlist skips by design)

The per-task map now includes the gap-closure plans 01-11 and 01-12, which were missing from it. The three manual-only items are unchanged.
