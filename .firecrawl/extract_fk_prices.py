from pathlib import Path
import re
import json

html = Path(".firecrawl/fk-20x25x1-raw.html").read_text(encoding="utf-8", errors="replace")
print("len", len(html))

blocks = re.findall(r"<script type=\"application/ld\+json\">(.*?)</script>", html, re.S)
print("ld+json blocks", len(blocks))
for i, b in enumerate(blocks):
    print(f"--- block {i} len {len(b)}")
    print(b.strip()[:800])
    print()

# Look for price-related JSON
for pat in [
    r"\"prices\"\s*:",
    r"unit_price",
    r"31\.10",
    r"8\.63",
    r"FB20X25",
    r"selectedFilter",
    r"filterTypes",
    r"packSize",
]:
    print(pat, html.count(pat) if pat[0] != "\\" else "n/a", "count via find:", len(re.findall(pat, html)))

# Extract nearby context for 31.10
for m in re.finditer(r".{0,120}31\.10.{0,120}", html):
    print("CTX31", m.group(0).replace("\n", " ")[:250])

for m in re.finditer(r".{0,80}\"price\".{0,80}", html, re.I):
    s = m.group(0).replace("\n", " ")
    if "$" in s or "31" in s or "price" in s.lower():
        print("PRICECTX", s[:200])
        if m.start() > 200000:
            break
