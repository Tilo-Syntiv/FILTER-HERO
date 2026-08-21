import json
import re
from pathlib import Path

ROOT = Path(__file__).parent


def extract(path: Path) -> None:
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    md = ""
    links: list = []
    if isinstance(data, dict):
        md = data.get("markdown") or ""
        links = data.get("links") or []
        inner = data.get("data")
        if isinstance(inner, dict):
            md = inner.get("markdown") or md
            links = inner.get("links") or links
    urls = []
    for l in links:
        if isinstance(l, str):
            urls.append(l)
        elif isinstance(l, dict):
            urls.append(l.get("url") or l.get("href") or "")
    urls += re.findall(r"https://filterking\.com/air-filter-sizes/[^\s)\]\"']+", md)
    urls = sorted({u.rstrip(").,]\"'") for u in urls if u})
    sizes = [u for u in urls if re.search(r"/air-filter-sizes/[0-9]", u)]
    hubs = [
        u
        for u in urls
        if "inch-air-filter" in u or u.rstrip("/").endswith("air-filter-sizes")
    ]
    print("FILE", path.name)
    print(" total urls", len(urls), "size urls", len(sizes), "hubs", len(hubs))
    print(" HUBS:")
    for u in hubs[:30]:
        print(" ", u)
    print(" FIRST SIZE URLS:")
    for u in sizes[:50]:
        print(" ", u)
    print(" LAST SIZE URLS:")
    for u in sizes[-20:]:
        print(" ", u)
    pages = [u for u in urls if "page=" in u or "/page/" in u]
    print(" PAGE LINKS", pages[:30])
    slugs = []
    for u in sizes:
        m = re.search(r"/air-filter-sizes/([^/]+)", u)
        if m and re.match(r"[0-9]", m.group(1)):
            slugs.append(m.group(1).split("/")[0])
    uniq = list(dict.fromkeys(slugs))
    print(" unique slugs", len(uniq))
    print(" sample slugs", uniq[:80])
    # also dump slugs to file
    out = ROOT / f"{path.stem}-slugs.txt"
    out.write_text("\n".join(uniq), encoding="utf-8")
    print(" wrote", out)
    print("---")


if __name__ == "__main__":
    extract(ROOT / "fk-home-full.json")
    extract(ROOT / "fk-all-sizes-p1.json")
