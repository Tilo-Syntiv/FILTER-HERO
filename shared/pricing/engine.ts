import FK_LIVE from "./fk-live-prices.json";

/** Undercut scraped FilterKing sale units by 10%. */
export const UNDERCUT_RATIO = 0.9;
/**
 * Extra cushion on estimated (modeled) ladders so we stay under FilterKing
 * even when the model is a bit high.
 */
export const ESTIMATED_UNDERCUT_RATIO = 0.88;

/**
 * Target Filtrete 1-pack, 1-inch only. Same ticket across common sizes.
 * MERV 8 = MPR 700, MERV 11 = MPR 1000, MERV 13 = MPR 1900.
 * Collected Aug 30, 2026.
 */
export const FILTRETE_1INCH_QTY1: Record<"8" | "11" | "13", number> = {
  "8": 9.99,
  "11": 13.49,
  "13": 22.99,
};

export type MervPriceKey = "8" | "11" | "13" | "carbon";

export type QtyKey = "q1" | "q2" | "q4" | "q6" | "q12";

/**
 * Filtrete units that beat our Filter King undercut. Match only these
 * rungs — do not pull 4 / 6 / other 12s down. Target 2-packs and Walmart
 * 12-pack, Aug 30, 2026.
 */
const FILTRETE_BEAT: Array<{
  size: string;
  merv: "8" | "11" | "13";
  key: QtyKey;
  unit: number;
}> = [
  { size: "14x20x1", merv: "11", key: "q2", unit: 11 },
  { size: "16x20x1", merv: "11", key: "q2", unit: 11 },
  { size: "16x25x1", merv: "11", key: "q2", unit: 11 },
  { size: "20x20x1", merv: "11", key: "q2", unit: 11 },
  { size: "20x25x1", merv: "11", key: "q2", unit: 11 },
  { size: "16x25x1", merv: "13", key: "q2", unit: 15 },
  { size: "20x20x1", merv: "8", key: "q12", unit: 5.18 },
];

export type Priceable = {
  size: string;
  merv: 8 | 11 | 13;
  isCarbon?: boolean;
};

export type FkLadder = Partial<Record<QtyKey, number>> & {
  size: string;
  merv: string;
  sku?: string;
  estimated?: boolean;
};

const QTY_STEPS: Array<{ minQty: number; key: QtyKey }> = [
  { minQty: 1, key: "q1" },
  { minQty: 2, key: "q2" },
  { minQty: 4, key: "q4" },
  { minQty: 6, key: "q6" },
  { minQty: 12, key: "q12" },
];

function money(n: number): number {
  return Math.round(n * 100) / 100;
}

function normalizeSize(size: string): string {
  return size.toLowerCase().replace(/\s/g, "").replace(/a$/i, "");
}

function sizeDepth(size: string): number | undefined {
  const parts = normalizeSize(size).split("x");
  if (parts.length < 3) return undefined;
  const depth = Number(parts[parts.length - 1]);
  return Number.isFinite(depth) ? depth : undefined;
}

/** Filtrete Target 1-pack when we sell the same 1-inch MERV. */
export function filtreteQty1(
  size: string,
  merv: 8 | 11 | 13,
  isCarbon?: boolean,
): number | undefined {
  if (isCarbon) return undefined;
  if (sizeDepth(size) !== 1) return undefined;
  return FILTRETE_1INCH_QTY1[String(merv) as "8" | "11" | "13"];
}

export function mervPriceKey(merv: 8 | 11 | 13, isCarbon?: boolean): MervPriceKey {
  if (isCarbon) return "carbon";
  return String(merv) as MervPriceKey;
}

function normalizeFkMerv(raw: string): MervPriceKey | null {
  const v = raw.toLowerCase().trim();
  if (v === "8" || v === "merv-8" || v === "merv8") return "8";
  if (v === "11" || v === "merv-11" || v === "merv11") return "11";
  if (v === "13" || v === "merv-13" || v === "merv13") return "13";
  if (v === "carbon" || v === "odor" || v === "merv-8-carbon") return "carbon";
  return null;
}

function ladderKey(size: string, merv: MervPriceKey): string {
  return `${normalizeSize(size)}|${merv}`;
}

function buildLadderMap(products: FkLadder[]): Map<string, FkLadder> {
  const map = new Map<string, FkLadder>();
  for (const row of products) {
    const merv = normalizeFkMerv(row.merv);
    if (!merv || !row.size) continue;
    const filled = QTY_STEPS.filter((s) => typeof row[s.key] === "number").length;
    if (filled < 3) continue;
    const key = ladderKey(row.size, merv);
    const prev = map.get(key);
    const prevFilled = prev
      ? QTY_STEPS.filter((s) => typeof prev[s.key] === "number").length
      : 0;
    // Prefer scraped over estimated; then richer ladders.
    if (prev && !prev.estimated && row.estimated) continue;
    if (prev && prev.estimated && !row.estimated) {
      map.set(key, { ...row, size: normalizeSize(row.size), merv });
      continue;
    }
    if (!prev || filled >= prevFilled) {
      map.set(key, { ...row, size: normalizeSize(row.size), merv });
    }
  }
  return map;
}

const LADDERS = buildLadderMap((FK_LIVE as { products: FkLadder[] }).products);

export function fkLadderFor(
  size: string,
  merv: 8 | 11 | 13,
  isCarbon?: boolean,
): FkLadder | undefined {
  return LADDERS.get(ladderKey(size, mervPriceKey(merv, isCarbon)));
}

/** FilterKing unit × undercut ratio (deeper when estimated). */
export function heroFromFk(fkUnit: number, estimated = false): number {
  const ratio = estimated ? ESTIMATED_UNDERCUT_RATIO : UNDERCUT_RATIO;
  return money(fkUnit * ratio);
}

function fkUnitForQty(ladder: FkLadder, qty: number): number | undefined {
  let unit: number | undefined;
  for (const step of QTY_STEPS) {
    const price = ladder[step.key];
    if (qty >= step.minQty && typeof price === "number") unit = price;
  }
  return unit;
}

function qtyKeyFor(qty: number): QtyKey {
  let key: QtyKey = "q1";
  for (const step of QTY_STEPS) {
    if (qty >= step.minQty) key = step.key;
  }
  return key;
}

/** Filtrete unit on a rung where they beat us. */
export function filtreteBeatUnit(
  size: string,
  merv: 8 | 11 | 13,
  qty: number,
  isCarbon?: boolean,
): number | undefined {
  if (isCarbon) return undefined;
  const key = qtyKeyFor(qty);
  const want = `${normalizeSize(size)}|${merv}|${key}`;
  const hit = FILTRETE_BEAT.find(
    (row) => `${normalizeSize(row.size)}|${row.merv}|${row.key}` === want,
  );
  return hit?.unit;
}

/** Qty-1 Filter Hero list: 1-inch matches Filtrete; else FilterKing × undercut. */
export function liveListPrice(
  size: string,
  merv: 8 | 11 | 13,
  isCarbon?: boolean,
): number | undefined {
  const matched = filtreteQty1(size, merv, isCarbon);
  if (matched != null) return matched;
  const ladder = fkLadderFor(size, merv, isCarbon);
  const q1 = ladder?.q1;
  return typeof q1 === "number" ? heroFromFk(q1, Boolean(ladder?.estimated)) : undefined;
}

/**
 * Pack unit. Qty 1 on 1-inch matches Filtrete. Larger packs stay on the
 * FilterKing undercut, but never cost more per filter than that single.
 * Where a Filtrete multi-pack still beats us, drop to that unit only.
 */
export function liveUnitPrice(product: Priceable, qty: number): number | undefined {
  const matched = filtreteQty1(product.size, product.merv, product.isCarbon);
  const beat = filtreteBeatUnit(product.size, product.merv, qty, product.isCarbon);
  const ladder = fkLadderFor(product.size, product.merv, product.isCarbon);
  if (!ladder) {
    if (qty <= 1) return matched;
    return beat;
  }
  const fk = fkUnitForQty(ladder, qty);
  const fromFk = typeof fk === "number" ? heroFromFk(fk, Boolean(ladder.estimated)) : undefined;
  if (qty <= 1) return matched ?? fromFk;
  if (fromFk == null) return beat ?? matched;
  const capped = matched != null && fromFk > matched ? matched : fromFk;
  if (beat != null && beat < capped) return beat;
  return capped;
}

/** Cheapest undercut for merchandising "from $X". */
export function liveFromPrice(key: MervPriceKey): number | undefined {
  let min: number | undefined;
  for (const row of Array.from(LADDERS.values())) {
    if (row.merv !== key) continue;
    for (const step of QTY_STEPS) {
      const fk = row[step.key];
      if (typeof fk !== "number") continue;
      const hero = heroFromFk(fk, Boolean(row.estimated));
      if (min === undefined || hero < min) min = hero;
    }
  }
  return min;
}

export function liveLadderCount(): number {
  return LADDERS.size;
}

export function liveScrapedCount(): number {
  let n = 0;
  for (const row of Array.from(LADDERS.values())) {
    if (!row.estimated) n += 1;
  }
  return n;
}
