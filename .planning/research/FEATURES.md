# Feature Landscape

**Domain:** Interactive visual math explainers (high school: trig/unit circle, transformations, limits, derivatives)
**Researched:** 2026-10-24
**Confidence:** MEDIUM. Based on well-established knowledge of 3Blue1Brown/Manim, Desmos, GeoGebra, Brilliant, Explorable Explanations (Bret Victor, Nicky Case), Seeing Theory, Immersive Math, Math is Fun. No live web verification in this pass; product-feature claims about these tools are stable, long-lived facts, but per-product specifics should be spot-checked before being cited.

## What the reference products actually do (pattern summary)

| Product | Signature strengths | What to borrow | What to ignore |
|---------|---------------------|----------------|----------------|
| 3Blue1Brown | Color-consistent objects, one idea per scene, motion that *derives* the result (e.g. circle unrolling), formula terms colored to match geometry, pacing | Look, color-binding, "reveal then show why" choreography | Passive video, narration-dependent |
| Desmos (+ Activity Builder) | Instant response to drag, sliders on any parameter, smooth zero-latency plotting, clean defaults | Slider/drag latency standard, tidy graph styling | Open-ended calculator, teacher dashboards |
| GeoGebra | Dynamic geometry, dependent objects update as you drag, trace/locus | Geometric construction feel (segments for tan/sec) | UI density, toolbars |
| Brilliant | Short steps, one interaction per step, immediate feedback, polish | Step granularity, "predict then reveal" feel | Quizzes, streaks, accounts, paywall |
| Explorable Explanations / Nicky Case | Reactive text (draggable numbers in prose), "play with it" invitations | Inline scrubbable values | Long essays |
| Seeing Theory | Chapter-scrolling, one chart per idea, hover-and-play | Clean single-widget focus | Scroll-only, limited per-step control |
| Immersive Math | Dense interactive textbook | Rigor of content | Textbook length, heavy text |
| Math is Fun | Accessible plain language, many small interactive widgets | Approachable tone | Dated visuals, text-heavy, ad pages |

The gap Duck Math targets: Desmos/GeoGebra are open sandboxes (no narrative); 3B1B is narrative with no interaction; Brilliant has narrative+interaction but is exercise-driven and gated. The "blended" guided-yet-live model is the differentiator, and it is the most technically demanding thing to get right.

## Table Stakes

Missing any of these makes the product feel broken or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Draggable primary object (point on circle, slider handle, point on curve) with instant response (<16 ms frame) | Desmos set the bar; laggy drag = unusable | Med | Core interaction primitive; build once in shell, reuse everywhere |
| Step-by-step guided flow: next/prev, play/pause, scrub bar, step indicator | Core value proposition | Med-High | Steps must be a declarative list per concept (shell-driven) |
| Visual stays live at every step (user can grab things mid-step) | Stated core value | High | Needs state model where step = target state + enabled interactions, not a baked animation |
| Smooth animated transitions between steps (tweening, not jump cuts) | 3B1B-style expectation | Med | Interrupt-safe: if user drags during a transition, hand control cleanly |
| Reset / replay a step or whole concept | Users get lost after dragging | Low | |
| Proper math typesetting with colors matching the visual | Mismatched color = lost explanatory power | Med | KaTeX/MathJax-class rendering; color tokens shared between canvas and formula |
| Live numeric readouts (angle, sin, cos, slope, f(x)) that update while dragging | Makes the relation concrete | Low | |
| Axes, grid, labeled ticks with good defaults and auto-scaling | Basic graph legibility | Med | |
| Dark, high-contrast, 3B1B-like theme with consistent color semantics | Project requirement, brand | Low-Med | Define a palette where e.g. sin=one color, cos=another, everywhere |
| Responsive layout incl. touch drag on phones/tablets | Students are on phones; touch drag must not scroll the page | Med | Pointer events, `touch-action` handling; large hit targets |
| Minimal text per step (1-2 short sentences) | Project constraint | Low | Enforce via authoring limits/lint, not goodwill |
| Concept index / category navigation (High School; University reserved) | Need to find things | Low | |
| Shareable deep links (URL per concept, ideally per step) | Teachers share links; public site with no accounts | Low-Med | Step-in-URL is cheap and highly valued |
| Language switcher + all strings externalized (EN + DE) | Project requirement | Med | Includes math-label text, aria text, step text; number formatting (decimal comma in German) |
| Fast load, works offline-ish/static hosting, no login | Public, no accounts | Low-Med | Avoid heavy bundles per concept; lazy-load modules |
| Keyboard operability and aria labels for controls | Baseline accessibility | Med | Full a11y of a canvas visual is hard; do controls + text alternatives at minimum |
| Angle units toggle (deg/rad) for trig | Explicit requirement | Low | Persist choice across the concept |

## Differentiators

Where Duck Math can beat Desmos/GeoGebra (no narrative) and Brilliant/3B1B (no free exploration).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Blended mode: guided narrative where every step is a live sandbox | The core product; nothing mainstream does this free | High | The shell's central design problem; decide state/step model early |
| Color-binding between formula terms and geometry (hover term highlights segment and vice versa) | 3B1B's best trick, made interactive | Med | Shared color tokens plus highlight events |
| "Predict, then reveal" nudges without grading (e.g. "where will the point be when angle = 90 deg?" then drag) | Active learning without being a quiz | Med | Must not become exercises; no scoring, no stored answers |
| Ghost/trace trails and persistent markers (previous position, locus, secant history) | Makes change visible (secant to tangent, unrolling trace) | Med | |
| Choreographed "derivation moments" (circle unrolling, secant collapsing to tangent) driven by a scrubbable parameter | Scrub-able animation = understanding via control | Med-High | Animation = function of a single t, so it can be scrubbed backwards |
| Linked multi-view panels (unit circle <-> sine graph <-> readouts moving in sync) | The essence of trig understanding | Med | One state, several renderers |
| Authoring API for fast new concept modules (declarative steps, typed controls, i18n keys) | Long-term velocity priority | High | Not user-facing but the key differentiator for the project's growth |
| Inline scrubbable numbers in step text (Nicky Case style) | Text becomes a control | Med | Keep optional; good for transformations (a, h, k) |
| Translation-aware layout (text expands in German without breaking visuals) | Quality multilingual | Low-Med | |
| Per-step "try this" micro-prompts that move the visual to an interesting state | Guides exploration | Low | Cheap and high value |
| Reduced-motion mode and pause-on-drag behavior | Polish, accessibility | Low | |
| Presenter/classroom-friendly mode (large type, hide chrome) | Teachers will project it | Low-Med | Defer unless cheap |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Quizzes, exercises, scoring, streaks, hints | Explicitly out of scope; turns product into a drill app | "Predict then reveal" with no grading; "try this" prompts |
| Accounts, login, progress tracking, analytics dashboards | Out of scope; privacy and complexity | Optional localStorage for language/deg-rad only |
| Long explanatory text / textbook prose | Violates minimal-text constraint | One idea per step; visual carries the meaning |
| Pre-rendered video as primary medium (Manim output) | Cannot be dragged/scrubbed live | Live rendering driven by parameters |
| General-purpose graphing calculator / equation input box | Competes with Desmos poorly; dilutes focus | Link to Desmos/GeoGebra for free exploration if needed |
| Free-form sandbox builder for users | Scope explosion | Fixed, curated draggable parameters per concept |
| Voiceover narration | Hard to translate and maintain across languages | Short on-screen text |
| Gamification, badges, leaderboards | Off-brand | None |
| Ads, popups, cookie-banner-heavy tracking | Hurts the feel (Math is Fun lesson) | Static, clean site |
| Over-wide step counts (30+ steps per concept) | Fatigue | Aim 6-12 steps per concept; split into modules |
| Hardcoded strings or text baked into canvas images | Breaks multilingual | Render text from i18n keys, including canvas labels |
| Exposing every parameter at once | Cognitive overload | Reveal controls progressively per step |

## Feature Dependencies

```
Shared state model (parameters + step definitions)
  -> Step player (next/prev/play/scrub/deep link)
  -> Draggable controls bound to state (live at every step)
  -> Animated tweening between step targets (interrupt-safe)
Color token palette -> Math typesetting with color binding -> Formula<->geometry highlight
i18n infrastructure (keys, locale-aware numbers) -> every step text, canvas label, aria label
Linked multi-view rendering -> Circle unrolling, secant->tangent derivative graph
Concept module API -> Category index -> Lazy loading -> Adding concepts without touching shell
Responsive/touch pointer handling -> every draggable
Deep links -> step-in-URL (needs stable step IDs, not indices)

Cross-concept: Functions/transformations graph primitives -> reused by Limits and Derivatives
(plotting, axes, draggable point on curve). Derivatives -> reuses limits' "approach" visual (h -> 0).
Trig graph primitives (sine curve) -> reused by Derivatives example (d/dx sin x = cos x), optional.
```

## Per-concept: visual "moments" that make the best explanations

Principle: each concept is a sequence of "aha" moments; each has one draggable, one thing that changes color/shape, and at most 1-2 sentences.

### 1. Trig and the Unit Circle (largest module; consider splitting into 2-3 sub-lessons within the module)

1. **Point on circle**: drag the point; show the angle arc, with deg/rad toggle. Radian moment: lay the radius along the arc ("one radian = arc same length as radius") with a visible wrapping of radius-lengths. HIGH value, commonly misunderstood.
2. **cos and sin as coordinates**: drop perpendiculars to the axes; project the point onto x (cos, one color) and y (sin, another color); live readouts. Right triangle with hypotenuse 1 emphasizes why they are ratios on a unit hypotenuse.
3. **Sign and quadrant**: color shift of the projection segments as they cross zero; quadrant sign shading (light touch, not a table).
4. **tan as a segment**: tangent line at (1,0); extend the radius ray until it hits it; the intercept length is tan. Show it blowing up at 90 deg. Similar triangles are the "why" moment.
5. **sec, csc, cot**: same style, appear one by one as distinct colored segments; sec = ray hits the tangent line, length from origin; cot/csc from the top tangent line. Offer fade-in per function to avoid clutter.
6. **Unrolling to graph**: a second panel draws the sine curve with the height of the point; angle on the horizontal axis as arc length; an animated "unroll" where the circle rolls/unwraps into the x-axis, with a connecting horizontal line from the point to the curve. Scrubbable by angle. Then switch to cosine (rotate the view 90 deg, or project onto x) and show cosine as shifted sine.
7. **Pythagorean identity**: the triangle legs sin, cos with squares on them whose areas sum to a constant 1 as you drag (squares' areas shown). Strong visual proof.
8. **Symmetries**: reflect the point across axes/origin with ghost points; show sin(-x), cos(pi - x), etc. as coordinate swaps/negations. Prefer ghost-point reflections over formula lists.
9. **Special angles**: snap-to points at 30/45/60 with the classic triangles (45-45-90 and 30-60-90) appearing, exact values emerging from the geometry (e.g. a half equilateral triangle gives sin 30 = 1/2). Snap on drag, with deg/rad both displayed.
10. Optional: period/amplitude hint by continuing the curve past 360 deg.

Pitfalls: clutter from six functions at once; sec/csc/cot sign and geometry confusion; keeping the graph x-axis in radians vs degrees consistent.

### 2. Function transformations

1. **Base function with a draggable point** and its image: pick one anchor curve (parabola or a function with an asymmetric shape, e.g. a "flag" or a curve with a labelled landmark points) so left/right and up/down errors are visible. Asymmetric shape is the key tip; a plain parabola hides horizontal-direction errors.
2. **Vertical shift f(x)+k**: slider, curve moves; trace a few landmark points moving in parallel.
3. **Horizontal shift f(x+h)**: the notorious counterintuitive "minus moves right". Moment: show a target y-value and the x where the new curve reaches it, i.e. "the input has to be earlier/later to get the same output" as a dragged horizontal arrow from old landmark to new. HIGH value because it is the standard misconception.
4. **Vertical stretch a·f(x)**: each landmark's height multiplies; vertical arrows scaled; points on x-axis stay fixed (invariant points highlight).
5. **Horizontal scale f(bx)**: landmarks' x-distance divides by b; invariant points on the y-axis.
6. **Reflections**: a = -1 and b = -1 as the continuation of the same sliders through zero (continuity of slider through 0 and into negatives shows the flip through collapse).
7. **Combining**: a·f(b(x-h))+k with all four sliders and order of operations; landmark points follow step-by-step (stretch, then shift) with a sequence view.
8. Color-bind each parameter to its term in the formula and its effect on the graph.

Pitfalls: only symmetric base functions; showing the formula but not which landmark went where; too many sliders at once.

### 3. Limits

1. **Approach**: a point on the curve moving toward x = a from the left and right, with x and f(x) readouts, and a "zoom" via a number line of the output values converging; draggable x with the output marker on the y-axis. Both sides visible simultaneously (two colors: left, right).
2. **Limit is not the value**: removable hole where f(a) is undefined or different (open circle vs filled); draggable point can approach but cannot occupy.
3. **One-sided limits and jump**: left and right colors disagree; "limit does not exist" shown as two different targets.
4. **Infinite and oscillating (1/x, sin(1/x))**: outputs run off; zoom into sin(1/x) shows endless oscillation. Optional, adds depth.
5. **The epsilon-delta "window" as a visual** (draggable band): a horizontal band of output tolerance and the input window needed. Powerful but potentially beyond HS; mark as optional/stretch, framed as "zoom until the curve fits in the box" without formal notation.
6. **Limits at infinity** (horizontal asymptote): drag x toward large values with the view zooming out. Optional.
7. **Continuity** as "no lift of the pen": connect to the above.

Pitfalls: confusing "gets close" with "reaches"; need a zoom/scale control that remains smooth; avoid numeric tables of values (use a moving readout).

### 4. Derivatives

1. **Slope intuition**: a draggable point on a curve with a tangent line, and the slope readout. Start with a line (constant slope), then a curve (varying slope) via "zoom in until the curve looks straight" (local linearity moment; very strong, 3B1B style).
2. **Secant line**: two points, x and x+h, with rise/run triangle (dy over dx) drawn and colored; slope = dy/dx live.
3. **Secant to tangent**: slider/animation h -> 0, secant pivots into the tangent; show the slope readout converging (links to the Limits module).
4. **Derivative graph built live**: second panel plots the slope at the dragged x as a point, leaving a trace so the derivative curve is drawn as you drag; the sign of the slope aligned with up/down parts of the original; zeros of f' at the peaks and valleys (vertical dotted line linking panels).
5. **Meaning**: positive slope (increasing), zero (flat), negative (decreasing) with color changes of the tangent (e.g. green/gray/red).
6. **Simple functions' derivatives**: x^2 giving 2x etc. as a pattern the trace reveals; shown as a prompt to guess before the trace completes (predict-reveal, ungraded). Do not teach differentiation rules as a table (that is exercise-land).
7. Optional: velocity-position analogy (a car moving), where the derivative is speed.

Pitfalls: h can't be exactly 0 (clamp, show "h -> 0" gracefully with a numerical guard for division); tangent drawing at cusps/vertical tangents; keep the function selector small (3-4 functions).

## Cross-cutting shell feature scope (what to build in v1)

| Feature | Phase suggestion | Complexity |
|---------|------------------|-----------|
| Module API + step player + state + tween | Foundation | High |
| Color tokens + math rendering + i18n | Foundation | Med |
| Draggable primitives (point-on-curve, point-on-circle, slider, angle handle) | Foundation | Med |
| Plot/axes primitives | Foundation | Med |
| Deep links with step IDs | Foundation | Low |
| Trig module | Concept 1 (tests multi-view, linked panels) | High |
| Transformations module | Concept 2 (reuses plot primitives) | Med |
| Limits module | Concept 3 | Med |
| Derivatives module | Concept 4 (builds on limits and linked panels) | Med-High |

## MVP Recommendation

Prioritize:
1. Shell: state-driven step player where every step is live and draggable (the core value); tween, scrub, reset.
2. Color-bound math rendering, dark theme, touch-friendly drag, i18n EN+DE.
3. Transformations module first (simplest, exercises the whole shell) or trig first if wanting to prove the hardest case early; recommended order for the roadmap: Transformations (proves the shell cheaply) -> Trig (stress test linked views) -> Limits -> Derivatives.

Defer:
- Epsilon-delta window, limits at infinity, velocity analogy: stretch goals inside modules.
- Presenter mode, inline scrubbable text: nice-to-have after the first module ships.
- Any form of persistence beyond language/unit preference.

## Sources

- Domain knowledge of 3Blue1Brown videos/Manim, Desmos, GeoGebra, Brilliant, Nicky Case / Bret Victor explorable explanations, Seeing Theory, Immersive Math, Math is Fun (MEDIUM confidence; not re-verified online in this pass).
- /home/duck_ruler28/Documents/opt/Duck_Math/.planning/PROJECT.md (project constraints).
- Pedagogy points (horizontal-shift misconception, asymmetric base functions, local linearity zoom, similar-triangle derivation of tan/sec) reflect widely shared math education practice (MEDIUM).
