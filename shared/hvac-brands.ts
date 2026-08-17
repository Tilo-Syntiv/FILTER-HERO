import HVAC_BRANDS from "./hvac-brands.json";
import { getFilterSize, type FilterSize } from "./products";

export type BrandCodeMap = {
  code: string;
  size: string;
};

export type HvacBrand = {
  slug: string;
  name: string;
  featured: boolean;
  sizes: string[];
  models: BrandCodeMap[];
  oemParts: BrandCodeMap[];
};

export const HVAC_BRAND_LIST = HVAC_BRANDS as HvacBrand[];

const BY_SLUG = new Map(HVAC_BRAND_LIST.map((b) => [b.slug, b]));

export function getHvacBrand(slug: string): HvacBrand | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}

export function featuredHvacBrands(): HvacBrand[] {
  return HVAC_BRAND_LIST.filter((b) => b.featured);
}

export function catalogSizeForSlug(slug: string): FilterSize | undefined {
  return getFilterSize(slug);
}

export function brandsForSize(sizeSlug: string): HvacBrand[] {
  const key = sizeSlug.toLowerCase();
  return HVAC_BRAND_LIST.filter((b) => b.sizes.some((s) => s.toLowerCase() === key));
}

export function searchBrandCodes(query: string): Array<{
  brand: HvacBrand;
  kind: "model" | "oem";
  code: string;
  size: string;
}> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: Array<{
    brand: HvacBrand;
    kind: "model" | "oem";
    code: string;
    size: string;
  }> = [];
  for (const brand of HVAC_BRAND_LIST) {
    for (const m of brand.models) {
      if (m.code.toLowerCase().includes(q)) {
        hits.push({ brand, kind: "model", code: m.code, size: m.size });
      }
    }
    for (const p of brand.oemParts) {
      if (p.code.toLowerCase().includes(q)) {
        hits.push({ brand, kind: "oem", code: p.code, size: p.size });
      }
    }
  }
  return hits.slice(0, 24);
}
