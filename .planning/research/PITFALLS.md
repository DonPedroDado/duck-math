# Pitfalls Research

**Domain:** Interactive animated math-visualization web app (modular concept explainers, 3B1B-style, blended guided + draggable)
**Researched:** 2026-10-24
**Confidence:** MEDIUM. Based on established domain knowledge (Desmos/GeoGebra/Explorable Explanations/Bret Victor/Nicky Case-style practice, KaTeX/MathJax behavior, WCAG 2.x, Pointer Events, IEEE-754 behavior). No live doc verification was done in this pass. Library-specific claims (KaTeX/MathJax/D3/JSXGraph/Mafs/i18n libs) should be confirmed against current docs during the phase that picks the stack. Items marked (verify) are most in need of that.

---

## Critical Pitfalls

### Pitfall 1: Two writers to one state (scripted animation vs. user dragging)

**What goes wrong:**
A guided step animates angle θ from 0 to π/3 while the student grabs the point. Both write to θ: the point jitters, snaps back, or the timeline continues after release and yanks the point away. Or the user drags during a step, the step "completes," and the visual jumps to the scripted end state. Pressing "next" then produces a state that depends on what the user did.

**Why it happens:**
Animation is implemented as imperative tweens (setInterval/GSAP/CSS transitions) that mutate the same variables as drag handlers. There is no notion of who owns a value at a given moment.

**How to avoid:**
- Model the concept as a pure function: `render(params, view)`. Parameters (θ, a, h...) are the single source of truth in one store.
- The timeline does not mutate the scene; it produces target parameter values `params = timeline(t)`.
- Define an explicit control-mode state machine per parameter: `scripted -> user-held -> free`. On pointerdown: cancel/pause the tween on that param (the user wins instantly). On release: do NOT resume the tween silently; either stay free and show a "resume" affordance, or ease back to the step's canonical state only when the user triggers next/prev/replay.
- Each step declares its end-state (`stepTarget`) as plain data so "next" and "jump to step N" are deterministic regardless of what the user did earlier.
- Declare per step which params are draggable and which are locked (e.g., locked while an explanatory tween plays).

**Warning signs:**
Point flickers on drag during playback; "next" lands in different states depending on history; bug reports containing "if you drag and then press play..."; tweens implemented with direct DOM mutation; more than one place that assigns the angle.

**Phase to address:**
Framework/core-engine phase (before the first concept is finished). Prove it on the unit circle with a drag-during-playback test.

---

### Pitfall 2: Timeline that cannot scrub backward (non-reversible, history-dependent state)

**What goes wrong:**
Playing forward works; scrubbing backward or jumping to step 5 shows a wrong scene: leftover trails, elements never removed, derived values stale. Scrubbing triggers side effects (sound, text swaps, "appear" animations) repeatedly. State accumulates (e.g., a tracing sine curve array appended each frame) so scrub-back leaves a corrupted trace.

**Why it happens:**
Timelines are written as event sequences ("at t=2 add the tangent line") rather than as pure functions of time/step. Accumulating state (trails, histories) is stored incrementally.

**How to avoid:**
- Make the scene a pure function of `(stepIndex, localProgress, userParams)`. Derive traces by recomputation (the sine curve is `sin` sampled on `[0, θ]`, not an array you push to).
- Per-element visibility/opacity is computed from time ranges, not toggled by events.
- Test: random-seek property test; for 100 random (step, progress) pairs, render must equal rendering reached by playing there, and equal rendering reached by scrubbing backward to there (snapshot compare).
- Keep side effects (text swap, focus, announcements) in step-change handlers keyed on discrete step index, not per frame.

**Warning signs:**
Any `push`/mutation of arrays during animation; bugs that only reproduce after "play, then back"; step N visuals depend on step N-1 having run; refresh-on-step is the only way to get a clean state.

**Phase to address:**
Framework/core-engine phase (same as Pitfall 1). Encode the seek-equivalence test in CI.

---

### Pitfall 3: Over-engineering the module framework before any concept exists

**What goes wrong:**
Weeks spent on a plugin registry, schema DSL, lifecycle hooks, dependency injection, a custom scene graph, and a "universal step API." The first real concept (unit circle) then needs things the abstraction did not anticipate, forcing rewrites; or concept authors fight the framework more than they author math.

**Why it happens:**
The project's stated priority ("ease of authoring a new concept," "shell never changes") invites designing for N concepts with N=0 data points.

**How to avoid:**
- Build concept #1 (unit circle) as a concrete, slightly hardcoded page with the shell. Only after concept #2 (functions/transformations) is in progress, extract the shared API from what two concepts actually duplicated ("rule of three" bias: extract at 2, finalize at 3-4).
- Keep the module contract tiny: `{ id, category, steps[], Scene(params) , i18nNamespace }`. Anything beyond this must be justified by a real second use.
- Concept discovery by file convention (glob a folder) rather than a registry system.
- Time-box framework work; the roadmap should deliver a playable concept in the first phase that produces user-visible output.

**Warning signs:**
Framework lines of code exceed concept lines; no on-screen concept after the first phase; abstractions with a single implementer; docs for the framework before any concept ships.

**Phase to address:**
Roadmap structure: Phase 1 = shell + unit circle vertical slice; extraction/hardening of the module API after concept #2, before concept #3.

---

### Pitfall 4: Mathematical edge cases rendered naively (tan asymptotes, domain, limits, derivatives)

**What goes wrong:**
- `tan` plotted by sampling and connecting points draws vertical lines across asymptotes; the tangent segment on the unit circle is of enormous length (or Infinity/NaN) near 90 deg, blowing out the viewport or producing NaN SVG attributes (element silently disappears).
- sec/csc/cot similarly blow up; cot at 0, csc at 0.
- Floating point: `cos(π/2)` = 6.1e-17, not 0, so "is this 90 degrees?" checks fail and labels show `0.000` vs `-0.000`; `sin²+cos²` displays `1.0000000000000002`.
- Radians/degrees mixed internally: some code paths take degrees, others radians; label says "60 deg" while the math used 60 rad.
- Limits at discontinuities: evaluating `f(a)` at a removable hole gives NaN (0/0) and the "approach" animation shows nothing or crashes; jump discontinuity needs distinct left/right values; an open/closed circle at the hole is forgotten; evaluating exactly at `a` is silently skipped or erroneously done.
- Derivative: using a numerical difference with tiny h (1e-10) gives catastrophic cancellation noise; the secant->tangent animation with h->0 jumps to garbage or divides by zero (0/0 at h=0). Also drawing a secant line with Δx=0 gives infinite slope.
- Graph transformations f(ax) with a=0 degenerate; a negative reflection of a domain-restricted function.
- Angle wraparound: dragging past 360 deg / 2π; labels showing 725 deg, or angle jumping from 359 to 0 and the swept-arc and the sine-graph x-coordinate discontinuously snapping.

**Why it happens:**
Math libraries return IEEE results without domain semantics; developers plot "what the function returns" instead of modelling continuity, domain and units.

**How to avoid:**
- One canonical internal unit: radians, as a number. Degrees exist only at input/display boundary through a single `Angle` helper. Never store degrees in scene state.
- A shared plotting utility that samples adaptively and breaks the path at discontinuities (detect large jumps / sign flips of tan / non-finite values, start a new subpath). Clip to the viewport; clamp geometry magnitude (tan segment drawn with an arrow off-screen and a label "undefined" at exactly 90 deg).
- Snap-to-special-angle with an epsilon (e.g., 1e-9) and a tolerance-based "isMultipleOf(π/2)" for labels; use exact tables for special angles (30/45/60) and display exact values (√3/2) rather than formatting floats. Format numbers with fixed precision and normalize `-0`.
- Treat undefined as a first-class UI state ("undefined"), not an error.
- Limits: model each limit scenario as data `{f, a, leftLimit, rightLimit, valueAtA | undefined}` with declared analytic values; never derive the limit by evaluating at `a`. Draw holes explicitly (open circle). Approach animation uses x = a ± δ where δ shrinks but is floored at a visible minimum (e.g., 1e-3 relative to view) and the display reads from analytic limit when δ is below float safety.
- Derivatives: use analytic derivatives for the demo functions (or symmetric difference `(f(x+h)-f(x-h))/2h` with h ~ 1e-5 relative, double precision (verify)). For secant->tangent, h approaches but never equals zero; at h tiny, switch to the analytic tangent. Show h values the student sees, not the machine's.
- Normalize angle for display (mod 2π) but keep an unwrapped value for continuity where the graph needs it; decide explicitly per concept.
- Unit-test the math layer independently of rendering (table of known values, asymptote cases, wraparound).

**Warning signs:**
`NaN` in console or SVG attributes; flickering lines at 90 deg/270 deg; "0.9999999999" in labels; `-0` printed; vertical connector lines on tan graph; a limit demo that shows a number at a hole; tests only on happy-path values.

**Phase to address:**
Math-core utilities in Phase 1 (angle type, formatting, discontinuity-aware sampler); per-concept verification in the Trig, Limits, Derivatives phases. Limits and Derivatives phases need a dedicated edge-case checklist.

---

### Pitfall 5: Text creep (explainer becomes a textbook)

**What goes wrong:**
Each step gets a paragraph; definitions, "remember that..." and caveats accumulate; the student reads rather than manipulates. Translation cost grows linearly with text. The visual stops carrying the explanation, violating the Core Value.

**Why it happens:**
Authors (and their reviewers) fear ambiguity and add text to compensate for visuals that do not self-explain. Text is the cheapest fix.

**How to avoid:**
- Hard budget in the module schema/lint: e.g., max ~15-25 words per step caption, max ~8 steps per concept (tunable). Fail the build/lint when exceeded.
- Rule: if a step needs more text, the visual or the interaction needs improving. Prefer labels on the diagram, color links and a single prompt ("Drag the point") over prose.
- Review checklist per step: "What does the student do/see? Can we delete a sentence?"
- Put optional depth behind an explicit "More" affordance only if needed; default off.

**Warning signs:**
Captions wrapping to 4+ lines; text panel taller than the viewport on mobile; steps that exist only to show text; translation files growing faster than scene code.

**Phase to address:**
Framework phase (add the lint/budget) and enforced in every concept phase; check at each concept's review.

---

### Pitfall 6: i18n retrofitted late; text baked into canvas/SVG/images/animation timing

**What goes wrong:**
Labels such as "sin θ", "undefined", "Drag me", angle names drawn directly in canvas or SVG strings in code; German text is ~15-30% longer and overflows; sentence concatenation (`"Angle is " + x`) breaks word order in other languages; decimal separators (`0.5` vs `0,5`), degree formatting and plural forms are hardcoded; LaTeX contains words (`\text{...}`) in English; RTL ignored (probably acceptable to defer, but layout should not forbid it). Animations are timed to the English reading speed.

**Why it happens:**
"Math is language-neutral" thinking: formulas look universal so strings are inlined. Canvas text is hard to translate and lay out.

**How to avoid:**
- All user-visible strings via keys from day one, including aria-labels, button titles, tooltip text, document title, and in-diagram labels. ICU message format (or an equivalent) for placeholders/plurals; never concatenate fragments.
- Number formatting through `Intl.NumberFormat` with the locale (German: decimal comma). Function names stay sin/cos/tan in both English and German. German strings run ~30% longer — layouts must survive it.
- Prefer HTML/SVG text overlays over canvas text so layout, fonts and screen readers work; if canvas is used, route labels through a localized text layer.
- Do not put words in LaTeX strings; keep `\text{}` out or wrap by key.
- Provide a pseudo-localization mode (long strings with accents, e.g., +40% length) in dev, and require layout to survive it.
- Locale files per concept namespace, lazily loaded; CI check for missing keys between en and de.
- Don't tie step durations to caption length; keep captions user-paced (no auto-advance on timers).

**Warning signs:**
String literals in scene code; `${}` concatenation of phrases; missing-key fallbacks appearing in the UI; labels clipped in German; a "translations later" ticket.

**Phase to address:**
Phase 1 (shell + i18n scaffolding + lint); verified with German at every concept phase.

---

### Pitfall 7: Mobile/touch and small screens treated as an afterthought

**What goes wrong:**
- Touch dragging scrolls the page (or the page scroll hijacks the drag) because `touch-action` is not set; pull-to-refresh triggers while dragging down.
- Hit targets of 8px points; the finger covers the thing being dragged; hover-only affordances (tooltips, cursor changes) don't exist on touch.
- Mouse events used instead of Pointer Events: multi-touch, pen and mouse behave inconsistently; no `setPointerCapture`, so drags drop when the pointer leaves the element.
- Layout designed for 16:9 landscape: visual and caption fight for space on a 360px-wide phone; the formula overflows; tiny labels.
- Viewport/dpr: blurry canvas on high-dpr phones (no devicePixelRatio scaling) or huge canvases wasting memory; orientation change not handled; iOS Safari 100vh bugs.
- Scrubber is too small to grab; page scroll vs. horizontal scrubbing conflict.

**Why it happens:**
Developed on a desktop with a mouse; the 3B1B aesthetic is landscape video.

**How to avoid:**
- Pointer Events + `setPointerCapture` for all drag; `touch-action: none` on the interactive visual only (leave the rest scrollable) and provide a way to scroll past the visual (don't make it fill the entire viewport with no gutter).
- Minimum hit target ~44px (invisible larger hit area around a smaller visible handle); offset readouts above the finger; avoid hover-only information.
- Design mobile-portrait layout first: visual on top (square-ish, via ResizeObserver, responsive viewBox), caption + controls below; formula can wrap/scroll horizontally. Font sizes in the scene scale with the container, with a floor.
- Scene must render from the container size, not window size; handle resize and orientation.
- Test on real devices (an iPhone Safari and an Android Chrome) at every concept, not only devtools emulation.

**Warning signs:**
Page scrolls while dragging on phone; users need two attempts to grab a point; dragging ends when leaving the handle; blurry text on retina; horizontal scrollbars at 360px.

**Phase to address:**
Phase 1 (interaction primitives, layout shell on mobile); recheck in each concept phase with a device checklist.

---

### Pitfall 8: Performance: wrong render tech and per-frame waste (60fps)

**What goes wrong:**
- Large SVG with thousands of nodes (dense sample points, many tick marks, a path recomputed with 10k points) re-rendered on every pointermove through a framework's virtual DOM -> jank on mid phones.
- Conversely, Canvas chosen for everything: loses crisp scaling, text/aria, easy styling, DOM hit-testing; hit testing and a11y built by hand.
- React state updates on every pointermove cause full-tree re-renders; layout thrash from reading `getBBox`/`getBoundingClientRect` each frame.
- Multiple `requestAnimationFrame` loops per concept; animation continues while the tab is hidden or the component is offscreen; leaks on navigation between concepts (listeners, rAF, resize observers not cleaned up).
- KaTeX re-rendered every frame because a number in the formula changes.
- No performance budget, so regressions are noticed late.

**Why it happens:**
Choosing SVG vs Canvas by taste and not by object count; naive reactive binding of high-frequency input.

**How to avoid:**
- Rule of thumb: SVG (or SVG-like declarative layer) for ordinary scenes with up to a few hundred elements (crisp, accessible, styleable); Canvas (or WebGL) only for dense/many-element parts (large point clouds, many secants, heatmaps). A hybrid is fine: Canvas for the graph curve, SVG/HTML overlay for handles and labels. Decide per scene with a measured budget (verify on a mid-range Android).
- One shared rAF loop owned by the shell; scenes subscribe; pause when hidden/offscreen (IntersectionObserver, `visibilitychange`); dirty-flag rendering (render only when params/time changed).
- Update only attributes of existing nodes at high frequency (imperative updates in the render function, or fine-grained reactivity such as signals) rather than re-rendering the framework tree per move.
- Curve sampling count tied to pixel width (about 1 sample per 1-2 px), cached per function and view; recompute only on view/param change.
- Throttle numeric readouts (display text updated at ~10-20 Hz) and avoid re-typesetting LaTeX per frame (see Pitfall 9).
- Add a dev FPS/frame-time overlay and a documented budget (e.g., < 8 ms scripting per frame on target mid device). Cleanup contract in the module API: `mount()` returns `dispose()`; test by mounting/unmounting repeatedly and checking listener counts.

**Warning signs:**
Frame time > 16 ms in the profiler during drag; DOM node counts in thousands; fans spinning on laptop idle; memory growth when switching concepts; battery complaints.

**Phase to address:**
Phase 1 (rendering approach decision with a spike + budget); re-measure on the heaviest scene (trig-to-graph unroll, derivative secant sweep).

---

### Pitfall 9: LaTeX rendering cost and colored-term linking that doesn't stay linked

**What goes wrong:**
- Using MathJax (heavier, async, flashes/reflows) for live-updating formulas, or re-typesetting on every frame; initial load of fonts and renderer is hundreds of KB and delays first paint (verify sizes).
- Colored terms in the formula are manually matched to scene colors by hex copy/paste; changing a palette breaks the linkage; colors drift between formula, graph and caption.
- Color-linking mechanism is brittle: regex on rendered HTML, or `\color{#abc}` strings built by hand with escaping bugs; KaTeX's `\htmlClass`/`\htmlStyle` need `trust` enabled (security implication if users/translators control strings) (verify).
- Highlighting a term on hover/step requires re-rendering the whole formula; layout shift as numbers change width (`0.5` -> `-0.866`).
- Font/FOUC: formula appears in a fallback font then jumps; text baseline mismatch with surrounding captions.
- Formulas inside SVG (foreignObject) or canvas are hard; the screen-reader representation is missing.

**Why it happens:**
Math rendering is treated as a one-off string, not a first-class linked-data object of the scene.

**How to avoid:**
- Prefer KaTeX (synchronous, fast, small) for rendering; render once per (formula template, step) and update only the dynamic numeric parts via separate DOM spans (e.g., template with named slots, or `\htmlId`/`\class` with `trust` restricted to a function that only allows known commands) (verify the current KaTeX options).
- Define a semantic color palette (tokens such as `--c-sin`, `--c-cos`, `--c-tan`) in one place used by CSS, scenes, and LaTeX through class names (`\htmlClass{term-sin}{\sin\theta}` styled via CSS variables) -- never hardcode hex in three places.
- Pre-render (build-time) static formulas where possible; ship KaTeX CSS/fonts self-hosted with `font-display` tuned; fixed-width/`tabular` approach or reserve width for dynamic numbers to avoid layout shift.
- Formula "slots" are driven from the same params store as the scene, throttled.
- Provide accessible output (KaTeX MathML is included by default (verify); keep it, and add aria-labels for dynamic readouts).
- Keep LaTeX strings in data files with the structure, and have translators avoid altering them (see Pitfall 6).

**Warning signs:**
Hex codes duplicated across files; formulas flash on each step change; layout jumps while dragging; `trust: true` globally; long scripting time attributed to katex.render in the profile.

**Phase to address:**
Phase 1 (formula component + color-token system); reused and verified in Trig phase (the heaviest color-linking use).

---

### Pitfall 10: Accessibility reduced to a checkbox (keyboard, reduced motion, screen readers, color-blindness)

**What goes wrong:**
- Drag-only interaction: the student using keyboard/switch devices cannot operate the visual. Handles are not focusable; no arrow-key stepping; no visible focus ring on dark theme.
- `prefers-reduced-motion` ignored: long sweeping animations and auto-play for vestibular-sensitive users. (Note: for this product animation is the content; reduced motion should mean "no auto-play, shorter/no easing, step-by-step stills," not "no visuals.")
- Screen readers get nothing from canvas/SVG; the formula's changing values are not announced, or are announced on every frame (spam).
- Color is the only carrier of meaning (sin = blue, cos = red; matching the colored terms) -> fails for ~8% of men with color-vision deficiency; red/green pairs particularly. Dark-background contrast of thin colored lines/text below WCAG thresholds (3:1 for graphics, 4.5:1 for text).
- The scrubber is a div, not `role="slider"` with `aria-valuetext`.

**Why it happens:**
Accessibility is perceived as incompatible with a visual explainer, so it is deferred; retrofitting after the scene code is written means restructuring.

**How to avoid:**
- Use real controls: playback buttons as `<button>`, scrubber as `<input type="range">` or ARIA slider with `aria-valuetext` ("Step 3 of 7").
- Every draggable handle is focusable (`tabindex=0`, `role="slider"`), responds to arrow keys (small step; Shift for large; Home/End) and snap to special angles via PageUp/PageDown; focus ring visible.
- Provide a text alternative per step (the caption does double duty) and an `aria-live="polite"` region updated on step change and on drag end (debounced), not per frame.
- Respect `prefers-reduced-motion`: disable autoplay, replace tweens with instant or short fades, keep manual step/scrub (which works because of Pitfall 2).
- Color + redundant encoding: pair every color with a different line style (solid/dashed/dotted), label direct on the diagram, and use a color-blind-safe palette (verify with a simulator, e.g., Okabe-Ito-inspired hues adapted for dark background). Formula terms also get underline/weight differences or position markers on hover/focus.
- Automated checks (axe, Lighthouse) in CI plus a manual keyboard-only and a screen-reader pass per concept.

**Warning signs:**
Cannot complete a concept with keyboard only; Tab skips the handles; contrast checker failures on axis labels; colors indistinguishable in a CVD simulator; screen reader reads "graphic" and nothing else.

**Phase to address:**
Phase 1 (interaction primitives built keyboard-first, palette chosen CVD-safe, reduced-motion in the timeline engine); audit in each concept phase and a dedicated a11y pass before public launch.

---

### Pitfall 11: Manim/Python temptation (and tool choice by familiarity)

**What goes wrong:**
Choosing Manim, or a Python-to-web bridge (Pyodide, server-side rendering, Streamlit/Dash/Jupyter widgets), because of the user's Python preference. Manim output is offline video (no drag at any step); Pyodide has large download (~10MB+ (verify)) and slow startup, poor interaction latency; server round-trips make dragging laggy and cost money at public scale. Hybrid approaches (Python precomputes, JS renders) add a build-pipeline burden.

**Why it happens:**
Familiarity and the 3B1B aesthetic is associated with Manim. The project constraint explicitly says Python is "preferred but not required."

**How to avoid:**
- Decision is already in PROJECT.md: live browser rendering. Keep the runtime in JS/TS (static site, no backend). Use TypeScript for correctness of the math layer.
- Borrow Manim's aesthetic, not its tool: palette, easing curves (smooth/ease-in-out), stroke weights, background color (#1c1c1c-ish (verify)), typography, "write/create/transform" motion vocabulary implemented in the timeline engine.
- If Python is wanted for something, restrict it to offline tools (e.g., generating reference values to test the math layer, exporting preview GIFs), never in the runtime path.

**Warning signs:**
Proposals to embed a Python runtime in the client; "just render videos for the hard parts"; interaction lag > 100 ms on drag.

**Phase to address:**
Stack decision (before Phase 1 planning); reiterate in the roadmap constraints.

---

## Moderate Pitfalls

### Pitfall 12: Easing/pacing that fights comprehension
**What goes wrong:** Animations too fast (copying video pacing where narration fills time) or too slow with no skip; continuous looping animations distract; everything moving at once.
**Prevention:** One thing moves at a time; durations roughly 0.6-1.2 s per transition with global speed control (0.5x/1x/2x); never auto-advance steps; "replay step" button; animate only what changed.
**Phase:** Framework phase (timeline engine defaults), tuned in the first concept.

### Pitfall 13: Step model that cannot express "free exploration"
**What goes wrong:** Steps are linear lessons, but the best learning happens when students roam; locking everything per step frustrates, unlocking everything makes steps meaningless.
**Prevention:** Per-step declaration of what's draggable plus a "free explore" final step; allow dragging at every step as per requirements, with the step highlighting (not enforcing) the focus.
**Phase:** Framework API design after concept #2 (see Pitfall 3).

### Pitfall 14: Coordinate system / view transform duplicated per concept
**What goes wrong:** Each concept hand-rolls math-to-pixel mapping, y-axis flip (SVG y points down), aspect ratio, pan/zoom; unit circle appears as an ellipse on non-square containers; stroke widths scale with zoom; label offsets inconsistent.
**Prevention:** Single shared `View` (domain<->pixel transforms, enforced equal aspect option, y-flip handled once, `vector-effect: non-scaling-stroke` or pixel-based stroke widths). Test that the unit circle is circular at odd container sizes.
**Phase:** Phase 1 shared graphics utilities.

### Pitfall 15: Angle/value readouts that change faster than they can be read
**What goes wrong:** Numeric labels flicker during drag; precision inconsistent (3 vs 6 digits); rounding makes sin²+cos² visibly not equal 1.
**Prevention:** Fixed 2-3 decimals; snap detents at special angles; throttle updates; display exact forms at special angles; make the identity demo use geometric sizes, not rounded numbers.
**Phase:** Trig concept phase.

### Pitfall 16: Lack of deep-linking / state persistence
**What goes wrong:** Public site with no accounts but no shareable URL for concept + step + language; refresh loses place; language not remembered; back button leaves the app.
**Prevention:** Route per concept (`/hs/trig`), step in the hash/query (`?step=3`), language in path or stored preference; static-host-compatible routing (404 fallback).
**Phase:** Phase 1 shell.

### Pitfall 17: Asset/bundle bloat and slow first load
**What goes wrong:** All concepts bundled together; KaTeX fonts, locales loaded upfront; students on mobile data wait.
**Prevention:** Code-split per concept and per locale; budget (e.g., < 200 KB JS initial gz, verify target); preload fonts used above the fold.
**Phase:** Phase 1 (build setup), checked at deployment phase.

### Pitfall 18: Testing only by eye
**What goes wrong:** Visual regressions and math bugs pass unnoticed as concepts multiply.
**Prevention:** Unit tests for math layer; seek-equivalence test (Pitfall 2); Playwright smoke test per concept (mounts, steps through, no console errors, dragging works with touch emulation); optional screenshot snapshots at fixed (step, params).
**Phase:** Phase 1 sets up; each concept adds its smoke test.

### Pitfall 19: Scope bloat into exercises/quizzes/progress
**What goes wrong:** "Check your understanding" widgets creep in, contradicting Out of Scope; each needs state, i18n and a11y.
**Prevention:** Keep Out of Scope enforced; reflective prompts as text in steps only ("What happens to tan as θ approaches 90 degrees?" with the visual answering it).
**Phase:** All; roadmap review at each transition.

---

## Minor Pitfalls

- **Dark theme only contrast and glare:** pure white on pure black causes halation; use off-white on near-black and test in bright light; consider a light-theme token set later (tokens from Pitfall 9 make that cheap).
- **Fonts for math labels:** italic variable names rendered in a UI font in diagrams while formulas use KaTeX fonts; use the KaTeX font for in-diagram math labels or keep consistent.
- **Cursor/Handle affordance:** no visual hint that something is draggable; add a gentle pulse that stops on first interaction (and respects reduced motion).
- **Browser zoom / text scaling:** layout breaks at 200% zoom (WCAG reflow); test.
- **Title/meta/SEO for a public site:** per-concept titles and descriptions per language (`hreflang`), social preview image; otherwise the app is undiscoverable.
- **Time-based animation tied to frames:** use timestamps (delta time) not frame counts so 120 Hz screens and throttled tabs behave identically.
- **Clamp delta time after tab resume:** avoid giant jumps.
- **Right-to-left or CJK future:** do not hardcode left/right in layout; use logical CSS properties.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline strings in scene code "temporarily" | Faster first concept | Full retrofit of every concept, plus missed aria labels | Never (i18n from day one is a stated requirement) |
| Hex colors copied into scene, CSS and LaTeX | Quick coloring | Palette changes and a11y fixes break links silently | Never; tokens cost almost nothing |
| Event-style timeline (`at t=2 do X`) | Easy to write | Not scrubbable/reversible; rewrite of every concept | Never for the final engine; fine in a 1-day spike |
| Degrees stored in state | Matches UI | Unit bugs in every formula | Never; convert at boundary only |
| Mouse events instead of Pointer Events | Familiar | Touch rewrite | Never |
| Hand-rolled coordinate mapping per concept | Fast first scene | Inconsistent behavior, repeated bugs | Only in concept #1 before extraction |
| Numerical derivative with arbitrary tiny h | Works for any f | Noise/NaN at h->0 | Only with symmetric difference and moderate h, or analytic where known |
| Global `trust: true` for KaTeX | Enables color/html macros | Injection risk if strings are ever user-supplied | Only if all strings are first-party and reviewed; prefer restricted `trust` function |
| Skipping reduced-motion/keyboard "for v1" | Ship sooner | Retrofit touches timeline and every handle | Never for the primitives; per-concept polish may lag slightly |
| One giant bundle | Simple build | Slow mobile load | Only for the first vertical slice |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| KaTeX | Re-render whole formula every frame; async font load causes shifts | Render per step; update dynamic slots only; self-host fonts and CSS; reserve width |
| MathJax (if considered) | Async typesetting in a live loop; heavy bundle | Avoid for live-updating formulas; prefer KaTeX unless features demand otherwise |
| i18n library | Concatenated strings; loading all locales upfront; missing-key silent fallback | ICU messages, lazy-load per concept/locale, CI check on missing keys |
| Animation library (GSAP/Motion/etc.) | Letting it mutate DOM directly alongside the state store | Drive it as a time source only; scene is a pure function of state |
| Router / static hosting | Client routes 404 on refresh | SPA fallback or pre-rendered routes; test deep links on the real host |
| Charting/graphing lib (D3/JSXGraph/Mafs etc.) | Adopting a full graphing lib whose drag model conflicts with the timeline | Verify it supports controlled (externally owned) state before adopting; otherwise use thin primitives (D3 scales, plain SVG) |
| Analytics (if added) | Third-party scripts hurting load and privacy (public site for students/minors) | Avoid or use privacy-friendly, cookieless, minimal analytics |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Framework re-render on pointermove | Dropped frames while dragging | Imperative attribute updates or fine-grained signals in the scene | Scenes with > ~100 reactive nodes on mid phones |
| Oversampled curves (10k points) | Slow path updates | ~1 sample per 1-2 px, cached | Wide screens plus several curves |
| Many SVG nodes (ticks, trails, dots) | Style/layout cost grows | Single path for ticks/grids; canvas layer for dense items | > ~1-2k nodes |
| Per-frame layout reads (`getBBox`, `getBoundingClientRect`) | Layout thrash | Measure on resize only; cache | Any scene with labels near handles |
| Multiple rAF loops / zombie loops | Heat, battery, leak between concepts | Single shell loop; `dispose()` contract; pause offscreen | After a few concept navigations |
| LaTeX re-typesetting per frame | High scripting time | Slot updates, throttle | Immediately noticeable on dragging |
| Unthrottled screen-reader live regions | SR babble | Announce on step change / drag end | First SR user |
| Large unoptimized fonts/locales | Slow first paint | Subset, code-split | Slow mobile networks |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| KaTeX `trust: true` with translatable strings | HTML/URL injection via locale files or future community translations | Restricted trust function (allow only specific commands); review locale PRs; no user-supplied TeX |
| `innerHTML` for captions with markup | XSS if translations ever come from outside | Render rich text via a safe mini-markup or component placeholders |
| Third-party scripts/CDN fonts | Supply chain, privacy for minors, GDPR (German/EU audience) | Self-host assets; pin dependency versions; no trackers by default |
| Public deploy without CSP | Weak defense in depth | Set a strict CSP on static host (verify host capability) |

Risk level overall: LOW (static public site, no accounts), so keep this cheap but do the above.

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Student does not know the thing is draggable | Passive watching, no learning | Pulse hint, cursor change, one-line prompt ("Drag the point") |
| Autoplay on load | Missed first step, motion discomfort | Start paused or require a tap; respect reduced motion |
| Dragging changes the scene in ways that break the narrative (e.g., unrelated element jumps) | Confusion | Dragging only affects the step's declared params; others stay consistent |
| No obvious "reset step" | Student stuck in a weird state | Reset button per step/concept |
| Colors that mean different things in different concepts | Confusion | Global semantic palette (sin always the same color, etc.) |
| Tiny formula/labels on phones | Unreadable | Minimum font floor; formula wraps/scrolls |
| Steps that advance only via play | Frustration for fast learners | Equal weight to prev/next/scrub/click on step list |
| Hidden undefined states | Student thinks it's a bug when tan vanishes at 90 degrees | Show explicit "undefined" feedback with an asymptote cue |

## "Looks Done But Isn't" Checklist

- [ ] **Scrubbing:** often only works forward -- verify random seek equals play-to-there equals scrub-back, in both directions.
- [ ] **Dragging during playback:** verify drag, release, next, prev, and replay all yield deterministic states.
- [ ] **Touch:** verify on a real phone, drag does not scroll the page, hit targets are comfortable, scrubber usable one-handed.
- [ ] **Tan / sec / csc / cot:** verify behavior at 90, 270, 0, 180 degrees; no NaN, no vertical connector lines, "undefined" shown.
- [ ] **Units:** verify degrees/radians toggle never changes the underlying geometry; labels agree; angles beyond 360 and negative.
- [ ] **Limits:** verify hole, jump, and infinite cases; value at a is not used for the limit; one-sided approach is distinguishable.
- [ ] **Derivative:** verify h -> 0 animation has no NaN and no noise; derivative graph matches analytic.
- [ ] **i18n:** verify German layout with +40% pseudo-localization, number formatting, aria-labels, page title, no English leftovers in diagram labels.
- [ ] **Keyboard:** verify the whole concept completes without a mouse; focus visible on dark background.
- [ ] **Reduced motion:** verify with OS setting on; no autoplay, steps still understandable.
- [ ] **Color-blindness:** verify in a CVD simulator; each color has a non-color cue.
- [ ] **Screen reader:** verify step changes announced once; handle values announced with `aria-valuetext`.
- [ ] **Cleanup:** verify navigating between concepts 20 times leaves no growth in listeners, rAF loops, or memory.
- [ ] **Performance:** verify frame time during drag on a mid-range Android on the heaviest step.
- [ ] **Deep links:** verify refresh on `/concept?step=N` on the production host, in both languages.
- [ ] **Text budget:** verify lint passes and mobile caption does not push the visual off-screen.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Two writers / non-reversible timeline | HIGH | Introduce params store and pure `render`; port concepts one at a time; add seek-equivalence test first to find breakage |
| Hardcoded strings / i18n retrofit | HIGH | Add lint that bans string literals in scene files; extract per concept; pseudo-localize to find the rest |
| Over-built framework | MEDIUM | Freeze it; delete unused abstractions; re-extract from the 2-3 real concepts |
| Wrong render tech for a scene | MEDIUM | Keep scene API (`render(params, view)`) renderer-agnostic so one layer can swap SVG/Canvas |
| Degrees/radians confusion | MEDIUM | Introduce `Angle` type; grep for trig calls; add unit tests with known values |
| Hex colors scattered | LOW | Introduce tokens; codemod hex to tokens |
| Accessibility retrofit | MEDIUM-HIGH | Wrap handles in a shared focusable `Handle` primitive; reduced-motion switch in engine; audit palette |
| Text creep | LOW | Enforce budget lint; cut captions; improve visuals |
| Mobile touch issues | MEDIUM | Switch to Pointer Events and capture in the shared drag primitive; fix layout via container-based sizing |
| Numeric precision bugs | LOW-MEDIUM | Centralize math helpers; analytic derivatives for demo functions |

## Pitfall-to-Phase Mapping

Suggested phase names assume roadmap: P1 Shell + core primitives + Trig vertical slice; P2 Functions & Transformations (and framework extraction); P3 Limits; P4 Derivatives; P5 Polish/a11y/launch. Adjust to the actual roadmap.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 Two writers (anim vs drag) | P1 (engine + param store) | Drag-during-playback test; deterministic next/prev |
| 2 Non-reversible timeline | P1 | Seek-equivalence property test in CI |
| 3 Over-engineered framework | P1 scope control; P2 extraction | Concept #1 ships before API is generalized; framework LOC < concept LOC |
| 4 Math edge cases | P1 math core; P-Trig, P3, P4 per-concept | Unit tests on asymptotes, wraparound, holes, h->0; visual checklist |
| 5 Text creep | P1 (lint) enforced in all | Caption budget lint passes |
| 6 i18n retrofit | P1 | en/de key parity in CI; pseudo-localization screenshot |
| 7 Mobile/touch | P1 primitives; every concept | Real-device checklist |
| 8 Performance | P1 spike + budget; P-Trig heavy scenes; P4 | Frame-time budget measured on mid Android |
| 9 LaTeX cost/color-linking | P1 formula component + tokens; P-Trig | No hex outside tokens; profile shows no per-frame typesetting |
| 10 Accessibility | P1 primitives; P5 audit | axe in CI; keyboard-only and screen reader pass |
| 11 Manim/Python temptation | Stack decision before P1 | Stack doc states JS/TS runtime, no Python in runtime path |
| 12 Pacing | P1 engine defaults | Playtest with a real student |
| 13 Free exploration vs steps | P2 API extraction | Each concept has a free-explore step |
| 14 Coordinate system duplication | P1 | Unit circle remains circular at odd sizes |
| 15 Readout flicker/precision | Trig phase | Visual check at special angles |
| 16 Deep links | P1 shell | Refresh test on production host |
| 17 Bundle bloat | P1 build; P5 check | Bundle size budget in CI |
| 18 Test-by-eye | P1 setup; each phase adds smoke test | Playwright smoke per concept |
| 19 Scope bloat | Every transition | Out of Scope reviewed at transitions |

## Sources

- Domain practice and prior art (training knowledge, not re-verified in this pass): Desmos and GeoGebra interaction models; Bret Victor "Explorable Explanations"; Nicky Case explorable work; 3Blue1Brown/Manim documentation (offline video rendering, which PROJECT.md already cites); Mafs, JSXGraph, D3 usage patterns.
- Standards: WCAG 2.1/2.2 (contrast 1.4.3/1.4.11, reflow 1.4.10, target size 2.5.5/2.5.8, keyboard 2.1.1, pause/stop/hide 2.2.2), WAI-ARIA slider pattern, CSS `prefers-reduced-motion`, Pointer Events and `touch-action` (MDN).
- IEEE-754 floating point behavior (`cos(Math.PI/2)` approx 6.1e-17; catastrophic cancellation in finite differences).
- KaTeX docs (`trust`, `\htmlClass`, MathML output) -- to be re-verified via Context7/official docs when the stack is chosen.
- Project context: /home/duck_ruler28/Documents/opt/Duck_Math/.planning/PROJECT.md

Items needing validation later (LOW/MEDIUM): exact KaTeX trust/htmlClass API and bundle sizes; Pyodide download size; German notation: sin/cos/tan (decided); concrete frame-time budget numbers; CSP support on the chosen host.

---
*Pitfalls research for: interactive animated math-visualization web app*
*Researched: 2026-10-24*
