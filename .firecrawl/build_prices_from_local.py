"""Rebuild FilterKing live prices from local scrapes only, then fill gaps.

Sources (no API credits):
  - .firecrawl/fk-batch*.ndjson
  - .firecrawl/filterking.com-air-filter-sizes-*.md
  - .firecrawl/fk-verified-prices.json
  - .firecrawl/fk-full-prices.json (prior parse)
  - existing shared/pricing/fk-live-prices.json

Gap fill (estimated):
  1. Same-size sibling × median MERV ratio from known pairs
  2. Else median ladder in same depth+merv area bucket (± neighbors)
"""
from __future__ import annotations

import json
import re
import statistics
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent
SHARED = ROOT.parent / "shared" / "pricing" / "fk-live-prices.json"
CATALOG = ROOT.parent / "shared" / "filter-catalog.json"

QTY_RE = re.compile(
    r"- (1|2|4|6\+|12\+)\s*\n+\s*\$([0-9]+\.[0-9]{2})(?:\$([0-9]+\.[0-9]{2}))?\s*\n+\s*([0-9]+)%",
    re.M,
)
SKU_RE = re.compile(r"- SKU\s*\n+\s*([A-Z0-9x.-]+)", re.I)
SIZE_RE = re.compile(r"/air-filter-sizes/([^/\"'?]+)", re.I)
MERV_PATH_RE = re.compile(r"/(merv-8|merv-11|merv-13|odor|freedom)(?:/|$)", re.I)
MD_NAME_RE = re.compile(
    r"filterking\.com-air-filter-sizes-(.+?)-(merv-8|merv-11|merv-13|odor|freedom)\.md$",
    re.I,
)

MERV_LIVE = {
    "8": "8",
    "11": "11",
    "13": "13",
    "carbon": "carbon",
    "odor": "carbon",
    "merv-8": "8",
    "merv-11": "11",
    "merv-13": "13",
    "merv-8-carbon": "carbon",
    "freedom": None,  # skip Freedom line
}
QTY_KEYS = ("q1", "q2", "q4", "q6", "q12")
MERVS = ("8", "11", "13", "carbon")


def money(n: float) -> float:
    return round(n + 1e-9, 2)


def norm_size(size: str) -> str:
    return size.lower().replace(" ", "").rstrip("a")


def parse_dims(size: str) -> tuple[float, float, float] | None:
    parts = norm_size(size).split("x")
    if len(parts) != 3:
        return None
    try:
        return float(parts[0]), float(parts[1]), float(parts[2])
    except ValueError:
        return None


def parse_markdown(md: str, url: str) -> dict | None:
    qty: dict[str, float] = {}
    for label, sale_p, _reg_p, _pct in QTY_RE.findall(md):
        key = {"1": "q1", "2": "q2", "4": "q4", "6+": "q6", "12+": "q12"}[label]
        qty[key] = float(sale_p)
    if len(qty) < 3:
        return None
    size_m = SIZE_RE.search(url)
    merv_m = MERV_PATH_RE.search(url)
    merv_raw = (merv_m.group(1).lower() if merv_m else "")
    merv = MERV_LIVE.get(merv_raw)
    size = norm_size(size_m.group(1)) if size_m else None
    if not merv or not size:
        return None
    row = {"size": size, "merv": merv, "estimated": False, **qty}
    sku_m = SKU_RE.search(md)
    if sku_m:
        row["sku"] = sku_m.group(1)
    return row


def to_live_row(raw: dict) -> dict | None:
    merv = MERV_LIVE.get(str(raw.get("merv") or "").lower())
    size = norm_size(str(raw.get("size") or ""))
    if not merv or not size:
        return None
    row: dict = {"size": size, "merv": merv, "estimated": bool(raw.get("estimated"))}
    if raw.get("sku"):
        row["sku"] = raw["sku"]
    filled = 0
    for key in QTY_KEYS:
        if key in raw and isinstance(raw[key], (int, float)):
            row[key] = money(float(raw[key]))
            filled += 1
    return row if filled >= 3 else None


def merge_rows(rows: list[dict]) -> dict[str, dict]:
    by: dict[str, dict] = {}
    for row in rows:
        live = to_live_row(row)
        if not live:
            continue
        key = f"{live['size']}|{live['merv']}"
        prev = by.get(key)
        filled = sum(1 for k in QTY_KEYS if k in live)
        prev_filled = sum(1 for k in QTY_KEYS if prev and k in prev)
        # Prefer real scrapes over estimates; then richer ladders.
        if prev is None:
            by[key] = live
            continue
        if prev.get("estimated") and not live.get("estimated"):
            by[key] = live
            continue
        if (not prev.get("estimated")) and live.get("estimated"):
            continue
        if filled >= prev_filled:
            by[key] = live
    return by


def harvest_local() -> list[dict]:
    rows: list[dict] = []

    for path in ROOT.glob("fk-batch*.ndjson"):
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                doc = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not doc.get("ok"):
                continue
            md = doc.get("markdown") or ""
            url = doc.get("url") or (doc.get("metadata") or {}).get("sourceURL") or ""
            parsed = parse_markdown(md, url)
            if parsed:
                rows.append(parsed)

    for path in ROOT.glob("filterking.com-air-filter-sizes-*.md"):
        m = MD_NAME_RE.search(path.name)
        if not m:
            continue
        size, merv_path = m.group(1), m.group(2)
        url = f"https://filterking.com/air-filter-sizes/{size}/{merv_path}"
        parsed = parse_markdown(path.read_text(encoding="utf-8"), url)
        if parsed:
            rows.append(parsed)

    for name in ("fk-verified-prices.json", "fk-full-prices.json", "fk-direct-leftover.json"):
        path = ROOT / name
        if not path.exists():
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        for raw in payload.get("products") or []:
            live = to_live_row(raw)
            if live:
                rows.append(live)

    if SHARED.exists():
        payload = json.loads(SHARED.read_text(encoding="utf-8"))
        for raw in payload.get("products") or []:
            live = to_live_row(raw)
            if live:
                rows.append(live)

    return rows


def median(vals: list[float]) -> float:
    return float(statistics.median(vals))


def sibling_ratios(by_key: dict[str, dict]) -> dict[tuple[str, str], float]:
    """Median ratio other_merv / merv8 for each qty."""
    ratios: dict[tuple[str, str], list[float]] = defaultdict(list)
    by_size: dict[str, dict[str, dict]] = defaultdict(dict)
    for row in by_key.values():
        by_size[row["size"]][row["merv"]] = row
    for mervs in by_size.values():
        base = mervs.get("8")
        if not base:
            continue
        for other in ("11", "13", "carbon"):
            peer = mervs.get(other)
            if not peer:
                continue
            for q in QTY_KEYS:
                if q in base and q in peer and base[q] > 0:
                    ratios[(other, q)].append(peer[q] / base[q])
    return {k: median(v) for k, v in ratios.items() if v}


def fill_siblings(by_key: dict[str, dict]) -> int:
    ratios = sibling_ratios(by_key)
    by_size: dict[str, dict[str, dict]] = defaultdict(dict)
    for row in by_key.values():
        by_size[row["size"]][row["merv"]] = row
    added = 0
    for size, mervs in list(by_size.items()):
        # Prefer deriving from MERV 8; else any known type.
        base = mervs.get("8") or next(iter(mervs.values()))
        base_merv = base["merv"]
        for target in MERVS:
            if target in mervs:
                continue
            row: dict = {"size": size, "merv": target, "estimated": True}
            filled = 0
            for q in QTY_KEYS:
                if q not in base:
                    continue
                if base_merv == "8":
                    ratio = ratios.get((target, q))
                elif target == "8":
                    # invert
                    inv = ratios.get((base_merv, q))
                    ratio = (1.0 / inv) if inv else None
                else:
                    # target/base = (target/8) / (base/8)
                    r_t = ratios.get((target, q))
                    r_b = ratios.get((base_merv, q))
                    ratio = (r_t / r_b) if r_t and r_b else None
                if not ratio:
                    continue
                row[q] = money(base[q] * ratio)
                filled += 1
            if filled >= 3:
                by_key[f"{size}|{target}"] = row
                added += 1
    return added


def fill_area_buckets(by_key: dict[str, dict], catalog: list[list[float]]) -> int:
    # Index known by depth+merv → (area, ladder)
    known: dict[tuple[float, str], list[tuple[float, dict]]] = defaultdict(list)
    for row in by_key.values():
        dims = parse_dims(row["size"])
        if not dims:
            continue
        w, l, depth = dims
        known[(depth, row["merv"])].append((w * l, row))

    for key in known:
        known[key].sort(key=lambda x: x[0])

    existing = {(row["size"], row["merv"]) for row in by_key.values()}
    added = 0

    def nearest_median(depth: float, merv: str, area: float) -> dict | None:
        peers = known.get((depth, merv)) or []
        if not peers:
            return None
        # Take up to 7 nearest by area
        ranked = sorted(peers, key=lambda x: abs(x[0] - area))[:7]
        if abs(ranked[0][0] - area) > max(80.0, area * 0.35):
            # Too far — skip rather than invent wild prices
            return None
        out: dict = {}
        for q in QTY_KEYS:
            vals = [r[q] for _, r in ranked if q in r]
            if vals:
                out[q] = money(median(vals))
        return out if len(out) >= 3 else None

    for w, l, d in catalog:
        size = f"{w:g}x{l:g}x{d:g}".lower()
        area = float(w) * float(l)
        depth = float(d)
        for merv in MERVS:
            if (size, merv) in existing:
                continue
            ladder = nearest_median(depth, merv, area)
            if not ladder:
                continue
            row = {"size": size, "merv": merv, "estimated": True, **ladder}
            by_key[f"{size}|{merv}"] = row
            existing.add((size, merv))
            known[(depth, merv)].append((area, row))
            known[(depth, merv)].sort(key=lambda x: x[0])
            added += 1
    return added


def main() -> None:
    harvested = harvest_local()
    by_key = merge_rows(harvested)
    scraped = sum(1 for r in by_key.values() if not r.get("estimated"))
    print(f"harvested_raw={len(harvested)} unique_scraped={scraped}")

    sib = fill_siblings(by_key)
    print(f"filled_siblings={sib} total={len(by_key)}")

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    area = fill_area_buckets(by_key, catalog)
    print(f"filled_area={area} total={len(by_key)}")

    products = sorted(by_key.values(), key=lambda r: (r["merv"], r["size"]))
    scraped_n = sum(1 for r in products if not r.get("estimated"))
    est_n = sum(1 for r in products if r.get("estimated"))

    SHARED.write_text(
        json.dumps(
            {
                "source": "filterking-local+model",
                "scraped": date.today().isoformat(),
                "notes": (
                    "Sale / one-time unit prices. Real scrapes preferred. "
                    "estimated=true rows are filled from same-size MERV ratios "
                    "or nearest same-depth area peers. No new Firecrawl credits used."
                ),
                "counts": {"scraped": scraped_n, "estimated": est_n, "total": len(products)},
                "products": products,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"wrote {SHARED} scraped={scraped_n} estimated={est_n} total={len(products)}")


if __name__ == "__main__":
    main()
