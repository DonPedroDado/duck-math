---
phase: 1
slug: foundation-playable-unit-circle
status: verified
threats_open: 0
asvs_level: 1
created: 2026-10-24
---

# Phase 1 - Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| URL -> app | Route params (`[[step]]`), arbitrary paths, query/hash on `/` | Untrusted strings, public |
| Browser storage -> redirect | `dm-locale` in localStorage read by static root redirect | Untrusted string, allowlisted |
| Pointer/keyboard -> state | Drag/scrub/key input to angle and time state | Numbers, clamped/normalized |
| Repo TeX -> DOM | KaTeX output injected via the single `{@html}` | Repo-authored only |
| Build/CI/deploy | npm supply chain, GitHub Actions, Vercel hosting | Code, no secrets |

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation / Evidence | Status |
|-----------|----------|-----------|-------------|-----------------------|--------|
| T-01-01 | Tampering | [[step]]/+page.ts | mitigate | `+page.ts:6` `if (!isStepId(step)) error(404)`; allowlist `step-ids.ts:3`; param never rendered as HTML | closed |
| T-01-02 | Tampering (supply chain) | project.inlang/settings.json | mitigate | `settings.json:5` local `./node_modules/@inlang/plugin-message-format/...`; package-lock.json committed | closed |
| T-01-03 | Info disclosure | scripts/serve-build.mjs | mitigate | `serve-build.mjs:44-47` prefix check `root + path.sep` -> 403; `//` guard :41; `.listen(port,'localhost')` | closed |
| T-01-04 | Info disclosure | fonts/assets | mitigate | e2e `skeleton.spec.ts:20-29` and `formulas.spec.ts:96-102` assert same-origin only | closed |
| T-01-06 | Tampering | workflow actions | mitigate | `.github/workflows/ci.yml` (no deploy.yml; deploy is Vercel): only `actions/checkout@v7`, `actions/setup-node@v7`; `permissions: contents: read` (stricter than plan) | closed |
| T-01-07 | Tampering | npm install in CI | mitigate | `ci.yml` `npm ci`; `vercel.json` `installCommand: npm ci` | closed |
| T-01-08 | Info disclosure | repo/workflow | mitigate | grep `secret` in .github and src = 0 matches | closed |
| T-01-09 | Spoofing | custom domain | mitigate | DEVIATION: hosting moved GitHub Pages/Cloudflare-proxy -> Vercel; no `static/CNAME` (not applicable on Vercel). Equivalent control: Vercel domain verification + Vercel-issued cert, DNS-only CNAME, checklist and curl verification in `docs/DEPLOY.md` (steps 4-6, Verify). Intent preserved | closed |
| T-01-11 | Spoofing (open redirect) | scripts/postbuild.mjs | mitigate | `postbuild.mjs` target `'/'+(l\|\|'en')+'/'` with `ok()` strict en/de check; e2e `root-redirect.spec.ts:50-56` `?next=//evil.example` origin unchanged | closed |
| T-01-12 | Tampering | localStorage dm-locale | mitigate | `postbuild.mjs` `ok(s)` strict equality; e2e cases 'xx' (:18) and 'constructor' (:24) | closed |
| T-01-14 | Integrity | build pipeline | mitigate | `package.json:8` `prebuild: node scripts/check-i18n.mjs`; `check-i18n.test.ts` fixtures | closed |
| T-01-15 | DoS | clock rAF loop | mitigate | `player.ts:3,49` MAX_DT=0.05 clamp; `clock.svelte.ts` loop stops when not playing, `destroy()` cancels; `clock.test.ts:67-73` | closed |
| T-01-16 | Tampering | seek/goto inputs | mitigate | `player.ts:47,62,67` `Number.isFinite` guards returning same state, clamps; `player.test.ts` | closed |
| T-01-18 | Reflected XSS | +error.svelte | mitigate | `+error.svelte` renders only `m.error_404_*` / `page.status`; no page.url / error.message / `{@html}`; e2e `notfound.spec.ts:21-24` | closed |
| T-01-19 | Spoofing | catalog links | mitigate | `ConceptCard.svelte:10` `localizeHref(concept.path)` from manifest | closed |
| T-01-21 | Tampering | page.state.ucStep effect | mitigate | `[[step]]/+page.svelte` effect `isStepId(id)` before goto | closed |
| T-01-22 | Spoofing | pushState URL | mitigate | `+page.svelte` `syncUrl`: `localizeHref(stepPath(STEP_IDS[i]))` | closed |
| T-01-23 | DoS | history spam | mitigate | `+page.svelte` `act()`: seek -> `replaceState`, otherwise push | closed |
| T-01-24 | XSS | Tex.svelte {@html} | mitigate | Single `{@html}` at `Tex.svelte:34` (grep confirms only one in src); `tex.ts` trust only `\htmlClass`; `tex.test.ts:11-15` href javascript / htmlId not honored | closed |
| T-01-25 | Tampering | KaTeX options | mitigate | `tex.ts` `throwOnError: true`; `tex.test.ts:8` invalid TeX throws. IN-14 change reviewed: `Tex.svelte` rethrows in DEV/SSR (build fails), prod browser falls back to `<code>{src}</code>` as escaped text, not `{@html}`; intent preserved | closed |
| T-01-26 | Info disclosure | KaTeX fonts | mitigate | `Tex.svelte` imports `katex/dist/katex.min.css` (Vite-bundled); e2e same-origin | closed |
| T-01-27 | Tampering | onunitchange | mitigate | `Panel.svelte:87` `if (u === 'deg' \|\| u === 'rad')` | closed |
| T-01-29 | DoS | glow filters | mitigate | `Scene.svelte:47-48` filters on groups only, gated by single `GLOW_GROUP[stepId]`; `+page.svelte` `glowing` reset via 600ms timeout | closed |
| T-01-30 | Info disclosure | svelte:boundary failed | mitigate | `+page.svelte` `failed()` shows `m.error_scene_body()` only, no error object | closed |
| T-01-31 | Spoofing | header back link | mitigate | `+layout.svelte:45` `localizeHref('/')` | closed |
| T-01-32 | Tampering | Scrubber -> seek | mitigate | `Scrubber.svelte` `clamp01(...) * total` in `xToT` and key handlers; reducer clamps | closed |
| T-01-33 | DoS | pointermove flood | mitigate | `Scrubber.svelte` / `DragPoint.svelte` handlers dispatch pure reduce/assign, single rect/CTM per event; rAF stops when paused | closed |
| T-01-11-01 | Tampering | DragPoint / onthetachange | mitigate | `angle.ts` `angleFromPoint` -> `norm`; `keyStep`; `Scene.svelte:255` `snapTheta(t)` before `onthetachange` | closed |
| T-01-11-02 | DoS | arcPath/formulaLines theta | mitigate | `norm`/`snapTheta` bound theta to [0,2pi) (`angle.ts`); `derive.ts:20` `norm(theta)` | closed |
| T-01-12-01 | Tampering | DragPoint.key, norm | mitigate | `angle.ts` `keyStep` integer-degree grid `% 360`; `norm` 1e-9 snap | closed |
| T-01-05, T-01-10, T-01-13, T-01-17, T-01-20, T-01-28, T-01-34, T-01-11-03, T-01-11-04, T-01-12-02, T-01-12-03 | various | see log | accept | See Accepted Risks Log | closed |

*Status: open / closed. Disposition: mitigate / accept / transfer.*

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01 | T-01-05 | Locale switcher writes `dm-locale` only from the fixed locales list; no PII | plan (Phase 1) | 2026-10-24 |
| AR-02 | T-01-10 | DoS on hosting: static CDN, provider-level protection | plan (Phase 1) | 2026-10-24 |
| AR-03 | T-01-13 | Message strings are in-repo and rendered escaped; no `{@html}` of messages | plan (Phase 1) | 2026-10-24 |
| AR-04 | T-01-17 | No user data stored or sent | plan (Phase 1) | 2026-10-24 |
| AR-05 | T-01-20 | Catalog is public static content | plan (Phase 1) | 2026-10-24 |
| AR-06 | T-01-28 | radianCopies per frame is trivial cost | plan (Phase 1) | 2026-10-24 |
| AR-07 | T-01-34 | Captions/readouts are static, non-sensitive | plan (Phase 1) | 2026-10-24 |
| AR-08 | T-01-11-03 | Panel toggle exposes no sensitive data | plan (Phase 1) | 2026-10-24 |
| AR-09 | T-01-11-04 | No auth/server/new deps, so no privilege boundary | plan (Phase 1) | 2026-10-24 |
| AR-10 | T-01-12-02 | keyStep/norm are O(1) over finite inputs | plan (Phase 1) | 2026-10-24 |
| AR-11 | T-01-12-03 | aria attributes expose angle only | plan (Phase 1) | 2026-10-24 |

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-24 | 41 | 41 | 0 | gsd-security-auditor |

Unregistered flags: none (no SUMMARY Threat Flags sections).

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-24
