---
phase: 01-foundation-playable-unit-circle
plan: 03
subsystem: i18n
tags: [i18n, paraglide, redirect, build-check]
requires: [01-01]
provides:
  - Build-failing i18n key/placeholder/caption-budget check (prebuild)
  - Static root language redirect page (postbuild)
  - e2e coverage for redirect and EN/DE URL behavior
affects: [all later plans adding messages]
key-files:
  created:
    - scripts/check-i18n.mjs
    - scripts/check-i18n.test.ts
    - scripts/postbuild.mjs
    - scripts/fixtures/i18n-missing/
    - scripts/fixtures/i18n-placeholder/
    - scripts/fixtures/i18n-caption-long/
    - e2e/root-redirect.spec.ts
    - e2e/i18n.spec.ts
  modified: [package.json]
key-decisions:
  - "Root redirect is a static build/index.html written by postbuild, not a SvelteKit route"
requirements-completed: [I18N-01, I18N-02, I18N-04, PLAY-03]
duration: 10min
completed: 2026-10-24
---

# Phase 1 Plan 03: i18n guarantees Summary

`npm run build` now fails on missing, empty or placeholder-mismatched message keys and over-long step captions (EN 18 / DE 25 words). A static page at `/` redirects to `/de/` or `/en/` using stored `dm-locale`, then browser language, with an allowlist so there is no open redirect.

## Task Commits
1. Task 1 RED: 3357faf; GREEN: 206ba7a (prebuild + check:i18n scripts)
2. Task 2: see `feat(01-03): static root language redirect` commit (postbuild, two e2e specs)

## Verification
- 14 vitest cases pass; deleting `uc_title` from de.json makes `npm run build` fail with `missing in de: uc_title` (restored afterwards).
- 10 e2e tests pass on desktop (port 4303).

## Deviations from Plan
- Task 2 e2e specs and postbuild were committed together rather than as a separate RED commit; specs were written first but the RED run was not committed separately.
- The mobile Playwright project uses an explicit testMatch list, so these specs run on desktop only (plan allowed this).

## Known Stubs
None.

## Self-Check: PASSED
