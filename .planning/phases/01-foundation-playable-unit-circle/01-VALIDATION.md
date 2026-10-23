---
phase: 1
slug: foundation-playable-unit-circle
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1 (unit) + Playwright 1.64.x (e2e against `vite preview` of the static build) |
| **Config file** | none — Wave 0 installs `vitest` config (in vite.config.ts or vitest.config.ts) and `playwright.config.ts` |
| **Quick run command** | `npx vitest run && node scripts/check-i18n.mjs` |
| **Full suite command** | `npm run check && npm run build && npx playwright test && npx vitest run` |
| **Estimated runtime** | ~15 s quick / ~90 s full |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run && node scripts/check-i18n.mjs`
- **After every plan wave:** Run `npm run check && npm run build && npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green, plus manual look-through at 3 viewports
- **Max feedback latency:** 15 seconds (quick), 120 seconds (full)

---

## Per-Task Verification Map

To be filled by the planner/executor from PLAN.md task IDs. Requirement → test mapping (from RESEARCH.md):

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| PLAY-02 | `view(t,user)` identical via play-through vs seek, both directions | unit | `npx vitest run src/lib/engine/timeline.test.ts` | ❌ W0 | ⬜ pending |
| PLAY-01 | Clock stops at step end; next/prev/reset produce staged `t` | unit | `npx vitest run src/lib/engine/clock.test.ts` | ❌ W0 | ⬜ pending |
| PLAY-05 | Pointerdown pauses, no jump; play after drag keeps user θ | unit + e2e | `npx playwright test e2e/drag.spec.ts` | ❌ W0 | ⬜ pending |
| PLAY-06 | θ kept across steps; layers re-staged per step | unit | `npx vitest run src/concepts` | ❌ W0 | ⬜ pending |
| MATH-02 / I18N-03 | `fmt`: DE `0,87`, EN `0.87`, U+2212, never `-0`, 359.95→0 | unit | `npx vitest run src/lib/engine/format.test.ts` | ❌ W0 | ⬜ pending |
| TRIG-01 / TRIG-03 | `derive(θ)` cos/sin/quadrant at 0/90/180/270/360 | unit | `npx vitest run src/concepts` | ❌ W0 | ⬜ pending |
| TRIG-02 | radian bend continuity at k→0, arc length 1 at k=1 | unit | `npx vitest run src/concepts` | ❌ W0 | ⬜ pending |
| I18N-04 | check-i18n fails on missing key / placeholder mismatch | unit + CI | `node scripts/check-i18n.mjs && npx vitest run scripts` | ❌ W0 | ⬜ pending |
| I18N-01 / I18N-02 | `/en/` and `/de/` built, `<html lang>`, switcher keeps route/step | e2e | `npx playwright test e2e/i18n.spec.ts` | ❌ W0 | ⬜ pending |
| SHELL-03 | every step deep link exists in build and opens at that step; unknown step → 404 | e2e | `npx playwright test e2e/deeplink.spec.ts` | ❌ W0 | ⬜ pending |
| SHELL-01 / SHELL-02 | catalog sections, live card link, soon cards not links, back link | e2e | `npx playwright test e2e/catalog.spec.ts` | ❌ W0 | ⬜ pending |
| SHELL-04 | root redirect by language, stored preference wins, fixed allowlist | e2e | `npx playwright test e2e/root-redirect.spec.ts` | ❌ W0 | ⬜ pending |
| A11Y-01 | 320×640 & 390×844 touch, EN+DE: no overflow, controls ≥44px, drag works | e2e | `npx playwright test e2e/mobile.spec.ts` | ❌ W0 | ⬜ pending |
| SHELL-05 | no hex literals in components; tokens defined | unit (fs scan) | `npx vitest run src/lib/styles` | ❌ W0 | ⬜ pending |
| MATH-01 | formula HTML carries `t-cos`/`t-sin` classes; invalid TeX throws | unit | `npx vitest run src/lib/tex` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Vitest config + `playwright.config.ts` (webServer: build + preview; chromium + `devices['Pixel 7']` projects)
- [ ] `src/lib/engine/*.test.ts` stubs, `scripts/check-i18n.mjs` with missing-key fixture
- [ ] `e2e/*.spec.ts` skeletons listed above
- [ ] `npm i -D vitest@^4.1 @playwright/test && npx playwright install chromium`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 3B1B visual polish (glow, easing, typography) | SHELL-05 / core value | Subjective | Open EN+DE at desktop, tablet, phone; play all steps, drag; judge against UI-SPEC |
| iOS Safari touch drag | A11Y-01 | Not automatable here | Drag point on a real iPhone; page must not scroll |
| Public deploy reachable | SHELL-04 | Needs user's repo/DNS | Open the public URL without login |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
