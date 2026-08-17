import FILTER_CATALOG from "./filter-catalog.json";
import {
  liveFromPrice,
  liveListPrice,
  liveUnitPrice,
  type Priceable,
} from "./pricing/engine";

export {
  liveFromPrice,
  liveListPrice,
  liveUnitPrice,
  liveLadderCount,
  UNDERCUT_RATIO,
  type Priceable,
} from "./pricing/engine";

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
  /** Qty-1 unit price (live FilterKing × 0.90 when known) */
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

/** Qty buttons. Multipliers are fallback only; live SKUs use FilterKing ladders. */
export const PACK_TIERS: PackTier[] = [
  { minQty: 1, label: "1", multiplier: 1 },
  { minQty: 2, label: "2", multiplier: 0.54 },
  { minQty: 4, label: "4", multiplier: 0.3 },
  { minQty: 6, label: "6+", multiplier: 0.28 },
  { minQty: 12, label: "12+", multiplier: 0.21 },
];

function fallbackUnitPrice(listPrice: number, qty: number): number {
  let tier = PACK_TIERS[0];
  for (const t of PACK_TIERS) {
    if (qty >= t.minQty) tier = t;
  }
  return Math.round(listPrice * tier.multiplier * 100) / 100;
}

/**
 * Pack unit price. When `product` has a live FilterKing ladder, uses that
 * SKU's qty table × 0.90. Otherwise applies PACK_TIERS to listPrice.
 */
export function unitPriceForQty(
  listPrice: number,
  qty: number,
  product?: Priceable,
): number {
  if (product) {
    const live = liveUnitPrice(product, qty);
    if (live !== undefined) return live;
  }
  return fallbackUnitPrice(listPrice, qty);
}

export function packTotal(
  listPrice: number,
  qty: number,
  product?: Priceable,
): number {
  return Math.round(unitPriceForQty(listPrice, qty, product) * qty * 100) / 100;
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

function uniqueSizes(list: FilterSize[]): FilterSize[] {
  const seen = new Set<string>();
  return list.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}

/** Full shoppable catalog. Each slug maps to `/sizes/{slug}`. */
export const FILTER_SIZES: FilterSize[] = uniqueSizes(
  (FILTER_CATALOG as Array<[number, number, number]>).map(([w, l, d]) => size(w, l, d)),
);

const SIZE_INDEX = new Map(FILTER_SIZES.map((s, i) => [s.slug.toLowerCase(), i]));

export function catalogWidths(): number[] {
  return Array.from(new Set(FILTER_SIZES.map((s) => s.width))).sort((a, b) => a - b);
}

export function catalogLengths(): number[] {
  return Array.from(new Set(FILTER_SIZES.map((s) => s.length))).sort((a, b) => a - b);
}

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
    fromPrice: liveFromPrice("8") ?? 11.99,
  },
  {
    key: "11",
    merv: 11,
    isCarbon: false,
    name: "MERV 11",
    shortLabel: "Advanced",
    description: "Enhanced protection for pets and mild allergies",
    fromPrice: liveFromPrice("11") ?? 15.99,
  },
  {
    key: "13",
    merv: 13,
    isCarbon: false,
    name: "MERV 13",
    shortLabel: "Ultimate",
    description: "Superior filtration for asthma and sensitivities",
    fromPrice: liveFromPrice("13") ?? 16.99,
  },
  {
    key: "carbon",
    merv: 8,
    isCarbon: true,
    name: "MERV 8 Carbon",
    shortLabel: "Odor",
    description: "Everyday filtration plus activated carbon for odors",
    fromPrice: liveFromPrice("carbon") ?? 19.99,
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

function productName(t: MervTypeInfo): string {
  if (t.isCarbon) return "Odor Eliminator";
  if (t.merv === 8) return "Standard Pleated";
  if (t.merv === 11) return "Allergy Plus";
  return "Precision High MERV";
}

function makeProduct(sizeMeta: FilterSize, type: MervTypeInfo, sizeIndex: number): Product {
  const mervIndex = MERV_TYPES.findIndex((t) => t.key === type.key);
  return {
    id: sizeIndex * MERV_TYPES.length + mervIndex + 1,
    size: sizeMeta.slug,
    merv: type.merv,
    isCarbon: type.isCarbon,
    price:
      liveListPrice(sizeMeta.slug, type.merv, type.isCarbon) ??
      listPriceFor(sizeMeta.depth, type.merv, type.isCarbon),
    inStock: true,
    name: productName(type),
    description: type.description,
  };
}

export function getFilterSize(slug: string): FilterSize | undefined {
  const normalized = slug.toLowerCase().replace(/\s/g, "");
  const idx = SIZE_INDEX.get(normalized);
  return idx === undefined ? undefined : FILTER_SIZES[idx];
}

export function compareFilterSizes(a: FilterSize, b: FilterSize): number {
  return a.width - b.width || a.length - b.length || a.depth - b.depth;
}

export function getSizesByThickness(depth: number): FilterSize[] {
  return FILTER_SIZES.filter((s) => s.depth === depth).sort(compareFilterSizes);
}

export function getProductById(id: number): Product | undefined {
  if (id < 1) return undefined;
  const idx = id - 1;
  const sizeIndex = Math.floor(idx / MERV_TYPES.length);
  const mervIndex = idx % MERV_TYPES.length;
  const sizeMeta = FILTER_SIZES[sizeIndex];
  const type = MERV_TYPES[mervIndex];
  if (!sizeMeta || !type) return undefined;
  return makeProduct(sizeMeta, type, sizeIndex);
}

export function findProductsBySize(size: string): Product[] {
  const sizeMeta = getFilterSize(size);
  if (!sizeMeta) return [];
  const sizeIndex = SIZE_INDEX.get(sizeMeta.slug.toLowerCase()) ?? 0;
  return MERV_TYPES.map((t) => makeProduct(sizeMeta, t, sizeIndex));
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

/** Popular sizes shown as shortcuts — must exist in the scraped catalog. */
export function popularSizeSlugs(limit = 12): string[] {
  const preferred = [
    "16x25x1",
    "20x25x1",
    "20x20x1",
    "16x20x1",
    "14x25x1",
    "16x25x2",
    "20x25x2",
    "12x24x1",
    "18x24x1",
    "20x30x1",
    "16x20x2",
    "16x25x4",
    "20x25x4",
  ];
  return preferred
    .map((slug) => getFilterSize(slug))
    .filter((size): size is FilterSize => Boolean(size))
    .slice(0, limit)
    .sort(compareFilterSizes)
    .map((size) => size.slug);
}

/** Legacy alias used by MERV guide cards */
export { MERV_TYPES as MERV_GUIDE };
