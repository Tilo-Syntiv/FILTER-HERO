"""Parse FilterKing size sitemaps into unique WxLxD catalog slugs."""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).parent
SLUG_RE = re.compile(
    r"/air-filter-sizes/(\d+(?:\.\d+)?x\d+(?:\.\d+)?x\d+(?:\.\d+)?)([an])?(?:/|$)",
    re.I,
)
LOC_RE = re.compile(r"<loc>(https://filterking\.com/air-filter-sizes/[^<]+)</loc>", re.I)


def parse_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    locs = LOC_RE.findall(text)
    if not locs:
        locs = re.findall(r"https://filterking\.com/air-filter-sizes/[^\s<\"']+", text)
    return locs


def slug_from_url(url: str) -> str | None:
    m = SLUG_RE.search(url)
    if not m:
        return None
    return m.group(1)  # drop trailing a/n actual/nominal suffix


def parse_dims(slug: str) -> tuple[float, float, float] | None:
    parts = slug.lower().split("x")
    if len(parts) != 3:
        return None
    try:
        return float(parts[0]), float(parts[1]), float(parts[2])
    except ValueError:
        return None


def main() -> None:
    files = [
        ROOT / "fk-sitemap-merv8.html",
        ROOT / "fk-sitemap-merv11.html",
        ROOT / "fk-sitemap-merv13.html",
        ROOT / "fk-sitemap-carbon.html",
        ROOT / "fk-home-full.json",
        ROOT / "fk-all-sizes-p1.json",
        ROOT / "fk-1inch-p1.json",
    ]
    all_urls: list[str] = []
    for f in files:
        if not f.exists():
            print("MISSING", f.name)
            continue
        if f.suffix == ".json":
            raw = json.loads(f.read_text(encoding="utf-8"))
            md = raw.get("markdown") or ""
            links = raw.get("links") or []
            urls = []
            for l in links:
                if isinstance(l, str):
                    urls.append(l)
                elif isinstance(l, dict):
                    urls.append(l.get("url") or "")
            urls += re.findall(r"https://filterking\.com/air-filter-sizes/[^\s)\]\"']+", md)
            all_urls.extend(urls)
            print(f"{f.name}: {len(urls)} urls from scrape")
        else:
            locs = parse_file(f)
            all_urls.extend(locs)
            print(f"{f.name}: {len(locs)} loc tags, bytes={f.stat().st_size}")

    slugs = []
    skipped = 0
    for u in all_urls:
        s = slug_from_url(u)
        if s:
            slugs.append(s)
        else:
            skipped += 1

    uniq = sorted(set(slugs), key=lambda s: parse_dims(s) or (0, 0, 0))
    by_depth = Counter()
    tuples: list[list[float]] = []
    for s in uniq:
        dims = parse_dims(s)
        if not dims:
            continue
        by_depth[dims[2]] += 1
        tuples.append([dims[0], dims[1], dims[2]])

    print("unique size slugs", len(uniq))
    print("depth counts", dict(sorted(by_depth.items())))
    print("skipped urls", skipped)
    print("first 40", uniq[:40])
    print("last 20", uniq[-20:])

    (ROOT / "fk-all-size-slugs.txt").write_text("\n".join(uniq) + "\n", encoding="utf-8")
    (ROOT / "fk-all-size-tuples.json").write_text(
        json.dumps(tuples, indent=0), encoding="utf-8"
    )
    print("wrote fk-all-size-slugs.txt and fk-all-size-tuples.json")


if __name__ == "__main__":
    main()
