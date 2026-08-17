import FK_LIVE from "./fk-live-prices.json";

export const UNDERCUT_RATIO = 0.9;

export type MervPriceKey = "8" | "11" | "13" | "carbon";

export type QtyKey = "q1" | "q2" | "q4" | "q6" | "q12";

export type Priceable = {
  size: string;
  merv: 8 | 11 | 13;
  isCarbon?: boolean;
};

export type FkLadder = Partial<Record<QtyKey, number>> & {
  size: string;
  merv: string;
  sku?: string;
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
  return size.toLowerCase().replace(/\s/g, "");
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

/** FilterKing live unit × 0.90, rounded to cents. */
export function heroFromFk(fkUnit: number): number {
  return money(fkUnit * UNDERCUT_RATIO);
}

function fkUnitForQty(ladder: FkLadder, qty: number): number | undefined {
  let unit: number | undefined;
  for (const step of QTY_STEPS) {
    const price = ladder[step.key];
    if (qty >= step.minQty && typeof price === "number") unit = price;
  }
  return unit;
}

/** Qty-1 Filter Hero list when a live FilterKing ladder exists. */
export function liveListPrice(
  size: string,
  merv: 8 | 11 | 13,
  isCarbon?: boolean,
): number | undefined {
  const q1 = fkLadderFor(size, merv, isCarbon)?.q1;
  return typeof q1 === "number" ? heroFromFk(q1) : undefined;
}

/** Pack unit when a live ladder exists; otherwise undefined (use depth formula). */
export function liveUnitPrice(product: Priceable, qty: number): number | undefined {
  const ladder = fkLadderFor(product.size, product.merv, product.isCarbon);
  if (!ladder) return undefined;
  const fk = fkUnitForQty(ladder, qty);
  return typeof fk === "number" ? heroFromFk(fk) : undefined;
}

/** Cheapest live undercut for merchandising "from $X"; undefined if no rows. */
export function liveFromPrice(key: MervPriceKey): number | undefined {
  let min: number | undefined;
  for (const row of LADDERS.values()) {
    if (row.merv !== key) continue;
    for (const step of QTY_STEPS) {
      const fk = row[step.key];
      if (typeof fk !== "number") continue;
      const hero = heroFromFk(fk);
      if (min === undefined || hero < min) min = hero;
    }
  }
  return min;
}

export function liveLadderCount(): number {
  return LADDERS.size;
}
