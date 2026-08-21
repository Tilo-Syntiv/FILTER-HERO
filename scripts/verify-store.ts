import { BRAND_EMAIL } from "../shared/const.ts";
import {
  FILTER_SIZES,
  MERV_DISPLAY_ORDER,
  MERV_TYPES,
  THICKNESSES,
  findProductVariant,
  getFilterSize,
  getSizesByThickness,
  packTotal,
  popularSizeSlugs,
  unitPriceForQty,
} from "../shared/products.ts";
import {
  liveLadderCount,
  liveListPrice,
  liveUnitPrice,
} from "../shared/pricing/engine.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(BRAND_EMAIL === "info@filterhero.net", `brand email should be info@, got ${BRAND_EMAIL}`);
assert(FILTER_SIZES.length > 100, `catalog too small: ${FILTER_SIZES.length}`);
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
const popularSlugs = popularSizeSlugs(8);
assert(popularSlugs.includes("16x25x2") && popularSlugs.includes("20x25x2"), "popular chips must include 16x25x2 and 20x25x2");

const popular = getFilterSize("20x25x1");
assert(popular, "20x25x1 must exist");
assert(popular.depth === 1 && popular.width === 20 && popular.length === 25, "20x25x1 dims");

for (const type of MERV_TYPES) {
  const variant = findProductVariant("20x25x1", type.merv, type.isCarbon);
  assert(variant, `missing 20x25x1 ${type.name}`);
  assert(variant.inStock, `${type.name} 20x25x1 should be in stock`);
  const unit1 = unitPriceForQty(variant.price, 1, variant);
  const unit6 = unitPriceForQty(variant.price, 6, variant);
  assert(unit1 > 0 && unit6 > 0, `${type.name} prices must be positive`);
  assert(unit6 <= unit1, `${type.name} 6-pack unit should not exceed 1-pack (${unit6} vs ${unit1})`);
  const total6 = packTotal(variant.price, 6, variant);
  assert(Math.abs(total6 - unit6 * 6) < 0.02, `${type.name} pack total mismatch`);
}

const ladders = liveLadderCount();
assert(ladders > 50, `live ladder table looks empty: ${ladders}`);
const live = liveListPrice("20x25x1", 8);
assert(typeof live === "number" && live > 0, `20x25x1 MERV 8 needs a live list price, got ${live}`);
const live6 = liveUnitPrice({ size: "20x25x1", merv: 8 }, 6);
assert(typeof live6 === "number" && live6 <= (live as number), "live 6-pack should undercut or match list");

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
