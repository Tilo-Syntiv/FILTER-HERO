from pathlib import Path
import json
import re

root = Path(".firecrawl")
rows = []
for p in sorted(root.glob("filterking.com-air-filter-sizes-*.md")):
    text = p.read_text(encoding="utf-8", errors="replace").strip()
    if not text.startswith("{") or '"json"' not in text[:80]:
        continue
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        continue
    j = data.get("json") or {}
    rows.append({
        "file": p.name,
        "url": (data.get("metadata") or {}).get("sourceURL"),
        **j,
    })

out = root / "fk-extracted-json-prices.json"
out.write_text(json.dumps(rows, indent=2), encoding="utf-8")
print(f"{len(rows)} products")
print(f"{'size':12} {'merv':8} {'sku':16} {'q1':7} {'q2':7} {'q4':7} {'q6':7} {'q12':7} {'6tot':7} carbon free")
for r in rows:
    print(
        f"{str(r.get('nominal_size')):12} {str(r.get('merv')):8} {str(r.get('sku')):16} "
        f"{r.get('unit_price_qty_1'):7} {r.get('unit_price_qty_2'):7} {r.get('unit_price_qty_4'):7} "
        f"{r.get('unit_price_qty_6'):7} {r.get('unit_price_qty_12'):7} {r.get('default_pack_total'):7} "
        f"{r.get('is_carbon')} {r.get('is_freedom')}"
    )
