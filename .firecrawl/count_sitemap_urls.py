from pathlib import Path
import re
from collections import Counter

root = Path(".firecrawl")
for n in [
    "fk-sitemap-merv8.html",
    "fk-sitemap-merv11.html",
    "fk-sitemap-merv13.html",
    "fk-sitemap-carbon.html",
]:
    t = (root / n).read_text(encoding="utf-8", errors="replace")
    locs = re.findall(r"<loc>(https://filterking\.com/air-filter-sizes/[^<]+)</loc>", t, re.I)
    if not locs:
        locs = re.findall(r"https://filterking\.com/air-filter-sizes/[^\s<\"']+", t)
    print(n, "urls", len(locs), "unique", len(set(locs)))
    kinds: Counter[str] = Counter()
    for u in locs:
        if "/merv-8" in u:
            kinds["merv-8"] += 1
        elif "/merv-11" in u:
            kinds["merv-11"] += 1
        elif "/merv-13" in u:
            kinds["merv-13"] += 1
        elif "/odor" in u:
            kinds["odor"] += 1
        elif "/freedom" in u:
            kinds["freedom"] += 1
        else:
            kinds["hub-or-other"] += 1
    print(" ", dict(kinds))

slugs = (root / "fk-all-size-slugs.txt").read_text(encoding="utf-8").strip().splitlines()
print("size slugs", len(slugs))
