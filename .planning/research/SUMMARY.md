# Project Research Summary — Duck Math

**Domain:** Interactive, animated math visualization explainers (3Blue1Brown look, live/draggable, modular concepts, multilingual)
**Researched:** 2026-10-24
**Confidence:** MEDIUM (direction high-confidence; open items are cheap API/license checks at Phase 1 start)

## Executive Summary

Duck Math should be a **static, client-only TypeScript web app**. Each concept is a module of numeric params + a pure scene render + a list of steps that are **keyframes** (param targets + visible layers), not animation scripts. Because the scene is a pure function of `(params, step progress)`, scrubbing backward, deep-linking to a step and dragging all share one code path.

**No Python in the runtime.** Manim renders video; Pyodide/PyScript add multi-MB cold start plus a JS renderer anyway; Streamlit/NiceGUI/Reflex need a live server (breaks static hosting and 60fps drag). Python is acceptable only for offline tooling. Borrow Manim's *look* (palette, easing), not the tool.

Build: a thin shell with folder-glob concept discovery; a concept-agnostic engine (player, param store with ownership, pure step resolver, scene host); a small in-house SVG primitives library; KaTeX math sharing one palette-token system with the SVG; i18n keys and locale-aware number formatting from the first commit.

Top risks (all engine-level, expensive to retrofit): two writers to one value (animation vs drag), non-scrubbable timelines, hard-coded strings/hex colors, naive math edge cases (tan asymptotes, holes, h→0). Counter-risk: over-engineering the framework before any concept exists — build the engine *with* the first concept, extract the module API after concept #2, and put seek-equivalence + drag-during-playback tests in CI from day one.

## Conflicts Reconciled

1. **Framework → SvelteKit 3 + Svelte 5 (runes)**, not React. ARCHITECTURE's React code was illustrative; fine-grained reactivity (runes) fits per-frame param updates; Mafs (React-only) is plot-centric and stale (last release Mar 2025). Translation: Scene → `Scene.svelte`; store → `$state` params with `$derived` for `derive()`; router → SvelteKit file routing + prerender (removes SPA-fallback issue); i18next → Paraglide JS 2. Runner-up: React + Vite + Mafs.
2. **First concept → Trig first** (user's stated first concept, and the hardest case — validates the contract while it has one consumer). Split: Phase 1 ships a thin playable trig slice; Phase 2 completes the heavy moments. Transformations follows and drives contract extraction.
3. **Smaller:** Paraglide compiles messages — keep per-concept folder convention + en/it parity check (fallback: prefixed keys or `svelte-i18n`). GSAP (or ~150-line own tweener) is only a *time source*; pure `resolve()` produces params. Start contract minimal `{ meta, params, steps, Scene, messages }`; add `derive`/`layers`/`draggable` when two concepts need them.

## Key Findings

### Stack (STACK.md)
TypeScript ~6.0 (Kit 3 peers `^6`; don't use 7.x yet) · Svelte 5.57 · SvelteKit 3.1 + adapter-static · Vite 8 · own SVG components + d3 pure modules (scale, shape, interpolate, ease) · GSAP 3.15 or own tweener · KaTeX 0.19 with `\htmlClass` + CSS-variable color tokens (restricted `trust`) · Paraglide JS 2.29 + `Intl.NumberFormat` · Vitest + Playwright · static host (Cloudflare Pages / Netlify).
**Avoid:** Manim, Pyodide, Streamlit/NiceGUI/Reflex, Motion Canvas, Remotion, MathJax for live formulas, TS 7.

### Features (FEATURES.md)
- **Table stakes:** instant touch-friendly drag; step player (play/pause/step/scrub/reset); live visuals at every step; color-matched KaTeX + live numeric readouts; global semantic palette; deg/rad toggle; deep links with stable step IDs; EN + IT; baseline accessibility.
- **Differentiators:** blended guided+live mode (the core); formula↔geometry hover linking; ungraded "predict, then reveal"; trace trails; linked multi-view panels; scrubbable derivation moments (unroll, secant→tangent); authoring ergonomics.
- **Defer:** ε-δ window, limits at infinity, presenter mode, inline scrubbable prose, persistence beyond language & deg/rad, University category, 3D.
- **Never:** quizzes/scoring, accounts, long prose, video, voiceover, general calculator, gamification, ads.

### Architecture (ARCHITECTURE.md)
Dependency flow `shell → core`; `concepts → primitives, core, math`; nothing imports concepts except the registry glob (lint-enforced). Components: registry + contract; player + pure step resolver; param store with ownership (`timeline` | `user`; pointer-down → `user`, cancel tween, pause; step boundary re-stages); scene host with shared `View` (y-flip, equal aspect, non-scaling strokes); stateless primitives (Axes, UnitCircle, FunctionPlot, DraggablePoint, Segment, AngleArc, TeX); pure `derive()`; TeX with palette tokens; i18n keys only in code.

### Top Pitfalls (PITFALLS.md)
1. **Two writers / non-scrubbable timeline** → single param store, explicit ownership, steps as data, traces recomputed from params; seek-equivalence property test + drag-during-playback test in CI from Phase 1.
2. **Framework over-engineering** → playable concept in Phase 1, extract API after concept #2.
3. **Math edge cases** → radians internally (one `Angle` helper), discontinuity-aware sampler, "undefined" as a UI state, epsilon snapping to special angles with exact values, declared analytic limits (never evaluate at the hole), analytic derivatives with h floored > 0.
4. **Late i18n / tokens / a11y** → no string literals or hex in scene code; color-blind-safe palette + non-color cues; keyboard-first handles; reduced-motion in engine.
5. **Mobile & performance** → Pointer Events with capture, container-based sizing, single shared rAF loop with `dispose()`, no per-frame KaTeX re-typeset, frame budget measured on mid-range Android.
6. **Text creep** → caption word-budget lint.

## Implications for Roadmap

1. **Foundation + Trig vertical slice** — scaffold, lint boundaries, tests, public deploy day one; shell (catalog, routing, EN/IT URL locale, step deep links); engine (param store, resolver, transport); primitives + tokens; math core (`Angle`, number format, sampler); trig slice (drag point, angle arc, deg/rad, sin/cos projections, readouts, radian "wrap the radius").
2. **Trig completion** — tan via similar triangles (undefined at 90°), sec/csc/cot one at a time, scrubbable unroll into sine graph with linked panels, cos as shifted sine, Pythagorean identity squares, symmetries via ghost points, special-angle snapping with exact values, free-explore step.
3. **Functions & Transformations + contract extraction** — asymmetric base curve with landmarks; shifts (f(x+h) "input must be earlier"), stretches, reflections as sliders through 0, combined; param→term color binding; freeze `ConceptModule` contract; `create-concept` template + authoring docs.
4. **Limits** — two-color left/right approach; hole (open vs filled dot), jump, DNE; optional infinite/oscillating; zoom; scenarios as data; dedicated edge-case checklist.
5. **Derivatives** — local-linearity zoom; secant with rise/run triangle; secant→tangent as h→0 (switch to analytic tangent below threshold); live derivative graph; slope-sign color; small function selector. Reuses Limits' approach visual.
6. **Polish / a11y audit / launch** — axe/Lighthouse CI, keyboard + screen-reader passes, color-blindness check, real-device touch, +40% pseudo-locale, Italian terminology review, bundle budget, per-locale SEO, CSP.

**Research flags:** Phase 1 (Paraglide + Kit 3, KaTeX 0.19 `trust`/`\htmlClass`, GSAP license vs own tweener, SVG drag perf spike), Phase 2 (unroll/linked panel design, Italian trig notation), Phase 5 (local-linearity zoom). Phases 3, 4, 6: standard patterns.

## Confidence

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Versions verified on npm 2026-10-24; Svelte vs React a judgment call; GSAP license, KaTeX `trust`, Paraglide/Kit integration unverified |
| Features | MEDIUM | Domain knowledge, no live web check |
| Architecture | MEDIUM | Established pattern; needs re-expression in Svelte runes |
| Pitfalls | MEDIUM | Standards/IEEE-754 solid; library specifics & perf numbers marked "verify" |

## Gaps to Address

- Confirm Svelte choice with user (fallback React + Vite + Mafs).
- Read actual GSAP license terms (own tweener as fallback).
- Verify KaTeX restricted `trust` API and Paraglide + SvelteKit 3 integration.
- Italian conventions (`sen`/`tg` vs `sin`/`tan`, decimal comma) — make function names localizable tokens.
- Set real perf/bundle budgets from Phase 1 spike (8 ms/frame, 200 KB gz are placeholders).
- Playtest "keep dragged value" vs "re-stage at next step" (default: re-stage, per-step opt-out).
- Confirm host (Cloudflare Pages / Netlify); prerender makes per-locale URLs + SEO nearly free.
- manim-web: optional spike only (LOW confidence; scripted, not state-driven).

## Sources

- Primary: npm registry checks 2026-10-24 (svelte 5.57.2, @sveltejs/kit 3.1.0, vite 8.3.5, katex 0.19.1, gsap 3.15.0, @inlang/paraglide-js 2.29.1, d3 7.9.0, vitest 4.0.0, playwright 1.64.1, mafs 0.21.0, jsxgraph 1.14.1, manim-web 0.40.0); `.planning/PROJECT.md`.
- Secondary: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md in this folder; WCAG 2.x, ARIA slider pattern, Pointer Events, IEEE-754.
- Needs validation: GSAP license, Pyodide size, manim-web fit, KaTeX 0.19 `trust`, Paraglide + Kit, Italian notation.
