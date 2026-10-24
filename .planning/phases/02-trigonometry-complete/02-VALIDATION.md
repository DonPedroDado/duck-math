---
phase: 2
slug: trigonometry-complete
status: draft
nyquist_compliant: false
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

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npm run check && npx vitest run` plus the relevant e2e spec
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds (unit)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| (filled by planner from PLAN.md tasks) | | | | | | | | | ⬜ pending |

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
| PLAY-07 | Reveal button EN/DE; marker then reveal | e2e | `npx playwright test e2e/predict.spec.ts` | ❌ W0 |
| i18n | EN/DE parity, caption limits | script | `npm run check:i18n` | ✅ |
| Tokens | every `--c-*` ≥ 7:1 on `--bg` | unit | `npx vitest run src/lib/styles/tokens.test.ts` | ✅ extend |
| Deep links | every concept × locale × step prerendered | e2e | `npx playwright test e2e/deeplink.spec.ts` | ✅ extend |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/trig/{ratios,clip,special,snap}.test.ts` — TRIG-04/05/09, MATH-06
- [ ] `src/lib/engine/format.test.ts` + `player.test.ts` extensions (exact forms, undefined, pause/reveal)
- [ ] Concept pure tests: `unroll`, `trail`, `squares`, `ghosts`, per-concept `view.test.ts`
- [ ] `tokens.test.ts` contrast assertions
- [ ] `src/lib/link/link.test.ts` + `tex.test.ts` multi-class extension
- [ ] e2e: `sine-cosine`, `predict`, `link`, `tangent`, identities snap spec; extend `deeplink`, `catalog`, `mobile`, `i18n`
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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
