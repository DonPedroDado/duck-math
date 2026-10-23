# Duck Math

## What This Is

Duck Math is a public math education web app that **visualizes concepts** so high school (and later university) students actually understand them. It is not a problem/exercise app and not a textbook: each concept is an animated, interactive visual explainer with short, minimal text alongside. The architecture is modular — the shell stays the same while new concept modules are added continuously.

## Core Value

A student opens a concept and, through guided animated steps they can also grab and manipulate, *sees* why the math works — with only as much text as needed.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Platform / framework**
- [ ] Modular concept architecture: each concept is a self-contained code module following a shared structure/API; adding a concept doesn't require touching the shell
- [ ] Concepts organized by category (High School now; University category reserved for later)
- [ ] "Blended" experience: guided step-by-step animated explanation (play/pause/step/scrub) where at each step the visual stays live and draggable
- [ ] Minimal explanatory text alongside each step (not textbook-length)
- [ ] Math rendered properly (formulas, colored terms that match the visual)
- [ ] 3Blue1Brown-inspired look: dark background, smooth animation, color-coded math
- [ ] Multilingual: all UI and concept text translatable (architecture supports multiple languages from day one; English + German)
- [ ] Publicly deployed website, no accounts required

**Concept: Trigonometry & the Unit Circle (High School)**
- [ ] sin/cos as coordinates of a point on the unit circle; angles in degrees and radians
- [ ] tan (and sec/csc/cot) shown geometrically as segments
- [ ] Unrolling the circle into sine/cosine graphs
- [ ] Identities: sin²+cos²=1, symmetries, special angles (30°/45°/60°)

**Concept: Functions & Transformations (High School)**
- [ ] Shifting/stretching/reflecting graphs: f(x+a), f(x)+a, a·f(x), f(ax)

**Concept: Limits (High School)**
- [ ] Visual intuition for limits (approaching a value, one-sided limits, discontinuities)

**Concept: Derivatives (High School)**
- [ ] Derivative as slope of the tangent, secant → tangent as a limit, derivative graph

### Out of Scope

- Problem sets / exercises / quizzes — the product is a visual explainer, not a drill app
- User accounts, progress tracking — public site, no login needed for v1
- University-level concepts — user has more complex ideas planned for that category later
- Integrals and remaining school calculus — next milestone (each as its own module)
- Using Manim directly — it renders offline videos and can't support live in-browser interaction, which is required

## Context

- Greenfield project, empty repo (initialized 2026-10-24).
- Inspiration: 3Blue1Brown visual style; interactive feel of Desmos/GeoGebra.
- User initially wanted Python, but said it's not strict — choose whatever produces the best live, interactive visuals. Live browser interaction outranks the language preference.
- Each school calculus topic is its own module (limits, derivatives, later integrals…), not one big calculus module.
- The project will grow continuously; ease of authoring a new concept module is a long-term priority.

## Constraints

- **Interaction**: Visuals must render live in the browser and be manipulable at any step — rules out pre-rendered video as the primary medium.
- **Tech stack**: Python preferred but not required — best tool for interactive visuals wins.
- **Content**: Text minimal; the visual carries the explanation.
- **i18n**: English + German. Text externalized from day one; layouts must survive longer German strings.
- **Look**: It must look beautiful — polished 3Blue1Brown-style visuals are part of the core value, not an afterthought. User will try it and give feedback on problems.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Live in-browser rendering (not Manim videos) | Students must be able to drag/scrub at every step | — Pending |
| Python not mandatory | User prioritized best visuals/interaction over language | — Pending |
| Code-per-concept modules with shared API | User wants a stable architecture with concepts added constantly | — Pending |
| v1 = 4 HS concepts (Trig, Functions, Limits, Derivatives) | Proves the modular design across several concepts | — Pending |
| Multilingual from start | Retrofitting i18n is expensive | — Pending |
| TypeScript + SvelteKit (static), own SVG primitives, KaTeX | Research: only JS/TS gives live 60fps drag on a static site; runes suit per-frame updates | — Pending |
| Languages: English + German (German: sin/cos/tan, decimal comma) | User choice | — Pending |
| Visual polish is a priority ("make it pretty") | User will test hands-on and report problems iteratively | — Pending |
| Limits v1 includes infinite limits & limits at infinity, no ε-δ | User: no proofs/uni rigor yet | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-24 after initialization*
