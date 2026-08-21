"""Compare FilterKing thickness-hub scrapes to our catalog."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent
SHARED = ROOT.parent / "shared" / "filter-catalog.json"
SLUG_RE = re.compile(
    r"/air-filter-sizes/(\d+(?:\.\d+)?x\d+(?:\.\d+)?x\d+(?:\.\d+)?)([an])?(?:/|$|\")",
    re.I,
)


def parse_dims(slug: str) -> tuple[float, float, float] | None:
    parts = slug.lower().split("x")
    if len(parts) != 3:
        return None
    try:
        return float(parts[0]), float(parts[1]), float(parts[2])
    except ValueError:
        return None


def fmt(n: float) -> str:
    return str(int(n)) if n == int(n) else str(n)


def canon(w: float, l: float, d: float) -> str:
    return f"{fmt(w)}x{fmt(l)}x{fmt(d)}"


def extract_file(path: Path) -> tuple[set[str], list[str]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    md = raw.get("markdown") or ""
    links = raw.get("links") or []
    urls: list[str] = []
    for l in links:
        if isinstance(l, str):
            urls.append(l)
        elif isinstance(l, dict):
            urls.append(l.get("url") or "")
    urls += re.findall(r"https://filterking\.com/air-filter-sizes/[^\s)\]\"']+", md)
    slugs: set[str] = set()
    pages: list[str] = []
    for u in urls:
        if "page=" in u or "/page/" in u:
            pages.append(u)
        m = SLUG_RE.search(u)
        if not m:
            continue
        dims = parse_dims(m.group(1))
        if not dims:
            continue
        slugs.add(canon(*dims))
    # visible labels in markdown like 16x25x2
    for m in re.finditer(r"\b(\d+(?:\.\d+)?x\d+(?:\.\d+)?x\d+(?:\.\d+)?)\b", md):
        dims = parse_dims(m.group(1))
        if dims:
            slugs.add(canon(*dims))
    return slugs, sorted(set(pages))


def main() -> None:
    catalog = json.loads(SHARED.read_text(encoding="utf-8"))
    cat_set = {canon(w, l, d) for w, l, d in catalog}
    cat_by_d: dict[float, set[str]] = defaultdict(set)
    for w, l, d in catalog:
        cat_by_d[d].add(canon(w, l, d))

    files = {
        0.5: ROOT / "fk-0.5inch.json",
        1.0: ROOT / "fk-1inch-p1.json",
        2.0: ROOT / "fk-2inch.json",
        4.0: ROOT / "fk-4inch.json",
        5.0: ROOT / "fk-5inch.json",
    }

    missing_all: list[list[float]] = []
    for depth, path in files.items():
        print("=" * 60)
        print("HUB", depth, path.name, "exists", path.exists())
        if not path.exists():
            continue
        slugs, pages = extract_file(path)
        at_depth = {s for s in slugs if parse_dims(s) and parse_dims(s)[2] == depth}
        other = slugs - at_depth
        missing = sorted(at_depth - cat_set, key=lambda s: parse_dims(s) or (0, 0, 0))
        extra_in_cat = len(cat_by_d[depth])
        print(" scraped unique slugs", len(slugs), "at this depth", len(at_depth))
        print(" catalog at this depth", extra_in_cat)
        print(" missing from catalog", len(missing))
        print(" page links", pages[:20])
        print(" first 30 hub sizes", sorted(at_depth, key=lambda s: parse_dims(s) or (0, 0, 0))[:30])
        print(" last 15 hub sizes", sorted(at_depth, key=lambda s: parse_dims(s) or (0, 0, 0))[-15:])
        if other:
            print(" other-depth slugs on page", len(other), list(sorted(other))[:12])
        if missing:
            print(" MISSING", missing[:80])
            for s in missing:
                dims = parse_dims(s)
                if dims:
                    missing_all.append([dims[0], dims[1], dims[2]])

    if missing_all:
        out = ROOT / "fk-thickness-missing.json"
        # unique
        seen = set()
        uniq = []
        for t in missing_all:
            key = tuple(t)
            if key in seen:
                continue
            seen.add(key)
            uniq.append(t)
        out.write_text(json.dumps(uniq), encoding="utf-8")
        print("wrote", out, "count", len(uniq))
    else:
        print("NO MISSING SIZES vs catalog")


if __name__ == "__main__":
    main()
