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

Next id: **FH-075**

---

### FH-074 — Hero restaged left, header stays on the first screen
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The live hero still read as a right-side lineup, and the giant outlined HERO sat next to the character. The shopper header (logo, Shop / Brands / Filter Clock / Contact, How to Measure, size finder, Need a Custom Size, cart) must stay on the locked first screen.
- **Do NOT:** Hide or remove `SiteHeader` from `.home-lock`. Do not put a painted banner back. Do not crop the CAPE BLOW figure. Do not add Carbon / MERV 13 caption pills. Do not flood-fill pack shots.
- **Do:** Keep header + hero as the only first-screen stack. Character lives on the left with copy over the cape. Replace the lone HERO wordmark with the Filter / Hero lockup (white + crimson). Filters and 30+ brand claim stay on the right.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/src/pages/Home.tsx`
- **Verify:** `/` — navy header bar still sits above the hero; character left, copy on cape, Filter King packs right; no page scroll.
- **Added:** 2026-08-30

---

### FH-073 — Hero character was a frozen still
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The standing hero did not move; the cape did not blow.
- **Do NOT:** Replace him with a new pose, walk cycle, or a painted banner. Do not crop the figure.
- **Do:** Loop `character-idle.webm` in the same slot — crossed arms, subtle idle, cape blowing. Poster is `character.png`. Prefer reduced-motion still. Higgsfield image-to-video was unavailable (expired session).
- **Files:** `client/public/hero/character-idle.webm`, `client/src/components/Hero.tsx`, `scripts/_cape_idle.py`
- **Verify:** `/` — character stays planted; cape loops. `prefers-reduced-motion` shows the PNG.
- **Added:** 2026-08-30

---

### FH-072 — Hero brand fit claim was easy to miss
- **Status:** mitigated
- **Area:** photos
- **Symptom:** “Fits 38 brands” and the Trane / Carrier / Rheem marks were tiny and scattered under the packs.
- **Do NOT:** Scatter the three logos at different heights in 0.62rem type.
- **Do:** One brand strip under the filters: “We also fit 30+ major brands” plus larger white Trane, Carrier, and Rheem marks.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — the three logos read clearly; the 30+ line sits with them.
- **Added:** 2026-08-30

---

### FH-071 — Carbon and MERV 13 hero captions duplicated the boxes
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Extra pills under Carbon and MERV 13 repeated “Carbon / Odor eliminator” and “MERV 13 / Superior.”
- **Do NOT:** Paint those words off the pack-shot PNGs. Do not hide the printed labels on the boxes.
- **Do:** Leave those two hero captions off. The boxes already name the SKU.
- **Files:** `client/src/components/Hero.tsx`
- **Verify:** `/` desktop — no Carbon or MERV 13 caption pills under those two packs.
- **Added:** 2026-08-30

---

### FH-070 — Hero character sat too low under the filters
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The character needed a small lift without moving the filter cluster.
- **Do NOT:** Raise `.hero-lineup` or the pack bottoms for this.
- **Do:** Desktop `.hero-character-slot` is `bottom: 10%` / `height: 84%`.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — character a bit higher; filters stay put.
- **Added:** 2026-08-30

---

### FH-069 — Hero filters needed a guarantee line above them
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Filters sat low with no copy tying them to the brands we fit.
- **Do NOT:** Leave the packs on the bottom edge with no claim above them.
- **Do:** Raise the filter cluster. Desktop line above them: “These are the filters we sell. Guaranteed to fit all major brands.” Hidden on mobile.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — packs sit higher; guarantee line sits above the cluster.
- **Added:** 2026-08-30

---

### FH-068 — Hero filters sat too close to the character
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The four packs needed to sit a bit farther right of the character, without moving him.
- **Do NOT:** Shift `.hero-lineup` or the character slot for this.
- **Do:** Nudge only the showcase products (and the brand marks under them) ~5% right.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — character stays put; filters and brand marks sit slightly farther right.
- **Added:** 2026-08-30

---

### FH-067 — Hero cast needed another nudge right
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-066 the character and filters still sat too close to the copy.
- **Do NOT:** Leave `.hero-lineup` at `left: 36%`.
- **Do:** Desktop lineup starts at `left: 42%`.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — character and packs sit farther right, more air between title and the group.
- **Added:** 2026-08-30

---

### FH-066 — Hero cast sat too far left over the copy
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Character and filters crowded the headline instead of using the open right side.
- **Do NOT:** Pin `.hero-lineup` at `left: 28%` on desktop.
- **Do:** Desktop lineup starts at `left: 42%` so the character and packs sit farther right as one group.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — character and four filters clear of the title, more open space on the left.
- **Added:** 2026-08-30

---

### FH-065 — Logo font change was not visible in the hero
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The hero still looked like the old title face after FH-064. Google italic may not have loaded, and h1 utilities kept Plus Jakarta Regular Bold.
- **Do NOT:** Rely on the Google Fonts italic URL alone. Do not leave the lockup only in the header.
- **Do:** Self-host Plus Jakarta ExtraBold Italic as `FilterHero`. Show a FILTER / HERO lockup in the hero copy. Force `h1.hero-title` onto that face.
- **Files:** `client/public/fonts/plus-jakarta-extrabold-italic.woff2`, `client/src/index.css`, `client/src/components/Hero.tsx`
- **Verify:** `/` — ice FILTER + crimson HERO sit above the headline in the italic extra-bold lockup face.
- **Added:** 2026-08-30

---

### FH-064 — Hero headline did not use the logo font
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The new hero title set in Manrope, so it did not match the FILTER HERO wordmark.
- **Do NOT:** Leave the hero title on the body face. Do not load Plus Jakarta upright-only and fake the italic.
- **Do:** Hero title is Plus Jakarta Sans ExtraBold Italic — the lockup face. Load `ital,wght` 700/800. Title is uppercase; the accent line uses `--hero` red like HERO in the mark.
- **Files:** `client/index.html`, `client/src/index.css`
- **Verify:** `/` — headline matches the italic extra-bold FILTER HERO wordmark, not Manrope.
- **Added:** 2026-08-30

---

### FH-063 — Hero filters and brands sat in separate corners
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Four pack shots orbited the corners and Trane/Carrier/Rheem lived in their own pill, so the hero looked like a collage.
- **Do NOT:** Park filters in four corners with the character isolated in the middle. Do not keep the brand logos in a separate copy-column chip on desktop.
- **Do:** One grounded lineup: character, four filters, and brand marks share the same cluster. Filters sit as a family at his side, not a pile and not a tray. Desktop hides the copy-column brand row.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — one group, not four corners plus a logo bar. Character full-figure. Each filter still its own clickable shot.
- **Added:** 2026-08-30

---

### FH-062 — Hero character crowded out the filter shots
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The character filled most of the art, so the four pack shots stayed small.
- **Do NOT:** Grow the character back to full-stage height. Do not cap showcase images at ~28vh.
- **Do:** Character slot ~82% tall / 34vw wide on desktop. Showcase packs use ~14–15.5vw (up to 14.5rem) and 36vh max image height.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — full-figure character, clearly smaller than before; four filters larger and still in their own corners.
- **Added:** 2026-08-30

---

### FH-061 — Home hero felt like a static catalog row
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Header + copy | character | four products sat in a rigid three-column grid and looked plain.
- **Do NOT:** Put the four filters back into even catalog cells. Do not pile them on the character or lock the page into a two-column split.
- **Do:** One cinematic stage. Character is the scene. Products orbit at different sizes, tilts, and float cycles. Copy overlays the left light. Giant outlined HERO wordmark, moving mesh, rays, and orbs stay behind the art. Viewport stays locked. Character stays full-figure.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — no three-column grid, products floating around a full character, page still does not scroll.
- **Added:** 2026-08-30

---

### FH-060 — MERV 13 hero cutout must keep the original product
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Background removal ate the white cardboard frame and lattice, so the MERV 13 shot no longer matched the uploaded pack photo.
- **Do NOT:** Flood-fill near-white as background. Do not recolor, relight, or rebuild the box.
- **Do:** Start from the original studio shot. Make only the exterior studio white transparent. Keep every product pixel, including the white frame and diamond grid. `?v=fh060`.
- **Files:** `client/public/hero/showcase-merv13.png`, `client/src/components/Hero.tsx`
- **Verify:** `/` desktop — MERV 13 is the original Filter King box, white frame intact, no black lattice.
- **Added:** 2026-08-30

---

### FH-059 — Home is a single locked hero screen
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Header + hero did not fill the viewport, so the page still scrolled into the trust bar and finder.
- **Do NOT:** Let `/` scroll. Do not give the home shell `min-h-screen` with content below the hero in normal flow.
- **Do:** `.home-lock` is `100dvh`, overflow hidden. Hero flexes to fill the remaining space under the header. Page body below the hero is in `.home-lock-rest` (not shown). Find your filter size goes to `/sizes`. Start your clock goes to `/how-often-to-change-air-filter`. Header Filter Clock / How to measure / FAQ / contact hashes go to those pages instead of scrolling a hidden home section.
- **Files:** `client/src/pages/Home.tsx`, `client/src/components/Hero.tsx`, `client/src/components/SiteHeader.tsx`, `client/src/index.css`
- **Verify:** `/` — no vertical scrollbar. Hero and header fill the window. Wheel/trackpad does not move the page.
- **Added:** 2026-08-30

---

### FH-058 — Hero product showcase uses clean pack shots
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Shoppers needed the four filter SKUs in the hero as a product showcase, not a pile or a tray.
- **Do NOT:** Use the banner cutouts (`merv-8.png`, `stack-3.png`, etc.) in the hero. Do not box the four shots in a glass panel or overlap them on the character.
- **Do:** Stage the isolated showcase shots — MERV 8, Carbon, MERV 11, MERV 13 — in their own cells around the CAPE BLOW character. Labels stay under each shot. Hero stays one viewport. `?v=fh058`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/showcase-*.png`
- **Verify:** `/` desktop — character full body in the center; four labeled filters around him, none overlapping. Click a filter → `/sizes/20x25x1`. Mobile — character only.
- **Added:** 2026-08-30

---

### FH-057 — Home hero was a tall scroll region
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The home hero grew past the first screen, so shoppers scrolled through the hero itself.
- **Do NOT:** Give `.hero-cast` a `min-height` taller than the remaining viewport. Do not let the hero stage scroll internally.
- **Do:** Hero fills `100dvh` minus `--site-header-h` (published by `SiteHeader`). Overflow hidden. Rest of the page starts below.
- **Files:** `client/src/components/SiteHeader.tsx`, `client/src/index.css`
- **Verify:** `/` — first screen is header + full hero. Character, headline, and CTAs visible without scrolling the hero. Scroll starts at the trust bar.
- **Added:** 2026-08-30

---

### FH-056 — Hero used a chopped crop instead of the solo character
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The home hero character was a crop from the banner composite. The left half of the body was missing. Shoppers pointed at CAPE BLOW as the standalone figure.
- **Do NOT:** Cut the character out of `TESTING-with-logos.png` for the hero. Do not clip him with `overflow` + `translateX(-50%)` or a tight `max-width`.
- **Do:** Hero art is the full CAPE BLOW figure with white knocked out (`/hero/character.png`). Fit the whole image in the art stage with `object-fit: contain`. `?v=fh056`.
- **Files:** `client/public/hero/character.png`, `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` — full body and cape visible. No vertical cut through the torso.
- **Added:** 2026-08-30

---

### FH-055 — Home hero is character only
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Filter cutouts around the character read as a pile or a boxed tray. Shoppers asked to drop the products and keep the mascot.
- **Do NOT:** Add MERV / carbon / pack shots back onto the home hero art stage.
- **Do:** Hero art is the isolated character only (`/hero/character.png`). Live copy and CTAs stay on the left. `?v=fh055`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` — character stands alone on the right. No filter PNGs in the hero.
- **Added:** 2026-08-30

---

### FH-054 — Hero filters were trapped in a glass tray
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-053 the four filters sat in a dark rounded container under the character. The stack still showed through. Shoppers could not see each product as its own image.
- **Do NOT:** Put hero product cutouts in a card, tray, glass panel, or overlapping pile. Do not cover the character with filters.
- **Do:** Keep each filter as its own image in the art stage — pack, carbon, MERV 11 on the left; MERV 8, MERV 13, 6-pack on the right. Character stays in the open center. No container. `?v=fh054`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — six separate filter shots around the character, none boxed together. Mobile — character only behind the copy.
- **Added:** 2026-08-30

---

### FH-053 — Hero art was a pile of overlapping cutouts
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The live hero stacked MERV 8 / 11 / 13 / carbon PNGs on top of the character. It read as a collage, not a composition.
- **Do NOT:** Absolutely position product cutouts over the character’s torso, cape, or face. Do not float filters at mixed scales around him.
- **Do:** Character stands alone in the art stage. The four products sit in one labeled lineup at the bottom of the art (`hero-lineup`). Hide the lineup on mobile. Assets stay in `client/public/hero/` with `?v=fh053`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — character unobstructed, MERV 8 / Carbon / MERV 11 / MERV 13 in one row with labels. Mobile — character only behind the copy, no product pile.
- **Added:** 2026-08-30

---

### FH-052 — Home hero rebuilt as a live stage, not a painted banner
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The homepage hero was a single painted composite (`hero-banner.webp`). Copy, CTA, logos, and products were locked in one image, so the layout could not change without a new render.
- **Do NOT:** Put the old full-bleed `TESTING-with-logos.png` / `hero-banner.webp` composite back as the desktop hero. Do not bake the headline, tagline, or Shop Now into the artwork.
- **Do:** Keep a live HTML hero (`Hero.tsx`) that uses the isolated pieces from that artwork — character, MERV 8 / 11 / 13 / carbon filters — plus live type, CTAs, and Trane / Carrier / Rheem marks. Assets live in `client/public/hero/` with `?v=fh052`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/`
- **Verify:** `/` — navy split stage, live H1, Find your filter size scrolls to `#finder`, Start your clock scrolls to `#clock`, brand marks go to `/brands/{slug}`. Resize to mobile — character remains, copy overlays the bottom.
- **Added:** 2026-08-30

---

### FH-051 — Leftover Filter King ladders were modeled, not live
- **Status:** mitigated
- **Area:** pricing
- **Symptom:** About 19,540 leftover Filter King size×MERV pages had only estimated ladders. Page-by-page Firecrawl scrape would have needed ~19k credits. Direct fetches hit Cloudflare 403.
- **Do NOT:** Re-scrape those leftover MERV URLs one credit each. Do not treat `/api/sales/prices` as the retail ladder (it is a sale overlay). Do not store `cost_dollars` from Filter King search JSON.
- **Do:** After one Firecrawl browser load, same-origin-fetch each leftover **size hub**. Hub HTML embeds MERV 8/11/13/carbon `prices[]` (qty 1/2/4/6/12 = indexes 0/1/3/5/6). Harvest into `.firecrawl/fk-direct-leftover.json`, then `build_prices_from_local.py`. Catalog leftover scrape list should stay empty until FK adds sizes.
- **Files:** `.firecrawl/harvest_leftover_browser.py`, `.firecrawl/fk-direct-leftover.json`, `.firecrawl/build_prices_from_local.py`, `shared/pricing/fk-live-prices.json`
- **Verify:** `python .firecrawl/_audit_remaining.py` — catalog missing scrape 0; leftover URL file empty. `24x24x2` MERV 11 uses the live `24x24x2n` ladder.
- **Added:** 2026-08-29

---

### FH-050 — Navy FAQ answers were too close to the background
- **Status:** mitigated
- **Area:** seo
- **Symptom:** Size-page FAQ answers and “Measure and confirm size / Get a change date” links used ice (`#8eb0d8`) at 80–85% on navy, so the letters blended into the band.
- **Do NOT:** Put `text-ice`, `text-ice/80`, or `text-ice/85` on FAQ body copy or action links when `tone="band"`. Do not hover navy FAQ help links to ice.
- **Do:** Band FAQ answers, links, subtitle, and help copy stay near-white (`text-white` / `text-white/90`). Action links stay white with an underline so they still read as links.
- **Files:** `client/src/components/FaqSection.tsx`, `client/src/index.css`, `client/src/pages/SizeDetail.tsx`
- **Verify:** `/sizes/20x25x1` FAQ — open Fit and Replacement; answer text and arrows read as white on navy.
- **Added:** 2026-08-26

---

### FH-049 — Official MERV 11 pack shot for every size and pack
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 11 used a stamped MERV 8 6-pack. Pack qty 1 / 2 / 4 / 6 / 12 all still showed that stack.
- **Do NOT:** Point MERV 11 hero, cart, or schema at `merv-11-thin-rectangle-6pack.png`. Do not let `scripts/label-pack-shots.py` overwrite `merv-11-packshot.png`. Do not make a different MERV 11 photo per pack qty.
- **Do:** `packShotSrc(11)` and the MERV 11 gallery hero are `/products/merv-11-packshot.png` for every size and every pack. Keep a copy in `client/public/products/source/`. URLs use `?v=fh049`.
- **Files:** `client/public/products/merv-11-packshot.png`, `shared/products.ts`, `scripts/label-pack-shots.py`, `scripts/verify-store.ts`
- **Verify:** `/sizes/20x25x1?merv=11` — hero is the red MERV 11 single-filter shot; switch qty 1 and 12 — same photo. Cart thumbnail matches. `pnpm exec tsx scripts/verify-store.ts`.
- **Added:** 2026-08-26

---

### FH-048 — Official MERV 13 pack shot for every size and pack
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 13 used a stamped MERV-8 6-pack stack. Pack qty 1 / 2 / 4 / 6 / 12 all still showed that stack.
- **Do NOT:** Point MERV 13 hero, cart, or schema at `merv-13-thin-rectangle-6pack.png`. Do not let `scripts/label-pack-shots.py` overwrite `merv-13-packshot.png`. Do not make a different MERV 13 photo per pack qty.
- **Do:** `packShotSrc(13)` and the MERV 13 gallery hero are `/products/merv-13-packshot.png` for every size and every pack. Keep a copy in `client/public/products/source/`. Pack-shot URLs share `?v=fh050`.
- **Files:** `client/public/products/merv-13-packshot.png`, `shared/products.ts`, `scripts/label-pack-shots.py`, `scripts/verify-store.ts`
- **Verify:** `/sizes/20x25x1?merv=13` — hero is the orange MERV 13 single-filter shot; switch qty 1 and 12 — same photo. Cart thumbnail matches. `pnpm exec tsx scripts/verify-store.ts`.
- **Added:** 2026-08-26

---

### FH-047 — Official MERV 8 pack shot for every size and pack
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 8 used a 6-pack stack photo. Pack qty 1 / 2 / 4 / 6 / 12 all still showed that stack.
- **Do NOT:** Point MERV 8 hero, cart, or schema at `merv-8-thin-rectangle-6pack.png`. Do not let `scripts/label-pack-shots.py` overwrite `merv-8-packshot.png`. Do not make a different MERV 8 photo per pack qty.
- **Do:** `packShotSrc(8)` and the MERV 8 gallery hero are `/products/merv-8-packshot.png` for every size and every pack. Keep a copy in `client/public/products/source/`. URLs use `?v=fh047`.
- **Files:** `client/public/products/merv-8-packshot.png`, `shared/products.ts`, `scripts/label-pack-shots.py`, `scripts/verify-store.ts`
- **Verify:** `/sizes/20x25x1` MERV 8 — hero is the single-filter shot; switch qty 1 and 12 — same photo. Cart thumbnail matches. `pnpm exec tsx scripts/verify-store.ts`.
- **Added:** 2026-08-26

---

### FH-046 — Every MERV 8 size used the raw Filter King 6-pack
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Every MERV 8 size page showed the same source 6-pack with MERV 8 printed on every stack edge (and the standing-filter side). 11 / 13 / carbon had side print covered; MERV 8 did not.
- **Do NOT:** Point the shop at `client/public/products/source/merv-8-thin-rectangle-6pack.png`. Do not overwrite those source files. Do not stamp a vertical MERV badge on the stack.
- **Do:** Shop MERV 8 6-pack / 3/4 are generated: front Filter King MERV 8 label stays, stack-edge MERV 8 is cardboard. Rebuild with `python scripts/label-pack-shots.py`. Pack-shot URLs use `?v=fh046` so stale MERV 8 files are not cached. We still have only one MERV 8 photo — sizes share it until real photography lands.
- **Files:** `scripts/label-pack-shots.py`, `client/public/products/source/`, `client/public/products/merv-8-thin-rectangle-*.png`, `shared/products.ts`
- **Verify:** `/sizes/20x25x1` MERV 8 — front still says MERV 8, stack edges do not. Source folder unchanged. `python scripts/label-pack-shots.py`; `pnpm exec tsx scripts/verify-store.ts`.
- **Added:** 2026-08-26

---

### FH-045 — Pack shots had a vertical MERV plate on the stack
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 11 / 13 / carbon 6-packs and 3/4 views showed a gray strip plus a colored “MERV 11 ADVANCED” / “MERV 13 ULTIMATE” / “MERV 8 CARBON” badge on the filter stack edge.
- **Do NOT:** Stamp `vertical_plate` (or any rating badge) on pack-shot sides. Do not leave the original printed MERV 8 on 11 / 13 / carbon sides either.
- **Do:** Front face can keep a MERV plate so the box matches the chosen rating. Side print is covered with cardboard in `scripts/label-pack-shots.py` — never a vertical MERV badge. Rebuild with `python scripts/label-pack-shots.py`.
- **Files:** `scripts/label-pack-shots.py`, `client/public/products/merv-{11,13,carbon}-thin-rectangle-*.png`, `docs/ISSUES-AND-FIXES.md`
- **Verify:** `/sizes/30x30x1` pack and 3/4 thumbs — stack edges have no colored MERV badge. MERV 8 original 6-pack is unchanged. `python scripts/label-pack-shots.py` (asserts no side badge).
- **Added:** 2026-08-26

---

### FH-044 — Pack shot said MERV 8 on every size page
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Size pages and the cart used one Filter King MERV 8 6-pack photo. Choosing MERV 11 or 13 still showed a MERV 8 box (e.g. `/sizes/30x30x1`).
- **Do NOT:** Point every rating at `/products/merv-8-thin-rectangle-6pack.png`. Do not delete the MERV 8 source photos.
- **Do:** Hero, thumbs, cart, and product schema use `packShotSrc` / `productGalleryFor` for that MERV. Rebuild stamped 11 / 13 / carbon shots with `python scripts/label-pack-shots.py`. Keep MERV 8 source photos; stamped plates stay until real 11 / 13 / carbon photography lands.
- **Files:** `shared/products.ts`, `scripts/label-pack-shots.py`, `client/public/products/merv-*-thin-rectangle-*.png`, `client/src/pages/SizeDetail.tsx`, `client/src/components/CartDrawer.tsx`, `shared/seo.ts`, `scripts/verify-store.ts`
- **Verify:** `/sizes/30x30x1` — MERV 11 pack says MERV 11; switch to MERV 13; cart thumbnail matches. `pnpm exec tsx scripts/verify-store.ts`.
- **Added:** 2026-08-26

---

### FH-043 — Shop listed SKUs with no wholesale cost
- **Status:** mitigated
- **Area:** catalog
- **Symptom:** The storefront sold every Filter King size × MERV (including carbon and sizes like 20x25x4) even though only Paul Sellaro’s 2025 dealer sheet can be supplied.
- **Do NOT:** Delete `shared/filter-catalog.json`, carbon MERV types, pricing ladders, or featured-size archives. Do not flip `SELLABLE_ONLY` back to false until new wholesale costs are on the sheet.
- **Do:** Live shop = `shared/sellable-skus.json` only (299 size × MERV lines / 182 sizes). Unsold sizes keep routing to the quote form. Checkout and cart refuse `inStock: false`. Rebuild the allowlist with `scripts/build-sellable-skus.ts` when the sheet grows.
- **Files:** `shared/products.ts`, `shared/sellable-skus.json`, `scripts/build-sellable-skus.ts`, `scripts/verify-store.ts`, size/finder/SEO/cart surfaces
- **Verify:** `pnpm exec tsx scripts/verify-store.ts`; shop `/sizes/20x25x1` (MERV 8/11/13 only); `/sizes/20x25x4` and `/sizes/14x25x1?merv=11` must not sell; `/sizes` lists 182 sizes.
- **Added:** 2026-08-26

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
