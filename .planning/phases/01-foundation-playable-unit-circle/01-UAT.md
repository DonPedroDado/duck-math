---
status: complete
phase: 01-foundation-playable-unit-circle
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md, 01-06-SUMMARY.md, 01-07-SUMMARY.md, 01-08-SUMMARY.md, 01-09-SUMMARY.md, 01-10-SUMMARY.md, 01-11-SUMMARY.md, 01-12-SUMMARY.md]
started: 2026-10-24T11:56:47Z
updated: 2026-10-24T13:51:13Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Stop any running server. `npm run build` then `npm run preview`. The build finishes without errors (the i18n check passes) and http://localhost:4173/ loads the app.
result: pass

### 2. Root Language Redirect
expected: Opening `/` sends you to `/de/` or `/en/` based on your browser language. After you switch locale once, `/` remembers your choice.
result: pass

### 3. Catalog Page
expected: The home page shows a dark-themed catalog: a live "Unit circle" card with an SVG thumbnail, three inert "Soon" cards (functions, limits, derivatives), and a dimmed University "Coming later" section. Clicking the Unit circle card opens the concept.
result: pass

### 4. EN/DE Locale Switcher
expected: The header's locale switcher toggles between English and German. The URL changes (/en/ to /de/), all UI text and captions are translated, and the current page/step is kept.
result: pass

### 5. Drag the Point (Intro)
expected: On the unit circle concept, dragging the point moves it smoothly around the circle. The live angle readout updates while you drag (decimal comma in DE). A drag hint shows at first and disappears once you interact.
result: pass

### 6. Player Controls and Scrubber
expected: The player bar has reset / prev / play-pause / next and a continuous scrubber with tick marks for the 6 steps. Play animates the current step to its end. Prev/next jump between steps. Dragging the scrubber scrubs the animation smoothly. Captions change per step. Dragging the point while playing pauses playback.
result: pass

### 7. Step URLs, Deep Links, Back/Forward
expected: Moving between steps updates the address bar (e.g. /en/high-school/unit-circle/sine/). Pasting a step URL in a new tab opens directly at that step. Browser Back/Forward move between the steps you visited.
result: pass

### 8. Radian Moment and Deg/Rad Toggle
expected: In the radian / radians steps, lavender copies of the radius peel off the x-axis and bend onto the arc: 3 full copies plus a small piece reaching π on half the circle. From the radians step a deg/rad toggle appears, and it switches the readout between degrees and radians.
result: pass

### 9. Cos/Sin Projections and Formulas
expected: In the cosine and sine steps, colored projection segments draw onto the x and y axes. The formula panel shows KaTeX formulas whose terms match the segment colors, and the numbers update live while you drag (DE uses a decimal comma and a true minus sign, never "-0"). Labels flip side so they stay readable.
result: pass

### 10. Keyboard Control
expected: Tab to the point and use the arrow keys: the angle steps one degree at a time, playback pauses, the hint disappears, and stepping past 359° wraps cleanly to exactly 0° (arc, readout and value agree), in both directions.
result: pass

### 11. Phone Layout and Touch
expected: At phone width (about 320 to 390px, EN and DE) the layout stacks cleanly with no horizontal scroll, the header shows a back button, long German strings fit, and touch-drag on the point works without scrolling the page.
result: pass

### 12. Localized 404
expected: Visiting a non-existent URL such as /de/gibts-nicht/ shows a styled, German 404 page with a link back to /de/. It does not echo the bad URL.
result: pass

### 13. Public Deployment
expected: https://dm.ducksoft.ai loads the same app over HTTPS: the redirect, catalog and unit circle steps all work as above.
result: pass

## Summary

total: 13
passed: 13
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
