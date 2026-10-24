# Roadmap: Duck Math

## Overview

Duck Math ships as a static, public SvelteKit site where every phase ends with something a student (and the user) can open in a browser and try. Phase 1 builds the engine and a thin, playable, deployed Trig unit-circle slice, so the hard architecture (param ownership, scrubbable steps, EN/DE, dark theme) is proven against a real concept. Trig is then completed, Functions & Transformations drives extraction of the reusable module contract, Limits and Derivatives follow as their own modules, and a final phase hardens accessibility, devices and launch quality.

## Phases

- [ ] **Phase 1: Foundation & Playable Unit Circle** - Deployed site with engine, player, EN/DE, dark theme, touch support, and a thin draggable unit-circle slice
- [ ] **Phase 2: Trigonometry Complete** - tan/sec/csc/cot, unrolling into graphs, identities, symmetries, special angles
- [ ] **Phase 3: Functions & Transformations + Module Contract** - Graph transformations concept; module contract frozen with scaffold template
- [ ] **Phase 4: Limits** - Visual limit intuition: approach, holes, jumps, infinite limits, limits at infinity, zoom
- [ ] **Phase 5: Derivatives** - Local linearity, secant to tangent, live derivative graph
- [ ] **Phase 6: Polish, Accessibility & Launch Hardening** - Keyboard, reduced motion, color-blind cues, device audit

## Phase Details

### Phase 1: Foundation & Playable Unit Circle
**Goal**: A visitor can open the publicly deployed site, pick the Trig concept from the catalog, and play through and drag a beautiful dark-themed unit-circle explainer in English or German.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05, PLAY-06, MATH-01, MATH-02, I18N-01, I18N-02, I18N-03, I18N-04, TRIG-01, TRIG-02, TRIG-03, A11Y-01
**Success Criteria** (what must be TRUE):
  1. Visitor opens a public URL without login, sees a catalog grouped by High School (with University shown as coming later), opens the Trig concept and returns to the catalog.
  2. Student can play, pause, step, reset and scrub the unit-circle explanation in both directions, and the visual is always correct at every position, with a short caption per step.
  3. Student can drag the point around the circle at any step, see angle in degrees or radians (toggle), see a radian as the radius laid along the arc, and see cos/sin as x/y projections with live, color-matched KaTeX formulas and readouts.
  4. Dragging during playback pauses it cleanly with no jumps; moving to another step re-stages the scene predictably.
  5. Visitor can switch between English and German via /en/ and /de/ URLs, numbers use a decimal comma in German, a link to a specific step opens at that step, and the build fails if a text key is missing in either language.
  6. On a phone or tablet, student can drag the point, use the player controls, and the layout fits the small screen without overflow (EN and DE).
**Plans**: 10 plans (6 waves)

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Walking skeleton: Kit 3 + Paraglide scaffold, tokens theme, registry catalog, concept page with draggable point and live locale readout

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 01-02-PLAN.md — Deploy to GitHub Pages at dm.ducksoft.ai (workflow, CNAME, checklist, user setup checkpoint)
- [x] 01-03-PLAN.md — i18n guardrails: build-failing key/placeholder check, static root language redirect, EN/DE URL e2e
- [x] 01-04-PLAN.md — Player engine (TDD): pure timeline, player reducer with keep/restage, rAF clock, unit-circle view schedule, arc geometry
- [x] 01-06-PLAN.md — Catalog visual cards (live + soon + University) and localized 404

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 01-05-PLAN.md — Guided player UI: player bar + scrubber, captions, responsive layout, intro/angle visuals, drag pauses playback

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 01-07-PLAN.md — Shareable step URLs: shallow-routing sync, Back/Forward, deep-link e2e
- [ ] 01-08-PLAN.md — Cos/sin projections with color-matched KaTeX formulas and live locale readouts

**Wave 5** *(blocked on Wave 4 completion)*
- [ ] 01-09-PLAN.md — Radian moment (peel, bend, repeat to π) and deg/rad toggle

**Wave 6** *(blocked on Wave 5 completion)*
- [ ] 01-10-PLAN.md — Phone/touch hardening, 3B1B polish (glow, halo, pulse), visual review checkpoint
**UI hint**: yes

### Phase 2: Trigonometry Complete
**Goal**: A student can see every core trig idea geometrically, from tan and its friends through the unrolled sine/cosine graphs to identities and special angles.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: TRIG-04, TRIG-05, TRIG-06, TRIG-07, TRIG-08, TRIG-09, MATH-03, MATH-04, MATH-05, MATH-06, PLAY-07
**Success Criteria** (what must be TRUE):
  1. Student sees tan as a segment on the tangent line, and at 90 and 270 degrees it shows "undefined" instead of a huge number; sec, csc and cot appear as segments one at a time.
  2. Student can play or scrub the circle unrolling into sine and cosine graphs in a synced side-by-side panel, with the moving point leaving a fading trail.
  3. Student sees sin^2 + cos^2 = 1 visually and symmetries via reflected ghost points.
  4. Student can snap to 30/45/60 degrees and see exact values derived from the special triangles.
  5. Hovering a formula term highlights the matching visual element and vice versa; selected steps pause with a "predict, then reveal" prompt before showing the answer.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Functions & Transformations + Module Contract
**Goal**: A student can see how shifts, stretches and reflections change a graph, and a developer can add a new concept from a template without touching the shell.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: FUNC-01, FUNC-02, FUNC-03, FUNC-04, FUNC-05, MOD-01, MOD-02, MOD-03
**Success Criteria** (what must be TRUE):
  1. Student sees f(x)+a and f(x+a) on an asymmetric base curve with landmark points, including why a horizontal shift moves the opposite way.
  2. Student sees stretches a*f(x) and f(ax) with the fixed points marked, and drags a parameter continuously through 0 into negatives to see reflections.
  3. Student can combine transformations, with each parameter color-linked to its term in the formula.
  4. A new concept scaffolded from the template appears in the catalog automatically; Trig and Functions both follow the same documented module folder contract.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Limits
**Goal**: A student gains visual intuition for what a limit is, including where it exists, differs from the value, or fails.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: LIM-01, LIM-02, LIM-03, LIM-04, LIM-05, LIM-06
**Success Criteria** (what must be TRUE):
  1. Student drags x toward a value from the left and right (two colors) and watches f(x) approach the limit.
  2. Student sees a hole (open dot) with a different filled value, and a jump discontinuity where the limit does not exist.
  3. Student sees infinite limits at vertical asymptotes and limits at infinity with horizontal asymptotes, with graphs breaking correctly at asymptotes.
  4. Student can zoom in around the approach point.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Derivatives
**Goal**: A student sees the derivative as the slope of the tangent and watches it emerge from a secant as a limit.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: DER-01, DER-02, DER-03, DER-04, DER-05, DER-06
**Success Criteria** (what must be TRUE):
  1. Student zooms in on a curve until it looks straight (local linearity).
  2. Student sees a secant with a rise/run triangle and its slope, and shrinks h toward 0 to watch it become the tangent without glitches.
  3. Student drags a point along the curve and the derivative graph is traced live in a linked panel; tangent color shows increasing, decreasing or flat.
  4. Student can choose among a few example functions.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Polish, Accessibility & Launch Hardening
**Goal**: Every concept works well on phones, with keyboard, with reduced motion, and for color-blind students, and the site is ready for the public.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: A11Y-02, A11Y-03, A11Y-04
**Success Criteria** (what must be TRUE):
  1. Every concept (not just Trig) is re-verified on real phones/tablets in both English and German — touch drag, controls, no overflow (A11Y-01 delivered in Phase 1, audited here).
  2. Student can operate every draggable element and player control with the keyboard alone.
  3. With reduced-motion enabled, animations are suppressed or simplified while concepts stay usable.
  4. Every color-coded meaning also has a label or pattern cue distinguishable without color.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Playable Unit Circle | 0/10 | Planned | - |
| 2. Trigonometry Complete | 0/TBD | Not started | - |
| 3. Functions & Transformations + Module Contract | 0/TBD | Not started | - |
| 4. Limits | 0/TBD | Not started | - |
| 5. Derivatives | 0/TBD | Not started | - |
| 6. Polish, Accessibility & Launch Hardening | 0/TBD | Not started | - |
