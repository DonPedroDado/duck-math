---
phase: 01-foundation-playable-unit-circle
plan: 02
subsystem: infra
tags: [deploy, vercel, ci, static]
requires:
  - phase: 01-01
    provides: SvelteKit static build
provides:
  - Live public deployment at https://dm.ducksoft.ai (Vercel, static output)
  - CI workflow (check, unit, Playwright e2e, build)
  - docs/DEPLOY.md setup and verification checklist
affects: [all later phases]
requirements-completed: [SHELL-04]
key-files:
  created: [vercel.json, .github/workflows/ci.yml, docs/DEPLOY.md]
  removed: [.github/workflows/deploy.yml, static/CNAME]
completed: 2026-10-24
---

# Phase 1 Plan 02: Public Deployment Summary

Static SvelteKit build deployed to https://dm.ducksoft.ai on Vercel, with GitHub Actions CI running the full test suite on every push.

## Tasks
1. Deploy workflow, CNAME, setup checklist (originally GitHub Pages) - eb0b0a1
2. User actions (repo, Vercel import, domain, Cloudflare CNAME DNS-only) - done by user/orchestrator
3. Verify public URL - 7846022 (verification notes in docs/DEPLOY.md)

## Deviations from Plan

**Deploy target changed from GitHub Pages to Vercel (deviates from D-19).** Reason: user choice. Commit dd93cf0 added `vercel.json` (framework null, `npm ci`, build `npm run check && npm test && npm run build`, output `build`, trailingSlash true, immutable cache header for `/_app/immutable`), converted `deploy.yml` into CI-only `ci.yml`, removed `static/CNAME`, and rewrote `docs/DEPLOY.md`. The output remains plain static files, so the host stays swappable.

Adaptation of the verification: GitHub Pages checks were replaced with curl checks against Vercel.

## Verification (2026-10-24, curl, valid TLS)
- `/` 200, static redirect page (location.replace + hreflang)
- `/en/`, `/de/` 200 with correct `<html lang>`
- `/en/high-school/unit-circle/` and `/de/high-school/unit-circle/sine/` 200
- `/en/high-school/unit-circle/angle` -> 308 to trailing-slash form
- `/en/does-not-exist/` 404 serving the app's 404.html (`+error.svelte`)
- `/_app/immutable/*` served with `cache-control: public, max-age=31536000, immutable`

## Known Stubs
None.

## Self-Check: PASSED
Commits eb0b0a1, dd93cf0, 7846022 present in git log.
