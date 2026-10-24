---
phase: 02-trigonometry-complete
plan: 03
subsystem: ui
tags: [hover-linking, katex, a11y, unit-circle, svelte-runes]
requires:
  - phase: 02-01
    provides: scene props contract
  - phase: 02-02
    provides: tokens (--dim-opacity, --dur-link) and link_* messages
provides:
  - Shared link store, closed LinkId union, linkAttrs/linkOpacity helpers, ROLE_NAME
  - Delegated link events in Tex.svelte, LinkReset
  - Linked cos/sin on the Unit circle (mouse and touch)
affects: [02-04, 02-06, later concept plans]
key-files:
  created:
    - src/lib/link/ids.ts
    - src/lib/link/link.svelte.ts
    - src/lib/link/linkable.ts
    - src/lib/link/roles.ts
    - src/lib/link/LinkReset.svelte
    - e2e/link.spec.ts
  modified:
    - src/lib/tex/Tex.svelte
    - src/concepts/high-school/unit-circle/Scene.svelte
    - src/concepts/high-school/unit-circle/formulas.ts
key-decisions:
  - "Keyboard-only focus links a term: tracked via window keydown, because :focus-visible is true after a touch tap and made click toggle cancel the link."
metrics:
  completed: 2026-10-24
requirements-completed: [MATH-03]
---

# Phase 2 Plan 03: Formula-visual hover linking Summary

Delegated hover/tap linking between KaTeX terms and SVG elements via a module-level rune store, proven on the Unit circle cos/sin steps.

## Tasks
1. Link ids, store, linkAttrs (63de989), unit tested.
2. Tex delegation, roles, LinkReset, linked unit circle, e2e (see git log, second commit).

## Verification
vitest 185 passing, `npm run check` 0 errors/warnings, Playwright link/formulas/drag specs 26 passing (one unrelated flake of the 30-keypress 90-degree test on a loaded run; passed on re-run).

## Deviations from Plan

**1. [Rule 1 - Bug] Touch tap cancelled itself** - Tapping a tabindex term fired focusin (focus-visible true), which set the link, then click toggled it off. Fix: focusin links only when the last input was a key (window keydown tracking).

**2. [Rule 3] Svelte `{@const}` not allowed inside `<g>`** - hoisted the label-position consts to the top of each `{#if}` block in Scene.svelte.

**3. [Rule 3] e2e hover on a zero-height SVG line** - cos-seg bounding box has zero height so Playwright hover fails as not visible; the spec moves the mouse by coordinates instead.

Added svelte-ignore a11y comments on the Tex wrapper (delegated handlers; focusable terms carry role/aria).

## Known Stubs
None.

## Self-Check: PASSED
