# Filter Hero — issues and fixes

Append here when you find or fix a bug. Chat is not the log. Never reuse ids.

```markdown
### FH-XXX — short title
- **Status:** open | mitigated | wontfix
- **Area:** finder | catalog | pricing | cart | header | clock | measure | brands | seo | photos | contact | other
- **Symptom:** what the shopper sees
- **Do NOT:** the change that brings it back
- **Do:** the invariant
- **Files:** key paths
- **Verify:** page or command
- **Added:** YYYY-MM-DD
```

Next id: **FH-043**

---

### FH-042 — tsconfig `baseUrl` flagged as an error
- **Status:** mitigated
- **Area:** other
- **Symptom:** Cursor/TypeScript 6 marked `tsconfig.json` as an error: `baseUrl` is deprecated and stops working in TypeScript 7.
- **Do NOT:** Put `baseUrl` back, or silence it with `ignoreDeprecations` on TypeScript 5.6 (that option is unknown there).
- **Do:** Path aliases stand on `paths` only (`@/*` → `./client/src/*`, `@shared/*` → `./shared/*`). `pnpm check` includes `scripts/**/*.ts`.
- **Files:** `tsconfig.json`, `tsconfig.node.json`
- **Verify:** `pnpm check` and open `tsconfig.json` — no deprecation error.
- **Added:** 2026-08-24

---

### FH-041 — Carbon Capture dots read as black on white
- **Status:** mitigated
- **Area:** catalog
- **Symptom:** MERV 8 Carbon used the navy-card silver accent (`#d8d8d8`), so Capture dots looked gray on the white size-page note.
- **Do NOT:** Paint carbon dots with the light silver accent on a white panel.
- **Do:** Carbon dots use the black badge (`#111111`). Other ratings keep `MERV_GUIDE.accent`.
- **Files:** `client/src/pages/SizeDetail.tsx`
- **Verify:** Choose MERV 8 Carbon — filled and outline dots are black.
- **Added:** 2026-08-21

---

### FH-040 — Size-page MERV note uses catch-page Capture
- **Status:** mitigated
- **Area:** catalog
- **Symptom:** Choose MERV used gray capsule bars and a one-line blurb. It did not match Capture (growing dots + efficiency) from the catch page.
- **Do NOT:** Use vertical pips. Do not paint this strip navy.
- **Do:** White/light container. Capture label, five growing dots from `MERV_GUIDE.strength` / `accent`, `efficiency`, then that rating’s best-for, note, and catches.
- **Files:** `client/src/pages/SizeDetail.tsx`, `client/src/index.css`
- **Verify:** Switch MERV 8 / Carbon / 11 / 13 on a size page — dots, µm line, and copy all change.
- **Added:** 2026-08-21

---

### FH-039 — MERV chips span their column
- **Status:** mitigated
- **Area:** catalog
- **Symptom:** MERV badges were only as wide as the label, so they sat short of the heading below.
- **Do NOT:** Size chips to the text (`inline-flex`, `max-w-[11rem]`).
- **Do:** Every MERV chip is `width: 100%` of its tile or column.
- **Files:** `client/src/index.css`, `client/src/components/MervCarousel.tsx`, `client/src/pages/SizeDetail.tsx`
- **Verify:** Size-page Choose MERV and catch-section cards — chips reach the right edge of the column.
- **Added:** 2026-08-21

---

### FH-038 — Size-page MERV picker matches catch-section columns
- **Status:** mitigated
- **Area:** catalog
- **Symptom:** Choose MERV used two-tone icon cards. Shopper wanted the catch-section column language on the white buy panel.
- **Do NOT:** Bring back the colored-bar + icon + short-label cards on the size page.
- **Do:** White panel stays. Four columns: color badge, bold MERV name, muted “best for” line, faint dividers. Selected column washes with that rating’s color.
- **Files:** `client/src/pages/SizeDetail.tsx`, `client/src/index.css`
- **Verify:** Any `/sizes/{slug}` page — Choose MERV looks like the catch-section columns on white.
- **Added:** 2026-08-21

---

### FH-037 — FAQ heading collage
- **Status:** mitigated
- **Area:** photos
- **Symptom:** FAQ opened with a wall-install + new/1-month/3-month + clean-vs-dirty mosaic.
- **Do NOT:** Put that collage back beside the FAQ heading.
- **Do:** FAQ is heading and answers only. Install and dirty-filter photos stay on how-to / size pages.
- **Files:** `client/src/components/FaqSection.tsx`
- **Verify:** Home FAQ has no photo mosaic next to the title.
- **Added:** 2026-08-21

---

### FH-031 — Filter Clock days must be 30 / 60 / 90 / 180 only
- **Status:** open
- **Area:** clock
- **Symptom:** Clock and calendar can show other intervals (120 / 270 / 330 bases, 7- or 15-day rounding).
- **Do NOT:** Keep those bases or that rounding.
- **Do:** Snap every day count, label, and calendar date to 30, 60, 90, or 180.
- **Files:** `client/src/lib/filter-cadence.ts`, `client/src/components/ClockDeck.tsx`, `scripts/verify-filter-clock.ts`
- **Verify:** Every MERV × thickness × household combo uses only those four days; then assert it in `verify-filter-clock.ts`.
- **Added:** 2026-08-20

### FH-032 — How to Measure chip belongs with Shop / Brands / Clock / Contact
- **Status:** open
- **Area:** header
- **Symptom:** Measure help is not in the primary nav. Do not put it inside Enter Your Filter Size.
- **Do NOT:** Nest How to Measure in the header finder.
- **Do:** A How to Measure control in that nav row; it jumps to the tape-measure diagram.
- **Files:** `client/src/components/SiteHeader.tsx`
- **Verify:** Nav row has Shop, Brands, FILTER CLOCK, How to Measure, Contact. Chip is not in the finder card.
- **Added:** 2026-08-20

### FH-033 — Clock nav still says Clock, not FILTER CLOCK
- **Status:** open
- **Area:** header
- **Symptom:** Header link is `Clock`.
- **Do NOT:** Label it Filter Hero or leave it as Clock.
- **Do:** Label **FILTER CLOCK**; still hashes to `#clock`.
- **Files:** `client/src/components/SiteHeader.tsx`
- **Verify:** Header reads FILTER CLOCK and opens the Filter Clock section.
- **Added:** 2026-08-20

### FH-034 — Custom CTA should read Need a custom size
- **Status:** open
- **Area:** header
- **Symptom:** Button says `Custom size`.
- **Do NOT:** Use Custom size or a second finder.
- **Do:** One button, **Need a custom size**, to `/custom-air-filters#custom-quote`.
- **Files:** `client/src/components/SiteHeader.tsx`
- **Verify:** Wording plus it opens the quote form.
- **Added:** 2026-08-20

### FH-035 — Tape-measure diagram missing from product pages
- **Status:** open
- **Area:** measure
- **Symptom:** Size/product pages do not all show the filter + tape measure.
- **Do NOT:** Leave it homepage-only, or clip Width / Length / Depth labels.
- **Do:** Same diagram on every `/sizes/{slug}` page, using that page’s dimensions.
- **Files:** `client/src/pages/SizeDetail.tsx`, `client/src/components/HowToMeasureGuide.tsx`, `client/src/components/MeasureFilterDiagram.tsx`
- **Verify:** Several size pages show the diagram with sharp labels.
- **Added:** 2026-08-20
