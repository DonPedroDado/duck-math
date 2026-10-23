# Phase 1: Foundation & Playable Unit Circle - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-10-24
**Phase:** 01-foundation-playable-unit-circle
**Areas discussed:** Unit-circle storyboard, Player & page layout, Look & palette, Catalog/URLs/hosting

---

## Unit-circle storyboard

| Option | Description | Selected |
|--------|-------------|----------|
| 6 steps, build-up | intro → angle → radian → radians → cosine → sine + explore | ✓ |
| 4 steps, compact | point & angle → radian → cos & sin → explore | |
| You decide | Claude drafts | |

| Step motion | | |
|---|---|---|
| Animate, then hand over | ~2–4 s eased animation, then wait | ✓ |
| Continuous autoplay | video-like | |
| No auto animation | static staging | |

| Dragged angle across steps | | |
|---|---|---|
| Keep their angle | angle persists | ✓ |
| Reset to step default | re-stage | |

| Radian moment | | |
|---|---|---|
| Radius peels off & bends | 3B1B style, repeats to π | ✓ |
| Static 1-rad mark | | |

## Player & page layout

| Question | Options | Selected |
|---|---|---|
| Desktop | Visual left + side panel / Full-bleed overlays | Visual left + side panel |
| Phone | Stack + sticky player / Visual + bottom sheet | Stack + sticky player |
| Scrubber | Continuous bar with step ticks / Step dots + per-step scrub | Continuous bar with ticks |
| Autoplay | Wait for Play / Autoplay step 1 | Wait for Play |
| Play flow | Stop at end of each step / Pause then continue | Stop at end of each step |

## Look & palette

| Question | Options | Selected |
|---|---|---|
| Background | Near-black blue-grey / Pure black / Dark + light option | Near-black blue-grey |
| Palette | 3B1B-inspired CB-checked / Exact 3B1B / You decide | 3B1B-inspired CB-checked |
| Polish | Rich (glow, draw-on, easing) / Clean & flat | Rich |
| Font | Inter + KaTeX / More character | Inter + KaTeX |
| Branding | Wordmark + duck glyph / Wordmark only / Duck in explainers | Wordmark only |

## Catalog, URLs & hosting

| Question | Options | Selected |
|---|---|---|
| Catalog | Visual cards incl. dimmed "soon" / Hide unbuilt / Simple list | Visual cards incl. "soon" |
| Root URL | Browser-language redirect / Always /en/ | Browser-language redirect |
| Step links | Path + readable id / Query or hash / Localized slugs | Path + readable id |
| Hosting | Cloudflare Pages / GitHub Pages / Netlify / Later | **Other:** "hosted under ducksoft.ai which is GitHub Pages hosted on Cloudflare, like dm.ducksoft.ai" |
| Deploy shape | This repo → own Pages site + custom domain / Build into ducksoft.ai repo | Own Pages site + custom domain |
| Setup | Claude writes workflow + checklist, user clicks / Already set up | Claude writes workflow + checklist |

## Claude's Discretion

- Caption wording, animation durations and easing, default angle, readout precision, default angle unit, engine internals (GSAP vs own tweener), catalog card art.

## Deferred Ideas

- Duck mascot/glyph (Phase 6 polish)
- Light theme (not v1)
