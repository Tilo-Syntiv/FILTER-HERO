"""Fetch FilterKing size pages and extract JSON-LD offers + qty ladders."""
from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "fk-price-samples.json"

UA = "Mozilla/5.0 (compatible; FilterHeroPriceResearch/1.0; +https://filterhero.example)"

SIZES = [
    # 1"
    "8x8x1", "10x10x1", "12x12x1", "12x24x1", "14x14x1", "14x20x1", "14x25x1",
    "16x16x1", "16x20x1", "16x25x1", "18x24x1", "20x20x1", "20x25x1", "20x30x1",
    "24x24x1", "24x30x1", "30x30x1", "6x14x1", "10x20x1", "16x24x1",
    # 0.5"
    "16x20x0.5", "16x25x0.5", "20x20x0.5", "20x25x0.5", "10x20x0.5", "14x20x0.5",
    # 2"
    "10x10x2", "14x20x2", "14x25x2", "16x20x2", "16x25x2", "20x20x2", "20x25x2",
    "20x30x2", "24x24x2n",
    # 4"
    "10x10x4", "14x20x4", "16x20x4", "16x25x4", "20x20x4", "20x25x4", "20x30x4",
    "24x24x4n", "16x16x4",
    # 5"
    "16x20x5", "16x25x5", "19x20x5", "20x20x5", "20x25x5",
]

MERV_PAGES = [
    ("20x25x1", "merv-8"),
    ("20x25x1", "merv-11"),
    ("20x25x1", "merv-13"),
    ("20x25x1", "odor"),
    ("20x25x1", "freedom"),
    ("16x25x1", "merv-8"),
    ("16x25x1", "merv-11"),
    ("16x25x1", "merv-13"),
    ("16x25x1", "odor"),
    ("16x25x4", "merv-8"),
    ("16x25x4", "merv-11"),
    ("16x25x4", "merv-13"),
    ("16x25x4", "odor"),
    ("20x25x5", "merv-8"),
    ("20x25x5", "merv-11"),
    ("20x25x5", "merv-13"),
    ("20x25x2", "merv-8"),
    ("20x25x2", "merv-13"),
    ("20x25x0.5", "merv-8"),
    ("10x10x1", "merv-8"),
    ("10x10x1", "merv-13"),
    ("24x24x1", "merv-8"),
    ("24x24x1", "merv-13"),
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=45) as resp:
        return resp.read().decode("utf-8", "replace")


def parse_offers(html: str) -> list[dict]:
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    for b in blocks:
        try:
            data = json.loads(b)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("@type") == "Product":
            offers = data.get("offers") or []
            out = []
            for o in offers:
                if not isinstance(o, dict):
                    continue
                out.append({
                    "sku": o.get("sku"),
                    "url": o.get("url"),
                    "price": float(o["price"]) if o.get("price") else None,
                    "availability": o.get("availability"),
                })
            return {
                "name": data.get("name"),
                "sku": data.get("sku"),
                "offers": out,
            }
    return None


def parse_qty(html: str) -> list[dict]:
    rows = re.findall(
        r'class="qty-select-item[^"]*".*?<span>([^<]+)</span>.*?class="row-each"><span[^>]*>\$([0-9.]+)</span>.*?class="row-savings">([^<]+)',
        html,
        re.S,
    )
    return [{"qty": q.strip(), "each": float(p), "savings": s.strip()} for q, p, s in rows]


def main() -> None:
    results = {"hubs": [], "merv_pages": [], "errors": []}
    for i, slug in enumerate(SIZES):
        url = f"https://filterking.com/air-filter-sizes/{slug}"
        try:
            html = fetch(url)
            product = parse_offers(html)
            qty = parse_qty(html)
            results["hubs"].append({"slug": slug, "url": url, "product": product, "qty": qty})
            print(f"HUB {i+1}/{len(SIZES)} {slug} offers={len((product or {}).get('offers') or [])} qty={qty}")
        except Exception as e:
            results["errors"].append({"url": url, "error": str(e)})
            print("ERR", slug, e)
        time.sleep(0.35)

    for i, (slug, merv) in enumerate(MERV_PAGES):
        url = f"https://filterking.com/air-filter-sizes/{slug}/{merv}"
        try:
            html = fetch(url)
            product = parse_offers(html)
            qty = parse_qty(html)
            results["merv_pages"].append({
                "slug": slug, "merv": merv, "url": url, "product": product, "qty": qty
            })
            print(f"MERV {i+1}/{len(MERV_PAGES)} {slug}/{merv} qty={qty}")
        except Exception as e:
            results["errors"].append({"url": url, "error": str(e)})
            print("ERR", slug, merv, e)
        time.sleep(0.35)

    OUT.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print("wrote", OUT, "hubs", len(results["hubs"]), "merv", len(results["merv_pages"]), "err", len(results["errors"]))


if __name__ == "__main__":
    main()
