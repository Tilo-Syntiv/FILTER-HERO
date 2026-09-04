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

Next id: **FH-163**

---

### FH-162 — MERV 8 Carbon cooking photo cropped the pot out
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-161 the family-of-four photo sat in the same `h-28` strip as the other catch cards. `object-cover` kept faces and steam and cut the pot, spoon, and food — shoppers could not see them cooking.
- **Do NOT:** Force `LIFE.familyCooking` through the short 2.6:1 header. Do not rely on `object-position` to reveal a square source in `h-28`.
- **Do:** Keep a 4:3 people-and-pot crop on `/life/family-cooking.jpg`. Give only the carbon tile `aspect-[4/3]` so the pot stays in frame.
- **Files:** `client/src/data/life-photos.ts`, `client/src/components/MervCarousel.tsx`, `client/public/life/family-cooking.jpg`
- **Verify:** Homepage `#merv` MERV 8 Carbon card — pot, steam, and all four people visible.
- **Added:** 2026-09-04

### FH-161 — MERV 8 Carbon catch card used the pizza-topping kitchen photo
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The MERV 8 Carbon tile in What should your filter catch? showed a woman and two children topping a pizza. The shopper-supplied family-of-four cooking photo belongs in that card slot, cropped so faces stay readable in the short header.
- **Do NOT:** Swap `LIFE.cookingWithLove` globally. Do not drop a square source into `object-cover` without a landscape people crop.
- **Do:** Keep a dedicated `LIFE.familyCooking` (`/life/family-cooking.jpg`, ~2.6:1 faces-and-steam crop) and point only `MervCarousel` HOME_PICKS key `carbon` at it.
- **Files:** `client/src/data/life-photos.ts`, `client/src/components/MervCarousel.tsx`, `client/public/life/family-cooking.jpg`
- **Verify:** Homepage `#merv` MERV 8 Carbon card header.
- **Added:** 2026-09-04

### FH-160 — Flyer grew off-screen; last pose was not the logo
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The live Seedance clip ended with the mascot filling the hero height (head and feet cropped). The last pose was not the Filter Hero logo flyer (profile right, leading fist, tucked knee, cape streaming left with filter-grid lining).
- **Do NOT:** Shrink the live `<video>` with `transform: scale(<1)` — that boxes the plate (FH-154–158). Do not swap the Seedance flight for a pose-sprite wander. Do not use `nav-icon.png` as the end pose.
- **Do:** Keep the clip full-bleed (`inset: 0` / `object-fit: cover`). Compose Seedance onto 4K navy at ~52% plate width so he stays in frame, feather and match Seedance navy so the inset does not read as a rectangle, then crossfade/hold the `logo.png` flyer cutout. Cache `?v=fh160`.
- **Files:** `client/public/hero/character-fly-natural.mp4`, `client/public/hero/character-fly-natural.webm`, `client/public/hero/character-fly-still.png`, `client/src/components/Hero.tsx`, `scripts/_compose_hero_fly_logo_end.py`
- **Verify:** Homepage hero — flyer stays on-screen for the whole loop; last hold is the logo pose; no square around the plate.
- **Added:** 2026-09-04

---

### FH-159 — Fly clip still read as a boxed plate inside the lineup
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-158 the video still sat in `.hero-character-slot` inside the lineup, so it could letterbox as a 16:9 square on the CSS navy.
- **Do NOT:** Nest the live fly clip in `.hero-lineup` / a sized slot. Do not scale the plate below 1.
- **Do:** Mount `HeroCharacter` as `.hero-sky-fill` on the stage — `position: absolute; inset: 0; object-fit: cover`. Stage fallback is `#1a2f50`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** Homepage hero — navy video is the full stage. No rectangle around the flyer.
- **Added:** 2026-09-04

---

### FH-158 — Scaled fly plate showed a square in the navy
- **Status:** mitigated
- **Area:** photos
- **Symptom:** FH-154–157 shrank the whole video with `scale(0.78–0.9)`, so the 16:9 plate sat as a rectangle on the hero navy.
- **Do NOT:** Scale `.hero-character` below 1 to shrink the mascot. That boxes the clip. Do not bring back the masked 37% slot.
- **Do:** Video and still stay `inset: 0` / `object-fit: cover` with no transform, so the navy plate is the stage.
- **Files:** `client/src/index.css`
- **Verify:** Homepage hero — no square edge around the fly clip. Stage navy is the video.
- **Added:** 2026-09-04

---

### FH-157 — Hero flyer still a tad large after FH-156
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After `scale(0.84)` the mascot still read a bit big on the full-bleed plate.
- **Do NOT:** Bring back the boxed slot, mask, or drop-shadow. Do not jump from 0.78 to a much smaller scale.
- **Do:** Keep the plate full-bleed. Flyer scale is `0.78`.
- **Files:** `client/src/index.css`
- **Verify:** Homepage hero — same Seedance clip, slightly smaller than FH-156.
- **Added:** 2026-09-04

---

### FH-156 — Hero flyer still a tad large after FH-154
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After the 4K full-bleed plate, `scale(0.9)` still read a bit big against the copy and packs.
- **Do NOT:** Bring back the boxed slot, mask, or drop-shadow. Do not jump from 0.84 to a much smaller scale.
- **Do:** Keep the plate full-bleed. Flyer scale is `0.84`.
- **Files:** `client/src/index.css`
- **Verify:** Homepage hero — same Seedance clip, slightly smaller than FH-154, no square plate edge.
- **Added:** 2026-09-04

---

### FH-155 — Hero fly plate was 720p on a full-bleed stage
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The live Seedance clip and poster were 1280×720, so the full-bleed hero looked soft on large screens.
- **Do NOT:** Drop the live files back to 720p. Do not swap the clip or change the flight.
- **Do:** Serve `character-fly-natural` mp4/webm and `character-fly-still.png` at 3840×2160. Cache `?v=fh155`.
- **Files:** `client/public/hero/character-fly-natural.mp4`, `client/public/hero/character-fly-natural.webm`, `client/public/hero/character-fly-still.png`, `client/src/components/Hero.tsx`
- **Verify:** Homepage hero — same Seedance motion, 4K sources in the network panel.
- **Added:** 2026-09-04

---

### FH-154 — Hero flyer read a notch too large on the full-bleed plate
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-153 the Seedance plate filled the stage, so the mascot read a bit big against the copy and packs.
- **Do NOT:** Bring back the boxed 37% / 72% slot, radial mask, or drop-shadow. Do not jump down more than a tad (this pass is `scale(0.9)`).
- **Do:** Keep the plate full-bleed. Shrink the flyer only with a centered scale on `.hero-character`.
- **Files:** `client/src/index.css`
- **Verify:** Homepage hero — same Seedance clip, slightly smaller character, no square plate edge.
- **Added:** 2026-09-03

---

### FH-153 — Hero fly plate sat in a boxed slot
- **Status:** mitigated
- **Area:** photos
- **Symptom:** `.hero-character-slot` was a receded rectangle (mask + drop-shadow), so the live fly clip read as a square card in the navy. A pose-composited wander plate was tried and rejected — keep the FH-152 Seedance clip.
- **Do NOT:** Box the flyer in a 37% / 72% slot, radial mask, or drop-shadow that outlines a plate. Do not swap the live mascot to the pose-sprite compose plate.
- **Do:** Full-bleed the FH-152 Seedance plate (`object-fit: cover`, `inset: 0`). Cache `?v=fh154`. Reduced motion uses `character-fly-still.png`.
- **Files:** `client/public/hero/character-fly-natural.mp4`, `client/public/hero/character-fly-natural.webm`, `client/public/hero/character-fly-still.png`, `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** Homepage hero — Seedance flyer, video fills the stage with no square edge. Copy and packs stay readable.
- **Added:** 2026-09-03

---

### FH-152 — Hero fly clip had a ghost second cape and locked-pose motion
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The FH-149 Seedance plate copied the old Veo lock-pose path and sometimes showed a second plaided cape. Shoppers need one sheet-accurate flyer on the same navy, with new entertaining travel (circle, cross, climb, dive) and no extra FX or costume pieces.
- **Do NOT:** Drive the live mascot from the old Veo warehouse clip. Do not add a second cape, extra horns, logos, particles, trails, or speed lines. Do not remount the pose-sprite sky rig while this plate is live.
- **Do:** Loop the 15s Seedance omni_reference plate from the latest three-panel sheet + clean navy still. One navy cape (grid only on the hem). Background stays `#1b3258` → `#23406a`. Cache `?v=fh152`.
- **Files:** `client/public/hero/character-fly-natural.mp4`, `client/public/hero/character-fly-natural.webm`, `client/public/hero/character-fly-still.png`, `client/src/components/Hero.tsx`
- **Verify:** Homepage hero — sheet costume, one cape, navy sky never changes, he circles then crosses then climbs and dives. `prefers-reduced-motion` shows the still.
- **Added:** 2026-09-03

---

### FH-151 — Hero flyer still a touch large after FH-150
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-150 the mascot was better but still a bit big in the middle lane.
- **Do NOT:** Jump back to FH-150 slot size (mobile 78% / 12% inset, desktop 40% × 84%).
- **Do:** Keep a small further shrink — mobile ~72% height with 14% side inset; desktop ~37% width and 78% height.
- **Files:** `client/src/index.css`
- **Verify:** Homepage hero. Noticeably smaller than FH-150, not a big drop.
- **Added:** 2026-09-03

---

### FH-150 — Hero flyer sat too large in the middle lane
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-149 the new navy fly plate filled most of the hero slot, so the mascot read too big against the copy and packs.
- **Do NOT:** Stretch `.hero-character-slot` back to full-bleed height / ~48% desktop width.
- **Do:** Keep the plate receded and a notch smaller — mobile ~78% height with 12% side inset; desktop ~40% width and 84% height.
- **Files:** `client/src/index.css`
- **Verify:** Homepage hero. Character is smaller than FH-149 but still readable in the middle lane.
- **Added:** 2026-09-03

---

### FH-149 — Hero fly clip used the old sheet and baked-in particle effects
- **Status:** mitigated
- **Area:** photos
- **Symptom:** `character-fly-natural.mp4` was the first Veo loop: old costume, warehouse beams, dust/sparkle trails. The latest V-abdomen character sheet and the site navy (`#1b3258` → `#23406a`) belong on that plate, with the original flight motion only.
- **Do NOT:** Restore the particle/sparkle/warehouse Veo as the hero source. Do not drive the live mascot with the pose-sprite sky rig while this plate is mounted.
- **Do:** Loop `character-fly-natural.webm` / `.mp4` from the latest sheet still. Poster and reduced-motion still are `character-fly-still.png`. Keep him receded in the middle lane so the navy plate blends into `.hero-cast-stage`.
- **Files:** `client/public/hero/character-fly-natural.mp4`, `client/public/hero/character-fly-natural.webm`, `client/public/hero/character-fly-still.png`, `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** Homepage hero — new sheet character flies on navy, no sparkles/dust. `prefers-reduced-motion` shows the still.
- **Added:** 2026-09-03

---

### FH-148 — MERV 8 Carbon catch card had no cooking photo
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-144 the odor card had no header image. The shopper-supplied kitchen shot (`E:\FILTER HEROE\PICS\cooking with love.jpeg`) belongs in that slot.
- **Do NOT:** Put `LIFE.womanPets` on carbon. Do not leave the carbon HOME_PICKS photo empty.
- **Do:** Keep a dedicated `LIFE.cookingWithLove` (`/life/cooking-with-love.jpg`) and point only `MervCarousel` HOME_PICKS key `carbon` at it.
- **Files:** `client/src/data/life-photos.ts`, `client/src/components/MervCarousel.tsx`, `client/public/life/cooking-with-love.jpg`
- **Verify:** Homepage `#merv` MERV 8 Carbon card header shows the woman and kids making pizza.
- **Added:** 2026-09-03

---

### FH-147 — Hero flyer vanished after the pose-machine swap
- **Status:** mitigated
- **Area:** other
- **Symptom:** After FH-146 the mascot was gone. The rig sat at 0,0 under the copy wash, the first path point started off-canvas, and a 0×0 absolute rig plus a pause-on-unseen observer could skip drawing.
- **Do NOT:** Park the flyer at the top-left of `.hero-copy`. Do not start the loop at a negative X. Do not leave `.hero-sky-rig` sizeless with both frames at opacity 0.
- **Do:** Keep a CSS fallback in the open sky. Paths stay on-stage. JS zeros `left/top` then translates. Opacity stays readable. Slot `z-index` 4, still under copy/packs.
- **Files:** `client/src/lib/hero-sky-flight.ts`, `client/src/components/HeroSkyFlight.tsx`, `client/src/index.css`
- **Verify:** Homepage hero shows the flyer immediately, then he moves through the sky.
- **Added:** 2026-09-03

### FH-146 — Hero flyer was still one locked pose on a path
- **Status:** mitigated
- **Area:** other
- **Symptom:** After FH-142 he still read as a sticker: one silhouette, slight cape warp, dragged along a spline.
- **Do NOT:** Translate or rotate a single fly PNG / 8-frame cape sheet and call it flying.
- **Do:** Switch distinct drawings — cruise, stroke, climb, dive, bank — from heading and turn rate. Crossfade. Flip for leftward travel. Only a small extra pitch. Keep him receded behind copy and packs.
- **Files:** `client/src/lib/hero-sky-flight.ts`, `client/src/components/HeroSkyFlight.tsx`, `client/src/index.css`, `client/public/hero/fly-poses/`
- **Verify:** Homepage hero. Level flight alternates cruise/stroke. Climbs and dives change the silhouette. Circles use the bank pose.
- **Added:** 2026-09-03

### FH-145 — Hero stage used a darker blue than the rest of the site
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The homepage hero sat on midnight `#122240` / `#162848`, so it did not match the header, footer, trust marquee, or brand-band navy (`#1b3258` → `#23406a`).
- **Do NOT:** Put `#122240`, `#162848`, or a near-black `#0a101e` wash back on `.hero-stage` / `.hero-cast-stage`. Do not add a bright ice/white center glow that reads as a different blue.
- **Do:** Hero stage uses the same navy as `.site-header` / `.site-footer` (`#1b3258` → `--navy` `#203868` → `#23406a`). Atmosphere stays subtle. Copy overlays stay in that navy, not midnight.
- **Files:** `client/src/index.css`
- **Verify:** `/` — hero sky matches the header above it and the trust / brand bands below. Other pages' `.brand-band` heroes unchanged.
- **Added:** 2026-09-03

---

### FH-144 — MERV 8 Carbon catch card showed the woman-with-pets photo
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The MERV 8 Carbon tile in What should your filter catch? opened with `/life/woman-pets.jpg` (woman hugging a dog and cat). Copy said cooking / odors, so the photo read as the wrong scene.
- **Do NOT:** Put `LIFE.womanPets` back on the carbon HOME_PICKS slot.
- **Do:** Carbon uses `LIFE.cookingWithLove` (FH-148). `LIFE.womanPets` stays on Family Air as the pets inset.
- **Files:** `client/src/components/MervCarousel.tsx`
- **Verify:** Homepage `#merv` MERV 8 Carbon card has no woman photo at the top.
- **Added:** 2026-09-03

---

### FH-143 — MERV 11 catch card used the sleeping cat-and-dog photo
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The MERV 11 tile in What should your filter catch? showed a sleeping golden dog and orange cat. The shopper-supplied doorway pair (terrier + Yorkie) belongs in that card slot.
- **Do NOT:** Swap `LIFE.petsSleep` globally. Family Air and the filter-change guide still use the sleeping pair.
- **Do:** Keep a dedicated `LIFE.petsDoorway` (`/life/pets-doorway.jpg`) and point only `MervCarousel` HOME_PICKS key `11` at it.
- **Files:** `client/src/data/life-photos.ts`, `client/src/components/MervCarousel.tsx`, `client/public/life/pets-doorway.jpg`
- **Verify:** Homepage `#merv` MERV 11 card header. Other pets photos unchanged.
- **Added:** 2026-09-03

### FH-142 — Hero flyer looked dragged because the pose never flew
- **Status:** mitigated
- **Area:** other
- **Symptom:** After FH-141 the vector sat in one flying pose and was translated along a path. He read as a sticker being pulled, not a body flying.
- **Do NOT:** Keep him screen-upright with a horizontal flip. Do not ease each beat to a stop. Do not drive the hero with a single still PNG.
- **Do:** Point the artwork along the velocity (head leads, `ART_PITCH` offset). Cycle the cape/limb sheet. Keep path timing linear and add a stroke heave perpendicular to the heading.
- **Files:** `client/src/lib/hero-sky-flight.ts`, `client/src/components/HeroSkyFlight.tsx`, `client/src/index.css`, `client/public/hero/character-sky-fly-cycle.png`
- **Verify:** Homepage hero. On a circle or figure-eight his nose follows the turn; cape and legs keep cycling.
- **Added:** 2026-09-03

### FH-141 — Hero character sat planted instead of flying the sky
- **Status:** mitigated
- **Area:** other
- **Symptom:** The homepage hero used an in-place `character-fly-natural` loop in the middle lane. He read as a foreground plate, not a receded mascot flying the navy sky.
- **Do NOT:** Plant a full-height video/still in `.hero-character-slot`. Do not remount the unused pack-presenting `HeroFlight` sales choreography on top of copy and MERV tiles.
- **Do:** Fly the transparent vector cutout (`character-sky-fly.png`) on a long background loop — crosses, ovals, weaves, figure-eight — behind copy (`z-index` 6) and packs. Keep him small and dim, and park a still when `prefers-reduced-motion` is on.
- **Files:** `client/src/components/Hero.tsx`, `client/src/components/HeroSkyFlight.tsx`, `client/src/lib/hero-sky-flight.ts`, `client/src/index.css`, `client/public/hero/character-sky-fly.png`
- **Verify:** Homepage hero, desktop and mobile. Copy and packs stay readable while he crosses and circles in the sky.
- **Added:** 2026-09-03

### FH-140 — Brand model/OEM search always opened /sizes, even off-catalog
- **Status:** mitigated
- **Area:** brands
- **Symptom:** Search hits in Shop by brand always linked to `/sizes/{slug}`. Brand detail size/model/OEM chips already sent off-catalog sizes to `/custom-air-filters?size=`. In wholesale mode those search hits landed on the quote empty-state PDP instead of the custom quote form.
- **Do NOT:** Hardcode `/sizes/` for brand codes. Do not skip `getFilterSize` / `shopOrQuotePath`.
- **Do:** One helper, `shopOrQuotePath(size)`, for brand search, brand chips, the finder, and the header finder. Shoppable → PDP. Not shoppable → custom quote with the size prefilled.
- **Files:** `client/src/lib/filter-size.ts`, `client/src/components/BrandDirectory.tsx`, `client/src/pages/BrandBrowse.tsx`, `client/src/components/FilterFinder.tsx`, `client/src/components/SiteHeader.tsx`
- **Verify:** `/brands` search `FC100` opens a size or custom-quote page. `pnpm exec tsx scripts/smoke-site.ts`.
- **Added:** 2026-09-01

---

### FH-139 — Checkout 400 when Stripe Tax had no head office
- **Status:** mitigated
- **Area:** cart
- **Symptom:** `checkout.sessions.create` with `automatic_tax.enabled=true` returned 400: “You must have a valid head office address to enable automatic tax calculation.” Cart checkout failed for every shopper.
- **Do NOT:** Force `automatic_tax.enabled=true` while Tax Settings `status` is `pending`.
- **Do:** Read Tax Settings first. Enable automatic tax only when status is `active`. Checkout still creates Customer + Invoice. After the Dashboard head office is set, the next session turns tax on with no deploy.
- **Files:** `server/stripe.ts`, `scripts/debug-stripe-checkout.ts`, `docs/STRIPE-BOOKS.md`
- **Verify:** `pnpm exec tsx scripts/debug-stripe-checkout.ts` — session creates; `automatic_tax` is off until head office exists.
- **Added:** 2026-09-01

---

### FH-138 — Match FilterBuy on confirmed cheaper 2-inch / 4-inch rungs
- **Status:** mitigated
- **Area:** pricing
- **Symptom:** After FH-136, Filtrete-gap 2-inch and 4-inch rungs stayed on Filter King × 0.90. FilterBuy’s Sep 1, 2026 10% sale (ends Sep 7) was cheaper on those singles and some packs.
- **Do NOT:** Stamp FilterBuy across sizes or MERVs we did not scrape. Do not match HDX. Do not undercut FilterBuy another 10%. Do not invent 16x25x2 MERV 13, 16x20x2 MERV 13, or 20x25x4 MERV 13 tickets — FilterBuy is not cheaper there.
- **Do:** `FILTERBUY_PACKS` holds only confirmed cheaper FilterBuy sale units. `liveUnitPrice` = min(existing Hero, FilterBuy) on those rungs. 6-packs that already beat FilterBuy stay on Filter King.
- **Files:** `shared/pricing/engine.ts`, `shared/products.ts`, `scripts/verify-store.ts`, `docs/WHOLESALE-PRICE-LISTS.md`
- **Verify:** `pnpm exec tsx scripts/verify-store.ts` — 20x25x4 MERV 8 qty 1 === 30.59; 20x25x2 MERV 8 qty 1 === 24.29; 16x25x4 MERV 8 qty 6 === 14.39; 20x25x4 MERV 8 qty 6 === 14.91; 20x25x4 MERV 13 qty 1 === 39.95.
- **Added:** 2026-09-01

---

### FH-137 — Filtrete-gap rungs: cheapest peer is FilterBuy; HDX undercuts MERV 8 store-brand
- **Status:** mitigated
- **Area:** pricing
- **Symptom:** Rungs with no Filtrete listing still use Filter King × 0.90. Live Sep 1, 2026 research: FilterBuy (10% sale through Sep 7) beats Hero on several 2-inch and 4-inch qty-1 tickets. HDX MERV 8 at Home Depot is $3.50–$5.98 and sits near or below wholesale — not the same pleat. Do not invent Filtrete packs.
- **Do NOT:** Stamp FilterBuy or HDX tickets across sizes we did not scrape. Do not match HDX 3-packs we do not sell.
- **Do:** If we match the cheapest true peer, add confirmed FilterBuy rungs the same way as `FILTRETE_PACKS`. Keep HDX as a separate store-brand compare. FilterBuy match landed as FH-138.
- **Files:** `docs/ISSUES-AND-FIXES.md`, `shared/pricing/engine.ts`
- **Verify:** FilterBuy 20x25x4 / 14x25x1 / 20x25x2 hubs; Home Depot HDX 14x25x1 and 20x30x1.
- **Added:** 2026-09-01

---

### FH-136 — Match the cheaper of Filtrete and Filter King on compared rungs
- **Status:** mitigated
- **Area:** pricing
- **Symptom:** Hero undercut Filter King by 10% even on rungs where Filter King was already cheaper than Filtrete, and stayed under Filtrete’s Office Depot 12-pack on 16x25x1 MERV 8.
- **Do NOT:** Invent Filtrete multi-packs. Do not apply the 10% undercut on a rung that already has both a Filtrete listing and a Filter King listing. Do not drop `FILTRETE_1INCH_QTY1`.
- **Do:** `liveUnitPrice` = `min(Filtrete, Filter King)` when both exist. Otherwise 1-inch qty 1 = Filtrete; other rungs = Filter King × 0.90 (× 0.88 if modeled), capped at the Filtrete single.
- **Files:** `shared/pricing/engine.ts`, `shared/products.ts`, `scripts/verify-store.ts`, `docs/WHOLESALE-PRICE-LISTS.md`
- **Verify:** `pnpm exec tsx scripts/verify-store.ts` — 20x25x1 MERV 8 qty 6 === 7.49; 16x25x1 MERV 8 qty 12 === 5.83; 20x25x1 MERV 13 qty 2 === 17.76; 14x25x1 MERV 11 qty 2 === 13.49.
- **Added:** 2026-09-01

---

### FH-135 — Full-catalog Filtrete match still leaves pack, MERV, and thick-size gaps
- **Status:** open
- **Area:** pricing
- **Symptom:** After FH-134, every 1-inch qty 1 (8 / 11 / 13 / carbon) matches a Filtrete 1-pack. Shoppers still see: (1) 253 pack rungs where a bigger pack costs more per filter (102 of those are carbon qty 4 cheaper than qty 6, copied from Filter King); (2) 815 size × qty cells where a higher MERV is cheaper; (3) Filtrete MERV 11 2-pack $11.00 only on five sizes — 9,376 other 1-inch MERV 11 stay at $13.49 at qty 2; (4) 2" / 4" / 5" / 0.5" (2,308 SKUs) have no Filtrete table, so they stay on Filter King × 0.90; (5) carbon is Filter King MERV 8 Carbon priced to Filtrete MERV 11 odor; (6) off-sheet SKUs, including all carbon, have no wholesale cost.
- **Do NOT:** Invent Filtrete 4-inch or 2-pack tickets. Do not expand `FILTRETE_BEAT` beyond confirmed scrapes. Do not flatten pack inversions by raising cheap rungs without a new rule.
- **Do:** Keep 1-inch qty 1 on `FILTRETE_1INCH_QTY1`. Add a Filtrete-beat row only when a live Filtrete multi-pack still undercuts us. Thick sizes stay on the Filter King undercut unless a confirmed FilterBuy ticket is cheaper (FH-138).
- **Files:** `shared/pricing/engine.ts`, `docs/WHOLESALE-PRICE-LISTS.md`
- **Verify:** Canvas `filtrete-match-gaps.canvas.tsx`. `pnpm exec tsx scripts/verify-store.ts`.
- **Added:** 2026-09-01

---

### FH-134 — 1-inch carbon qty 1 did not match Filtrete odor
- **Status:** mitigated
- **Area:** pricing
- **Symptom:** Full catalog put MERV 8 Carbon on sale, but `filtreteQty1` returned undefined for carbon, so qty 1 was Filter King × 0.90 (~$37.40 on 20x25x1) instead of Filtrete Allergen Defense Odor Reduction $16.70.
- **Do NOT:** Drop carbon from `FILTRETE_1INCH_QTY1`. Do not treat Filtrete odor as MERV 8. Do not invent a carbon 2-pack beat without a scrape.
- **Do:** 1-inch carbon qty 1 = Lowe’s Filtrete odor 1-pack $16.70 (same flat-ticket rule as MERV 8 / 11 / 13). Multi-packs stay on the Filter King undercut, capped at that single.
- **Files:** `shared/pricing/engine.ts`, `shared/products.ts`, `scripts/verify-store.ts`, `docs/WHOLESALE-PRICE-LISTS.md`
- **Verify:** `pnpm exec tsx scripts/verify-store.ts` — 20x25x1 and 20x20x1 carbon qty 1 === 16.70; carbon 6-pack ≤ 16.70.
- **Added:** 2026-09-01

---

### FH-133 — Full Filter King catalog stayed behind a code flag the .env did not read
- **Status:** mitigated
- **Area:** catalog
- **Symptom:** `.env` already had `VITE_FULL_CATALOG=true`, but the shop still sold only the 299 wholesale-sheet SKUs. `SELLABLE_ONLY` was hardcoded `true` in `shared/products.ts`, so carbon, 20x25x4, and off-sheet MERVs stayed quote-only.
- **Do NOT:** Hardcode `SELLABLE_ONLY = true`. Do not ignore `VITE_FULL_CATALOG` / `FULL_CATALOG`. Do not delete `shared/filter-catalog.json` or `shared/sellable-skus.json`.
- **Do:** `VITE_FULL_CATALOG=true` (and `FULL_CATALOG=true` for the API) sells every archived size × MERV, including carbon. `false` restores the wholesale allowlist. Checkout still refuses `inStock: false`.
- **Files:** `shared/products.ts`, `.env.example`, `scripts/verify-store.ts`, `shared/seo.ts`, `client/public/llms.txt`, `docs/WHOLESALE-PRICE-LISTS.md`
- **Verify:** `pnpm exec tsx scripts/verify-store.ts`. `/sizes/20x25x4` and `/sizes/20x25x1?merv=carbon` add to cart. `/#merv` Carbon card shows `from $`.
- **Added:** 2026-09-01

---

### FH-132 — Checkout collected no sales tax and no Stripe customer
- **Status:** mitigated
- **Area:** cart
- **Symptom:** Payment-mode Checkout had line items and a US address but no `automatic_tax`, no product tax code, and no Customer/Invoice. QBO/Stripe Connector had nothing to attach; catalog prices never grew tax.
- **Do NOT:** Drop `customer_creation: "always"`, `invoice_creation`, exclusive `tax_behavior`, or `txcd_99999999` on filter line items. Do not invent a different `txcd_` without Stripe’s tax-code list. Do not force `automatic_tax` on while Tax Settings are pending (FH-139).
- **Do:** Enable `automatic_tax` when Tax Settings are `active`. Persist subtotal/tax/customer/invoice/payment_intent on `orders.json`. Head office + registrations still happen in the Dashboard.
- **Files:** `server/stripe.ts`, `shared/stripe-tax.ts`, `client/src/pages/CheckoutSuccess.tsx`, `docs/STRIPE-BOOKS.md`, `scripts/verify-stripe-books.ts`
- **Verify:** `pnpm exec tsx scripts/verify-stripe-books.ts`. Start checkout — Stripe Customer is created; tax line appears only after Tax Settings are active and a registration exists for the ship-to state.
- **Added:** 2026-09-01

---

### FH-131 — Filter Clock must not send replacement emails before a purchase
- **Status:** mitigated
- **Area:** clock
- **Symptom:** Clock copy promised “we’ll email you before {date}” when someone only checked or saved a cadence. Replenish mail must not start until they buy.
- **Do NOT:** Enroll `replenish` (or any send) from Filter Clock check, house-profile save, or `Signed Up Reminder` / `intent: "reminder"` without `Placed Order`.
- **Do:** Clock is a calculator. Store cadence on the profile if they save it. Set the sendable `next_change_date` and enroll replenish only on `Placed Order` (`paid_at + interval`). Copy must say emails start after checkout.
- **Files:** `docs/KLAVIYO-REPLICA-PLAN.md`, `client/src/components/FilterPower.tsx`
- **Verify:** Clock save / check produces no customer replenish mail. A paid order does.
- **Added:** 2026-09-01

---

### FH-130 — Stale public robots.txt and llms.txt lagged the server
- **Status:** mitigated
- **Area:** seo
- **Symptom:** `client/public/robots.txt` omitted AI crawler rules the Express route already allowed. Static `llms.txt` said carbon had bulk pricing after carbon became quote-only.
- **Do NOT:** Let the copied public files contradict `shared/seo.ts` / `server/index.ts`.
- **Do:** Keep static copies aligned with the server generators (AI bots allowed; carbon quote-only). Prefer the Express routes in production.
- **Files:** `client/public/robots.txt`, `client/public/llms.txt`, `server/index.ts`, `shared/seo.ts`
- **Verify:** `/robots.txt` and `/llms.txt` via the API server; `vite preview` still has matching static files.
- **Added:** 2026-08-31

---

### FH-129 — SPA navigation dropped `og:type=article`
- **Status:** mitigated
- **Area:** seo
- **Symptom:** Filter Change Guide is an article in SSR, but client `useSeo` always set `og:type` to `website` unless the page was a product.
- **Do NOT:** Map only `product` vs everything-else-as-website.
- **Do:** Pass through `article` as `og:type=article`.
- **Files:** `client/src/hooks/useSeo.ts`
- **Verify:** `/how-often-to-change-air-filter` — document head `og:type` is `article`.
- **Added:** 2026-08-31

---

### FH-128 — Unsellable cart lines vanished on reload with no notice
- **Status:** mitigated
- **Area:** cart
- **Symptom:** `normalizeCart()` dropped SKUs that were no longer `inStock` (carbon, delisted wholesale) on hydrate. Shoppers saw a smaller cart and no explanation.
- **Do NOT:** Silently omit those lines on `loadCart()`.
- **Do:** Toast when one or more saved lines cannot be restored.
- **Files:** `client/src/contexts/CartContext.tsx`
- **Verify:** Seed `fpf-cart-v1` with an unknown `productId`, reload — toast fires, remaining good lines stay.
- **Added:** 2026-08-31

---

### FH-127 — Checkout cancel “quote instead” raced Home paint
- **Status:** mitigated
- **Area:** cart
- **Symptom:** Cancel page called `setLocation("/")` then scrolled to `#contact` after 100ms. Home often had not painted, so the scroll no-op’d and the URL had no hash for `useHashScroll`.
- **Do NOT:** Timebox a scroll after a client route change with no hash.
- **Do:** Navigate with `window.location.href = "/#contact"` so Home mounts and hash-scrolls.
- **Files:** `client/src/pages/CheckoutCancel.tsx`
- **Verify:** `/checkout/cancel` → Request a quote instead → lands on `/#contact`.
- **Added:** 2026-08-31

---

### FH-126 — Filter Clock reminder stored MERV as “filter size”
- **Status:** mitigated
- **Area:** clock
- **Symptom:** Reminder POST sent `filterSize: "MERV 11"` instead of Width × Length × Depth. Leads looked like a size request.
- **Do NOT:** Put `recommendedMervName` in `filterSize`.
- **Do:** Leave `filterSize` empty. Put depth + MERV + pack in `message`.
- **Files:** `client/src/components/FilterPower.tsx`
- **Verify:** Submit a Filter Clock reminder — lead `filterSize` is empty; message names thickness and MERV.
- **Added:** 2026-08-31

---

### FH-125 — Carbon carousel showed a “from $” price while quote-only
- **Status:** mitigated
- **Area:** pricing
- **Symptom:** MERV 8 Carbon is not on the wholesale allowlist, but the home MERV deck still rendered `from $6.37`.
- **Do NOT:** Display `fromPrice` for a rating `isMervKeyOnSale` rejects.
- **Do:** Show “Quote only” when the rating is not on sale.
- **Files:** `client/src/components/MervCarousel.tsx`, `scripts/verify-store.ts`
- **Verify:** `/#merv` — Carbon card says Quote only. `pnpm exec tsx scripts/verify-store.ts`
- **Added:** 2026-08-31

---

### FH-124 — Contact email failure returned 400 after the lead was saved
- **Status:** mitigated
- **Area:** contact
- **Symptom:** `appendLead()` ran, then Resend threw or returned `{ error }`. The API answered 400, so the shopper retried and duplicated the lead.
- **Do NOT:** Treat a saved lead as a failed submit just because email delivery failed.
- **Do:** Return `{ ok: true, emailed: false }` after a successful save. Log the Resend error.
- **Files:** `server/contact.ts`
- **Verify:** POST `/api/contact` with no `RESEND_API_KEY` still returns `{ ok: true }`.
- **Added:** 2026-08-31

---

### FH-123 — Stripe webhook wrote duplicate orders on retry
- **Status:** mitigated
- **Area:** other
- **Symptom:** Every `checkout.session.completed` appended to `orders.json`. Stripe retries created duplicate rows for the same `session.id`.
- **Do NOT:** Push an order when that `sessionId` already exists.
- **Do:** Skip duplicates. Persist shipping + phone from the session.
- **Files:** `server/stripe.ts`
- **Verify:** Handle the same completed event twice — `orders.json` has one row.
- **Added:** 2026-08-31

---

### FH-122 — Production leads and orders wrote into `dist/data`
- **Status:** mitigated
- **Area:** other
- **Symptom:** Paths used `__dirname/data`. Dev wrote `server/data/`. Production `dist/index.js` wrote `dist/data/`, which a redeploy wipes.
- **Do NOT:** Resolve lead/order files from the bundled file’s directory.
- **Do:** Write to `DATA_DIR` or `<cwd>/server/data`.
- **Files:** `server/data-store.ts`, `server/contact.ts`, `server/stripe.ts`, `.env.example`
- **Verify:** After `pnpm start`, new leads land in `server/data/leads.json`.
- **Added:** 2026-08-31

---

### FH-121 — Success page cleared the cart without verifying payment
- **Status:** mitigated
- **Area:** cart
- **Symptom:** Visiting `/checkout/success` with no `session_id` still called `clearCart()` and said “Payment successful.”
- **Do NOT:** Trust the success URL alone.
- **Do:** `GET /api/checkout/session?session_id=` and clear the cart only when Stripe says `paid`.
- **Files:** `server/stripe.ts`, `server/index.ts`, `client/src/pages/CheckoutSuccess.tsx`
- **Verify:** Open `/checkout/success` — cart stays, copy says no session. Invalid `session_id` does not clear the cart.
- **Added:** 2026-08-31

---

### FH-120 — Stripe Checkout did not collect a shipping address
- **Status:** mitigated
- **Area:** other
- **Symptom:** `checkout.sessions.create()` had line items only. Stripe could charge with no deliverable US address.
- **Do NOT:** Create payment-mode sessions without `shipping_address_collection`.
- **Do:** Collect US shipping addresses and phone. Store them on the webhook order.
- **Files:** `server/stripe.ts`
- **Verify:** Start checkout — Stripe asks for a US shipping address.
- **Added:** 2026-08-31

---

### FH-119 — Hash scroll only ran on first mount
- **Status:** mitigated
- **Area:** other
- **Symptom:** `useHashScroll` used `[]` deps and no `hashchange` listener. Back/Forward between `/#contact` and `/#finder` did not re-scroll because Home stayed mounted.
- **Do NOT:** Scroll hash targets only once per page mount.
- **Do:** Re-run on `hashchange` with the same retry timers.
- **Files:** `client/src/hooks/useHashScroll.ts`
- **Verify:** On `/`, click footer Contact then Finder in the header — each hash scrolls to the matching section.
- **Added:** 2026-08-31

---

### FH-118 — Hero pack tiles ignored the selected MERV
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 8 / Carbon / 11 / 13 packs all linked to `/sizes/20x25x1` with no `?merv=` and no preferred-MERV stash. Carbon is not even sellable.
- **Do NOT:** Point every pack at the default MERV 8 PDP.
- **Do:** Shopable packs go to `/sizes/20x25x1?merv={key}` and `setPreferredMerv`. Carbon (quote-only) goes to `/custom-air-filters`.
- **Files:** `client/src/components/Hero.tsx`
- **Verify:** `/` — MERV 13 pack opens 20x25x1 on MERV 13. Carbon pack opens custom quote.
- **Added:** 2026-08-31

---

### FH-117 — Cart quote handoff was cleared before the destination page could read it
- **Status:** mitigated
- **Area:** cart
- **Symptom:** `CartDrawer` stashed the cart, then Home and Filter Change Guide called `takeQuoteHandoff()` and navigated away. The destination form read an empty stash, so “Cart attached” never appeared.
- **Do NOT:** Call `takeQuoteHandoff()` and then leave the page that needs that payload.
- **Do:** On Home, consume the stash into the contact form and scroll to `#contact`. On other pages, navigate to `/#contact` and let Home’s mount effect take it.
- **Files:** `client/src/pages/Home.tsx`, `client/src/pages/FilterChangeGuide.tsx`, `client/src/lib/quote-handoff.ts`
- **Verify:** Add a size to cart on Home → Request a quote → contact form shows the cart summary. Repeat from `/how-often-to-change-air-filter`.
- **Added:** 2026-08-31

---

### FH-116 — Hero video used invalid React `defaultMuted` prop
- **Status:** mitigated
- **Area:** photos
- **Symptom:** `pnpm check` (`tsc --noEmit`) failed: `defaultMuted` is not a valid React `<video>` prop, so the client typecheck did not pass.
- **Do NOT:** Put `defaultMuted` back on the JSX `<video>` element.
- **Do:** Keep `muted` on the element. Set `node.muted` and `node.defaultMuted` on the video ref so autoplay still starts muted.
- **Files:** `client/src/components/Hero.tsx`
- **Verify:** `pnpm check`
- **Added:** 2026-08-31

---

### FH-115 — Hero brand strip did not mention custom sizes
- **Status:** mitigated
- **Area:** brands
- **Symptom:** The navy brand-row line read “Filter King also fits 30+ major brands” and said nothing about custom filters.
- **Do NOT:** Restore “Filter King also fits 30+ major brands” as the strip copy.
- **Do:** Keep “Guaranteed to fit 30+ major brands and we can customize them” (uppercase via CSS) above the brand marks. Size the line so the longer sentence still fits the right-hand strip.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — brand strip shows the new line above the logos.
- **Added:** 2026-08-31

---

### FH-114 — Hero claim line named Trane, Carrier, Rheem + 30 more
- **Status:** mitigated
- **Area:** other
- **Symptom:** Under the Filter King lockup, desktop showed “GUARANTEED TO FIT TRANE, CARRIER, RHEEM + 30 MORE.”
- **Do NOT:** Restore `.hero-filter-claim-sub` or that brand list under the Filter King mark.
- **Do:** Keep only the Filter King lockup in `.hero-filter-claim`. Brand fit still lives in the lede and the brand row.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — no “Guaranteed to fit Trane, Carrier, Rheem + 30 more” under the lockup.
- **Added:** 2026-08-31

---

### FH-113 — Hero character used a warped still instead of a real flight clip
- **Status:** mitigated
- **Area:** photos
- **Symptom:** `character-fly.webm` was a procedural orbit of the standing PNG. Shoppers asked for a real flight of the official sheet character, cape-as-filter catching dust, not Higgsfield.
- **Do NOT:** Put the sliding-still loop back as the hero source. Do not swap in a look-alike. Do not restore the outlined HERO wordmark.
- **Do:** Loop Gemini Veo `character-fly-natural.webm` / `.mp4` from the official sheet still. Poster and reduced-motion still are `character-fly-still.png`. Keep him receded in the middle lane.
- **Files:** `client/public/hero/character-fly-natural.webm`, `client/public/hero/character-fly-natural.mp4`, `client/public/hero/character-fly-still.png`, `scripts/_veo_filter_hero_fly.py`, `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` — mascot flies naturally between FILTER HERO and the packs; cape mesh catches dust; reduced motion shows the flying still.
- **Added:** 2026-08-31

---

### FH-112 — Hero CTAs mixed a pill with the site slant
- **Status:** mitigated
- **Area:** other
- **Symptom:** “Find your filter size” used the crimson parallelogram, but “Start your clock” sat next to it as a rounded ghost pill — leftover outline styling that does not match header FIND, finder, or other shop buttons.
- **Do NOT:** Pair `.hero-shop-btn` with a rounded/pill outline, `variant="outline"`, or sentence-case type. Do not restyle the clock CTA as a navy pill.
- **Do:** Keep both hero actions on the Filter Hero CTA geometry — same slant, italic uppercase, and height. Primary stays crimson (`.hero-shop-btn`). Secondary is the ice ghost (`.hero-ghost-btn`). Reuse that pair on other navy bands (Filter Clock page).
- **Files:** `client/src/index.css`, `client/src/components/Hero.tsx`, `client/src/pages/FilterChangeGuide.tsx`
- **Verify:** `/` — both hero buttons share the slant and type; primary crimson, secondary ice. `/how-often-to-change-air-filter` — Get your number / Shop your size use the same pair.
- **Added:** 2026-08-31

---

### FH-111 — Trust marquee chips sat too small after the hero lift
- **Status:** mitigated
- **Area:** other
- **Symptom:** After FH-108–FH-110 moved the packs and brand row up, the Free Shipping / fit / MERV chips still read as a thin strip.
- **Do NOT:** Shrink `.trust-chip` / `.trust-ship-chip` back to `0.86rem` / `0.9rem` or restore `py-2.5 md:py-3` on the track.
- **Do:** Keep the first-screen marquee larger — taller bar, bigger pills and icons — while it still sits in the first viewport under the hero.
- **Files:** `client/src/components/TrustMarquee.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — marquee chips are clearly larger; still visible without scrolling; brand row stays above it.
- **Added:** 2026-08-31

---

### FH-110 — Hero brand row sat low and only showed three marks
- **Status:** mitigated
- **Area:** brands
- **Symptom:** The “Filter King also fits 30+ major brands” strip sat too close to the marquee and only showed Trane, Carrier, and Rheem.
- **Do NOT:** Park `.hero-brands` at `bottom: 2.5%`. Do not drop Goodman or Lennox from the hero marks.
- **Do:** Keep the strip a tad higher (`bottom: 6%`) with Trane, Carrier, Rheem, Goodman, and Lennox in the same white pills. Packs stay above; marquee stays below.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — brand row sits closer to the packs and shows five logos, including Goodman and Lennox.
- **Added:** 2026-08-31

---

### FH-109 — Hero Filter King packs still sat a little low
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-108 the four packs still sat a tad low under the Filter King claim.
- **Do NOT:** Drop `.hero-pack-row` back to `top: 14%` / `bottom: 22%` (or `top: 19%` on short desktop). Do not cover the claim or the 30+ brand line.
- **Do:** Keep the lineup a little higher still (`top: 11%` / `bottom: 25%`, `top: 16%` on short desktop). Claim stays above, brands stay below.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — four packs sit closer to the Filter King claim, with clear space above the brand row.
- **Added:** 2026-08-31

---

### FH-108 — Hero Filter King packs sat too low
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-107 the four packs sat low in the right column, with extra empty air under the Filter King claim.
- **Do NOT:** Drop `.hero-pack-row` back to `top: 17%` / `bottom: 18%` (or `top: 22%` on short desktop). Do not cover the claim or the 30+ brand line.
- **Do:** Keep the lineup a little higher (`top: 14%` / `bottom: 22%`, `top: 19%` on short desktop). Claim stays above, brands stay below.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — four packs sit closer to the Filter King claim, with clear space above the brand row.
- **Added:** 2026-08-31

---

### FH-107 — Hero Filter King packs sat too close together
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 8 / Carbon / MERV 11 / MERV 13 in the home hero lineup had only a 0.2rem gap, so the four pack frames almost touched.
- **Do NOT:** Collapse `.hero-pack-row` back to `gap: 0.2rem` / `0.25rem`. Do not restack them into an overlapping fan.
- **Do:** Keep a little air between each isolated pack (`gap: 0.9rem`, `1rem` on short desktop). Claim stays above, brands stay below.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — four Filter King packs side by side with a visible gap between frames.
- **Added:** 2026-08-31

---

### FH-106 — Hero character needed a flight loop in his exact form
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Shoppers wanted the mascot flying around the background without changing his crossed-arms illustrated form. Higgsfield image-to-video was unavailable (expired session).
- **Do NOT:** Replace him with a new pose, a generated look-alike, or the outlined HERO wordmark. Do not freeze him as a still.
- **Do:** Loop `character-fly.webm` in the middle lane — same character, cape blowing, figure-eight flight on transparent. Poster is `character.png`. Reduced motion keeps the still.
- **Files:** `client/public/hero/character-fly.webm`, `scripts/_cape_fly.py`, `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` — character flies in the gap between FILTER HERO and the packs. `prefers-reduced-motion` shows the PNG.
- **Added:** 2026-08-31

---

### FH-105 — Hero character sat behind the packs instead of the middle lane
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-104 the mascot filled the old HERO-outline zone under the Filter King packs, not the gap beside FILTER HERO.
- **Do NOT:** Park him at `left: 40%` / `width: 58%` behind the packs. Do not put the outlined HERO back. Do not slide the copy or packs with him.
- **Do:** Receded idle character sits in the middle lane (`left: 26%`, `width: 40%`) between the FILTER HERO type and the packs. Copy and packs stay put.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — figure visible between the lockup and the four packs; cape may tuck under the packs.
- **Added:** 2026-08-31

---

### FH-104 — Giant outlined HERO sat where the mascot belongs
- **Status:** mitigated
- **Area:** photos
- **Symptom:** A faded outlined HERO wordmark filled the right background; the character was on the left instead of occupying that slot.
- **Do NOT:** Put `.hero-wordmark` back. Do not keep the mascot in the left letter lane.
- **Do:** Remove the outlined HERO. The idle character is the background in that right-center zone, receded behind the packs (`z-index: 2`, opacity ~0.4). Copy and packs stay in front.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — no giant HERO outline; cape-loop character fills that background behind the Filter King packs.
- **Added:** 2026-08-31

---

### FH-103 — Hero foreground sat too far right of the mascot
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Copy, packs, claim, and brand marks sat a bit too far right of the receded character.
- **Do NOT:** Move `.hero-character-slot`. Do not shift the mascot with the foreground.
- **Do:** Nudge only the live foreground left — copy `padding-left` 14/20vw → 11/17vw; packs, claim, and brands `left` 56% → 53%.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — FILTER HERO type and Filter King packs sit slightly left; character stays put.
- **Added:** 2026-08-31

---

### FH-102 — Hero character sat too far right of the lockup
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-101 the receded mascot sat under the Filter King packs on the right, away from FILTER HERO / the H1.
- **Do NOT:** Park him in the right-center pack lane. Do not put him front and center at full opacity.
- **Do:** Keep him receded (`z-index: 2`, opacity ~0.46). Desktop stands on the left, immediately beside the main letters. Copy starts after the torso (`padding-left` ~20vw). Packs stay on the right.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — figure on the left next to FILTER HERO; packs unchanged on the right.
- **Added:** 2026-08-31

---

### FH-101 — Hero character sat too far forward
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After FH-100 the mascot filled the middle of the stage at full opacity, so he read as the main subject instead of background atmosphere.
- **Do NOT:** Scale him over the full stage at opacity 1 in front of the packs. Do not park him under the headline.
- **Do:** Keep him behind copy and packs (`z-index: 2`, opacity ~0.4, dimmed). Desktop sits in the right-center lane under the Filter King packs. Cape loop still plays.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — character visible as a receded figure behind the packs; lockup and H1 stay readable on the left.
- **Added:** 2026-08-31

---

### FH-100 — Hero character sat under the headline
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The faded mascot sat behind FILTER HERO / the H1, so the type was hard to read and the figure was hard to see.
- **Do NOT:** Park him under the lockup at ~0.5 opacity with a right-edge fade. Do not dim him with saturate/brightness filters.
- **Do:** Desktop — copy stays on the left over a navy wash. Character stands in the middle lane at full opacity and larger scale; packs stay on the right over the cape. Mobile — figure sits in the upper stage, copy stays on the bottom gradient.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — torso visible between headline and packs; lockup readable. `/` mobile — character above the copy block.
- **Added:** 2026-08-31

---

### FH-099 — Dual-logo claim lost its fade
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After the lighter wash, the lockup sat in a hard clipped box with a border. The old claim faded out into the hero.
- **Do NOT:** Put the clipped plate, border, or solid non-fading fill back. Do not restore the darker `rgba(10,16,30)` strip.
- **Do:** Same lighter navy/mesh color, same fade as the original claim — strong at the top, transparent at the bottom. No clip, no border.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — lockup panel is lighter blue and dissolves into the stage. No hard box edge.
- **Added:** 2026-08-31

---

### FH-098 — Dual-logo claim sat in a darker navy strip
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The Filter King now-at Filter Hero plate read as the same deep navy as the hero stage, so the lockup disappeared into the background.
- **Do NOT:** Recolor the whole hero stage. Do not put a white plate behind the marks.
- **Do:** Only `.hero-filter-claim` gets a lighter navy/mesh wash (`rgba(45,78,138)` into `#203868`). Marks stay transparent. Rest of the hero wash stays.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — lockup panel is a step lighter blue than the stage. Packs and left copy unchanged.
- **Added:** 2026-08-31

---

### FH-097 — Hero character was a frozen still again
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The background mascot used `character.png` and did not move; the cape-blowing idle loop was off.
- **Do NOT:** Leave a static PNG in `.hero-character-slot`. Do not put the video in front of the headline. Do not swap the pose.
- **Do:** Loop `character-idle.webm` in the same receded slot (behind copy, faded). Poster is `character.png`. `prefers-reduced-motion` keeps the still.
- **Files:** `client/src/components/Hero.tsx`, `client/public/hero/character-idle.webm`
- **Verify:** `/` — character stays planted behind FILTER HERO type; cape loops. Reduced motion shows the PNG.
- **Added:** 2026-08-31

---

### FH-096 — Dual-logo tag said FROM, which implied Filter Hero makes Filter King
- **Status:** mitigated
- **Area:** photos
- **Symptom:** “Filter King FROM Filter Hero” read as origin/manufacture. Filter Hero only sells Filter King.
- **Do NOT:** Use FROM, BY, or SELLS / sold by in the lockup. Do not imply Filter Hero manufactures Filter King.
- **Do:** Connector is “NOW AT” — Filter King now at Filter Hero. Transparent marks still sit on the hero wash.
- **Files:** `client/src/components/Hero.tsx`, `client/public/hero/fh-sells-fk.png`, `scripts/compose-brand-lockup.py`
- **Verify:** `/` desktop — reads Filter King now at Filter Hero. No FROM.
- **Added:** 2026-08-31

---

### FH-095 — Dual-logo tag sat on a white plate
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The Filter Hero / Filter King lockup used a white card and the word “SELLS,” so it floated off the navy hero and read like a checkout line.
- **Do NOT:** Put the white plate or `background: #f7f8fb` back on the tag image. Do not use “SELLS.”
- **Do:** Transparent lockup that sits on the hero wash. Ice-tinted official marks. Connector is “FROM” — Filter King from Filter Hero.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/fh-sells-fk.png`, `scripts/compose-brand-lockup.py`
- **Verify:** `/` desktop — no white box behind the marks. Reads Filter King from Filter Hero.
- **Added:** 2026-08-30

---

### FH-094 — Hero tag now uses both brand marks
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The claim still read as copy. Shoppers needed a visual that Filter Hero sells Filter King, using both official logos.
- **Do NOT:** Put the maroon text pill back. Do not drop either logo. Do not replace the lockup with a filter-only photo.
- **Do:** The tag is the official Filter Hero mark, a slanted SELLS ticket, and the official Filter King lion mark on one plate. Fit line stays under it.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/fh-sells-fk.png`, `scripts/compose-brand-lockup.py`
- **Verify:** `/` desktop — both logos readable, SELLS between them, no “Our Filter King filters.”
- **Added:** 2026-08-30

---

### FH-093 — Hero Filter King pill was not a statement
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The right-side lockup was a red pill that only said “Filter King — by Filter Hero,” then a second line “Our Filter King filters.” It read as a label, not a claim, and hid the actual filter.
- **Do NOT:** Put the maroon pill or the “Our Filter King filters.” headline back. Do not drop Filter King / Filter Hero from the statement. Do not replace the build plate with text-only attribution.
- **Do:** The claim is one slanted statement plate: cinematic shot of the bare filter build plus “This is Filter King. Built by Filter Hero.” Keep the fit line under it. Packs stay below.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/filter-build.png`
- **Verify:** `/` desktop — no “Our Filter King filters.” No red pill. Statement plate with the filter visual sits above the four packs.
- **Added:** 2026-08-30

---

### FH-092 — Hero captions redesigned off the pill
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Under-pack pills (text, then capture dots) read as a second bubble system and fought the lineup.
- **Do NOT:** Put pills, glass chips, or capture dots back under the hero packs. Do not invent another caption row below the filters.
- **Do:** Each pack wears a slanted rating ticket on the product — same cut as the shop CTAs. Grade + use (Dust / Odors / Pets / Allergies). Carbon is the ice ticket. Catch-page dots stay on the catch cards only.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — four slanted tickets sit on the packs. No pills under the row. Brands and claim stay clear.
- **Added:** 2026-08-30

---

### FH-091 — Hero captions did not match catch bubbles
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The four hero pills under the packs were text-only. They did not use the CAPTURE dots from “What should your filter catch?”
- **Do NOT:** Put the text-only navy pills back. Do not invent a second dot scale for the hero.
- **Do:** Hero captions use the shared `CaptureDots` (MERV 8 / Carbon: 1 filled, even size; MERV 11: 3 filled, slightly larger; MERV 13: 5 filled, growing). Pill chrome tints to the same accent. Catch cards and size-page Capture use the same component.
- **Files:** `client/src/components/CaptureDots.tsx`, `client/src/components/Hero.tsx`, `client/src/components/MervCarousel.tsx`, `client/src/pages/SizeDetail.tsx`, `client/src/lib/merv-guide.ts`, `client/src/index.css`
- **Verify:** `/` desktop — each pack caption shows the matching capture dots. `/` catch cards and `/sizes/20x25x1` Capture match those fills and sizes.
- **Added:** 2026-08-30

---

### FH-090 — Hero packs sat still after the lineup
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After the side-by-side restage, MERV 8 / Carbon / MERV 11 / MERV 13 no longer floated.
- **Do NOT:** Put the packs back on overlapping corners to get motion. Do not turn the float off.
- **Do:** Keep the row. Each pack uses its old `hero-float-*` idle. Reduced motion still kills the animation.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — four packs side by side and drifting on their old float cycles.
- **Added:** 2026-08-30

---

### FH-089 — Hero MERV 13 used the older pack shot
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The lineup still showed the previous MERV 13 render instead of the photoreal Filter King MERV 13 the shop should use.
- **Do NOT:** Point MERV 13 at `showcase-merv13.png` or the old `merv-13-packshot.png`. Do not leave MERV 13 on a different canvas than MERV 8 / 11.
- **Do:** Official and source pack shots are the uploaded photoreal MERV 13. Hero isolate is the same file, cropped to the 508×833 canvas as the other packs.
- **Files:** `client/public/products/merv-13-packshot.png`, `client/public/products/source/merv-13-packshot.png`, `client/public/hero/pack-merv13.png`, `client/src/components/Hero.tsx`, `shared/products.ts`
- **Verify:** `/` hero MERV 13 matches the photoreal upload and sits the same size as MERV 8 / 11 / Carbon. `/sizes/20x25x1` MERV 13 gallery uses the new pack shot.
- **Added:** 2026-08-30

---

### FH-088 — Hero packs sat in a small overlapping fan
- **Status:** mitigated
- **Area:** photos
- **Symptom:** MERV 8 / Carbon / MERV 11 / MERV 13 were tilted and stacked, so they read small and graphic instead of a product lineup.
- **Do NOT:** Put the four packs back on absolute overlapping corners or restore the tilt/float collage. Do not cover the Filter King claim or 30+ brand line.
- **Do:** Stand the official isolated pack shots in one row. Keep them large (`max-height: 52vh`, `34vh` on short screens). Claim stays above, brands stay below. Do not let MERV 8 cover the lede or CTAs.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/pack-merv8.png`, `client/public/hero/pack-merv11.png`, `client/public/hero/pack-merv13.png`
- **Verify:** `/` desktop — four filters side by side, larger, claim and brand type readable.
- **Added:** 2026-08-30

---

### FH-087 — Header CTAs drifted from the shop buttons
- **Status:** mitigated
- **Area:** header
- **Symptom:** FIND, Need a custom size, and How to measure did not share the Filter Hero crimson slant / italic used on hero and finder buttons. Header FIND also skipped the preferred MERV query the page finder sends. Cold `/#clock` and `/#how-to-measure` loads missed their sections.
- **Do NOT:** Style header actions as navy pills or plain text links. Do not send header FIND to a different size route than `FilterFinder`.
- **Do:** Header FIND / custom use the same crimson slanted CTA as `.hero-shop-btn`. How to measure stays a crimson pill. Header FIND appends `?merv=` from `getPreferredMerv()`. Hash landings retry until the section is in view.
- **Files:** `client/src/index.css`, `client/src/components/SiteHeader.tsx`, `client/src/hooks/useHashScroll.ts`
- **Verify:** `/` header — FIND and custom match the shop CTAs; FIND opens `/sizes/20x25x1`; How to measure / Filter Clock land on their sections from a fresh `/#` URL.
- **Added:** 2026-08-30

---

### FH-086 — Header lockup left the 8:09 shopper bar
- **Status:** mitigated
- **Area:** header
- **Symptom:** The top bar no longer matched the running-mark + Filter Hero shopper header (Shop / Brands / Filter Clock / Contact, How to Measure, size finder, Need a Custom Size, cart).
- **Do NOT:** Put `/hero/nav-icon.png` or the italic uppercase FILTER / HERO lockup back in the header. Do not hide `SiteHeader` from the top of `/`.
- **Do:** Header stays first. Emblem is the `/logo.png` running crop beside title-case Filter Hero. Full shopper chrome stays in one top row.
- **Files:** `client/src/components/BrandLockup.tsx`
- **Verify:** `/` — navy header at the top matches the 8:09 bar; trust chips still sit on the first screen under the hero.
- **Added:** 2026-08-30

---

### FH-085 — Trust marquee sat below the first screen
- **Status:** mitigated
- **Area:** other
- **Symptom:** Free Shipping / Built To Last / MERV / support chips only appeared after scrolling past the locked hero.
- **Do NOT:** Hide `.home-lock-rest` or lock `html` / `body` / `#root` overflow. Do not put the marquee back under the hero-only first viewport.
- **Do:** First screen is header + hero + `TrustMarquee`. Hero flexes into the leftover height. The rest of the shop still scrolls below.
- **Files:** `client/src/pages/Home.tsx`, `client/src/index.css`, `client/src/components/TrustMarquee.tsx`
- **Verify:** `/` — chips visible without scrolling; scroll still reaches finder, clock, footer.
- **Added:** 2026-08-30

---

### FH-084 — Home hid everything below the hero
- **Status:** mitigated
- **Area:** other
- **Symptom:** `/` showed only the header and hero. Shoppers could not scroll to Find your size, Filter Clock, brands, FAQ, contact, or the footer.
- **Do NOT:** Set `.home-lock-rest { display: none }` or lock `html` / `body` / `#root` / `.home-lock` to `100dvh` + `overflow: hidden`. Do not redirect `/#clock`, `/#faq`, `/#contact`, `/#finder`, or `/#how-to-measure` away from the home sections.
- **Do:** Header + hero still fill the first viewport. The rest of the page sits below in normal flow. Hash links scroll to those home sections.
- **Files:** `client/src/index.css`, `client/src/pages/Home.tsx`, `client/src/components/SiteHeader.tsx`
- **Verify:** `/` — scroll past the hero to the trust bar, finder, clock, brands, FAQ, contact, footer. Header Filter Clock / How to measure / FAQ / contact stay on `/`.
- **Added:** 2026-08-30

---

### FH-083 — Filter King claim sat under the packs
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After the scale-up, MERV 8 covered “Our Filter King filters” / “Guaranteed to fit…”, and Carbon covered “Filter King also fits 30+ major brands.”
- **Do NOT:** Let pack shots share the top or bottom type bands.
- **Do:** Top band for the claim, bottom band for the 30+ line, packs in the middle at `max-height: 34vh` so every word stays visible.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — claim and brand lines fully readable; packs do not cover type.
- **Added:** 2026-08-30

---

### FH-082 — Hero type and packs read too small
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The locked first screen left empty navy around the lockup, headline, and Filter King packs compared with the reworded preview.
- **Do NOT:** Shrink the desktop lockup back under 5rem or cap pack shots at 36vh.
- **Do:** Scale lockup, title, lede, CTAs, claim, packs, brand marks, and the character together. Keep the giant outlined HERO behind the packs.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` desktop — type and packs fill the stage like the preview; header still on the first screen.
- **Added:** 2026-08-30

---

### FH-081 — Leftover hero line overlays stayed on
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After hiding `.hero-mesh`, diagonal ray streaks and dust still read as leftover graph lines on the stage.
- **Do NOT:** Put `.hero-mesh`, `.hero-rays`, `.hero-slash`, or `.hero-dust` back on the home hero.
- **Do:** Navy wash only. The filter-grid lives on the cape, not the stage.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`
- **Verify:** `/` — no grid, no diagonal streaks behind copy or packs.
- **Added:** 2026-08-30

---

### FH-080 — Hero graph-paper grid came off
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The stage still showed a graph-paper grid behind the figure and the Filter King packs.
- **Do NOT:** Turn `.hero-mesh` back on.
- **Do:** Keep the navy wash only. No graph overlay.
- **Files:** `client/src/index.css`
- **Verify:** `/` — smooth navy behind character and packs; no grid lines.
- **Added:** 2026-08-30

---

### FH-079 — Hero looked like two different backgrounds
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Dark grid sat behind the character; a lighter, ungridded blue sat behind the Filter King packs, with a diagonal seam in the middle.
- **Do NOT:** Mask `.hero-mesh` / `.hero-rays` to the left 24%. Do not keep `.hero-slash` or the 118° ramp that ends in `#2f5a96`.
- **Do:** One navy field across the stage. Grid and rays cover the full width. No copy-column wash. No diagonal slash.
- **Files:** `client/src/index.css`
- **Verify:** `/` — same navy + grid behind the figure and the packs; no left/right seam.
- **Added:** 2026-08-30

---

### FH-078 — Hero stage wash no longer matched the preview
- **Status:** mitigated
- **Area:** photos
- **Symptom:** Shifting the mascot also moved the ice/red/navy blobs, so the stage no longer matched `hero-reworded-preview_2.html`.
- **Do NOT:** Recolor the 118° navy ramp. Do not keep the center-weighted ice blob from FH-077.
- **Do:** Use the preview wash: ice at 72% 42%, red at 8% 88%, blue at 4% 12%. Leave copy and Filter King packs in place.
- **Files:** `client/src/index.css`
- **Verify:** `/` — dark left, ice light on the right, same navy ramp as the preview.
- **Added:** 2026-08-30

---

### FH-077 — Hero background hugged the left crop
- **Status:** mitigated
- **Area:** photos
- **Symptom:** After receding the mascot, the figure, grid, and glow still sat on the far left and clipped off the edge.
- **Do NOT:** Slide the Filter King packs or the headline with the background. Do not pin the character at `left: -6%`.
- **Do:** Keep copy and products where they are. Shift the stage wash, mesh, rays, glow, ground, red orb, and character slot right so the figure sits behind the lockup.
- **Files:** `client/src/index.css`
- **Verify:** `/` desktop — full figure visible under FILTER HERO type, not cut off on the left; packs stay on the right.
- **Added:** 2026-08-30

---

### FH-076 — Hero character sat too far forward
- **Status:** mitigated
- **Area:** photos
- **Symptom:** The crossed-arms figure read as the main subject, in front of the headline, instead of sitting behind FILTER HERO copy like the reworded preview.
- **Do NOT:** Put the idle video back in front of the type. Do not crop the cape or hide the filter-mesh lining. Do not paint a banner composite.
- **Do:** Keep the existing crossed-arms mascot (`character.png` — red chest, navy legs, filter-grid cape). Sit him left and back: `opacity` ~0.58, right-edge fade, dimmer glow, `z-index: 2` under `.hero-copy`.
- **Files:** `client/src/components/Hero.tsx`, `client/src/index.css`, `client/public/hero/character.png`
- **Verify:** `/` desktop — character visible behind the lockup and headline; Filter King packs stay on the right.
- **Added:** 2026-08-30

---

### FH-075 — Header character icon looked blank after the public swap
- **Status:** mitigated
- **Area:** header
- **Symptom:** The header mark stayed empty after `BrandLockup` pointed at `/hero/nav-icon.png`. The file was valid; the slot was still the old wide `logo.png` crop (`md:w-[4.6rem]` on a 48px-tall box), so the 528×650 portrait sat in empty navy and read as a blank gap.
- **Do NOT:** Route the icon through `useKnockoutLogo()` (punches out the eye slits). Do not keep the old crop (`h-[168%]` / `object-[center_8%]` / `overflow: hidden`) or the wide 4.6rem mark box.
- **Do:** Size `.brand-emblem` to the icon aspect (~0.81). Load `/hero/nav-icon.png` eagerly with intrinsic 528×650. `object-contain` / `object-center`.
- **Files:** `client/src/components/BrandLockup.tsx`, `client/src/components/SiteHeader.tsx`, `client/src/index.css`, `client/public/hero/nav-icon.png`
- **Verify:** `/` header — crossed-arms character fills the mark beside italic FILTER / HERO; Network `/hero/nav-icon.png?v=fh075` 200.
- **Added:** 2026-08-30

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
- **Status:** wontfix
- **Area:** photos
- **Symptom:** Header + hero did not fill the viewport, so the page still scrolled into the trust bar and finder.
- **Do NOT:** Re-lock `/` to a hero-only screen. Reversed by FH-084 — shoppers need the rest of the site.
- **Do:** Hero still fills the first viewport under the header (`100dvh` minus `--site-header-h`). Content below stays in normal flow.
- **Files:** `client/src/pages/Home.tsx`, `client/src/components/Hero.tsx`, `client/src/components/SiteHeader.tsx`, `client/src/index.css`
- **Verify:** `/` — first screen is header + hero. Scroll starts at the trust bar.
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
- **Status:** mitigated
- **Area:** header
- **Symptom:** Measure help is not in the primary nav. Do not put it inside Enter Your Filter Size.
- **Do NOT:** Nest How to Measure in the header finder.
- **Do:** A How to Measure control in that nav row; it jumps to the tape-measure diagram.
- **Files:** `client/src/components/SiteHeader.tsx`
- **Verify:** Nav row has Shop, Brands, FILTER CLOCK, How to Measure, Contact. Chip is not in the finder card.
- **Added:** 2026-08-20

### FH-033 — Clock nav still says Clock, not FILTER CLOCK
- **Status:** mitigated
- **Area:** header
- **Symptom:** Header link is `Clock`.
- **Do NOT:** Label it Filter Hero or leave it as Clock.
- **Do:** Label **FILTER CLOCK**; still hashes to `#clock`.
- **Files:** `client/src/components/SiteHeader.tsx`
- **Verify:** Header reads FILTER CLOCK and opens the Filter Clock section.
- **Added:** 2026-08-20

### FH-034 — Custom CTA should read Need a custom size
- **Status:** mitigated
- **Area:** header
- **Symptom:** Button says `Custom size`.
- **Do NOT:** Use Custom size or a second finder.
- **Do:** One button, **Need a custom size**, to `/custom-air-filters#custom-quote`.
- **Files:** `client/src/components/SiteHeader.tsx`
- **Verify:** Wording plus it opens the quote form.
- **Added:** 2026-08-20

### FH-035 — Tape-measure diagram missing from product pages
- **Status:** mitigated
- **Area:** measure
- **Symptom:** Size/product pages do not all show the filter + tape measure.
- **Do NOT:** Leave it homepage-only, or clip Width / Length / Depth labels.
- **Do:** Same How to Measure guide (tape diagram + Width / Length / Depth steps) on every `/sizes/{slug}` page, including the off-catalog quote empty state.
- **Files:** `client/src/pages/SizeDetail.tsx`, `client/src/components/HowToMeasureGuide.tsx`, `client/src/components/MeasureFilterDiagram.tsx`
- **Verify:** `/sizes/20x25x1` and `/sizes/99x99x9` show “How to measure your air filter”.
- **Added:** 2026-08-20
