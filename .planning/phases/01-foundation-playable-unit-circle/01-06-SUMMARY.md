---
phase: 01-foundation-playable-unit-circle
plan: 06
subsystem: catalog-ui
tags: [catalog, ui, error-states]
requires: [01-01]
provides: [catalog cards, soon cards, localized 404]
affects: [src/routes/+page.svelte, src/routes/+error.svelte]
key-files:
  created:
    - src/lib/catalog/categories.ts
    - src/lib/catalog/upcoming.ts
    - src/lib/catalog/ConceptCard.svelte
    - src/lib/catalog/SoonCard.svelte
    - src/lib/catalog/thumbs/FunctionsThumb.svelte
    - src/lib/catalog/thumbs/LimitsThumb.svelte
    - src/lib/catalog/thumbs/DerivativesThumb.svelte
    - src/concepts/high-school/unit-circle/Thumbnail.svelte
    - src/routes/+error.svelte
    - e2e/catalog.spec.ts
    - e2e/notfound.spec.ts
  modified:
    - src/routes/+page.svelte
    - src/concepts/high-school/unit-circle/index.ts
requirements-completed: [SHELL-01, SHELL-02, SHELL-05]
duration: ~15min
completed: 2026-10-24
---

# Phase 01 Plan 06: Catalog cards and 404 Summary

Visual catalog (live Unit circle card with SVG thumbnail, three inert "Soon" cards, dimmed University "Coming later" section, empty state) plus a localized, non-reflecting 404 page.

## Commits
- a8ee338: catalog cards, thumbnails, sections
- 97775b0: localized 404

## Deviations from Plan

**1. [Rule 1 - Bug] 404 home link lacked trailing slash.** `localizeHref('/')` returns `/en`; the error CTA now appends `/` so href is `/de/` as specified.

**2. [Rule 1 - Bug] 404 fallback html lang stayed `en` (Assumption A5 partly failed).** Heading and text were already localized from the URL, but the prerendered `404.html` carries `lang="en"`. Fixed in `+error.svelte` with an `$effect` setting `document.documentElement.lang = getLocale()`. `hooks.ts` needed no change.

Imports use the project `#lib/...` alias rather than `$lib`.

## Verification
Playwright catalog, notfound and skeleton specs: 24/24 pass (desktop + mobile). Vitest: 45/45 pass. `+error.svelte` contains no `page.url`, `error.message` or `{@html}`.

## Known Stubs
None.

## Self-Check: PASSED
