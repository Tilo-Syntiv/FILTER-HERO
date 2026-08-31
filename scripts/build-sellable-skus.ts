/**
 * Rebuild shared/sellable-skus.json from the Filter King wholesale sheet extract.
 * Full catalog stays in shared/filter-catalog.json — this file is the shop allowlist.
 *
 * Usage: pnpm exec tsx scripts/build-sellable-skus.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHEET = path.join(ROOT, ".firecrawl", "fk-wholesale-2025.txt");
const CATALOG = path.join(ROOT, "shared", "filter-catalog.json");
const OUT = path.join(ROOT, "shared", "sellable-skus.json");

const SKU_RE = /^FK(\d+(?:\.\d+)?x\d+(?:\.\d+)?x\d+(?:\.\d+)?)([ANan])?$/i;

type SheetRow = {
  size: string;
  merv: 8 | 11 | 13;
  wholesaleSku: string;
  cost: number;
  suffix: string;
};

function parseSheet(text: string): SheetRow[] {
  const rows: SheetRow[] = [];
  let merv: 8 | 11 | 13 | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("MERV ")) {
      const n = Number(line.split(/\s+/)[1]);
      if (n === 8 || n === 11 || n === 13) merv = n;
      continue;
    }
    if (!line.startsWith("FK") || merv == null) continue;
    const [sku, priceS] = line.split("\t");
    const match = SKU_RE.exec(sku);
    if (!match || !priceS) {
      throw new Error(`Unparsed wholesale line: ${line}`);
    }
    rows.push({
      size: match[1].toLowerCase(),
      merv,
      wholesaleSku: sku,
      cost: Number(priceS.replace("$", "")),
      suffix: (match[2] || "").toUpperCase(),
    });
  }
  return rows;
}

function preferred(rows: SheetRow[]): SheetRow {
  const plain = rows.filter((r) => !r.suffix);
  return (plain.length ? plain : rows).reduce((best, row) =>
    row.cost < best.cost ? row : best,
  );
}

const sheet = parseSheet(fs.readFileSync(SHEET, "utf8"));
const grouped = new Map<string, SheetRow[]>();
for (const row of sheet) {
  const key = `${row.size}|${row.merv}`;
  const list = grouped.get(key) ?? [];
  list.push(row);
  grouped.set(key, list);
}

const skus = Array.from(grouped.values())
  .map((rows) => {
    const chosen = preferred(rows);
    return {
      size: chosen.size,
      merv: chosen.merv,
      wholesaleSku: chosen.wholesaleSku,
      cost: chosen.cost,
    };
  })
  .sort((a, b) => a.size.localeCompare(b.size, "en") || a.merv - b.merv);

const catalog = new Set(
  (JSON.parse(fs.readFileSync(CATALOG, "utf8")) as Array<[number, number, number]>).map(
    ([w, l, d]) => `${w}x${l}x${d}`.toLowerCase(),
  ),
);
const missing = skus.filter((s) => !catalog.has(s.size));
if (missing.length) {
  throw new Error(
    `Wholesale sizes missing from filter-catalog.json: ${missing
      .map((s) => s.size)
      .join(", ")}`,
  );
}

const uniqueSizes = new Set(skus.map((s) => s.size)).size;
const payload = {
  source: "Paul Sellaro 2025 Filter King dealer sheet",
  extractedFrom: ".firecrawl/fk-wholesale-2025.txt",
  note: "Shop sells only these size × MERV lines. Keep filter-catalog.json intact. Set SELLABLE_ONLY to false in shared/products.ts to restore every size and carbon.",
  sheetRows: sheet.length,
  count: skus.length,
  sizes: uniqueSizes,
  skus,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      wrote: path.relative(ROOT, OUT),
      sheetRows: payload.sheetRows,
      uniqueSkus: payload.count,
      uniqueSizes: payload.sizes,
      missingFromCatalog: 0,
    },
    null,
    2,
  ),
);
