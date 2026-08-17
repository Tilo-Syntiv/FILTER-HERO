from pathlib import Path
import re
import json

html = Path(".firecrawl/fk-20x25x1-raw.html").read_text(encoding="utf-8", errors="replace")
blocks = re.findall(r"<script type=\"application/ld\+json\">(.*?)</script>", html, re.S)
product = json.loads(blocks[1])
Path(".firecrawl/fk-20x25x1-product.json").write_text(json.dumps(product, indent=2), encoding="utf-8")
print("keys", product.keys())
print("sku", product.get("sku"))
print("name", product.get("name"))
offers = product.get("offers") or product.get("hasVariant") or {}
print("offers type", type(offers), "keys" if isinstance(offers, dict) else "len", (list(offers)[:20] if isinstance(offers, dict) else len(offers) if isinstance(offers, list) else offers))
if isinstance(offers, dict):
    print(json.dumps(offers, indent=2)[:4000])
elif isinstance(offers, list):
    print("n offers", len(offers))
    print(json.dumps(offers[:8], indent=2)[:5000])

# qty table
qty = re.findall(
    r'class="qty-select-item".*?<span>([^<]+)</span>.*?class="row-each"><span[^>]*>(\$[0-9.]+)</span>.*?class="row-savings">([^<]+)',
    html,
    re.S,
)
print("QTY TABLE", qty[:20])

# all dollar amounts near qty
chunk = re.search(r"qty-select-list.*?</ul>", html, re.S)
if chunk:
    print("QTY HTML", re.sub(r"\s+", " ", chunk.group(0))[:1500])
