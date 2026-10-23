# Phase 1: Foundation & Playable Unit Circle - Research

**Researched:** 2026-10-24
**Domain:** SvelteKit 3 static site, Paraglide i18n, scrubbable step engine, SVG interactive unit circle, KaTeX
**Confidence:** MEDIUM-HIGH (toolchain verified by a real scaffold + prerender spike; engine design is reasoned, not yet built)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Six steps with stable named IDs, building up in this order: 1. `intro` (circle r=1 + draggable point "drag me"), 2. `angle` (angle arc θ drawn, readout in degrees e.g. 60°), 3. `radian` (radius wraps onto the arc, showing 1 rad), 4. `radians` (angle in radians θ = π/3 ≈ 1.05, deg/rad toggle introduced), 5. `cosine` (x-projection "shadow" with cos θ formula and readout), 6. `sine` (y-projection with sin θ, both stay visible for free exploration).
- **D-02:** Step motion is "animate, then hand over". Entering a step plays a short eased animation (~2-4 s), then stops and waits. The point stays draggable during and after the animation.
- **D-03:** The student's dragged angle is kept across steps (overrides the research default of re-staging). Only a step that genuinely needs a specific angle animates the point there. Visibility and layers are still re-staged per step. The engine should support a per-step choice of "keep" or "re-stage" for each param, with this concept using "keep" for θ.
- **D-04:** Radian moment, 3B1B style: a colored copy of the radius peels off, moves to the circle's edge and bends onto the arc, landing exactly 1 rad long. It then repeats about 3.14 times to reach π. Scrubbable both ways.
- **D-05:** Desktop: large square stage on the left (~60-65% width). Side panel on the right holds step counter, caption, KaTeX formula with live readouts, deg/rad toggle. Player bar full width at the bottom.
- **D-06:** Phone (portrait): stacked layout, full-width square visual on top, then formula and caption, player bar sticky at the bottom. Visual must never scroll away while dragging (prevent touch scroll on the stage).
- **D-07:** Scrubber is one continuous bar across all steps with tick marks at step boundaries. Dragging the knob scrubs; clicking a tick jumps to that step. Controls: reset, prev step, play/pause, next step.
- **D-08:** No autoplay. Concept opens on step 1 (or the deep-linked step), staged and draggable, with a prominent Play button.
- **D-09:** Play stops at the end of each step. Pressing play again (or next) runs the next step. Dragging during an animation pauses it cleanly (PLAY-05).
- **D-10:** Background deep near-black blue-grey (~`#0f1117`). Subtle grid only where axes exist. Dark theme only.
- **D-11:** Semantic palette as global CSS tokens: angle θ `#FFD54A`, radius/point `#E8ECF4`, cos `#4FC3F7`, sin `#FF8A65`, radian `#B39DDB`, text `#C9D1D9`. Researcher/planner may tune for contrast/deuteranopia but must keep hue roles.
- **D-12:** Rich polish in Phase 1: soft glow on active strokes, strokes that "draw on", smooth cubic easing, hover/drag halos on the draggable point.
- **D-13:** Fonts: Inter for UI, KaTeX fonts for math, both self-hosted (no external font requests).
- **D-14:** Branding is a text "Duck Math" wordmark only.
- **D-15:** Catalog has category sections with visual cards (static SVG thumbnail, title, one-line hook). "High School" shows Trig live and Functions, Limits, Derivatives as dimmed "soon" cards. "University" appears as a dimmed "coming later" section.
- **D-16:** Root `/` redirects by browser language: `/de/` if the browser prefers German, else `/en/`. Header language switcher overrides and the choice is remembered (localStorage). On GitHub Pages this must be a client-side redirect from a static `/index.html`.
- **D-17:** Step deep links use path segments with readable stable step IDs, e.g. `/de/high-school/unit-circle/cosine`. Slugs are English in both locales. Each step URL is prerendered. Reordering steps must not break links.
- **D-18:** Hosting is GitHub Pages at the custom domain `dm.ducksoft.ai`, DNS on Cloudflare. Served from the domain root (no base path).
- **D-19:** Claude writes the GitHub Actions deploy workflow, `static/CNAME` (`dm.ducksoft.ai`) and a short setup checklist. The user creates the GitHub repo, enables Pages (source: GitHub Actions) and adds Cloudflare DNS `CNAME dm -> <user>.github.io`. GitHub Pages has no server redirects (use `trailingSlash`/prerendered `index.html` per route), 404 handling via `404.html`, Cloudflare SSL must be "Full".

### Claude's Discretion
- Exact caption wording in EN/DE (minimal, within word budget), duration and easing of each step's animation, default starting angle, readout precision, default angle unit for the deg/rad toggle.
- Engine internals: GSAP vs own tweener, param-store design, resolver. Follow the research architecture, keeping the `timeline`/`user` ownership model.
- Exact catalog card design and thumbnail art.

### Deferred Ideas (OUT OF SCOPE)
- Duck mascot / logo glyph (revisit Phase 6).
- Light theme (not planned for v1).
- Out of this phase (Phase 2+): tan/sec/csc/cot, unrolling into graphs, identities, symmetries, special-angle snapping, formula<->visual hover linking, predict-then-reveal, trails, multi-panel. Module contract freeze and scaffold template = Phase 3. Keyboard/reduced-motion/color-blind audits = Phase 6 (palette chosen color-blind-safe now).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHELL-01 | Catalog grouped by category | Registry via `import.meta.glob` (eager manifests); catalog route `/{locale}/`; UI-SPEC card layout |
| SHELL-02 | Open concept and return | Plain `<a>` links with `localizeHref`; back link in header |
| SHELL-03 | Shareable link to a step (stable IDs) | `prerender.entries` for 2 locales x 6 steps (verified); `[step]` route param; shallow routing for in-page step changes |
| SHELL-04 | Public URL, no login | adapter-static + GitHub Pages workflow + `static/CNAME` |
| SHELL-05 | Dark 3B1B theme, semantic palette | `tokens.css` CSS custom properties; same tokens drive SVG and KaTeX `\htmlClass` |
| PLAY-01 | Play/pause/step/reset | Engine: rAF clock, step-bounded play (section "Player state machine") |
| PLAY-02 | Scrub both directions, always correct | Pure `view(t, user)` function; no GSAP (see Standard Stack); seek-equivalence test |
| PLAY-03 | Short caption per step | Message keys `uc.step.<id>.caption`; `aria-live` region |
| PLAY-04 | Drag at every step | Pointer-capture drag on SVG, `touch-action: none` |
| PLAY-05 | Drag pauses playback, no jumps | Single writer for theta (user), timeline never writes theta except one guarded case |
| PLAY-06 | Step change re-stages predictably | Per-param `keep`/`restage` policy; layers are pure function of step |
| MATH-01 | KaTeX with colored terms | KaTeX 0.19 `trust` + `strict:false` + `\htmlClass` (verified, with a gotcha) |
| MATH-02 | Live locale-aware readouts | `Intl.NumberFormat` + custom minus/negative-zero normalizer |
| I18N-01 | EN/DE switch | Paraglide JS 2 |
| I18N-02 | Per-language URLs | Paraglide `urlPatterns` prefixing all locales (verified) |
| I18N-03 | Decimal comma in DE | `Intl.NumberFormat(getLocale())` |
| I18N-04 | Build fails on missing key | NOT provided by Paraglide (verified: silent fallback). Custom key-parity script in `prebuild` + Vitest |
| TRIG-01 | Drag point, deg/rad toggle | Angle model in radians, formatting layer |
| TRIG-02 | Radian = radius along arc | Bending-segment geometry (Code Examples) |
| TRIG-03 | cos/sin projections, live values | Pure `derive(theta)` |
| A11Y-01 | Touch works, fits small screens | `touch-action:none`, 44px targets, sticky stage/player, Playwright mobile viewport tests |
</phase_requirements>

## Summary

The whole toolchain from CLAUDE.md was scaffolded and built in a throwaway spike (SvelteKit 3.1.0, Vite 8.3.5, TS 6.0.3, Svelte 5.57.2, adapter-static 4.0.0, Paraglide 2.29.1, KaTeX 0.19.1). The spike produced prerendered `/{en,de}/` and all 12 `/{locale}/high-school/unit-circle/{step}/index.html` pages with correct `<html lang>` and translated text. Several things in CLAUDE.md are **wrong or changed in Kit 3** and must be reflected in plans: the `$lib` alias is removed (use `#lib`), there is no `svelte.config.js` (config lives in `vite.config.ts` under `sveltekit({...})`), adapter-static latest is **4.0.0** (not 5.0.5), and Vitest 5 refuses Node 25 (use Vitest 4.1.x, or run Node 22/24 LTS).

Paraglide does NOT fail builds on missing translations (verified: an English-only key compiled and the German page rendered the English string). I18N-04 therefore needs a small custom key-parity check (script run in `prebuild` + a Vitest test). Paraglide's `reroute` hook makes `/`, `/en/` and `/de/` the same SvelteKit route, so the D-16 root redirect cannot be a normal route: write it as a post-build step that overwrites `build/index.html`.

For the engine, recommend the **own tweener (no GSAP)**: D-03 ("keep the student's angle") means the start value of a tween depends on live user state, which conflicts with GSAP's cached-start-value tween model, and GSAP also writes a `_gsap` cache property onto the animated object (verified), which is hostile to Svelte `$state` proxies. A pure `view(t, userState)` function with d3-ease/d3-interpolate is simpler, makes seek-equivalence trivially true, and avoids the unverified license question.

**Primary recommendation:** Scaffold with the exact versions below, build the engine as pure functions (`locate(t)`, `view(t, user)`, `derive(theta)`) driven by a ~40-line rAF clock, render the stage in a pixel-space SVG, and add the custom i18n key-parity check and root-redirect post-build step in the first plan wave.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Catalog, concept pages, step URLs | Build (SSG prerender) | CDN/Static | Every route prerendered to static HTML; no server |
| Locale routing (/en, /de) | Build (Paraglide + reroute) | Browser (language switcher, localStorage) | URL is source of truth; prerendered per locale |
| Root `/` language redirect | Browser (inline script) | CDN/Static (static index.html) | GitHub Pages has no server redirects |
| Timeline clock, scrub, step state | Browser | none | rAF-driven, client only |
| Drag / pointer handling | Browser | none | Pointer events + capture on SVG |
| Math derive (cos/sin, angle) | Browser (pure TS) | Build (SSR initial render) | Pure functions, run in SSR for first paint |
| Formula typesetting | Build (SSR `renderToString`) | Browser (re-render on live values) | Static HTML first paint, live update client side |
| Number/locale formatting | Browser | Build | `Intl.NumberFormat` identical on both |
| i18n key completeness | Build (prebuild script / CI) | none | Paraglide has no strict mode |
| Hosting, TLS, custom domain | CDN/Static (GitHub Pages + Cloudflare) | none | D-18 |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| svelte | 5.57.2 | UI, runes reactivity | [VERIFIED: npm registry] |
| @sveltejs/kit | 3.1.0 (engines node >=22.17) | Routing, prerender | [VERIFIED: npm registry] peers vite ^8.0.12, typescript ^6, vite-plugin-svelte ^7 |
| @sveltejs/vite-plugin-svelte | 7.3.1 | Svelte compile | [VERIFIED: npm registry] |
| vite | 8.3.5 | Build | [VERIFIED: npm registry] |
| typescript | ~6.0.3 | Language. `latest` tag is 7.0.2; DO NOT take it | [VERIFIED: npm registry] Kit peers `^6` |
| @sveltejs/adapter-static | 4.0.0 | Static output. **CLAUDE.md's "5.0.x" does not exist** | [VERIFIED: npm view, 4.0.0 is latest; peer `@sveltejs/kit ^3.0.0-next.0` accepts 3.1.0] |
| @inlang/paraglide-js | 2.29.1 | Compile-time i18n | [VERIFIED: npm registry + spike build] |
| @inlang/plugin-message-format | 4.5.5 | Reads `messages/{locale}.json` | [VERIFIED: npm + spike]. Install locally and reference by path so the build is offline-safe (default docs use a jsDelivr CDN URL) |
| katex | 0.19.1 | Math typesetting | [VERIFIED: npm + spike] |
| d3-scale 4.0.2, d3-shape 3.2.0, d3-interpolate 3.0.1, d3-ease 3.0.1 | as listed | Scales, paths, easing | [VERIFIED: npm registry] Pure modules only |
| @fontsource-variable/inter | 5.3.0 | Self-hosted Inter | [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^4.1.12 | Unit tests | [VERIFIED: spike] v5.0.5 is latest but requires Node `^22.12 || ^24 || >=26`; fails on this machine's Node 25.9. Use ^4.1 (works everywhere) |
| @playwright/test | 1.64.1 | E2E, mobile viewport checks | [VERIFIED: npm registry] browsers not installed locally; `/usr/bin/chromium` 154 exists (use `npx playwright install chromium` or `channel`/`executablePath`) |
| svelte-check | 4.7.7 | Type check | [VERIFIED: npm registry] supports TS ^6 |
| @types/katex | 0.16.8 | KaTeX types | [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Own tweener | GSAP 3.15.0 | GSAP seeks deterministically (verified in node: `tl.time()` back and forth gave identical values) but caches tween start values and mutates targets with `_gsap`. Does not fit D-03 dynamic starts. License is "Standard no charge" per npm; full text could not be fetched in this session [ASSUMED: free for commercial use]. Skip for Phase 1; revisit only if timeline needs become exotic |
| Paraglide | svelte-i18n | Not needed; Paraglide works with Kit 3 (verified) |

**Installation (matches the spike):**
```bash
npx sv@latest create . --template minimal --types ts --no-add-ons
npm rm @sveltejs/adapter-auto
npm i -D @sveltejs/adapter-static@4 @inlang/paraglide-js @inlang/plugin-message-format typescript@~6.0 vitest@^4.1 @playwright/test @types/katex
npm i katex d3-scale d3-shape d3-interpolate d3-ease @fontsource-variable/inter
```
The scaffold sets `engine-strict=true` in `.npmrc`, so use Node 22.17+ LTS (24 recommended; add `.nvmrc`/`mise` pin). Local machine has Node 25.9.0 which satisfies Kit but not Vitest 5.

## Architecture Patterns

### System Architecture Diagram

```
 Visitor URL
    |
    +-- "/" ---------> static build/index.html (post-build script) --JS--> navigator.languages / localStorage 'dm-locale' --> /de/ or /en/
    |
    +-- "/{locale}/..." --> GitHub Pages serves prerendered {path}/index.html (trailingSlash always)
                              |
                      hydrate (Svelte 5)  <-- reroute hook strips locale; Paraglide runtime reads locale from URL
                              |
        +---------------------+------------------------+
        |                                              |
   Catalog page                                Concept page /high-school/unit-circle/[step]
   registry (import.meta.glob eager manifests)         |
   cards -> localizeHref(link)                  Player store: t, playing, rAF clock
                                                       |  (stops at step end)
   pointer drag --> user.theta (single writer) --+     v
   toggle --------> user.unit                    +--> view(t, user) [pure]  -> {step, p, layers, draw-on progress, theta_eff}
                                                       |
                                                 derive(theta_eff) [pure] -> cos, sin, point, arc, label values
                                                       |
                         +-----------------------------+------------------------------+
                         v                             v                              v
                   SVG Stage (px space)         KaTeX formula (htmlClass)       Readouts (Intl) + caption (m.*())
                         |
        shallow routing: pushState/replaceState(step URL) keeps component mounted
```

### Recommended Project Structure
```
src/
├── app.html                      # <html lang="%lang%">
├── hooks.ts                      # reroute (deLocalizeUrl)
├── hooks.server.ts               # paraglideMiddleware + %lang% replacement
├── routes/
│   ├── +layout.ts                # prerender = true; trailingSlash = 'always'
│   ├── +layout.svelte            # header, language switcher
│   ├── +page.svelte              # catalog
│   ├── +error.svelte             # 404 state (uses messages)
│   └── high-school/unit-circle/[step]/+page.svelte   # NOTE: generic later: [category]/[concept]/[step]
├── lib/                          # alias is '#lib/...' in Kit 3 (NOT $lib)
│   ├── paraglide/                # generated (gitignore)
│   ├── styles/tokens.css
│   ├── engine/                   # clock.ts, timeline.ts (locate/view), ease.ts, format.ts  (pure, unit-tested)
│   ├── stage/                    # Stage.svelte, Axes, Arc, Segment, DragPoint, Label (px-space primitives)
│   ├── player/                   # PlayerBar, Scrubber, StepCounter
│   ├── tex/                      # Tex.svelte (renderToString wrapper)
│   └── icons/
├── concepts/high-school/unit-circle/   # index.ts (manifest), Scene.svelte, steps.ts, derive.ts
messages/en.json, messages/de.json      # keys prefixed shell.* / uc.*
project.inlang/settings.json
scripts/check-i18n.mjs, scripts/postbuild.mjs
static/CNAME  static/.nojekyll(optional)
.github/workflows/deploy.yml
```
Keep concept-specific code inside `src/concepts/...` and engine/stage inside `#lib` so Phase 3 can freeze the contract without moving files (Phase 1 must not over-build the generic module API; CONTEXT says contract freeze is Phase 3). Still use the manifest-per-folder + `import.meta.glob` for the catalog now.

### Verified toolchain configuration (spike result)

`vite.config.ts` (Kit 3 has no `svelte.config.js`; options go inside `sveltekit({...})`):
```ts
// Source: spike build in this session; Paraglide docs https://paraglidejs.com/sveltekit and /i18n-routing
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';
import { locales } from './src/concepts/locales';          // plain TS data: ['en','de']
import { STEP_IDS } from './src/concepts/high-school/unit-circle/step-ids'; // plain TS array, no Svelte imports

export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
      strategy: ['url', 'baseLocale'],        // add 'localStorage'/'cookie' only if needed; see Pitfalls
      emitTsDeclarations: true,
      urlPatterns: [
        { pattern: '/', localized: [['en', '/en'], ['de', '/de']] },
        { pattern: '/:path(.*)?', localized: [['en', '/en/:path(.*)?'], ['de', '/de/:path(.*)?']] }
      ]
    }),
    sveltekit({
      compilerOptions: { runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true },
      adapter: adapter({ fallback: '404.html' }),
      paths: { relative: false },
      prerender: {
        handleHttpError: 'fail',
        entries: ['*', ...locales.flatMap((l) => STEP_IDS.map((s) => `/${l}/high-school/unit-circle/${s}/`))]
      }
    })
  ]
});
```
`project.inlang/settings.json`: `baseLocale: "en"`, `locales: ["en","de"]`, `modules: ["./node_modules/@inlang/plugin-message-format/dist/index.js"]`, `"plugin.inlang.messageFormat": {"pathPattern": "./messages/{locale}.json"}`.

Other verified specifics:
- `src/routes/+layout.ts`: `export const prerender = true; export const trailingSlash = 'always';` produces `build/en/index.html` and `build/de/high-school/unit-circle/cosine/index.html` (without `trailingSlash='always'` output is `de.html`, which breaks `/de/` on GitHub Pages).
- `src/app.html`: `<html lang="%lang%">`; `hooks.server.ts` replaces it inside `paraglideMiddleware` via `transformPageChunk` (build output showed `lang="de"`/`lang="en"` correctly). In Kit 3 `event.request` is readonly, so pass `{ ...event, request }`.
- `src/hooks.ts` (NOT hooks.server.ts) exports `reroute = (request) => deLocalizeUrl(request.url).pathname`.
- Locale-switch links: `<a href={localizeHref(page.url.pathname, { locale })} data-sveltekit-reload>` so the crawler finds them and the runtime locale stays in sync. All imports of the generated module use `#lib/paraglide/...`.
- `entries()` in a `+page.ts` only yields **unprefixed** params; use `prerender.entries` (above) to get all locale x step combinations. A crawl-only setup produced just `/de/.../intro` (verified).
- Output tree confirmed: `build/{en,de}/index.html`, `build/{en,de}/high-school/unit-circle/{intro,angle,radian,radians,cosine,sine}/index.html`, `build/404.html`, plus unwanted-but-harmless unprefixed `build/index.html` (English catalog) that the post-build step overwrites.

### Pattern 1: Pure view function (scrub = play = deep link)
**What:** The scene is a pure function of `(t, user)`; there is no mutable "animation state".
```ts
// engine/timeline.ts  (pure; unit-test with fast-check-style loops, no DOM)
export interface StepDef { id: string; dur: number; }
export const locate = (steps: StepDef[], t: number) => {            // t in [0,total]
  let start = 0;
  for (let i = 0; i < steps.length; i++) {
    const end = start + steps[i].dur;
    if (t <= end || i === steps.length - 1) return { i, p: clamp01((t - start) / steps[i].dur), start, end };
    start = end;
  }
};
// view(t, user) -> { i, p, layers, anim: {...draw-on progress per element}, theta }
//   theta = user.moved ? user.theta
//         : i === ANGLE_STEP ? lerp(0, user.theta, easeMath(p)) : user.theta     // only guarded timeline write (see Open Q1)
```
Ownership rule that satisfies PLAY-05/D-03: `theta` has exactly one writer (pointer/keyboard). The timeline never writes it, except the optional demo sweep, which is derived (not stored) and only while `!user.moved`. On first pointerdown: set `user.theta` from the pointer and `user.moved = true`; the first drag frame reads pointer position, never `view()`, so no jump is possible.

### Pattern 2: rAF clock that stops at step ends
State: `t`, `playing`. Per frame: `t += dt * speed`; clamp to current step end `e_i`; when reached, `playing=false`. Next: `t = start_{i+1}; playing = true`. Prev: `t = end_{i-1}` (staged). Reset: `t = end_0`?? see Open Q2. Scrub: `playing=false; t = x`. Pointerdown on stage: `playing=false`. Use `performance.now()` deltas, cap `dt` at ~50 ms (tab switch), and compute `p` from `t`, never accumulate per-element state.

### Pattern 3: Stage in pixel space
Render the SVG with `viewBox="0 0 S S"` where S = measured pixel size (`bind:clientWidth`, default 600 for SSR) and map math->px with `d3-scale` `scaleLinear` (y flipped). Then stroke widths, `font-size: 14px`, dash lengths and 44px hit targets are literal CSS px (UI-SPEC demands labels never below 14px and strokes in CSS px). This avoids `vector-effect: non-scaling-stroke`, whose interaction with `stroke-dasharray`/`pathLength` draw-on is inconsistent across browsers [ASSUMED, spike it]. Draw-on: set `stroke-dasharray = L` and `stroke-dashoffset = L*(1-p)` with computed length L (circle: 2πr, arc: rθ), no `pathLength`.

### Pattern 4: Single glow filter on a group
UI-SPEC already requires it: one `<g filter="url(#glow)">` per layer group, at most two active; never per element. Put the dragged point's glow on its own group. Measure fps in the Playwright/trace spike (budget 8 ms/frame is a placeholder).

### Pattern 5: Step URL sync via shallow routing
Use `pushState(url, {})` / `replaceState` from `$app/navigation` for step changes (no navigation, no re-run of load, component keeps its clock). `replaceState` while scrubbing (debounced to the step index change), `pushState` on user step actions. Also react to `page.params.step` changes (browser back/forward) by setting `t` to that step's staged position, guarding against feedback loops. Use `localizeHref` for the URL so the locale prefix is kept. [ASSUMED: Kit shallow routing API behaves with the reroute hook; verify in the first spike task]

### Anti-Patterns to Avoid
- **Animating a Svelte `$state` object with a tween library that stores start values** (D-03 breaks; scrubbing becomes history dependent).
- **Hard-coding "60" in caption/formula strings** (UI-SPEC: captions generic; values via formatter).
- **`$lib` imports** (removed in Kit 3; build error `module_removed_lib`).
- **Per-element `filter`s** (kills 60 fps).
- **Putting numbers inside message strings** (e.g. "3.14"): pass formatted number as a message parameter.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale routing, `<html lang>`, typed messages | Own router/loader | Paraglide + reroute | Verified working, typed keys |
| Math typesetting / colored terms | Custom MathML/SVG text | KaTeX `\htmlClass` + CSS vars | Tested in spike |
| Number localization | Manual comma replace | `Intl.NumberFormat(getLocale())` + small post-processing (minus sign, negative zero) | Plural/locale rules |
| Easing, interpolation, scales | Custom bezier math | d3-ease (`easeCubicInOut`), d3-interpolate, d3-scale | Tiny, pure, tested |
| Static deploy to Pages | Custom scripts | `actions/configure-pages`, `upload-pages-artifact`, `deploy-pages` | Official |
| Font hosting | Manual woff2 downloads | `@fontsource-variable/inter` | Latin + latin-ext subsets with unicode-range |
| Pointer drag math | Raw mouse/touch listeners | Pointer Events + `setPointerCapture` | Unifies mouse/touch/pen |

**Do hand-roll (deliberately, small):** the timeline (`locate`/`view`/clock), the SVG stage primitives, the i18n key-parity script, and the root-redirect page. These are tiny and are the product's core.

## Common Pitfalls

### Pitfall 1: Paraglide silently falls back on missing keys
**What goes wrong:** An English-only key compiles fine; German page shows English. (Verified in spike.) I18N-04 would fail unnoticed.
**How to avoid:** `scripts/check-i18n.mjs` loads `messages/en.json` and `messages/de.json`, compares key sets (ignoring `$schema`), also checks that every `{param}` placeholder set matches, exits 1. Wire as `"prebuild": "node scripts/check-i18n.mjs"`, `"test"` and in CI. Add a Vitest test that imports the same function and asserts that a deliberately-missing fixture is detected.
**Warning signs:** DE page shows English text.

### Pitfall 2: `$lib`, `svelte.config.js`, versions from CLAUDE.md
Kit 3 removed `$lib` (use `#lib`, defined by the scaffold's `package.json` `imports` field and `alias` option if you really need `$lib`), puts config in `vite.config.ts`, and forces runes via `compilerOptions.runes`. Paraglide's docs still show `$lib`; replace with `#lib/paraglide/...`. adapter-static is 4.0.0.

### Pitfall 3: KaTeX `\htmlClass` is disabled in strict mode
`trust` alone is not enough: with default `strict: 'warn'` KaTeX logs "HTML extension is disabled on strict mode [htmlExtension]" per call and the class may not be applied. Fix: `{ trust: (ctx) => ctx.command === '\\htmlClass', strict: false }` (spike output then contained `class="enclosing t-cos"`). Restrict trust to `\htmlClass` only (formulas are authored, not user input, but keep it minimal). Note KaTeX adds `enclosing` and may wrap; style colors via `.t-cos { color: var(--c-cos) }` including descendants.

### Pitfall 4: Prerender misses localized step pages
Only crawled links get prerendered; `entries()` yields unprefixed URLs. Use `prerender.entries` with explicit `/${locale}/.../${step}/` (verified). With `handleHttpError: 'fail'` broken links fail the build.

### Pitfall 5: Root `/` collides with the English catalog
The reroute hook maps `/`, `/en/` and `/de/` to the same route, and `/` prerenders as English catalog content. Implement D-16 as `scripts/postbuild.mjs` that overwrites `build/index.html` with a minimal page: `<meta http-equiv="refresh" content="0;url=/en/">` as no-JS fallback inside `<noscript>`, plus inline script: read `localStorage['dm-locale']`, else `navigator.languages` first match `de` -> `/de/` else `/en/`, `location.replace(target + location.search + location.hash)`. Run as `"build": "vite build && node scripts/postbuild.mjs"`. Language switcher writes `dm-locale` before navigating. Do not use `redirect()` in a route.

### Pitfall 6: 404 on GitHub Pages
Unknown URLs get `404.html`. adapter-static `fallback: '404.html'` creates an SPA shell that boots the client router, so `/de/high-school/unit-circle/foo/` can render `+error.svelte` via the `[step]` page throwing `error(404)` in `load` when the id is not in STEP_IDS (needs `ssr`/`prerender` handling: set `export const prerender = 'auto'`? simpler: validate in `+page.ts` `load`). Verify in Playwright via `vite preview` that an unknown step shows the 404 state. Language of the 404 follows the URL prefix; for completely unprefixed unknown paths it falls to `en`.

### Pitfall 7: Step-boundary semantics are ambiguous in UI-SPEC
"Prev jumps to previous step's staged end state", "tick jumps to the start of that step (staged state)" and "initial: final staged state of step 1" are not the same `t`. Define once: step i occupies `[s_i, e_i]`, **staged = e_i**. Deep link, tick click, Prev, and initial load all set `t = e_i`; Next sets `t = s_{i+1}` and plays. Scrubber ticks are drawn at `s_i` but their click target is `e_i`. Put this in one constant-tested function.

### Pitfall 8: Dragging vs scroll on phones
`touch-action: none` on the stage SVG (not on the page), pointer capture, `user-select:none`, `-webkit-touch-callout:none`. Stage is `position: sticky; top: 56px`. Test with Playwright `hasTouch` + `isMobile` at 320x640 (EN and DE) asserting `document.documentElement.scrollWidth <= innerWidth` and that the DE long caption wraps without clipping the 44px controls.

### Pitfall 9: Math edge cases (UI-SPEC "Edge cases")
Normalize θ to `[0, 2π)` with `((x % 2π) + 2π) % 2π`; derive cos/sin from the **point** for display; round to display precision FIRST, then if result is 0 print "0" (Intl prints `-0.00` for `-0.001`, verified in node). Replace ASCII hyphen with U+2212 after formatting (Intl in both en and de emits U+002D, verified). Hide zero-length arc/segment when `|θ|<1e-3`. Use `atan2(-(py - cy), px - cx)` with y flipped. Wrap handling: `359.9 -> 0.0` only, so compute displayed degrees from the normalized angle and format `Math.round(x*10)/10 === 360 ? 0`.

### Pitfall 10: Bending-radius geometry divides by zero
A segment bent to curvature k has points `(sin(ks)/k, (1-cos(ks))/k)`; at k=0 this is 0/0. Use `k = max(k, 1e-6)` or the series, and unit-test continuity at k->0 and k=1 (arc of length 1 on the unit circle). See Code Examples.

### Pitfall 11: Intro-to-angle point discontinuity
UI-SPEC has `intro` staged with the point at 60° and `angle` sweeping the point from 0 to 60° (when not moved). Entering `angle` after `intro` would teleport the point. See Open Question 1.

### Pitfall 12: Bundle / fonts
KaTeX CSS references woff2+woff+ttf (1.2 MB of fonts in `node_modules`); Vite emits all of them. Import `katex/dist/katex.min.css` once, then (optional) override `@font-face` to woff2 only. The KaTeX JS chunk was ~78 KB gz in the spike (client-side because live values re-render formulas). Budget: keep first-load JS under ~200 KB gz total (placeholder from SUMMARY) and measure with the build output.

### Pitfall 13: Locale source on first load
If you add `cookie`/`localStorage` strategies to Paraglide `strategy`, they can override the URL on prerendered pages unexpectedly. Keep `['url','baseLocale']`; the URL always wins and the stored preference is only used by the root redirect and switcher.

## Code Examples

### KaTeX component (SSR + live)
```ts
// Source: spike (katex 0.19.1). Verified output contained class="enclosing t-cos"
import katex from 'katex';
export const tex = (src: string) =>
  katex.renderToString(src, { trust: (c) => c.command === '\\htmlClass', strict: false, throwOnError: true, output: 'htmlAndMathml' });
// \htmlClass{t-cos}{\cos\theta} = \htmlClass{t-cos}{0{,}50}  (use "{,}" for decimal comma; pass the formatted number string in)
```
```svelte
<script lang="ts">
  let { src }: { src: string } = $props();
  const html = $derived(tex(src));          // renders in SSR for prerender, and on the client when src changes
</script>
{@html html}
```
Render cost per call is small (~1 KB output); throttle to rAF (readouts already update once per frame). Only the numbers change: if profiling shows cost, split into a static KaTeX label and a plain tabular-nums `<span>` for the number.

### Formatting
```ts
// engine/format.ts
const nf = new Map<string, Intl.NumberFormat>();
export function fmt(x: number, digits: number, locale: string) {
  const k = locale + digits;
  const f = nf.get(k) ?? nf.set(k, new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })).get(k)!;
  const rounded = Number(x.toFixed(digits));
  return f.format(Object.is(rounded, -0) || rounded === 0 ? 0 : rounded).replace('-', '−');
}
```

### Bent unit segment (radian peel-off, D-04)
```ts
// k=0: straight segment along +x of length 1; k=1: arc of length 1 on the unit circle
export function bentPoint(s: number, k: number): [number, number] {   // s in [0,1]
  const kk = Math.max(k, 1e-6);
  return [Math.sin(kk * s) / kk, (1 - Math.cos(kk * s)) / kk];
}
// Place copy j: translate/rotate so its start sits at angle j rad on the circle edge (radius 1.03).
// Animation phases of local p: peel (rotate up from the x-axis end), move to edge, bend (k: 0->1, easeMath), then copies j>=1 repeat staggered.
```

### Drag handler (Svelte 5)
```svelte
<circle r="24" fill="transparent" role="slider" tabindex="0" aria-label={...}
  onpointerdown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); player.pause(); user.moved = true; setFromPointer(e); }}
  onpointermove={(e) => { if (e.buttons || dragging) setFromPointer(e); }}
  onpointerup={() => dragging = false} onkeydown={arrowKeys} style="touch-action:none; cursor:grab" />
```
`setFromPointer`: `r = svg.getBoundingClientRect(); x = (e.clientX - r.left - cx)/scale; y = -(e.clientY - r.top - cy)/scale; user.theta = norm(Math.atan2(y, x))`.

### Missing-key check
```js
// scripts/check-i18n.mjs
import { readFileSync } from 'node:fs';
const load = (l) => JSON.parse(readFileSync(`messages/${l}.json`, 'utf8'));
const strip = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== '$schema'));
const en = strip(load('en')), de = strip(load('de'));
const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const errs = [];
for (const k of new Set([...Object.keys(en), ...Object.keys(de)])) {
  if (!(k in de)) errs.push(`missing in de: ${k}`); else if (!(k in en)) errs.push(`missing in en: ${k}`);
  else if (ph(en[k]) !== ph(de[k])) errs.push(`placeholder mismatch: ${k}`);
}
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
```

### GitHub Actions deploy (D-19)
```yaml
# .github/workflows/deploy.yml  -- action major versions from GitHub releases API on 2026-10-24
name: Deploy
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run check && npm test
      - run: npm run build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with: { path: build }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      - id: d
        uses: actions/deploy-pages@v5
```
Latest majors seen via `gh api .../releases/latest`: checkout v7.0.1, setup-node v7.1.0, configure-pages v6.0.0, upload-pages-artifact v5.0.0, deploy-pages v5.0.1 [VERIFIED: GitHub releases API]. `static/CNAME` containing `dm.ducksoft.ai` is copied into `build/` by adapter-static. Setup checklist for user: create repo, Settings > Pages > Source "GitHub Actions", set custom domain `dm.ducksoft.ai`, Cloudflare `CNAME dm -> <user>.github.io` (DNS only/grey cloud during first certificate issuance is the safe path [ASSUMED]), SSL mode Full, enforce HTTPS.

## State of the Art

| Old (CLAUDE.md / training) | Current (verified) | Impact |
|----|----|----|
| `$lib` alias | `#lib` (Kit 3), `$lib` removed | All imports and Paraglide outdir references |
| `svelte.config.js` | Config inside `vite.config.ts` `sveltekit({...})` | Plans must not create svelte.config.js |
| adapter-static 5.0.x | 4.0.0 is latest | Install `@4` |
| Vitest 4.x | 5.0.5 latest but Node-picky; 4.1.12 works | Pin ^4.1 |
| Paraglide docs use `$lib`, Kit2 `Handle` from `@sveltejs/kit/hooks` | Kit 3: import `Handle`/`Reroute` from `@sveltejs/kit`; readonly `event.request` | Hook code above |
| Paraglide `@inlang/paraglide-sveltekit` | Removed; use `@inlang/paraglide-js` + vite plugin | Already in stack |

**Deprecated/outdated:** TypeScript 7.x (do not install), GSAP-for-everything (not needed).

## Runtime State Inventory

Not applicable (greenfield, no rename/migration).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | GSAP "no charge" license permits free commercial/public use (text not retrievable; npm says "Standard 'no charge' license") | Standard Stack | Low: recommendation is to not use GSAP at all |
| A2 | `vector-effect: non-scaling-stroke` + dasharray draw-on is inconsistent across browsers, so pixel-space SVG is safer | Pattern 3 | Medium: if wrong, either approach works; spike a draw-on in Chromium + Safari/Firefox |
| A3 | Kit shallow routing (`pushState`/`replaceState`) works cleanly with the Paraglide reroute hook | Pattern 5 | Medium: fallback is raw `history.replaceState` with `localizeHref` URL; verify in first task |
| A4 | Cloudflare grey-cloud (DNS-only) during GitHub Pages cert issuance avoids problems | Deploy | Low: documented as a checklist hint; user-run |
| A5 | Unknown-path 404 via `fallback: '404.html'` renders `+error.svelte` correctly in the localized shell | Pitfall 6 | Medium: verify with `vite preview` + Playwright |
| A6 | KaTeX re-render per frame is cheap enough to avoid splitting number spans | Code Examples | Low: split fallback described |
| A7 | Nothing in Safari/iOS breaks pointer-capture drag with `touch-action:none` on SVG | Pitfall 8 | Medium: cannot test iOS here; flag for user device check |

## Open Questions

1. **Intro/angle point teleport.** UI-SPEC: `intro` rests at 60°; `angle` "sweeps from 0 to 60° if not moved". That teleports 60->0 at the step boundary and when scrubbing.
   - Recommendation: drop the point sweep. In `angle`, only the arc draws on 0->θ and the label fades in; the point never moves from timeline. Then θ has zero timeline writers and PLAY-05 is trivially safe. Needs a quick user/planner OK because it deviates from UI-SPEC step table.
2. **What does Reset do?** UI-SPEC: "step 1 at t=0, staged". With staged = end of step (Pitfall 7), `t=0` shows an empty scene (before axes fade in). Recommend Reset = `t = e_0` (intro staged) so it matches the initial/deep-link state; scrubbing to t=0 still shows the empty start.
3. **Staged definition for tick click/prev** (see Pitfall 7). Recommend staged = `e_i`.
4. **`radian` step when θ is small or the user dragged to ~0.** Copy count `floor(theta)` is 0 at θ<1 rad. Recommend the radian animation always plays a full 1 rad copy + continuation up to π independent of θ (a scene-intrinsic demonstration), and the fading copies in `radians` are cosmetic; this avoids the animation depending on user state. Confirm with the planner.
5. **Safari/iOS testing** is not possible on this machine; user feedback loop is expected.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/test | yes | 25.9.0 (non-LTS) | Use 24 LTS via mise for parity with CI; Kit needs >=22.17 |
| npm | Install | yes | 11.12.1 | — |
| git | VCS | yes | present | — |
| gh CLI | Optional repo/Pages setup | yes | 2.102.0 | User does it in web UI |
| Chromium | Playwright e2e | yes (system) | 154.0.8037.97 at `/usr/bin/chromium` | `npx playwright install chromium` |
| Playwright browsers cache | e2e | no (`~/.cache/ms-playwright` missing) | — | Install chromium or use `executablePath: '/usr/bin/chromium'` |
| Network (npm registry) | install | yes | — | — |
| GitHub repo / Pages / Cloudflare DNS | Deploy | not created | — | User action per D-19 (checklist); phase code is complete without it |

**Missing with no fallback:** none for code. Public deploy (SHELL-04) requires the user's repo/DNS steps (flag as a manual checkpoint in the plan).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.12 (unit), Playwright 1.64.1 (e2e against `vite preview` of the static build) |
| Config file | none yet, Wave 0: `vitest.config.ts` (or `test` in vite.config), `playwright.config.ts` |
| Quick run command | `npx vitest run` |
| Full suite command | `npm run build && npx playwright test && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAY-02 | `view(t,user)` identical when reached by play-through vs seek (random t sequences, both directions) | unit | `npx vitest run src/lib/engine/timeline.test.ts` | Wave 0 |
| PLAY-01/09 | Clock stops at step end; next/prev/reset produce the staged `t` values | unit | `npx vitest run src/lib/engine/clock.test.ts` | Wave 0 |
| PLAY-05 | Pointerdown pauses, theta == pointer angle on first frame, no jump; play after drag keeps user theta | unit + e2e | `npx playwright test e2e/drag.spec.ts` | Wave 0 |
| PLAY-06/D-03 | theta kept across steps; layers re-staged per step | unit | `npx vitest run src/concepts/**/steps.test.ts` | Wave 0 |
| MATH-02/I18N-03 | `fmt`: DE `0,87`, EN `0.87`, U+2212, never `-0`, 359.95->0 | unit | `npx vitest run src/lib/engine/format.test.ts` | Wave 0 |
| TRIG-01/03 | `derive(theta)` cos/sin/quadrant/edge angles (0, 90, 180, 270, 360) | unit | `npx vitest run src/concepts/**/derive.test.ts` | Wave 0 |
| TRIG-02 | `bentPoint` continuity at k->0, arc length = 1 at k=1 | unit | same file as geometry tests | Wave 0 |
| I18N-04 | check-i18n detects missing key/placeholder mismatch; real messages pass | unit + CI | `node scripts/check-i18n.mjs && npx vitest run scripts` | Wave 0 |
| I18N-01/02 | `/en/` and `/de/` built, `<html lang>`, switcher keeps route/step | e2e | `npx playwright test e2e/i18n.spec.ts` | Wave 0 |
| SHELL-03 | Every `/{l}/high-school/unit-circle/{step}/` exists in `build/`, opens at that step; unknown step shows 404 state | e2e + file check | `npx playwright test e2e/deeplink.spec.ts` | Wave 0 |
| SHELL-01/02 | Catalog sections, live card links, soon cards not links, back link works | e2e | `npx playwright test e2e/catalog.spec.ts` | Wave 0 |
| D-16 | Root redirect: `Accept-Language`/`navigator.languages` de -> /de/, else /en/; stored `dm-locale` wins | e2e | `npx playwright test e2e/root-redirect.spec.ts` | Wave 0 |
| A11Y-01 | At 320x640 and 390x844 (touch, EN+DE): no horizontal overflow, controls >= 44px, drag moves point, page does not scroll during drag | e2e | `npx playwright test e2e/mobile.spec.ts` | Wave 0 |
| SHELL-05 | No hex literals in components (grep test), tokens defined | unit (fs scan) | `npx vitest run src/lib/styles/tokens.test.ts` | Wave 0 |
| MATH-01 | Formula HTML contains `t-cos`/`t-sin` classes; KaTeX throws on invalid TeX | unit | `npx vitest run src/lib/tex/tex.test.ts` | Wave 0 |
| Visual polish | Look and feel, glow, easing, 3B1B feel | manual | user review in browser | manual-only (subjective, per PROJECT) |

### Sampling Rate
- **Per task commit:** `npx vitest run` (<15 s) + `node scripts/check-i18n.mjs`
- **Per wave merge:** `npm run check && npm run build && npx playwright test`
- **Phase gate:** full suite green plus a manual look-through at 3 viewports before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts`, `playwright.config.ts` (webServer: `npm run build && npm run preview`, `testIgnore` nothing; chromium project + mobile project with `devices['Pixel 7']`)
- [ ] `src/lib/engine/*.test.ts`, `scripts/check-i18n.mjs` (+ test fixtures with a missing key)
- [ ] `e2e/*.spec.ts` skeletons listed above
- [ ] Framework install: `npm i -D vitest@^4.1 @playwright/test && npx playwright install chromium`

## Security Domain

Static public site, no accounts, no user input beyond pointer/keyboard and a locale preference.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | none (no login by design) |
| V3 Session Management | no | none |
| V4 Access Control | no | none |
| V5 Input Validation | limited | Validate `[step]` param against `STEP_IDS`; locale restricted to Paraglide `locales`; KaTeX `trust` limited to `\htmlClass` and only authored (never user-supplied) TeX |
| V6 Cryptography | no | none; TLS from GitHub Pages/Cloudflare |
| V14 Config | yes | Self-hosted fonts and assets (no third-party requests), `{@html}` only with KaTeX output of authored strings, no secrets in repo |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via `{@html}` | Tampering | Only render `katex.renderToString` output of build-authored strings; message strings with TeX are authored in repo; no URL-derived content into `{@html}` |
| Open redirect in root redirect script | Spoofing | Redirect target built from a fixed allowlist (`/en/`, `/de/`), never from query/hash input (preserve `search`/`hash` only as suffix) |
| Supply chain via CDN plugin URL | Tampering | Install `@inlang/plugin-message-format` from npm, not jsDelivr, so build is reproducible; commit lockfile; `npm ci` in CI |
| Third-party GitHub Actions | Tampering | Use first-party `actions/*`; optionally pin by SHA |

## Sources

### Primary (HIGH confidence)
- Spike project built in this session (scratchpad): Kit 3.1.0 + Vite 8.3.5 + TS 6.0.3 + adapter-static 4.0.0 + Paraglide 2.29.1 + KaTeX 0.19.1: produced and inspected the build output tree, `lang` attributes, translated text, KaTeX class output, missing-key behavior.
- npm registry (`npm view`, 2026-10-24): versions and peerDependencies for all packages in the stack table; Vitest engines; Kit engines.
- https://paraglidejs.com/sveltekit (hooks, reroute, prerender notes), https://paraglidejs.com/i18n-routing (prefix-all-locales `urlPatterns`), https://paraglidejs.com/compiler-options (no strict-missing-translation option listed).
- GitHub releases API for action versions (via `gh api`).

### Secondary (MEDIUM)
- GSAP: `node` run of a paused timeline with `tl.time()` seeks (deterministic) and observed `_gsap` property on tweened object; npm license field "Standard 'no charge' license".

### Tertiary (LOW)
- None relied on without verification; unverified items are in the Assumptions Log.

## Metadata

**Confidence breakdown:**
- Standard stack and config: HIGH, built and prerendered in a real spike.
- Architecture (engine, pixel-space stage): MEDIUM, reasoned design consistent with `.planning/research/ARCHITECTURE.md`; not yet implemented.
- Pitfalls: MEDIUM-HIGH, the toolchain ones were reproduced; UI-SPEC ambiguities are analytic.
- Deploy: MEDIUM, workflow is standard but not executed (needs the user's repo and DNS).

**Research date:** 2026-10-24
**Valid until:** ~2026-11-07 (Kit 3 / Vite 8 / Paraglide 2 are moving quickly; re-run `npm view` at scaffold time)

## Project Constraints (from CLAUDE.md)
- Visuals render live in the browser and are manipulable at any step; no pre-rendered video.
- TypeScript + Svelte 5 (runes) + SvelteKit 3 + adapter-static; own SVG components; d3 pure modules only (no D3 DOM selections); KaTeX; Paraglide JS 2; Vitest + Playwright.
- Do NOT use: Manim/Pyodide/Streamlit-type runtimes, Motion Canvas/Remotion, TypeScript 7.x, a second DOM-owning library as main renderer, inline UI strings or step text in components, formulas as images.
- Text minimal, externalized from day one (EN+DE); layouts must survive longer German strings.
- It must look beautiful (3Blue1Brown style); the user gives feedback on problems.
- Per CLAUDE.md the spec of versions is a hypothesis: this research corrected adapter-static (4.0.0), Vitest (^4.1), `$lib` -> `#lib`, config location.
- GSD workflow: file edits happen through GSD commands (`/gsd-execute-phase` etc.); do not edit the repo outside a GSD workflow.
