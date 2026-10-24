---
phase: 01-foundation-playable-unit-circle
plan: 08
subsystem: ui
tags: [katex, trig, projections, i18n-numbers]
requires: [01-05]
provides:
  - KaTeX wrapper (trust limited to htmlClass) and Tex component
  - per-step formula builder with locale numbers
  - cos/sin projection layer in the unit-circle Scene
affects: [unit-circle]
key-files:
  created:
    - src/lib/tex/tex.ts
    - src/lib/tex/Tex.svelte
    - src/lib/styles/math.css
    - src/concepts/high-school/unit-circle/formulas.ts
    - src/concepts/high-school/unit-circle/projection.ts
    - e2e/formulas.spec.ts
  modified:
    - src/concepts/high-school/unit-circle/Scene.svelte
    - src/concepts/high-school/unit-circle/Panel.svelte
requirements-completed: [TRIG-03, MATH-01, MATH-02, I18N-03]
completed: 2026-10-24
---

# Phase 1 Plan 08: Formulas and cos/sin projections Summary

Color-matched, prerendered KaTeX formulas with live locale numbers (decimal comma in DE, true minus, no -0) plus drawn-on cos/sin projection segments with label flipping.

## Commits
- RED tests: tex and formulas
- 8004f80: KaTeX wrapper, math.css, formula builder
- 34e8fbe: projection layer, Panel formulas, e2e

## Deviations from Plan
- [Rule 1 - e2e adjustment] Flat SVG lines have zero-size bounding boxes so Playwright reports them hidden; the e2e uses `toBeAttached` plus `data-len` instead of `toBeVisible`.
- [Rule 1 - e2e adjustment] Keyboard focus targets the `[tabindex]` child of `drag-point`; at the cosine deep link the readout is in radians, so the 90 degree check accepts `90°` or `1.57`/`1,57`.

## Verification
vitest 114 passed, `npm run check` 0 errors, e2e formulas + drag (desktop) 12 passed. Only one `{@html}` exists (Tex.svelte). `+page.svelte` untouched. No stubs.

## Self-Check: PASSED
