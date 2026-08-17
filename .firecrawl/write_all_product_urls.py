"""Write every FilterKing product URL from cached sitemaps."""
from pathlib import Path
import re

root = Path(".firecrawl")
files = [
    "fk-sitemap-merv8.html",
    "fk-sitemap-merv11.html",
    "fk-sitemap-merv13.html",
    "fk-sitemap-carbon.html",
]
urls: list[str] = []
for n in files:
    t = (root / n).read_text(encoding="utf-8", errors="replace")
    locs = re.findall(r"<loc>(https://filterking\.com/air-filter-sizes/[^<]+)</loc>", t, re.I)
    if not locs:
        locs = re.findall(r"https://filterking\.com/air-filter-sizes/[^\s<\"']+", t)
    urls.extend(locs)

uniq = sorted(set(urls))
out = root / "fk-all-product-urls.txt"
out.write_text("\n".join(uniq) + "\n", encoding="utf-8")
print("wrote", out, "count", len(uniq))
