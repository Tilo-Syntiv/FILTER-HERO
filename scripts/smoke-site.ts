import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LIFE } from "../client/src/data/life-photos.ts";
import { HVAC_BRAND_LIST, catalogSizeForSlug } from "../shared/hvac-brands.ts";
import {
  FILTER_SIZES,
  THICKNESSES,
  findProductVariant,
  getFilterSize,
  packShotSrc,
  popularSizeSlugs,
  productGalleryFor,
} from "../shared/products.ts";
import { sitemapPaths } from "../shared/seo.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "client", "public");
const BASE = process.env.SMOKE_BASE || "http://127.0.0.1:3000";
const API = process.env.SMOKE_API || "http://127.0.0.1:3001";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

function publicFile(urlPath: string) {
  return path.join(PUBLIC, urlPath.replace(/^\//, "").split("?")[0]);
}

async function get(url: string) {
  const res = await fetch(url);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { res, text, json };
}

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not json */
  }
  return { res, text, json };
}

const missing: string[] = [];
for (const photo of Object.values(LIFE)) {
  if (!fs.existsSync(publicFile(photo.src))) missing.push(photo.src);
}
for (const brand of HVAC_BRAND_LIST) {
  const src = `/brands/${brand.slug}.svg`;
  if (!fs.existsSync(publicFile(src))) missing.push(src);
}
for (const asset of [
  "/logo.png",
  "/favicon.png",
  "/hero/pack-merv8.png",
  "/hero/pack-merv11.png",
  "/hero/pack-merv13.png",
  "/hero/showcase-carbon.png",
  "/hero/character-fly-still.png",
  "/hero/character-fly-natural.webm",
  "/hero/character-fly-natural.mp4",
  "/hero/fh-sells-fk.png",
]) {
  if (!fs.existsSync(publicFile(asset))) missing.push(asset);
}
for (const [merv, carbon] of [
  [8, false],
  [11, false],
  [13, false],
  [8, true],
] as const) {
  for (const shot of productGalleryFor(merv, carbon)) {
    if (!fs.existsSync(publicFile(shot.src))) missing.push(shot.src);
  }
  if (!fs.existsSync(publicFile(packShotSrc(merv, carbon)))) {
    missing.push(packShotSrc(merv, carbon));
  }
}
assert(missing.length === 0, `missing public assets:\n${missing.join("\n")}`);

const uncataloguedBrandSizes = new Set<string>();
for (const brand of HVAC_BRAND_LIST) {
  for (const size of brand.sizes) {
    if (!getFilterSize(size)) uncataloguedBrandSizes.add(`${brand.slug}:${size}`);
  }
  for (const row of [...brand.models, ...brand.oemParts]) {
    if (!getFilterSize(row.size)) uncataloguedBrandSizes.add(`${brand.slug}:${row.size}`);
  }
}

for (const slug of popularSizeSlugs(12)) {
  assert(getFilterSize(slug), `popular slug missing from shop: ${slug}`);
}

async function main() {
const health = await get(`${API}/api/health`);
assert(health.res.ok, `health ${health.res.status}`);
assert((health.json as { ok?: boolean })?.ok === true, "health.ok");

const products = await get(`${API}/api/products`);
assert(products.res.ok, `products ${products.res.status}`);
const meta = products.json as { sizeCount?: number };
assert(meta.sizeCount === FILTER_SIZES.length, `API sizeCount ${meta.sizeCount} != ${FILTER_SIZES.length}`);

const sitemap = await get(`${API}/sitemap.xml`);
assert(sitemap.res.ok, `sitemap ${sitemap.res.status}`);
assert(sitemap.text.includes("<urlset"), "sitemap missing urlset");
assert(sitemap.text.includes("/sizes/20x25x1"), "sitemap missing 20x25x1");

const robots = await get(`${API}/robots.txt`);
assert(robots.res.ok && robots.text.includes("Sitemap:"), "robots");

const llms = await get(`${API}/llms.txt`);
assert(llms.res.ok && llms.text.toLowerCase().includes("filter hero"), "llms.txt");

const pages = [
  "/",
  "/sizes",
  "/sizes/20x25x1",
  "/sizes/20x25x1?merv=carbon",
  "/sizes/20x25x4",
  "/sizes/not-a-real-size",
  "/filters/1-inch",
  "/filters/0.5-inch",
  "/filters/2-inch",
  "/filters/4-inch",
  "/filters/5-inch",
  "/filters/3-inch",
  "/brands",
  "/brands/carrier",
  "/brands/not-a-brand",
  "/custom-air-filters",
  "/custom-air-filters?size=19.5x23.5x1",
  "/how-often-to-change-air-filter",
  "/checkout/success",
  "/checkout/cancel",
  "/404",
  "/this-route-does-not-exist",
];
for (const page of pages) {
  const hit = await get(`${BASE}${page}`);
  assert(hit.res.ok, `${page} returned ${hit.res.status}`);
  assert(hit.text.includes("<div id=\"root\">") || hit.text.includes("id=\"root\""), `${page} is not the SPA shell`);
}

const badContact = await post(`${API}/api/contact`, { name: "", email: "nope", message: "" });
assert(badContact.res.status === 400, `invalid contact should 400, got ${badContact.res.status}`);

const goodContact = await post(`${API}/api/contact`, {
  name: "Smoke Test",
  email: "smoke-test@example.com",
  phone: "",
  filterSize: "20x25x1",
  message: "Automated smoke test — ignore this lead.",
  intent: "support",
});
assert(goodContact.res.ok, `contact failed ${goodContact.res.status} ${goodContact.text}`);
assert((goodContact.json as { ok?: boolean })?.ok === true, "contact.ok");

const variant = findProductVariant("20x25x1", 8);
assert(variant, "20x25x1 MERV 8");
const checkout = await post(`${API}/api/checkout`, {
  items: [{ productId: variant.id, quantity: 1 }],
});
if (checkout.res.status === 503) {
  console.warn("Checkout skipped — Stripe is not configured.");
} else {
  assert(checkout.res.ok, `checkout failed ${checkout.res.status} ${checkout.text}`);
  const url = (checkout.json as { url?: string }).url || "";
  assert(url.includes("checkout.stripe.com") || url.includes("stripe.com"), `unexpected checkout url: ${url}`);
}

const badCheckout = await post(`${API}/api/checkout`, { items: [] });
assert(badCheckout.res.status === 400, `empty cart checkout should 400, got ${badCheckout.res.status}`);

const missingSession = await get(`${API}/api/checkout/session?session_id=not-a-session`);
assert(missingSession.res.status === 400, `bad session should 400, got ${missingSession.res.status}`);

const quoteOrShop = (size: string) =>
  catalogSizeForSlug(size) ? `/sizes/${encodeURIComponent(size)}` : `/custom-air-filters?size=${encodeURIComponent(size)}`;
assert(quoteOrShop("20x25x1").startsWith("/sizes/"), "shoppable size must go to PDP");

console.log("Smoke site checks passed.");
console.log(
  JSON.stringify(
    {
      base: BASE,
      api: API,
      pages: pages.length,
      brands: HVAC_BRAND_LIST.length,
      sizes: FILTER_SIZES.length,
      thicknesses: THICKNESSES.join(","),
      uncataloguedBrandSizes: uncataloguedBrandSizes.size,
      checkout: checkout.res.status,
    },
    null,
    2,
  ),
);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
