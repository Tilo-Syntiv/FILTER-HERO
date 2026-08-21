from pathlib import Path
import re

root = Path(".firecrawl")
files = [
    "filterking.com-air-filter-sizes-14x25x1-merv-8.md",
    "filterking.com-air-filter-sizes-12x24x1-merv-8.md",
    "filterking.com-air-filter-sizes-18x24x1-merv-8.md",
    "filterking.com-air-filter-sizes-16x25x2-merv-8.md",
    "filterking.com-air-filter-sizes-16x20x2-merv-8.md",
]
for name in files:
    p = root / name
    text = p.read_text(encoding="utf-8", errors="replace")
    # grab qty block
    m = re.search(r"Select quantity.*?air filter description", text, re.S)
    block = m.group(0) if m else text[70:220]
    prices = re.findall(r"\$([0-9]+\.[0-9]{2})", block)
    print(name.replace("filterking.com-air-filter-sizes-", "").replace(".md",""), prices[:12])
