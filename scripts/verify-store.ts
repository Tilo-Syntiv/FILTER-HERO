import { BRAND_EMAIL } from "../shared/const.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALL_FILTER_SIZES,
  FILTER_PRODUCT_IMAGE,
  FILTER_SIZES,
  MERV_DISPLAY_ORDER,
  MERV_TYPES,
  SELLABLE_ONLY,
  THICKNESSES,
  findProductVariant,
  getArchivedFilterSize,
  getFilterSize,
  getSizesByThickness,
  mervTypesForSize,
  packShotSrc,
  packTotal,
  popularSizeSlugs,
  productGalleryFor,
  unitPriceForQty,
} from "../shared/products.ts";
import {
  liveLadderCount,
  liveListPrice,
  liveUnitPrice,
} from "../shared/pricing/engine.ts";
import { sitemapPaths } from "../shared/seo.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(BRAND_EMAIL === "info@filterhero.net", `brand email should be info@, got ${BRAND_EMAIL}`);
assert(SELLABLE_ONLY, "shop must stay on the wholesale allowlist until more costs land");
assert(
  ALL_FILTER_SIZES.length > 9000,
  `archived catalog should stay intact, got ${ALL_FILTER_SIZES.length}`,
);
assert(
  FILTER_SIZES.length === 182,
  `shop catalog should be the 182 wholesale sizes, got ${FILTER_SIZES.length}`,
);
assert(
  THICKNESSES.join(",") === "0.5,1,2,4,5",
  `thicknesses drifted: ${THICKNESSES.join(",")}`,
);
assert(
  MERV_TYPES.every((t) => /^#[0-9a-f]{6}$/i.test(t.badgeColor)),
  "every MERV type needs a badge color",
);
assert(
  MERV_DISPLAY_ORDER.join(",") === "8,carbon,11,13",
  `MERV display order must be 8, Carbon, 11, 13, got ${MERV_DISPLAY_ORDER.join(",")}`,
);
assert(
  MERV_TYPES.find((t) => t.key === "carbon")?.badgeColor === "#111111",
  "MERV 8 Carbon badge must stay black",
);
assert(packShotSrc(8) === FILTER_PRODUCT_IMAGE, "default pack shot is MERV 8");
assert(packShotSrc(8).includes("merv-8-packshot"), "every MERV 8 pack uses the official single-filter pack shot");
assert(productGalleryFor(8)[0].src === packShotSrc(8), "MERV 8 gallery hero is the official pack shot");
assert(packShotSrc(11).includes("merv-11-packshot"), "every MERV 11 pack uses the official single-filter pack shot");
assert(productGalleryFor(11)[0].src === packShotSrc(11), "MERV 11 gallery hero is the official pack shot");
assert(
  !productGalleryFor(11).some((shot) => shot.src.includes("6pack") || shot.src.includes("thin-rectangle")),
  "MERV 11 gallery must not use the stamped 6-pack",
);
assert(packShotSrc(13).includes("merv-13-packshot"), "every MERV 13 pack uses the official single-filter pack shot");
assert(productGalleryFor(13)[0].src === packShotSrc(13), "MERV 13 gallery hero is the official pack shot");
assert(
  !productGalleryFor(13).some((shot) => shot.src.includes("6pack") || shot.src.includes("thin-rectangle")),
  "MERV 13 gallery must not use the stamped 6-pack",
);
assert(packShotSrc(8, true).includes("carbon"), "carbon must use its own pack shot");
const productsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../client/public/products");
for (const key of ["8", "11", "13", "carbon"] as const) {
  for (const suffix of ["thin-rectangle-6pack", "thin-rectangle-no-labels", "layers"] as const) {
    const file = path.join(productsDir, `merv-${key}-${suffix}.png`);
    assert(fs.existsSync(file), `missing pack shot ${file}`);
  }
}
assert(fs.existsSync(path.join(productsDir, "merv-8-macro.png")), "shared macro shot missing");
for (const key of ["8", "11", "13"] as const) {
  assert(fs.existsSync(path.join(productsDir, `merv-${key}-packshot.png`)), `official MERV ${key} pack shot missing`);
  assert(
    fs.existsSync(path.join(productsDir, "source", `merv-${key}-packshot.png`)),
    `official MERV ${key} pack shot source missing`,
  );
}
assert(fs.existsSync(path.join(productsDir, "source", "merv-8-thin-rectangle-6pack.png")), "MERV 8 source 6-pack missing");
assert(
  !productGalleryFor(13).some((shot) => shot.src.includes("merv-8-thin")),
  "MERV 13 gallery must not reuse MERV 8 pack photos",
);
const popularSlugs = popularSizeSlugs(8);
assert(popularSlugs.includes("16x25x2") && popularSlugs.includes("20x25x2"), "popular chips must include 16x25x2 and 20x25x2");
assert(!popularSlugs.includes("20x25x4"), "20x25x4 has no wholesale cost and must not be a popular chip");

const popular = getFilterSize("20x25x1");
assert(popular, "20x25x1 must exist");
assert(popular.depth === 1 && popular.width === 20 && popular.length === 25, "20x25x1 dims");

for (const type of MERV_TYPES) {
  const variant = findProductVariant("20x25x1", type.merv, type.isCarbon);
  assert(variant, `missing 20x25x1 ${type.name}`);
  if (type.isCarbon) {
    assert(!variant.inStock, "20x25x1 carbon is quote-only until wholesale cost exists");
    continue;
  }
  assert(variant.inStock, `${type.name} 20x25x1 should be in stock`);
  const unit1 = unitPriceForQty(variant.price, 1, variant);
  const unit6 = unitPriceForQty(variant.price, 6, variant);
  assert(unit1 > 0 && unit6 > 0, `${type.name} prices must be positive`);
  assert(unit6 <= unit1, `${type.name} 6-pack unit should not exceed 1-pack (${unit6} vs ${unit1})`);
  const total6 = packTotal(variant.price, 6, variant);
  assert(Math.abs(total6 - unit6 * 6) < 0.02, `${type.name} pack total mismatch`);
}

assert(!getFilterSize("20x25x4"), "20x25x4 must not be shoppable");
assert(getArchivedFilterSize("20x25x4"), "20x25x4 must stay in the archived catalog");
const fourteen = findProductVariant("14x25x1", 8);
assert(fourteen?.inStock, "14x25x1 MERV 8 is on the wholesale sheet");
assert(!findProductVariant("14x25x1", 11)?.inStock, "14x25x1 MERV 11 is not on the wholesale sheet");
assert(!findProductVariant("16x25x4", 8)?.inStock, "16x25x4 MERV 8 is not on the wholesale sheet");
assert(findProductVariant("16x25x4", 11)?.inStock, "16x25x4 MERV 11 is on the wholesale sheet");
assert(
  mervTypesForSize("14x25x1").map((t) => t.key).join(",") === "8",
  "14x25x1 should only offer MERV 8",
);

let sellableCount = 0;
for (const size of ALL_FILTER_SIZES) {
  for (const type of MERV_TYPES) {
    const variant = findProductVariant(size.slug, type.merv, type.isCarbon);
    if (variant?.inStock) sellableCount += 1;
  }
}
assert(sellableCount === 299, `exactly 299 wholesale SKUs should be in stock, got ${sellableCount}`);

const sizePages = sitemapPaths().filter((p) => p.path.startsWith("/sizes/")).length;
assert(sizePages === FILTER_SIZES.length, `sitemap size pages ${sizePages} must match shop catalog`);

const ladders = liveLadderCount();
assert(ladders > 50, `live ladder table looks empty: ${ladders}`);
const live = liveListPrice("20x25x1", 8);
assert(live === 9.99, `20x25x1 MERV 8 qty 1 must match Filtrete $9.99, got ${live}`);
assert(liveListPrice("20x20x1", 8) === 9.99, "20x20x1 MERV 8 qty 1 must match Filtrete $9.99");
assert(liveListPrice("16x25x1", 8) === 9.99, "16x25x1 MERV 8 qty 1 must match Filtrete $9.99");
assert(liveListPrice("20x20x1", 11) === 13.49, "20x20x1 MERV 11 qty 1 must match Filtrete $13.49");
assert(liveListPrice("20x25x1", 13) === 22.99, "20x25x1 MERV 13 qty 1 must match Filtrete $22.99");
const live2 = liveUnitPrice({ size: "20x20x1", merv: 8 }, 2);
assert(typeof live2 === "number" && live2 <= 9.99, `20x20x1 MERV 8 qty 2 must not exceed the Filtrete single (${live2})`);
assert(liveUnitPrice({ size: "20x20x1", merv: 11 }, 2) === 11, "20x20x1 MERV 11 qty 2 must match Filtrete $11.00");
assert(liveUnitPrice({ size: "16x25x1", merv: 11 }, 2) === 11, "16x25x1 MERV 11 qty 2 must match Filtrete $11.00");
assert(liveUnitPrice({ size: "16x25x1", merv: 13 }, 2) === 15, "16x25x1 MERV 13 qty 2 must match Filtrete $15.00");
assert(liveUnitPrice({ size: "20x25x1", merv: 13 }, 2) === 15.98, "20x25x1 MERV 13 qty 2 stays on the Filter King undercut");
assert(liveUnitPrice({ size: "20x20x1", merv: 8 }, 12) === 5.18, "20x20x1 MERV 8 qty 12 must match Filtrete Walmart $5.18");
assert(liveUnitPrice({ size: "16x25x1", merv: 8 }, 12) === 5.43, "16x25x1 MERV 8 qty 12 stays cheaper than Filtrete");
const live6 = liveUnitPrice({ size: "20x25x1", merv: 8 }, 6);
assert(typeof live6 === "number" && live6 <= (live as number), "live 6-pack should undercut or match list");
const thick = liveListPrice("16x25x4", 11);
assert(typeof thick === "number" && thick > 22.99, `4-inch qty 1 stays on the Filter King ladder, got ${thick}`);

const inch = getSizesByThickness(1);
assert(inch.length > 20, `1" catalog too small: ${inch.length}`);
const halfWidths = inch.filter((s) => s.width % 1 !== 0);
assert(halfWidths.length > 0, "expected some half-inch widths in the 1\" catalog");
const sample = halfWidths[0];
const whole = Math.floor(sample.width);
const matched = inch.filter((s) => Math.floor(s.width) === whole);
assert(
  matched.some((s) => s.slug === sample.slug),
  `width chip ${whole}" must include ${sample.slug}`,
);
assert(
  matched.every((s) => s.depth === 1),
  "width filter must stay on the selected depth",
);

const odd = getFilterSize("20.5x25x1") ?? inch.find((s) => s.width % 1 !== 0);
assert(odd, "need a fractional-width size to prove the directory filter");

console.log("Shop / catalog / pricing checks passed.");
console.log(
  JSON.stringify(
    {
      sizes: FILTER_SIZES.length,
      archivedSizes: ALL_FILTER_SIZES.length,
      sellableSkus: sellableCount,
      liveLadders: ladders,
      list20x25x1: live,
      pack6_20x25x1: live6,
      inchSizes: inch.length,
      widthChipIncludes: sample.slug,
      email: BRAND_EMAIL,
    },
    null,
    2,
  ),
);

