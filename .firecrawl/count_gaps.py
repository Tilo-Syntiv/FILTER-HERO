from pathlib import Path
import re
from collections import Counter

root = Path(".firecrawl")

# Count FPF sizes
src = Path("shared/products.ts").read_text(encoding="utf-8")
size_calls = len(re.findall(r"size\(\s*\d+", src))
print(f"FPF FILTER_SIZES entries: {size_calls}")

def parse_jammed_sitemap(path: Path):
    text = path.read_text(encoding="utf-8", errors="replace")
    urls = []
    for part in text.split("https://filterking.com")[1:]:
        m = re.match(r"(/[^\s]+?)(20\d{2}-\d{2}-\d{2})", part)
        if m:
            urls.append(m.group(1).rstrip("/"))
    return urls

for name in [
    "fk-sitemap-content.md",
    "fk-sitemap-blog.md",
    "fk-sitemap-brand-categories.md",
    "fk-sitemap-belt-categories.md",
    "fk-sitemap-content-categories.md",
]:
    p = root / name
    urls = parse_jammed_sitemap(p)
    print(f"\n{name}: {len(urls)} URLs")
    c = Counter(u.strip("/").split("/")[0] for u in urls)
    for k, v in c.most_common(15):
        print(f"  {v:4d} /{k}")
    for u in urls[:8]:
        print(f"   sample {u}")
