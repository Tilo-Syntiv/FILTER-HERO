/**
 * Rebuild shared/sellable-skus.json from Filter King’s contractor commerce sheet.
 * Full size archive stays in shared/filter-catalog.json — this file is the shop list.
 *
 * Usage: pnpm exec tsx scripts/build-sellable-skus.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHEET = path.join(ROOT, "shared", "pricing", "fk-contractor-commerce.csv");
const CATALOG = path.join(ROOT, "shared", "filter-catalog.json");
const OUT = path.join(ROOT, "shared", "sellable-skus.json");
const EXTRACT = path.join(ROOT, ".firecrawl", "fk-wholesale-contractor.txt");

const SIZE_RE = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)([an])?$/i;
const DIM = String.raw`(?:\d+(?:\.\d+)?|\.\d+)`;
const ACTUAL_RE = new RegExp(`^(${DIM})\\s*x\\s*(${DIM})\\s*x\\s*(${DIM})$`, "i");

type Merv = 8 | 11 | 13;

type SheetRow = {
  size: string;
  width: number;
  length: number;
  depth: number;
  merv: Merv;
  isCarbon: boolean;
  wholesaleSku: string;
  cost: number;
  suffix: string;
  actualWidth: number;
  actualLength: number;
  actualDepth: number;
};

export type SellableSku = {
  size: string;
  merv: Merv;
  isCarbon?: boolean;
  wholesaleSku: string;
  cost: number;
  actualWidth: number;
  actualLength: number;
  actualDepth: number;
};

function stripMarks(value: string): string {
  return value.replace(/^\uFEFF/, "").replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, "").trim();
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function parseMerv(raw: string): { merv: Merv; isCarbon: boolean } | null {
  const value = stripMarks(raw).toUpperCase();
  if (value === "CARBON") return { merv: 8, isCarbon: true };
  const match = /^MERV\s*(8|11|13)$/.exec(value);
  if (!match) return null;
  return { merv: Number(match[1]) as Merv, isCarbon: false };
}

function parseSheet(text: string): SheetRow[] {
  const rows: SheetRow[] = [];
  const lines = text.split(/\r?\n/);
  for (let i = 1; i < lines.length; i += 1) {
    const line = stripMarks(lines[i]);
    if (!line) continue;
    const [skuRaw, sizeRaw, actualRaw, mervRaw, , priceRaw] = parseCsvLine(line);
    const sku = stripMarks(skuRaw ?? "");
    const sizeCell = stripMarks(sizeRaw ?? "").toLowerCase();
    const mervInfo = parseMerv(mervRaw ?? "");
    const cost = Number(stripMarks(priceRaw ?? "").replace(/[$,]/g, ""));
    if (!mervInfo || !Number.isFinite(cost) || cost <= 0) continue;
    const match = SIZE_RE.exec(sizeCell);
    if (!match) {
      throw new Error(`Unparsed contractor size on line ${i + 1}: ${line}`);
    }
    const actualMatch = ACTUAL_RE.exec(stripMarks(actualRaw ?? ""));
    if (!actualMatch) {
      throw new Error(`Unparsed actual size on line ${i + 1}: ${actualRaw}`);
    }
    rows.push({
      size: `${match[1]}x${match[2]}x${match[3]}`.toLowerCase(),
      width: Number(match[1]),
      length: Number(match[2]),
      depth: Number(match[3]),
      merv: mervInfo.merv,
      isCarbon: mervInfo.isCarbon,
      wholesaleSku: sku || `AF${match[1]}x${match[2]}x${match[3]}-${mervInfo.isCarbon ? "CO" : `M${mervInfo.merv}`}`,
      cost,
      suffix: (match[4] || "").toUpperCase(),
      actualWidth: Number(actualMatch[1]),
      actualLength: Number(actualMatch[2]),
      actualDepth: Number(actualMatch[3]),
    });
  }
  return rows;
}

function skuKey(row: { size: string; merv: Merv; isCarbon: boolean }): string {
  return `${row.size}|${row.isCarbon ? "carbon" : row.merv}`;
}

function preferred(rows: SheetRow[]): SheetRow {
  const plain = rows.filter((r) => !r.suffix);
  return (plain.length ? plain : rows).reduce((best, row) =>
    row.cost < best.cost ? row : best,
  );
}

function appendMissingSizes(
  catalogPath: string,
  sizes: Array<{ width: number; length: number; depth: number; size: string }>,
): string[] {
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8")) as Array<[number, number, number]>;
  const have = new Set(catalog.map(([w, l, d]) => `${w}x${l}x${d}`.toLowerCase()));
  const missing = sizes.filter((s) => !have.has(s.size));
  if (!missing.length) return [];

  const unique = new Map<string, [number, number, number]>();
  for (const row of missing) {
    unique.set(row.size, [row.width, row.length, row.depth]);
  }
  const extra = Array.from(unique.values());
  const raw = fs.readFileSync(catalogPath, "utf8").replace(/\s*$/, "");
  if (!raw.endsWith("]")) {
    throw new Error("filter-catalog.json does not end with ]");
  }
  const chunk = extra
    .map(
      ([w, l, d]) =>
        `,\n[\n${Number.isInteger(w) ? w.toFixed(1) : w},\n${Number.isInteger(l) ? l.toFixed(1) : l},\n${Number.isInteger(d) ? d.toFixed(1) : d}\n]`,
    )
    .join("");
  fs.writeFileSync(catalogPath, `${raw.slice(0, -1)}${chunk}\n]\n`, "utf8");
  return Array.from(unique.keys());
}

function writeExtract(rows: SheetRow[]): void {
  const sections: Array<{ title: string; match: (row: SheetRow) => boolean }> = [
    { title: "MERV 8", match: (row) => !row.isCarbon && row.merv === 8 },
    { title: "MERV 11", match: (row) => !row.isCarbon && row.merv === 11 },
    { title: "MERV 13", match: (row) => !row.isCarbon && row.merv === 13 },
    { title: "CARBON", match: (row) => row.isCarbon },
  ];
  const lines: string[] = [];
  for (const section of sections) {
    const list = rows.filter(section.match).sort((a, b) => a.wholesaleSku.localeCompare(b.wholesaleSku, "en"));
    if (!list.length) continue;
    lines.push(section.title);
    for (const row of list) {
      lines.push(`${row.wholesaleSku}\t$${row.cost.toFixed(2)}`);
    }
    lines.push("");
  }
  fs.writeFileSync(EXTRACT, `${lines.join("\n").trim()}\n`, "utf8");
}

const sheet = parseSheet(fs.readFileSync(SHEET, "utf8"));
const grouped = new Map<string, SheetRow[]>();
for (const row of sheet) {
  const key = skuKey(row);
  const list = grouped.get(key) ?? [];
  list.push(row);
  grouped.set(key, list);
}

const skus: SellableSku[] = Array.from(grouped.values())
  .map((rows) => {
    const chosen = preferred(rows);
    return {
      size: chosen.size,
      merv: chosen.merv,
      ...(chosen.isCarbon ? { isCarbon: true } : {}),
      wholesaleSku: chosen.wholesaleSku,
      cost: chosen.cost,
      actualWidth: chosen.actualWidth,
      actualLength: chosen.actualLength,
      actualDepth: chosen.actualDepth,
    };
  })
  .sort(
    (a, b) =>
      a.size.localeCompare(b.size, "en") ||
      Number(Boolean(a.isCarbon)) - Number(Boolean(b.isCarbon)) ||
      a.merv - b.merv,
  );

const addedSizes = appendMissingSizes(
  CATALOG,
  skus.map((s) => {
    const match = SIZE_RE.exec(s.size);
    if (!match) throw new Error(`Sellable size failed to parse: ${s.size}`);
    return {
      size: s.size,
      width: Number(match[1]),
      length: Number(match[2]),
      depth: Number(match[3]),
    };
  }),
);

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
  source: "Filter King contractor commerce sheet (Paul Sellaro)",
  extractedFrom: "shared/pricing/fk-contractor-commerce.csv",
  note: "Shop catalog and wholesale cost source. Keep filter-catalog.json as the archived size universe for finder/quote. VITE_FULL_CATALOG=false sells this list only, including carbon rows.",
  sheetRows: sheet.length,
  count: skus.length,
  sizes: uniqueSizes,
  carbon: skus.filter((s) => s.isCarbon).length,
  skus,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
writeExtract(sheet);

const byMerv = {
  8: skus.filter((s) => !s.isCarbon && s.merv === 8).length,
  11: skus.filter((s) => !s.isCarbon && s.merv === 11).length,
  13: skus.filter((s) => !s.isCarbon && s.merv === 13).length,
  carbon: skus.filter((s) => s.isCarbon).length,
};

console.log(
  JSON.stringify(
    {
      wrote: path.relative(ROOT, OUT),
      extract: path.relative(ROOT, EXTRACT),
      sheetRows: payload.sheetRows,
      uniqueSkus: payload.count,
      uniqueSizes: payload.sizes,
      byMerv,
      addedToCatalog: addedSizes,
    },
    null,
    2,
  ),
);
