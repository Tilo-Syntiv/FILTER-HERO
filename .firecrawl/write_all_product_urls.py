"""Write every FilterKing product URL from cached sitemaps."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES = [
    "fk-sitemap-merv8.html",
    "fk-sitemap-merv11.html",
    "fk-sitemap-merv13.html",
    "fk-sitemap-carbon.html",
]


def collect_urls() -> list[str]:
    urls: list[str] = []
    for n in FILES:
        t = (ROOT / n).read_text(encoding="utf-8", errors="replace")
        locs = re.findall(r"<loc>(https://filterking\.com/air-filter-sizes/[^<]+)</loc>", t, re.I)
        if not locs:
            locs = re.findall(r"https://filterking\.com/air-filter-sizes/[^\s<\"']+", t)
        urls.extend(locs)
    return sorted(set(urls))


def main() -> None:
    uniq = collect_urls()
    out = ROOT / "fk-all-product-urls.txt"
    out.write_text("\n".join(uniq) + "\n", encoding="utf-8")
    print("wrote", out, "count", len(uniq))


if __name__ == "__main__":
    main()
