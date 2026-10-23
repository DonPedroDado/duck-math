# Phase 1: Foundation & Playable Unit Circle - Context

**Gathered:** 2026-10-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A publicly deployed static site (at `dm.ducksoft.ai`) with: a catalog grouped by category, a concept page with the guided step player (play/pause/step/reset/scrub), EN/DE via URL locale, the dark 3B1B-style theme, touch support, and a thin but polished **unit-circle** slice: drag the point, angle in degrees and radians (toggle), the radian shown as the radius wrapping onto the arc, and cos/sin as x/y projections with color-matched KaTeX formulas and live readouts.

Out of this phase: tan/sec/csc/cot, unrolling into graphs, identities, symmetries, special-angle snapping, formula↔visual hover linking, predict-then-reveal, trails, and multi-panel (all Phase 2). Module contract freeze and scaffold template come in Phase 3. Keyboard, reduced motion and color-blind cue audits come in Phase 6 (but the palette is chosen color-blind-safe now).

</domain>

<decisions>
## Implementation Decisions

### Unit-circle storyboard
- **D-01:** Six steps with stable named IDs, building up in this order:
  1. `intro`: circle (r = 1) plus a draggable point ("drag me")
  2. `angle`: angle arc θ drawn, readout in degrees (e.g. 60°)
  3. `radian`: the radius wraps onto the arc, showing 1 rad
  4. `radians`: angle in radians (θ = π/3 ≈ 1.05), deg/rad toggle introduced
  5. `cosine`: x-projection ("shadow") with cos θ formula and readout
  6. `sine`: y-projection with sin θ, and both stay visible for free exploration
- **D-02:** Step motion is **"animate, then hand over"**. Entering a step plays a short eased animation (~2–4 s, e.g. the point sweeps to an angle, a stroke draws on), then stops and waits. The point stays draggable during and after the animation.
- **D-03:** **The student's dragged angle is kept across steps** (this overrides the research default of re-staging). Only a step that genuinely needs a specific angle animates the point there. Visibility and layers are still re-staged per step. The engine should support a per-step choice of "keep" or "re-stage" for each param, with this concept using "keep" for θ.
- **D-04:** Radian moment, 3B1B style: a colored copy of the radius peels off, moves to the circle's edge and bends onto the arc, landing exactly 1 rad long. It then repeats about 3.14 times to reach π. It must be scrubbable both ways like everything else.

### Player & page layout
- **D-05:** Desktop: a large square stage on the left (~60–65% width). A side panel on the right holds the step counter, caption, KaTeX formula with live readouts, and the deg/rad toggle. A player bar runs full width at the bottom.
- **D-06:** Phone (portrait): stacked layout with a full-width square visual on top, then formula and caption, and the player bar **sticky at the bottom** (thumb reach). The visual must never scroll away while dragging (prevent touch scroll on the stage).
- **D-07:** Scrubber is **one continuous bar across all steps with tick marks at step boundaries**. Dragging the knob scrubs the animation, and clicking a tick jumps to that step. Controls: ⏮ reset, ◀ prev step, ▶/⏸ play-pause, ▶▶ next step.
- **D-08:** **No autoplay.** The concept opens on step 1 (or on the deep-linked step), staged and draggable, with a prominent Play button.
- **D-09:** **Play stops at the end of each step.** Pressing ▶ again (or next) runs the next step. Dragging during an animation pauses it cleanly (PLAY-05).

### Look & palette
- **D-10:** Background is a deep near-black blue-grey (around `#0f1117`). A subtle grid appears only where axes exist. Dark theme only (no light mode in v1).
- **D-11:** Semantic palette, 3B1B-inspired and checked for color-blind safety, defined as global CSS tokens. The same meaning keeps the same color in every concept:
  - angle θ `#FFD54A` (yellow)
  - radius/point `#E8ECF4` (off-white)
  - cos `#4FC3F7` (sky blue)
  - sin `#FF8A65` (coral)
  - radian `#B39DDB` (lavender)
  - text `#C9D1D9`

  The researcher/planner may tune these values for contrast or deuteranopia, but must keep the hue roles.
- **D-12:** Rich polish in Phase 1, because polish is core value: soft glow on active strokes, strokes that "draw on" when introduced (like 3B1B's Create), smooth cubic easing, and hover/drag halos on the draggable point.
- **D-13:** Fonts: **Inter** for the UI and KaTeX fonts for math, both self-hosted (no external font requests).
- **D-14:** Branding is a text "Duck Math" wordmark only. No duck mascot or glyph yet.

### Catalog, URLs & hosting
- **D-15:** The catalog has category sections with **visual cards**: a small static SVG thumbnail, title and one-line hook. "High School" shows Trig as live and Functions, Limits and Derivatives as dimmed "soon" cards. "University" appears as a dimmed "coming later" section.
- **D-16:** The root `/` redirects by browser language: `/de/` if the browser prefers German, else `/en/`. The header language switcher overrides this and the choice is remembered (localStorage). On GitHub Pages this must be a client-side redirect from a static `/index.html`.
- **D-17:** Step deep links use path segments with readable, stable step IDs, e.g. `/de/high-school/unit-circle/cosine`. Slugs are English in both locales. Each step URL is prerendered. Reordering steps must not break links.
- **D-18:** Hosting is **GitHub Pages at the custom domain `dm.ducksoft.ai`**, with DNS on Cloudflare (ducksoft.ai is already GitHub Pages behind Cloudflare). This repo is its own Pages site, served from the domain root (no base path).
- **D-19:** Claude writes the GitHub Actions deploy workflow (build, then deploy to Pages), the `static/CNAME` file (`dm.ducksoft.ai`) and a short setup checklist. The **user** creates the GitHub repo, enables Pages (source: GitHub Actions) and adds the Cloudflare DNS record `CNAME dm → <user>.github.io`. Keep in mind: GitHub Pages has no server redirects (use `trailingSlash`/prerendered `index.html` per route), 404 handling goes through `404.html`, and Cloudflare SSL must be "Full" to avoid redirect loops.

### Claude's Discretion
- Exact caption wording in EN/DE (minimal, within a word budget), the duration and easing of each step's animation, the default starting angle, readout precision, and the default angle unit for the deg/rad toggle.
- Engine internals: GSAP vs own tweener, param-store design, resolver. Follow the research architecture, keeping the `timeline`/`user` ownership model.
- The exact catalog card design and the thumbnail art.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope & requirements
- `.planning/PROJECT.md`: vision, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md`: Phase 1 requirement IDs (SHELL-01..05, PLAY-01..06, MATH-01..02, I18N-01..04, TRIG-01..03, A11Y-01)
- `.planning/ROADMAP.md` § Phase 1: goal and success criteria

### Research (stack, architecture, pitfalls)
- `.planning/research/SUMMARY.md`: reconciled conclusions, Phase 1 research flags (Paraglide + Kit 3, KaTeX `trust`/`\htmlClass`, GSAP license vs own tweener, SVG drag perf spike)
- `.planning/research/STACK.md`: pinned versions (TS ~6.0, Svelte 5.57, Kit 3.1, Vite 8, KaTeX 0.19, Paraglide 2.29, d3 modules)
- `.planning/research/ARCHITECTURE.md`: param store with ownership, pure step resolver, scene host/View, primitives
- `.planning/research/PITFALLS.md`: two-writers, scrubbability, math edge cases, i18n/token/mobile pitfalls
- `.planning/research/FEATURES.md`: table stakes and differentiators
- `CLAUDE.md`: technology stack and "What NOT to use"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. This is a greenfield repo with only planning docs and CLAUDE.md.

### Established Patterns
- None yet. Phase 1 establishes them: the `src/concepts/<category>/<id>/` folder convention, global CSS color tokens, message keys only (no inline strings), and SVG primitives.

### Integration Points
- New SvelteKit app at the repo root. GitHub Actions deploys to GitHub Pages at the custom domain `dm.ducksoft.ai`.

</code_context>

<specifics>
## Specific Ideas

- The look should be 3Blue1Brown-like: draw-on strokes, glow, smooth easing. The radian moment specifically copies the 3B1B "radius peels off and bends onto the arc" animation.
- "My point stays where I put it": the student's angle persists through steps.
- The step player behaves like slides with animated transitions (stop after each step), not like a video.
- The user will try it in the browser and give iterative feedback on visual problems.

</specifics>

<deferred>
## Deferred Ideas

- A duck mascot or logo glyph (and possibly a duck character in explainers). Decided against for now; revisit at launch polish (Phase 6).
- A light theme. Not planned for v1.

</deferred>

---

*Phase: 01-foundation-playable-unit-circle*
*Context gathered: 2026-10-24*
