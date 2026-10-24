---
phase: 01-foundation-playable-unit-circle
verified: 2026-10-24T12:30:00Z
status: gaps_found
score: 5/6 roadmap criteria verified (criterion 3 partial)
overrides_applied: 0
gaps:
  - truth: "Visual is always correct while the student manipulates the point (criterion 3; keyboard path)"
    status: partial
    reason: "CR-01 from 01-REVIEW.md is still present in the code. Keyboard arrows emit theta +/- step without wrapping to [0, 2pi); the page stores it raw. Below 0 deg the angle arc and theta label vanish (Scene.svelte gates on theta >= 1e-3), above 360 deg the arc becomes a full circle and the label flips, while the readout shows the normalized value. Pointer/touch drag is unaffected (angleFromPoint normalizes)."
    artifacts:
      - path: "src/lib/stage/DragPoint.svelte"
        issue: "key() calls onchange(theta - step) / onchange(theta + step) with no wrap (lines 63-69)"
      - path: "src/routes/high-school/unit-circle/[[step]]/+page.svelte"
        issue: "line 103 onthetachange={(t) => (user.theta = t)} stores un-normalized theta"
    missing:
      - "Wrap keyboard output to [0, 2pi) in DragPoint.key() and normalize at the page state boundary"
      - "Add an e2e/unit case: ArrowLeft past 0 deg keeps angle-arc present with ~359 deg sweep"
human_verification: []
---

# Phase 1: Foundation + Playable Unit Circle - Verification Report

**Phase Goal:** A visitor can open the publicly deployed site, pick the Trig concept from the catalog, and play through and drag a beautiful dark-themed unit-circle explainer in English or German.
**Verified:** 2026-10-24
**Status:** gaps_found (one small, well-localized defect; everything else verified)
**Re-verification:** No, initial verification

## Automated evidence (run by the verifier)

| Check | Result |
| --- | --- |
| `npm run check` (svelte-check) | 0 errors, 0 warnings |
| `npx vitest run` | 14 files, 128 tests passed |
| `npm run build` (includes prebuild i18n check, adapter-static, postbuild redirect) | success |
| `npm run check:i18n` | "58 keys OK in en, de" |
| Live site `https://dm.ducksoft.ai/en/` and `/de/` | HTTP 200 both; `/de/` contains German catalog strings (Oberstufe, Universität) |
| `npx playwright test` | NOT RUN: port 4173 was already occupied by another node process (config has `reuseExistingServer: false`); I did not kill it. E2E result relies on the SUMMARYs and the user's manual review. |

## Roadmap success criteria

| # | Criterion | Status | Evidence |
| - | --------- | ------ | -------- |
| 1 | Public URL, catalog grouped by High School, University as coming later, open Trig and return | VERIFIED | Live site 200 in en and de, no login; catalog/categories/upcoming/SoonCard code present; e2e/catalog.spec.ts exists; user approval |
| 2 | Play, pause, step, reset, scrub both directions; always correct; caption per step | VERIFIED | `engine/timeline.ts`, `player.ts`, `PlayerBar`, `Scrubber`; pure reducer/timeline unit tests green; captions per step id in Panel. WR-01 (rAF loop uses `performance.now()` per frame so animation runs somewhat slower than authored) is a timing-accuracy defect, not a correctness one |
| 3 | Drag at any step, deg/rad toggle, radian as radius laid on arc, cos/sin projections, live color-matched KaTeX and readouts | PARTIAL | Pointer/touch drag, toggle, RadianLayer, projections, formulas.ts, Tex.svelte all exist and are tested (radian, projection, formulas, derive, format tests). FAIL on the keyboard path: CR-01 (see gap). WR-02 (toggle can show the blended, not the real, unit for roughly the first 20% of the radians step, and a click on "rad" is then a no-op) is a minor warning |
| 4 | Dragging during playback pauses cleanly; changing step re-stages predictably | VERIFIED (pointer) | `ondragstart` pauses the player and sets `moved`; reducer re-stages on step change (player.test.ts). WR-03: keyboard does not pause playback (warning) |
| 5 | /en/ and /de/, German decimal comma, step deep link, build fails on missing key | VERIFIED | Both URLs live; `format.ts` + tests; `[[step]]` route + `urls.ts` tests; `prebuild` runs `scripts/check-i18n.mjs` (with its own test file) and passes on 58 keys |
| 6 | Phone/tablet: drag, controls, no overflow (EN and DE) | VERIFIED (human) | e2e/mobile.spec.ts and helpers/touch.ts exist; user did a visual desktop and responsive review and approved (01-10-SUMMARY.md). Not re-run by me |

## Requirements coverage

All 21 phase IDs appear in PLAN frontmatter (01-01 through 01-10 cover them) and in REQUIREMENTS.md.

| Requirement | Status | Note |
| --- | --- | --- |
| SHELL-01..05 | SATISFIED | Catalog, open/return, deep link, public site, dark theme |
| PLAY-01..06 | SATISFIED | See criteria 2 and 4. PLAY-05 caveat: keyboard input (WR-03) |
| MATH-02 | SATISFIED | Live locale-aware readouts |
| I18N-01, I18N-02, I18N-03 | SATISFIED | |
| TRIG-01, TRIG-02 | SATISFIED | |
| A11Y-01 | SATISFIED | As defined in REQUIREMENTS.md (touch, phones/tablets, layout fits). It does not mention keyboard, so CR-01 does not fail this ID |
| MATH-01 | SATISFIED in code, STALE in docs | KaTeX with color-matched terms implemented (Tex.svelte, formulas.ts, math.css, formulas.spec.ts). REQUIREMENTS.md still shows `[ ]` and "Pending" |
| I18N-04 | SATISFIED in code, STALE in docs | `prebuild` check-i18n verified working. REQUIREMENTS.md still shows `[ ]` and "Pending" |
| TRIG-03 | SATISFIED in code, STALE in docs | Delivered by 01-08 (projections plus live formulas). REQUIREMENTS.md still shows `[ ]` and "Pending" |

Orphaned requirements: none. Doc fix needed: tick MATH-01, I18N-04, TRIG-03 and set their traceability rows to Complete.

## Code review findings (01-REVIEW.md) assessment

- **CR-01 (BLOCKER for criterion 3 "always correct"):** confirmed unfixed in `DragPoint.svelte:63-69` and `+page.svelte:103`. Reachable with a few arrow presses past 0 deg. It does not affect pointer/touch use, which is what the user reviewed and approved, but it is a genuine wrong-visual bug in the primary interaction and the fix is a few lines.
- WR-01 (clock timing drift), WR-02 (toggle shows blended unit), WR-03 (keyboard does not pause or dismiss hint), WR-04 (Panel KaTeX throw not boundaried), WR-05 (lib imports from concept; drag center uses bounding rect), WR-06 (live region recreated per step): warnings. None defeats a criterion on its own. WR-02 and WR-04 are worth fixing before building more concepts.
- IN-01..: informational.

## Other notes

- STATE.md is stale: `status: executing`, `stopped_at: Phase 1 UI-SPEC approved`, and it says `completed_phases: 1` while the phase is in fact finished. Update after gap closure.
- Deploy target is Vercel rather than GitHub Pages (deviation from D-19, documented in 01-02-SUMMARY.md and accepted by the user). The 01-02 PLAN text still mentions GitHub Pages.
- Anti-pattern scan: no stub or placeholder renderers found in the concept or shell code. Components are fed by real state.

## Gaps summary

One gap: CR-01. Run `/gsd-plan-phase 01 --gaps` (or a quick fix) to wrap keyboard theta to [0, 2pi), add a regression test, and optionally batch WR-02 and WR-03 with it. Then update the three stale requirement checkboxes. After that the phase should pass. The phase otherwise achieves its goal: the site is live, bilingual, playable and draggable, and the user approved it.
