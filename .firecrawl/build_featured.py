"""Build featured size lists from FilterKing thickness hub scrapes (UI order)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SLUG_RE = re.compile(
    r"/air-filter-sizes/(\d+(?:\.\d+)?x\d+(?:\.\d+)?x\d+(?:\.\d+)?)([an])?(?:/|$)",
    re.I,
)


def parse_dims(slug: str):
    parts = slug.lower().split("x")
    if len(parts) != 3:
        return None
    try:
        return float(parts[0]), float(parts[1]), float(parts[2])
    except ValueError:
        return None


def fmt(n: float) -> str:
    return str(int(n)) if n == int(n) else str(n)


def canon(w, l, d) -> str:
    return f"{fmt(w)}x{fmt(l)}x{fmt(d)}"


def extract_ordered(path: Path, depth: float) -> list[str]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    md = raw.get("markdown") or ""
    links = raw.get("links") or []
    urls = []
    for l in links:
        if isinstance(l, str):
            urls.append(l)
        elif isinstance(l, dict):
            urls.append(l.get("url") or "")
    urls += re.findall(r"https://filterking\.com/air-filter-sizes/[^\s)\]\"']+", md)
    ordered: list[str] = []
    seen = set()
    for u in urls:
        m = SLUG_RE.search(u)
        if not m:
            continue
        dims = parse_dims(m.group(1))
        if not dims or dims[2] != depth:
            continue
        slug = canon(*dims)
        if slug in seen:
            continue
        seen.add(slug)
        ordered.append(slug)
    return ordered


def main() -> None:
    files = {
        "0.5": (ROOT / "fk-0.5inch.json", 0.5),
        "1": (ROOT / "fk-1inch-p1.json", 1.0),
        "2": (ROOT / "fk-2inch.json", 2.0),
        "4": (ROOT / "fk-4inch.json", 4.0),
        "5": (ROOT / "fk-5inch.json", 5.0),
    }
    out: dict[str, list[str]] = {}
    for key, (path, depth) in files.items():
        ordered = extract_ordered(path, depth) if path.exists() else []
        out[key] = ordered
        print(key, "featured", len(ordered), "first", ordered[:8], "last", ordered[-5:])
    dest = ROOT.parent / "shared" / "featured-sizes.json"
    dest.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print("wrote", dest)


if __name__ == "__main__":
    main()
