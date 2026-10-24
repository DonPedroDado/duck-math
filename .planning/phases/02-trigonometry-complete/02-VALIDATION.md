---
phase: 2
slug: trigonometry-complete
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-24
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1 (unit, node env) + Playwright 1.64 (e2e against built static site) |
| **Config file** | `vite.config.ts` (`test` block), `playwright.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npm run check && npx vitest run && npm run test:e2e` |
| **Estimated runtime** | ~2 s quick; ~90 s full (e2e includes build) |

---

## Sampling Rate

- **After every task commit:** Run the task's targeted `<automated>` command (see map)
- **After every plan wave:** Run the wave's plan-level e2e command (table below)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds (unit)

---

## Per-Task Verification Map

Per-task commands are quick and targeted (svelte-check, targeted vitest, `playwright test --list` to parse specs). Playwright e2e runs the ~90s build, so it runs in each plan's `<verification>` after its wave completes (see "Plan-level e2e" below).

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | TRIG-04/06/07 (infra) | T-02-01, T-02-02, T-02-03 | route params matched only against registry; glob keys fixed | unit + check | `npm run check && npx vitest run src/concepts src/lib/engine src/lib/player` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | TRIG-04/06/07 (infra) | T-02-04 | unit circle unchanged after migration; prerender files exist | unit + check (+ build in acceptance) | `npm run check && npx vitest run src/concepts src/lib/engine src/lib/player` | ✅ (extend) | ⬜ pending |
| 02-01-03 | 01 | 1 | TRIG-04/06/07 (infra) | T-02-04 | every concept × locale × step page prerendered | unit + e2e parse | `npx vitest run scripts/concept-routes.test.ts && npx playwright test --list e2e/deeplink.spec.ts e2e/catalog.spec.ts e2e/mobile.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | TRIG-05, D-18 | T-02-08 | tokens ≥ 7:1; CVD risk pairs ΔE ≥ 15; low pairs dashed | unit | `npx vitest run src/lib/styles/tokens.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | i18n | T-02-06 | duplicate keys fail the build | unit | `npx vitest run scripts/check-i18n.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | i18n, MATH-03 | T-02-07 | EN/DE parity incl. link_role_* names | script + check | `npm run check:i18n && npm run paraglide && npm run check` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | MATH-03 | T-02-09 | closed LinkId union | unit | `npx vitest run src/lib/link` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | MATH-03 | T-02-10, T-02-11 | {@html} only tex() output; localized aria role names | unit + check + e2e parse | `npm run check && npx vitest run src/lib/tex src/concepts/high-school/unit-circle src/lib/link && npx playwright test --list e2e/link.spec.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | PLAY-07 | T-02-12 | tick capped at pause/stepEnd | unit | `npx vitest run src/lib/engine` | ✅ (extend) | ⬜ pending |
| 02-04-02 | 04 | 2 | PLAY-07 | T-02-12 | Reveal button / pause marks | unit + check | `npm run check && npx vitest run src/lib/engine src/lib/player` | ❌ W0 | ⬜ pending |
| 02-04-03 | 04 | 2 | PLAY-07 (D-03) | T-02-13 | NextLink href from registry only | unit + check + e2e parse | `npx vitest run src/lib/player && npm run check && npx playwright test --list e2e/next-link.spec.ts` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 3 | TRIG-04, MATH-06 | T-02-16 | poles by angular distance; no Infinity/NaN | unit + e2e parse | `npx vitest run src/lib/trig src/lib/engine/format.test.ts && npx playwright test --list e2e/tangent.spec.ts` | ❌ W0 | ⬜ pending |
| 02-05-02 | 05 | 3 | TRIG-04, PLAY-07 | T-02-15 | only repo TeX + texNum digits | unit + script | `npm run paraglide && npx vitest run src/concepts/high-school/tangent && npm run check:i18n` | ❌ W0 | ⬜ pending |
| 02-05-03 | 05 | 3 | TRIG-04, MATH-03, PLAY-07 | T-02-17 | guess clamped | unit + check | `npm run check && npx vitest run src/concepts/high-school/tangent src/lib/trig scripts/concept-routes.test.ts` | ❌ W0 | ⬜ pending |
| 02-06-01 | 06 | 2 | MATH-05, TRIG-06 | T-02-18 | layout finite at 0×0; display single writer | unit | `npx vitest run src/lib/stage/panelpair.test.ts src/concepts/high-school/sine-cosine-graphs` | ❌ W0 | ⬜ pending |
| 02-06-02 | 06 | 2 | MATH-05 | T-02-18, T-02-33 | fallback sizes | check + unit | `npm run check && npx vitest run src/lib/stage src/lib/styles/tokens.test.ts` | ❌ W0 | ⬜ pending |
| 02-07-01 | 07 | 3 | TRIG-06, PLAY-07 | T-02-19 | view never reads θ | unit + e2e parse | `npx vitest run src/concepts/high-school/sine-cosine-graphs && npx playwright test --list e2e/sine-cosine.spec.ts` | ❌ W0 | ⬜ pending |
| 02-07-02 | 07 | 3 | TRIG-06, MATH-03 | T-02-20 | only repo TeX + texNum digits | unit + script | `npm run paraglide && npx vitest run src/concepts/high-school/sine-cosine-graphs && npm run check:i18n` | ❌ W0 | ⬜ pending |
| 02-07-03 | 07 | 3 | TRIG-06, MATH-05, PLAY-07, MATH-03 | T-02-19 | θ only via update() | check + unit | `npm run check && npx vitest run src/concepts/high-school/sine-cosine-graphs scripts/concept-routes.test.ts` | ❌ W0 | ⬜ pending |
| 02-08-01 | 08 | 3 | TRIG-07, TRIG-08 | T-02-21 | no NaN at degenerate angles | unit + e2e parse | `npx vitest run src/concepts/high-school/trig-identities && npx playwright test --list e2e/identities.spec.ts` | ❌ W0 | ⬜ pending |
| 02-08-02 | 08 | 3 | TRIG-07, TRIG-08, PLAY-07 | T-02-23 | only repo TeX | unit + script | `npm run paraglide && npx vitest run src/concepts/high-school/trig-identities && npm run check:i18n` | ❌ W0 | ⬜ pending |
| 02-08-03 | 08 | 3 | TRIG-07, TRIG-08, MATH-03 | T-02-22 | guess normalised | check + unit | `npm run check && npx vitest run src/concepts/high-school/trig-identities scripts/concept-routes.test.ts` | ❌ W0 | ⬜ pending |
| 02-09-01 | 09 | 4 | TRIG-05, MATH-06 | T-02-24 | label separation bounded | unit + script + e2e parse | `npm run paraglide && npx vitest run src/concepts/high-school/tangent && npm run check:i18n && npx playwright test --list e2e/tangent.spec.ts` | ❌ W0 | ⬜ pending |
| 02-09-02 | 09 | 4 | TRIG-05, MATH-06, MATH-03, D-18 | T-02-24, T-02-25 | endpoints clipped; CVD cues (labels, dash, no risk pairs) | check + unit | `npm run check && npx vitest run src/concepts/high-school/tangent src/lib/trig` | ❌ W0 | ⬜ pending |
| 02-10-01 | 10 | 4 | MATH-04, TRIG-06 | T-02-27 | trail fixed sample counts | unit + script + e2e parse | `npm run paraglide && npx vitest run src/concepts/high-school/sine-cosine-graphs && npm run check:i18n && npx playwright test --list e2e/sine-cosine.spec.ts` | ❌ W0 | ⬜ pending |
| 02-10-02 | 10 | 4 | TRIG-06, MATH-04, MATH-05, MATH-03 | T-02-26 | graph writes clamped to [0, range] | check + unit | `npm run check && npx vitest run src/concepts/high-school/sine-cosine-graphs src/lib/stage` | ❌ W0 | ⬜ pending |
| 02-11-01 | 11 | 4 | TRIG-09 | T-02-29 | stateless snap; keyboard never snapped | unit + check + e2e parse | `npx vitest run src/lib/trig src/concepts/high-school/trig-identities/jump.test.ts && npm run check && npx playwright test --list e2e/identities.spec.ts` | ❌ W0 | ⬜ pending |
| 02-11-02 | 11 | 4 | TRIG-09, TRIG-08, TRIG-07 | T-02-30 | exact TeX are repo constants | unit + script | `npm run paraglide && npx vitest run src/concepts/high-school/trig-identities && npm run check:i18n` | ❌ W0 | ⬜ pending |
| 02-11-03 | 11 | 4 | TRIG-09, TRIG-08, TRIG-07, MATH-03 | T-02-28 | jump cancelled on interaction | check + unit | `npm run check && npx vitest run src/concepts/high-school/trig-identities src/lib/trig` | ❌ W0 | ⬜ pending |
| 02-12-01 | 12 | 5 | all Phase 2 reqs | T-02-31 | full suite before sign-off | check + e2e parse | `npm run check && npx playwright test --list e2e/trig-journey.spec.ts e2e/catalog.spec.ts` | ❌ W0 | ⬜ pending |
| 02-12-02 | 12 | 5 | all (visual) | T-02-32 | n/a | manual checkpoint | human-verify (blocking) | ❌ W0 | ⬜ pending |

### Plan-level e2e (run after each wave completes)

| Wave | Plans | Command |
|------|-------|---------|
| 1 | 01, 02 | `npm run check && npx vitest run && npm run test:e2e` |
| 2 | 03, 04, 06 | `npx vitest run && npm run check && npx playwright test e2e/link.spec.ts e2e/formulas.spec.ts e2e/drag.spec.ts e2e/player.spec.ts e2e/deeplink.spec.ts e2e/next-link.spec.ts e2e/mobile.spec.ts` |
| 3 | 05, 07, 08 | `npx vitest run && npm run check && npx playwright test e2e/tangent.spec.ts e2e/sine-cosine.spec.ts e2e/identities.spec.ts e2e/deeplink.spec.ts e2e/mobile.spec.ts e2e/catalog.spec.ts` |
| 4 | 09, 10, 11 | `npx vitest run && npm run check && npx playwright test e2e/tangent.spec.ts e2e/sine-cosine.spec.ts e2e/identities.spec.ts e2e/deeplink.spec.ts e2e/mobile.spec.ts e2e/drag.spec.ts` |
| 5 | 12 | `npm run check && npx vitest run && npm run test:e2e` (full suite before the visual checkpoint) |

### Requirement → Test Map (from RESEARCH.md)

| Req ID | Behavior | Test Type | Automated Command | File Exists |
|--------|----------|-----------|-------------------|-------------|
| TRIG-04 | tan segment length/sign, similar triangles; undefined within 0.5° of 90/270 | unit | `npx vitest run src/lib/trig/ratios.test.ts` | ❌ W0 |
| TRIG-04/MATH-06 | clip at stage edge with arrow; no `Infinity/NaN/e+` in readout | unit | `npx vitest run src/lib/trig/clip.test.ts src/lib/engine/format.test.ts` | ❌ W0 / extend |
| TRIG-05 | sec/csc/cot geometry + poles; one-at-a-time schedule | unit | `npx vitest run src/concepts/high-school/tangent/view.test.ts` | ❌ W0 |
| TRIG-06 | unroll samples monotone, endpoint on axis at q=1, scrub-invariant | unit | `npx vitest run src/concepts/high-school/sine-cosine-graphs/unroll.test.ts` | ❌ W0 |
| TRIG-06 | circle drag and graph drag both change θ; deep links render | e2e | `npx playwright test e2e/sine-cosine.spec.ts` | ❌ W0 |
| MATH-04 | `tail(θ)` pure, clamped, length π/2, opacities monotone | unit | `npx vitest run src/concepts/high-school/sine-cosine-graphs/trail.test.ts` | ❌ W0 |
| MATH-05 | PanelPair frames shared axis; no overflow at 320px | unit + e2e | `npx vitest run src/lib/stage/panelpair.test.ts`; `npx playwright test e2e/mobile.spec.ts` | ❌ W0 |
| TRIG-07 | square areas sum to 1 over sweep | unit | `npx vitest run src/concepts/high-school/trig-identities/squares.test.ts` | ❌ W0 |
| TRIG-08 | ghost angles + identities for three symmetries | unit | `npx vitest run src/concepts/high-school/trig-identities/ghosts.test.ts` | ❌ W0 |
| TRIG-09 | exact table matches `Math.*`; snap ±3°, axes excluded, keyboard not snapped | unit + e2e | `npx vitest run src/lib/trig/special.test.ts src/lib/trig/snap.test.ts` | ❌ W0 |
| MATH-03 | `\htmlClass` → `link-*`; hover links + stuck-link recovery | unit + e2e | `npx vitest run src/lib/tex/tex.test.ts src/lib/link/link.test.ts`; `npx playwright test e2e/link.spec.ts` | ❌ W0 / extend |
| PLAY-07 | reducer pause/reveal semantics | unit | `npx vitest run src/lib/engine/player.test.ts` | ✅ extend |
| PLAY-07 | Reveal / Aufdecken button EN/DE; marker then reveal (one moment per concept) | e2e | `npx playwright test e2e/tangent.spec.ts e2e/sine-cosine.spec.ts e2e/identities.spec.ts e2e/trig-journey.spec.ts` (DE 'Aufdecken' asserted in sine-cosine.spec.ts and trig-journey.spec.ts) | ❌ W0 |
| i18n | EN/DE parity, caption limits | script | `npm run check:i18n` | ✅ |
| Tokens | every `--c-*` ≥ 7:1 on `--bg` | unit | `npx vitest run src/lib/styles/tokens.test.ts` | ✅ extend |
| D-18 color-blind | deut/prot-simulated ΔE ≥ 15 for UI-SPEC risk pairs; low pairs always include a dashed role; labels + dash cue in tangent `all` | unit + e2e | `npx vitest run src/lib/styles/tokens.test.ts`; `npx playwright test e2e/tangent.spec.ts` | ✅ extend / ❌ W0 |
| Deep links | every concept × locale × step prerendered | e2e | `npx playwright test e2e/deeplink.spec.ts` | ✅ extend |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/trig/{ratios,clip,special,snap}.test.ts` — TRIG-04/05/09, MATH-06
- [ ] `src/lib/engine/format.test.ts` + `player.test.ts` extensions (exact forms, undefined, pause/reveal)
- [ ] Concept pure tests: `unroll`, `trail`, `squares`, `ghosts`, per-concept `view.test.ts`
- [ ] `tokens.test.ts` contrast assertions
- [ ] `src/lib/link/link.test.ts` + `tex.test.ts` multi-class extension
- [ ] e2e: `sine-cosine`, `link`, `tangent`, `identities` (incl. snap), `next-link`, `trig-journey`; extend `deeplink`, `catalog`, `mobile` (predict moments are covered inside the three concept specs + trig-journey; there is no separate predict.spec.ts)
- [ ] e2e helper for dragging to a specific angle

*No framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 3B1B visual polish (glow, trail fade, unroll smoothness at 60fps) | TRIG-06, MATH-04 | Aesthetic/perceptual | Open each concept, play and scrub, drag at every step; check smoothness and look |
| German strings fit layouts | i18n | Visual layout judgment | Switch to /de, check each concept at 320px and desktop |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (every auto task; 02-12-02 is the human checkpoint)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (each spec/test file is created by the first task that verifies against it; e2e specs are written first in their plan and parsed with `--list`)
- [x] No watch-mode flags
- [ ] Feedback latency < 5s (unit commands yes; tasks running `npm run check` take ~10-20s, accepted)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
