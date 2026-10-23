# Requirements: Duck Math

**Defined:** 2026-10-24
**Core Value:** A student opens a concept and, through guided animated steps they can also grab and manipulate, *sees* why the math works — with only as much text as needed.

## v1 Requirements

### Shell & Navigation

- [ ] **SHELL-01**: Visitor can browse a catalog of concepts grouped by category (High School; University shown as reserved/coming later)
- [ ] **SHELL-02**: Visitor can open a concept from the catalog and return to the catalog
- [ ] **SHELL-03**: Visitor can share/open a link that lands on a specific step of a concept (stable step IDs)
- [ ] **SHELL-04**: Site is publicly reachable at a URL with no account or login
- [ ] **SHELL-05**: Site uses a 3Blue1Brown-inspired dark theme with a consistent semantic color palette (same color = same meaning across concepts)

### Guided Player

- [ ] **PLAY-01**: Student can play, pause, step forward/back, and reset a concept's guided explanation
- [ ] **PLAY-02**: Student can scrub the timeline forward and backward and the visual is always correct for that position
- [ ] **PLAY-03**: Each step shows a short caption (minimal text, within a word budget) next to the visual
- [ ] **PLAY-04**: At every step, the student can drag the step's interactive elements and the visual responds instantly
- [ ] **PLAY-05**: Dragging during playback pauses the animation and gives control to the student without jumps or glitches
- [ ] **PLAY-06**: Moving to another step re-stages the scene predictably (dragged values reset unless the step keeps them)
- [ ] **PLAY-07**: Some steps pause with an ungraded "predict, then reveal" prompt before the animation shows the answer

### Math Display

- [ ] **MATH-01**: Formulas are typeset properly (KaTeX) with terms colored to match their geometric counterparts
- [ ] **MATH-02**: Live numeric readouts update as the student drags (locale-aware number formatting)
- [ ] **MATH-03**: Hovering/focusing a formula term highlights the matching visual element, and vice versa
- [ ] **MATH-04**: Moving points can leave a fading trace trail (e.g. tracing a wave or derivative graph)
- [ ] **MATH-05**: Concepts can show two synced panels side by side (e.g. circle + graph, function + derivative)
- [ ] **MATH-06**: Undefined values (e.g. tan 90°) are shown as "undefined" rather than huge numbers or glitches; graphs break correctly at asymptotes and show holes as open dots

### Internationalization

- [ ] **I18N-01**: Visitor can switch between English and German; all UI and concept text changes language
- [ ] **I18N-02**: Each language has its own URL (e.g. /en/..., /de/...)
- [ ] **I18N-03**: Numbers use the locale's format (decimal comma in German); function names sin/cos/tan in both
- [ ] **I18N-04**: A check fails the build when a text key is missing in any language

### Accessibility & Devices

- [ ] **A11Y-01**: Concepts work with touch on phones/tablets (drag, player controls, layout fits small screens)
- [ ] **A11Y-02**: Draggable elements and player controls are keyboard-operable
- [ ] **A11Y-03**: Animations respect the reduced-motion preference
- [ ] **A11Y-04**: Color-coded meaning also has a non-color cue (labels/patterns) for color-blind students

### Module Framework

- [ ] **MOD-01**: Each concept is a self-contained code module (own folder: manifest, scene, steps, texts) following a shared contract
- [ ] **MOD-02**: Adding a new concept requires no changes to the shell (auto-discovered)
- [ ] **MOD-03**: Developer can scaffold a new concept from a template with authoring docs

### Concept: Trigonometry & the Unit Circle

- [ ] **TRIG-01**: Student can drag a point around the unit circle and see the angle in degrees and radians (with toggle)
- [ ] **TRIG-02**: Student sees what a radian is (radius laid along the arc)
- [ ] **TRIG-03**: Student sees cos and sin as the x and y projections of the point, with live values
- [ ] **TRIG-04**: Student sees tan as a segment on the tangent line (similar triangles), undefined at 90°/270°
- [ ] **TRIG-05**: Student sees sec, csc and cot as geometric segments (one at a time)
- [ ] **TRIG-06**: Student can watch/scrub the circle "unrolling" into the sine and cosine graphs, linked to the circle
- [ ] **TRIG-07**: Student sees sin² + cos² = 1 visually
- [ ] **TRIG-08**: Student sees symmetries (supplementary/negative/complementary angles) via reflected ghost points
- [ ] **TRIG-09**: Student sees special angles (30°/45°/60°) with snapping and exact values derived from the special triangles

### Concept: Functions & Transformations

- [ ] **FUNC-01**: Student sees vertical shift f(x)+a on an asymmetric base curve with landmark points
- [ ] **FUNC-02**: Student sees horizontal shift f(x+a) and why it moves "the opposite way"
- [ ] **FUNC-03**: Student sees vertical and horizontal stretches a·f(x), f(ax), including which points stay fixed
- [ ] **FUNC-04**: Student sees reflections by dragging a parameter continuously through 0 into negatives
- [ ] **FUNC-05**: Student can combine transformations, with each parameter color-linked to its term in the formula

### Concept: Limits

- [ ] **LIM-01**: Student sees x approach a value from left and right (two colors) and f(x) approach the limit
- [ ] **LIM-02**: Student sees that the limit can differ from the function value (hole vs filled point)
- [ ] **LIM-03**: Student sees a jump discontinuity where the limit does not exist
- [ ] **LIM-04**: Student sees infinite limits at vertical asymptotes (→ ±∞)
- [ ] **LIM-05**: Student sees limits at infinity and horizontal asymptotes
- [ ] **LIM-06**: Student can zoom in around the approach point

### Concept: Derivatives

- [ ] **DER-01**: Student sees local linearity — zooming in until the curve looks straight
- [ ] **DER-02**: Student sees a secant with a rise/run triangle and its slope
- [ ] **DER-03**: Student can shrink h → 0 and watch the secant become the tangent
- [ ] **DER-04**: Student drags a point along the curve and the derivative graph is traced live in a linked panel
- [ ] **DER-05**: Tangent color shows the sign of the slope (increasing/decreasing/flat)
- [ ] **DER-06**: Student can choose among a few example functions

## v2 Requirements

### Calculus (next milestone, one module each)

- **INT-01**: Integrals — area under a curve, Riemann sums
- **INT-02**: Fundamental theorem of calculus
- **CALC-XX**: Remaining school calculus topics (each its own module)

### Platform

- **PLAT-01**: Presenter/classroom mode
- **PLAT-02**: Inline scrubbable numbers in captions
- **PLAT-03**: Additional languages beyond EN/DE

### University category

- **UNI-XX**: University concepts (user has larger ideas planned)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Quizzes, exercises, scoring, gamification | Product is a visual explainer, not a drill app |
| User accounts, progress tracking | Public site, no login |
| ε-δ definition / proofs | Not touching proofs or university-level rigor yet |
| Long textbook prose, voiceover, video | Visual carries the explanation; text minimal |
| General graphing calculator / sandbox builder | Desmos/GeoGebra already do that; dilutes focus |
| Manim / Python runtime | Can't do live in-browser interaction; static hosting |
| Ads | Distracts from learning |
| 3D visuals | Not needed for v1 concepts |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 1 | Pending |
| SHELL-02 | Phase 1 | Pending |
| SHELL-03 | Phase 1 | Pending |
| SHELL-04 | Phase 1 | Pending |
| SHELL-05 | Phase 1 | Pending |
| PLAY-01 | Phase 1 | Pending |
| PLAY-02 | Phase 1 | Pending |
| PLAY-03 | Phase 1 | Pending |
| PLAY-04 | Phase 1 | Pending |
| PLAY-05 | Phase 1 | Pending |
| PLAY-06 | Phase 1 | Pending |
| MATH-01 | Phase 1 | Pending |
| MATH-02 | Phase 1 | Pending |
| I18N-01 | Phase 1 | Pending |
| I18N-02 | Phase 1 | Pending |
| I18N-03 | Phase 1 | Pending |
| I18N-04 | Phase 1 | Pending |
| TRIG-01 | Phase 1 | Pending |
| TRIG-02 | Phase 1 | Pending |
| TRIG-03 | Phase 1 | Pending |
| TRIG-04 | Phase 2 | Pending |
| TRIG-05 | Phase 2 | Pending |
| TRIG-06 | Phase 2 | Pending |
| TRIG-07 | Phase 2 | Pending |
| TRIG-08 | Phase 2 | Pending |
| TRIG-09 | Phase 2 | Pending |
| MATH-03 | Phase 2 | Pending |
| MATH-04 | Phase 2 | Pending |
| MATH-05 | Phase 2 | Pending |
| MATH-06 | Phase 2 | Pending |
| PLAY-07 | Phase 2 | Pending |
| FUNC-01 | Phase 3 | Pending |
| FUNC-02 | Phase 3 | Pending |
| FUNC-03 | Phase 3 | Pending |
| FUNC-04 | Phase 3 | Pending |
| FUNC-05 | Phase 3 | Pending |
| MOD-01 | Phase 3 | Pending |
| MOD-02 | Phase 3 | Pending |
| MOD-03 | Phase 3 | Pending |
| LIM-01 | Phase 4 | Pending |
| LIM-02 | Phase 4 | Pending |
| LIM-03 | Phase 4 | Pending |
| LIM-04 | Phase 4 | Pending |
| LIM-05 | Phase 4 | Pending |
| LIM-06 | Phase 4 | Pending |
| DER-01 | Phase 5 | Pending |
| DER-02 | Phase 5 | Pending |
| DER-03 | Phase 5 | Pending |
| DER-04 | Phase 5 | Pending |
| DER-05 | Phase 5 | Pending |
| DER-06 | Phase 5 | Pending |
| A11Y-01 | Phase 1 | Pending |
| A11Y-02 | Phase 6 | Pending |
| A11Y-03 | Phase 6 | Pending |
| A11Y-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0

---
*Requirements defined: 2026-10-24*
*Last updated: 2026-10-24 after initial definition*
