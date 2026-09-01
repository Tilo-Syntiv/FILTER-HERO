"""Audit local Filter King scrapes vs catalog. No API calls."""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))

from build_prices_from_local import (  # noqa: E402
    harvest_local,
    merge_rows,
    parse_markdown,
    to_live_row,
    norm_size,
)

SHARED = ROOT.parent / "shared" / "pricing" / "fk-live-prices.json"
CATALOG_URLS = ROOT / "fk-all-product-urls.txt"

MERV_FROM_PATH = {
    "merv-8": "8",
    "merv-11": "11",
    "merv-13": "13",
    "odor": "carbon",
    "merv-8-carbon": "carbon",
    "freedom": None,
}


def url_key(url: str):
    url = url.strip().rstrip("/").lower()
    m = re.search(r"/air-filter-sizes/([^/]+)/([^/?#]+)", url)
    if not m:
        return None
    size, merv_raw = m.group(1), m.group(2)
    merv = MERV_FROM_PATH.get(merv_raw)
    if merv is None:
        return None
    return f"{norm_size(size)}|{merv}", url, size, merv_raw


def json_keys(name: str) -> set[str]:
    path = ROOT / name
    keys: set[str] = set()
    payload = json.loads(path.read_text(encoding="utf-8"))
    n = used = 0
    for raw in payload.get("products") or []:
        n += 1
        live = to_live_row(raw)
        if live and not live.get("estimated"):
            used += 1
            keys.add(f"{live['size']}|{live['merv']}")
    print(f"  {name}: products={n} usable_real={used} unique={len(keys)}")
    return keys


def coverage(sizes, label, have_price, have_raw, live_scraped, live_est):
    missing = []
    miss_scrape = 0
    for s in sizes:
        for m in ("8", "11", "13", "carbon"):
            k = f"{norm_size(s)}|{m}"
            if k in have_price:
                continue
            if k in have_raw:
                missing.append((k, "raw-no-parse"))
            elif k in live_est:
                miss_scrape += 1
                missing.append((k, "estimated-only"))
            else:
                miss_scrape += 1
                missing.append((k, "none"))
    total = len(sizes) * 4
    print(
        f"{label}: slots={total} live_price={total - len(missing)} "
        f"missing_price={len(missing)} would_cost_credit={miss_scrape}"
    )
    if missing:
        print("  missing:", missing)


def main() -> None:
    catalog_keys: dict[str, str] = {}
    freedom = unparsed = 0
    raw_lines = 0
    for line in CATALOG_URLS.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        raw_lines += 1
        parsed = url_key(line)
        if not parsed:
            if "/freedom" in line.lower():
                freedom += 1
            else:
                unparsed += 1
            continue
        key, url, _size, _merv = parsed
        catalog_keys[key] = url

    print(
        "CATALOG raw lines",
        raw_lines,
        "priceable keys",
        len(catalog_keys),
        "freedom/skip",
        freedom,
        "unparsed",
        unparsed,
    )

    live = json.loads(SHARED.read_text(encoding="utf-8"))
    live_scraped = {
        f"{norm_size(p['size'])}|{p['merv']}"
        for p in live["products"]
        if not p.get("estimated")
    }
    live_est = {
        f"{norm_size(p['size'])}|{p['merv']}"
        for p in live["products"]
        if p.get("estimated")
    }
    print(
        "LIVE FILE",
        live.get("counts"),
        "scraped_keys",
        len(live_scraped),
        "est_keys",
        len(live_est),
    )

    harvested = harvest_local()
    by_key = merge_rows(harvested)
    real = {k: v for k, v in by_key.items() if not v.get("estimated")}
    print("HARVEST raw_rows", len(harvested), "unique_real_ladders", len(real))

    nd_ok: set[str] = set()
    nd_fail: set[str] = set()
    nd_parse_ok: set[str] = set()
    nd_parse_fail: set[str] = set()
    nd_credits = 0
    nd_ok_n = nd_fail_n = 0
    fail_reasons: Counter[str] = Counter()

    for path in sorted(ROOT.glob("fk-batch*.ndjson")):
        n = 0
        with path.open(encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                n += 1
                try:
                    doc = json.loads(line)
                except json.JSONDecodeError:
                    continue
                url = (
                    doc.get("url")
                    or (doc.get("metadata") or {}).get("sourceURL")
                    or ""
                ).rstrip("/")
                parsed = url_key(url)
                key = parsed[0] if parsed else None
                credits = (doc.get("metadata") or {}).get("creditsUsed")
                if isinstance(credits, (int, float)):
                    nd_credits += credits
                if doc.get("ok"):
                    nd_ok_n += 1
                    if key:
                        nd_ok.add(key)
                    md = doc.get("markdown") or ""
                    got = parse_markdown(md, url) if md and url else None
                    if got:
                        nd_parse_ok.add(f"{got['size']}|{got['merv']}")
                    elif key:
                        nd_parse_fail.add(key)
                else:
                    nd_fail_n += 1
                    if key:
                        nd_fail.add(key)
                    err = str(doc.get("error") or "unknown")[:80]
                    fail_reasons[err] += 1
        print(f"  {path.name}: {n} records")

    print(
        "NDJSON ok_records",
        nd_ok_n,
        "fail_records",
        nd_fail_n,
        "credits_logged",
        nd_credits,
    )
    print(
        "NDJSON unique ok keys",
        len(nd_ok),
        "parse_ok",
        len(nd_parse_ok),
        "have_md_no_price",
        len(nd_parse_fail),
    )
    print(
        "NDJSON fail unique keys",
        len(nd_fail),
        "fail also later ok",
        len(nd_fail & nd_ok),
    )
    print("top fail reasons", fail_reasons.most_common(8))

    md_ok: set[str] = set()
    md_n = 0
    for path in ROOT.glob("filterking.com-air-filter-sizes-*.md"):
        m = re.search(
            r"filterking\.com-air-filter-sizes-(.+?)-(merv-8|merv-11|merv-13|odor|freedom)\.md$",
            path.name,
            re.I,
        )
        if not m:
            continue
        md_n += 1
        size, merv_path = m.group(1), m.group(2)
        url = f"https://filterking.com/air-filter-sizes/{size}/{merv_path}"
        got = parse_markdown(path.read_text(encoding="utf-8"), url)
        if got:
            md_ok.add(f"{got['size']}|{got['merv']}")
    print("MD product pages", md_n, "parsed", len(md_ok))

    fp_keys = json_keys("fk-full-prices.json")
    vp_keys = json_keys("fk-verified-prices.json")

    have_price = set(real) | nd_parse_ok | md_ok | fp_keys | vp_keys | live_scraped
    have_raw = set(nd_ok) | md_ok | fp_keys | vp_keys | live_scraped

    print("\n=== UNION ===")
    print("have_real_price", len(have_price))
    print("have_raw_or_price", len(have_raw))

    need_price = [k for k in catalog_keys if k not in have_price]
    need_scrape = [k for k in catalog_keys if k not in have_raw]
    already_price = [k for k in catalog_keys if k in have_price]
    already_raw = [k for k in catalog_keys if k in have_raw]
    have_raw_no_price = [k for k in need_price if k in have_raw]

    print("catalog already have price", len(already_price))
    print("catalog already have raw scrape", len(already_raw))
    print("catalog missing live price", len(need_price))
    print("catalog missing ANY local scrape (would cost a credit)", len(need_scrape))
    print("have raw but parser missed price (do not re-pay)", len(have_raw_no_price))
    print("live estimated but we HAVE real price locally", len(live_est & have_price))
    print("live estimated but we HAVE raw scrape locally", len(live_est & have_raw))

    popular = [
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
    ]
    industry = [
        "10x20x1",
        "12x12x1",
        "12x24x1",
        "14x14x1",
        "14x20x1",
        "14x25x1",
        "16x16x1",
        "16x20x1",
        "16x25x1",
        "18x18x1",
        "18x20x1",
        "18x24x1",
        "20x20x1",
        "20x25x1",
        "20x30x1",
        "24x24x1",
        "16x20x2",
        "16x25x2",
        "20x20x2",
        "20x25x2",
        "16x20x4",
        "16x25x4",
        "20x20x4",
        "20x25x4",
        "14x25x2",
        "16x25x5",
        "20x25x5",
        "12x12x2",
        "24x24x2",
        "24x30x1",
    ]
    coverage(popular, "HERO SHORTCUTS", have_price, have_raw, live_scraped, live_est)
    coverage(industry, "INDUSTRY COMMON", have_price, have_raw, live_scraped, live_est)

    by_merv = Counter()
    by_depth = Counter()
    for k in need_scrape:
        size, merv = k.split("|")
        by_merv[merv] += 1
        parts = size.split("x")
        by_depth[parts[2] if len(parts) == 3 else "?"] += 1
    print("remaining scrape by merv", dict(by_merv))
    print("remaining scrape by depth", dict(sorted(by_depth.items())))
    print("sample remaining (25):")
    for k in sorted(need_scrape)[:25]:
        print(" ", catalog_keys[k])

    listing = (
        list(ROOT.glob("fk-*-inch.json"))
        + list(ROOT.glob("fk-*-inch-p1.json"))
        + list(ROOT.glob("fk-air-filter-merv-*.md"))
        + list(ROOT.glob("filterking.com-sitemap*.md"))
        + list(ROOT.glob("fk-sitemap-*.html"))
    )
    print("listing/sitemap local files already paid", len(listing))
    print("extra real ladders not in sitemap catalog", len(have_price - set(catalog_keys)))

    out = {
        "catalog_raw_urls": raw_lines,
        "catalog_priceable": len(catalog_keys),
        "already_have_real_price": len(already_price),
        "already_have_raw_scrape": len(already_raw),
        "missing_live_price": len(need_price),
        "missing_any_scrape_credits_needed": len(need_scrape),
        "have_raw_but_no_price_parse": len(have_raw_no_price),
        "ndjson_ok": nd_ok_n,
        "ndjson_fail": nd_fail_n,
        "ndjson_credits_logged": nd_credits,
        "harvest_unique_real": len(real),
        "full_prices_unique": len(fp_keys),
        "live_file_scraped": len(live_scraped),
        "live_file_estimated": len(live_est),
        "remaining_by_merv": dict(by_merv),
        "remaining_by_depth": dict(sorted(by_depth.items())),
    }
    (ROOT / "_fk-scrape-audit.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
    remaining_urls = [catalog_keys[k] for k in sorted(need_scrape)]
    (ROOT / "_fk-still-need-scrape.txt").write_text(
        "\n".join(remaining_urls) + ("\n" if remaining_urls else ""),
        encoding="utf-8",
    )
    print("\nSUMMARY")
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
