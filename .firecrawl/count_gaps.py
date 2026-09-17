from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
REPO = HERE.parent


def parse_jammed_sitemap(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    urls = []
    for part in text.split("https://filterking.com")[1:]:
        m = re.match(r"(/[^\s]+?)(20\d{2}-\d{2}-\d{2})", part)
        if m:
            urls.append(m.group(1).rstrip("/"))
    return urls


def main() -> None:
    catalog = json.loads((REPO / "shared" / "filter-catalog.json").read_text(encoding="utf-8"))
    print(f"FPF FILTER_SIZES entries: {len(catalog)}")

    for name in [
        "fk-sitemap-content.md",
        "fk-sitemap-blog.md",
        "fk-sitemap-brand-categories.md",
        "fk-sitemap-belt-categories.md",
        "fk-sitemap-content-categories.md",
    ]:
        p = HERE / name
        urls = parse_jammed_sitemap(p)
        print(f"\n{name}: {len(urls)} URLs")
        c = Counter(u.strip("/").split("/")[0] for u in urls)
        for k, v in c.most_common(15):
            print(f"  {v:4d} /{k}")
        for u in urls[:8]:
            print(f"   sample {u}")


if __name__ == "__main__":
    main()
