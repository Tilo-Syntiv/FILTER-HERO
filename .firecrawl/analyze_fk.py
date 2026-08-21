from pathlib import Path
import re
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

root = Path(__file__).parent
out = root / "fk-analysis-summary.txt"
chunks = []

files = sorted(root.glob("fk-*.md"))
for f in files:
    text = f.read_text(encoding="utf-8", errors="replace")
    chunks.append("\n" + "=" * 70)
    chunks.append(f"{f.name} len={len(text)}")
    chunks.append("=" * 70)
    heads = [ln for ln in text.splitlines() if re.match(r"^#{1,3} ", ln)]
    chunks.append(f"HEADINGS: {len(heads)}")
    for h in heads[:35]:
        chunks.append(f"  {h}")

    urls = re.findall(r"https://filterking\.com[^\s<>\"']+", text)
    urls = sorted(set(u.rstrip(").,]\"'") for u in urls))
    if "sitemap" in f.name or len(urls) > 20:
        chunks.append(f"URLS found: {len(urls)}")
        c = Counter()
        for u in urls:
            path = u.replace("https://filterking.com", "")
            parts = [p for p in path.strip("/").split("/") if p]
            key = "/".join(parts[:2]) if len(parts) >= 2 else (parts[0] if parts else "/")
            c[key] += 1
        chunks.append("Top prefixes:")
        for k, v in c.most_common(50):
            chunks.append(f"  {v:4d}  {k}")
        chunks.append("Sample URLs:")
        for u in urls[:60]:
            chunks.append(f"  {u}")
    else:
        # first 2200 chars of body
        body = "\n".join(ln for ln in text.splitlines() if not ln.startswith("!["))
        chunks.append(body[:2200])

out.write_text("\n".join(chunks), encoding="utf-8")
print(f"Wrote {out} ({out.stat().st_size} bytes)")
