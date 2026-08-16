export type MervRating = 8 | 11 | 13;

export type FilterSize = {
  /** Nominal size slug used in URLs, e.g. 20x25x1 */
  slug: string;
  width: number;
  length: number;
  depth: number;
  /** Actual (exact) dimensions printed for fit reassurance */
  actualWidth: number;
  actualLength: number;
  actualDepth: number;
};

export type Product = {
  id: number;
  size: string;
  merv: MervRating;
  isCarbon?: boolean;
  /** Unit price at qty 1 before volume discounts */
  price: number;
  inStock: boolean;
  name: string;
  description: string;
};

export type PackTier = {
  minQty: number;
  label: string;
  /** Multiplier applied to unit list price (1 = full price) */
  multiplier: number;
};

/** Volume ladder inspired by typical HVAC filter retail (steeper at higher packs). */
export const PACK_TIERS: PackTier[] = [
  { minQty: 1, label: "1", multiplier: 1 },
  { minQty: 2, label: "2", multiplier: 0.54 },
  { minQty: 4, label: "4", multiplier: 0.3 },
  { minQty: 6, label: "6+", multiplier: 0.28 },
  { minQty: 12, label: "12+", multiplier: 0.21 },
];

export function unitPriceForQty(listPrice: number, qty: number): number {
  let tier = PACK_TIERS[0];
  for (const t of PACK_TIERS) {
    if (qty >= t.minQty) tier = t;
  }
  return Math.round(listPrice * tier.multiplier * 100) / 100;
}

export function packTotal(listPrice: number, qty: number): number {
  return Math.round(unitPriceForQty(listPrice, qty) * qty * 100) / 100;
}

function actualFromNominal(w: number, l: number, d: number) {
  // Typical HVAC: actual is ~0.5" under on face dims; depth slightly under
  const depthMap: Record<number, number> = {
    0.5: 0.38,
    1: 0.75,
    2: 1.75,
    4: 3.75,
    5: 4.75,
  };
  return {
    actualWidth: Math.round((w - 0.5) * 100) / 100,
    actualLength: Math.round((l - 0.5) * 100) / 100,
    actualDepth: depthMap[d] ?? Math.round((d - 0.25) * 100) / 100,
  };
}

function size(w: number, l: number, d: number): FilterSize {
  const slug = `${w}x${l}x${d}`;
  return { slug, width: w, length: l, depth: d, ...actualFromNominal(w, l, d) };
}

/** Popular / common residential sizes by thickness (B2C catalog). */
export const FILTER_SIZES: FilterSize[] = [
  // 0.5"
  size(16, 20, 0.5),
  size(16, 25, 0.5),
  size(20, 20, 0.5),
  size(20, 25, 0.5),
  size(14, 20, 0.5),
  size(14, 25, 0.5),
  size(12, 24, 0.5),
  size(18, 24, 0.5),
  size(20, 30, 0.5),
  size(24, 24, 0.5),
  // 1"
  size(10, 20, 1),
  size(12, 12, 1),
  size(12, 20, 1),
  size(12, 24, 1),
  size(14, 14, 1),
  size(14, 20, 1),
  size(14, 24, 1),
  size(14, 25, 1),
  size(14, 30, 1),
  size(15, 20, 1),
  size(16, 16, 1),
  size(16, 20, 1),
  size(16, 24, 1),
  size(16, 25, 1),
  size(16, 30, 1),
  size(18, 18, 1),
  size(18, 20, 1),
  size(18, 24, 1),
  size(18, 25, 1),
  size(18, 30, 1),
  size(20, 20, 1),
  size(20, 21, 1),
  size(20, 22, 1),
  size(20, 24, 1),
  size(20, 25, 1),
  size(20, 30, 1),
  size(21, 21, 1),
  size(22, 22, 1),
  size(24, 24, 1),
  size(24, 30, 1),
  size(25, 25, 1),
  size(30, 30, 1),
  // 2"
  size(14, 20, 2),
  size(14, 25, 2),
  size(16, 20, 2),
  size(16, 24, 2),
  size(16, 25, 2),
  size(18, 20, 2),
  size(18, 24, 2),
  size(20, 20, 2),
  size(20, 24, 2),
  size(20, 25, 2),
  size(20, 30, 2),
  size(24, 24, 2),
  // 4"
  size(12, 20, 4),
  size(14, 20, 4),
  size(14, 25, 4),
  size(16, 20, 4),
  size(16, 24, 4),
  size(16, 25, 4),
  size(18, 20, 4),
  size(18, 24, 4),
  size(20, 20, 4),
  size(20, 24, 4),
  size(20, 25, 4),
  size(20, 30, 4),
  size(24, 24, 4),
  // 5"
  size(16, 20, 5),
  size(16, 25, 5),
  size(20, 20, 5),
  size(20, 25, 5),
];

export const THICKNESSES = [0.5, 1, 2, 4, 5] as const;

export type MervTypeInfo = {
  key: "8" | "11" | "13" | "carbon";
  merv: MervRating;
  isCarbon: boolean;
  name: string;
  shortLabel: string;
  description: string;
  fromPrice: number;
};

export const MERV_TYPES: MervTypeInfo[] = [
  {
    key: "8",
    merv: 8,
    isCarbon: false,
    name: "MERV 8",
    shortLabel: "Standard",
    description: "Everyday dust and pollen for typical homes",
    fromPrice: 11.99,
  },
  {
    key: "11",
    merv: 11,
    isCarbon: false,
    name: "MERV 11",
    shortLabel: "Advanced",
    description: "Enhanced protection for pets and mild allergies",
    fromPrice: 15.99,
  },
  {
    key: "13",
    merv: 13,
    isCarbon: false,
    name: "MERV 13",
    shortLabel: "Ultimate",
    description: "Superior filtration for asthma and sensitivities",
    fromPrice: 16.99,
  },
  {
    key: "carbon",
    merv: 8,
    isCarbon: true,
    name: "MERV 8 Carbon",
    shortLabel: "Odor",
    description: "Everyday filtration plus activated carbon for odors",
    fromPrice: 19.99,
  },
];

function listPriceFor(depth: number, merv: MervRating, isCarbon: boolean): number {
  const depthBase: Record<number, number> = {
    0.5: 10.99,
    1: 14.99,
    2: 22.99,
    4: 34.99,
    5: 39.99,
  };
  let base = depthBase[depth] ?? 14.99;
  if (merv === 11) base += 3;
  if (merv === 13) base += 5;
  if (isCarbon) base += 6;
  return Math.round(base * 100) / 100;
}

function buildProducts(): Product[] {
  const products: Product[] = [];
  let id = 1;
  for (const s of FILTER_SIZES) {
    for (const t of MERV_TYPES) {
      products.push({
        id: id++,
        size: s.slug,
        merv: t.merv,
        isCarbon: t.isCarbon,
        price: listPriceFor(s.depth, t.merv, t.isCarbon),
        inStock: true,
        name: t.isCarbon ? "Odor Eliminator" : t.merv === 8 ? "Standard Pleated" : t.merv === 11 ? "Allergy Plus" : "Precision High MERV",
        description: t.description,
      });
    }
  }
  return products;
}

export const PRODUCTS: Product[] = buildProducts();

export function getFilterSize(slug: string): FilterSize | undefined {
  const normalized = slug.toLowerCase().replace(/\s/g, "");
  return FILTER_SIZES.find((s) => s.slug.toLowerCase() === normalized);
}

export function getSizesByThickness(depth: number): FilterSize[] {
  return FILTER_SIZES.filter((s) => s.depth === depth);
}

export function getProductById(id: number): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function findProductsBySize(size: string): Product[] {
  const normalized = size.toLowerCase().replace(/\s/g, "");
  return PRODUCTS.filter((p) => p.size.toLowerCase() === normalized);
}

export function findProductVariant(
  size: string,
  merv: MervRating,
  isCarbon = false,
): Product | undefined {
  return findProductsBySize(size).find(
    (p) => p.merv === merv && Boolean(p.isCarbon) === isCarbon,
  );
}

export function popularSizeSlugs(limit = 12): string[] {
  const preferred = [
    "16x25x1",
    "20x25x1",
    "20x20x1",
    "16x20x1",
    "14x25x1",
    "16x25x4",
    "20x25x4",
    "12x24x1",
    "18x24x1",
    "20x30x1",
    "16x20x2",
    "20x25x2",
  ];
  return preferred.filter((slug) => getFilterSize(slug)).slice(0, limit);
}

/** Legacy alias used by MERV guide cards */
export { MERV_TYPES as MERV_GUIDE };
