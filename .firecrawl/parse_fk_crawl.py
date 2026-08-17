"""Parse FilterKing crawl/scrape markdown into a price catalog."""
from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent
QTY_RE = re.compile(
    r"- (1|2|4|6\+|12\+)\s*\n+\s*\$([0-9]+\.[0-9]{2})(?:\$([0-9]+\.[0-9]{2}))?\s*\n+\s*([0-9]+)%",
    re.M,
)
SKU_RE = re.compile(r"- SKU\s*\n+\s*([A-Z0-9x.-]+)", re.I)
SIZE_RE = re.compile(r"/air-filter-sizes/([^/\"'?]+)", re.I)
MERV_PATH_RE = re.compile(r"/(merv-8|merv-11|merv-13|odor|freedom)(?:/|$)", re.I)


def parse_markdown(md: str, url: str) -> dict | None:
    qty: dict[str, float] = {}
    qty_reg: dict[str, float] = {}
    sale: dict[str, int] = {}
    for label, sale_p, reg_p, pct in QTY_RE.findall(md):
        key = {"1": "q1", "2": "q2", "4": "q4", "6+": "q6", "12+": "q12"}[label]
        qty[key] = float(sale_p)
        if reg_p:
            qty_reg[key] = float(reg_p)
        sale[key] = int(pct)
    if len(qty) < 3:
        return None
    sku_m = SKU_RE.search(md)
    size_m = SIZE_RE.search(url)
    merv_m = MERV_PATH_RE.search(url)
    return {
        "url": url,
        "size": size_m.group(1) if size_m else None,
        "merv": (merv_m.group(1).lower() if merv_m else "hub"),
        "sku": sku_m.group(1) if sku_m else None,
        **qty,
        **{f"{k}_reg": v for k, v in qty_reg.items()},
        "sale_pct_q1": sale.get("q1", 0),
    }


def iter_crawl_docs(payload: object):
    if isinstance(payload, dict):
        if "markdown" in payload and "url" in payload:
            yield payload
        data = payload.get("data")
        if isinstance(data, list):
            for item in data:
                yield from iter_crawl_docs(item)
        elif isinstance(data, dict):
            yield from iter_crawl_docs(data)
        for key in ("documents", "pages", "results"):
            if key in payload:
                yield from iter_crawl_docs(payload[key])
    elif isinstance(payload, list):
        for item in payload:
            yield from iter_crawl_docs(item)


MERV_LIVE = {
    "8": "8",
    "11": "11",
    "13": "13",
    "carbon": "carbon",
    "odor": "carbon",
    "merv-8": "8",
    "merv-11": "11",
    "merv-13": "13",
}
QTY_KEYS = ("q1", "q2", "q4", "q6", "q12")
SHARED_OUT = ROOT.parent / "shared" / "pricing" / "fk-live-prices.json"


def to_live_row(parsed: dict) -> dict | None:
    merv = MERV_LIVE.get((parsed.get("merv") or "").lower())
    size = (parsed.get("size") or "").lower().replace(" ", "")
    if not merv or not size:
        return None
    row = {"size": size, "merv": merv}
    sku = parsed.get("sku")
    if sku:
        row["sku"] = sku
    filled = 0
    for key in QTY_KEYS:
        if key in parsed:
            row[key] = parsed[key]
            filled += 1
    if filled < 3:
        return None
    return row


def merge_live(existing: list[dict], incoming: list[dict]) -> list[dict]:
    by_key: dict[str, dict] = {}
    for row in existing + incoming:
        filled = sum(1 for k in QTY_KEYS if k in row)
        key = f"{row.get('size')}|{row.get('merv')}"
        prev = by_key.get(key)
        prev_filled = sum(1 for k in QTY_KEYS if prev and k in prev)
        if not prev or filled >= prev_filled:
            by_key[key] = row
    return list(by_key.values())


def main() -> None:
    src = ROOT / "fk-full-catalog-crawl.json"
    if not src.exists():
        print("missing", src)
        return
    payload = json.loads(src.read_text(encoding="utf-8"))
    rows = []
    live_rows = []
    n_docs = 0
    for doc in iter_crawl_docs(payload):
        n_docs += 1
        md = doc.get("markdown") or ""
        url = doc.get("url") or (doc.get("metadata") or {}).get("sourceURL") or ""
        parsed = parse_markdown(md, url)
        if parsed:
            rows.append(parsed)
            live = to_live_row(parsed)
            if live:
                live_rows.append(live)
    out = ROOT / "fk-full-prices.json"
    out.write_text(json.dumps({"count": len(rows), "products": rows}, indent=2), encoding="utf-8")
    existing: list[dict] = []
    if SHARED_OUT.exists():
        try:
            existing = json.loads(SHARED_OUT.read_text(encoding="utf-8")).get("products") or []
        except json.JSONDecodeError:
            existing = []
    merged = merge_live(existing, live_rows)
    SHARED_OUT.write_text(
        json.dumps(
            {
                "source": "filterking-live",
                "scraped": date.today().isoformat(),
                "notes": "Sale / one-time unit prices. MERV 13 uses live sale, not regular. Merged onto prior live rows.",
                "products": merged,
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print("docs", n_docs, "priced", len(rows), "live", len(merged), "wrote", out, "and", SHARED_OUT)


if __name__ == "__main__":
    main()
