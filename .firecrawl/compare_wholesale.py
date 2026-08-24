"""Compare Filter King 2025 wholesale sheet vs Filter Hero live sell prices."""
from __future__ import annotations

import json
import re
import statistics
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHEET = Path(__file__).parent / "fk-wholesale-2025.txt"
LIVE = ROOT / "shared" / "pricing" / "fk-live-prices.json"
OUT = Path(__file__).parent / "fk-wholesale-vs-hero.json"

SKU_RE = re.compile(
    r"^FK(?P<size>\d+(?:\.\d+)?x\d+(?:\.\d+)?x\d+(?:\.\d+)?)(?P<suf>[ANan])?$",
    re.I,
)
UNDERCUT = 0.9
EST_UNDERCUT = 0.88
POPULAR = [
    "16x25x1",
    "20x25x1",
    "20x20x1",
    "16x20x1",
    "14x25x1",
    "16x25x2",
    "20x25x2",
    "12x24x1",
    "18x24x1",
    "20x30x1",
    "16x20x2",
    "16x25x4",
    "20x25x4",
    "16x25x5",
    "20x25x5",
    "14x20x1",
    "24x24x1",
    "20x20x2",
    "16x20x4",
    "20x20x4",
]


def money(n: float) -> float:
    return round(n + 1e-9, 2)


def hero(fk: float, estimated: bool) -> float:
    return money(fk * (EST_UNDERCUT if estimated else UNDERCUT))


def norm(size: str) -> str:
    return size.lower().replace(" ", "").rstrip("a").rstrip("n")


def parse_sheet() -> list[dict]:
    rows = []
    merv = None
    for line in SHEET.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith("MERV "):
            merv = line.split()[1]
            continue
        if not line or not line.startswith("FK"):
            continue
        sku, price_s = line.split("\t")
        m = SKU_RE.match(sku)
        if not m or merv is None:
            print("UNPARSED", sku)
            continue
        rows.append(
            {
                "sku": sku,
                "size": norm(m.group("size")),
                "suffix": (m.group("suf") or "").upper(),
                "merv": merv,
                "cost": float(price_s.replace("$", "")),
            }
        )
    return rows


def preferred_cost(cands: list[dict]) -> dict:
    """Prefer a nominal (no A/N) SKU when both exist."""
    plain = [c for c in cands if not c["suffix"]]
    return min(plain or cands, key=lambda c: c["cost"])


def build_ladders(live: dict) -> dict[tuple[str, str], dict]:
    ladders: dict[tuple[str, str], dict] = {}
    for row in live["products"]:
        merv = str(row.get("merv", "")).lower()
        if merv not in {"8", "11", "13"}:
            continue
        size = norm(row.get("size") or "")
        if not size:
            continue
        filled = sum(isinstance(row.get(k), (int, float)) for k in ("q1", "q2", "q4", "q6", "q12"))
        if filled < 3:
            continue
        key = (size, merv)
        prev = ladders.get(key)
        if prev and (not prev.get("estimated")) and row.get("estimated"):
            continue
        if prev and prev.get("estimated") and not row.get("estimated"):
            ladders[key] = row
            continue
        if not prev:
            ladders[key] = row
    return ladders


def main() -> None:
    sheet = parse_sheet()
    live = json.loads(LIVE.read_text(encoding="utf-8"))
    ladders = build_ladders(live)

    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for r in sheet:
        grouped[(r["size"], r["merv"])].append(r)

    comparisons = []
    unmatched_cost = []
    for key, cands in grouped.items():
        chosen = preferred_cost(cands)
        ladder = ladders.get(key)
        rec = {
            "size": key[0],
            "merv": key[1],
            "sku": chosen["sku"],
            "cost": chosen["cost"],
            "altSkus": [c["sku"] for c in cands if c["sku"] != chosen["sku"]],
        }
        if not ladder:
            unmatched_cost.append(rec)
            rec["matched"] = False
            comparisons.append(rec)
            continue
        rec["matched"] = True
        rec["estimated"] = bool(ladder.get("estimated"))
        rec["fk"] = {k: ladder[k] for k in ("q1", "q2", "q4", "q6", "q12") if k in ladder}
        rec["hero"] = {
            k: hero(ladder[k], rec["estimated"])
            for k in ("q1", "q2", "q4", "q6", "q12")
            if k in ladder
        }
        rec["margin"] = {}
        rec["marginPct"] = {}
        rec["underwater"] = []
        for k, sell in rec["hero"].items():
            m = money(sell - rec["cost"])
            rec["margin"][k] = m
            rec["marginPct"][k] = round(100 * m / sell, 1) if sell else None
            if m < 0:
                rec["underwater"].append(k)
        comparisons.append(rec)

    matched = [c for c in comparisons if c["matched"]]
    underwater = [c for c in matched if c["underwater"]]
    thin_q6 = [c for c in matched if 0 <= c["margin"].get("q6", 99) < 1]
    thin_q12 = [c for c in matched if 0 <= c["margin"].get("q12", 99) < 1]

    def avg(xs):
        return round(statistics.mean(xs), 1) if xs else None

    q6_pcts = [c["marginPct"]["q6"] for c in matched if "q6" in c["marginPct"]]
    q12_pcts = [c["marginPct"]["q12"] for c in matched if "q12" in c["marginPct"]]
    q1_pcts = [c["marginPct"]["q1"] for c in matched if "q1" in c["marginPct"]]

    popular = [
        c
        for c in matched
        if c["size"] in POPULAR
    ]
    popular.sort(key=lambda c: (POPULAR.index(c["size"]), c["merv"]))

    by_merv = {}
    for m in ("8", "11", "13"):
        subset = [c for c in matched if c["merv"] == m]
        by_merv[m] = {
            "sheet": sum(1 for c in comparisons if c["merv"] == m),
            "matched": len(subset),
            "underwater": sum(1 for c in subset if c["underwater"]),
            "avgQ6Pct": avg([c["marginPct"]["q6"] for c in subset if "q6" in c["marginPct"]]),
            "avgQ12Pct": avg([c["marginPct"]["q12"] for c in subset if "q12" in c["marginPct"]]),
        }

    worst_q12 = sorted(matched, key=lambda c: c["margin"].get("q12", 99))[:15]
    best_q6 = sorted(matched, key=lambda c: -c["margin"].get("q6", -99))[:8]

    summary = {
        "wholesaleYear": 2025,
        "heroSource": live.get("scraped"),
        "sheetRows": len(sheet),
        "uniqueSizeMerv": len(comparisons),
        "matched": len(matched),
        "unmatched": len(unmatched_cost),
        "underwaterCount": len(underwater),
        "thinQ6Count": len(thin_q6),
        "thinQ12Count": len(thin_q12),
        "avgMarginPct": {"q1": avg(q1_pcts), "q6": avg(q6_pcts), "q12": avg(q12_pcts)},
        "byMerv": by_merv,
        "unmatchedSample": unmatched_cost[:20],
        "underwater": [
            {
                "size": c["size"],
                "merv": c["merv"],
                "cost": c["cost"],
                "heroQ6": c["hero"].get("q6"),
                "heroQ12": c["hero"].get("q12"),
                "marginQ6": c["margin"].get("q6"),
                "marginQ12": c["margin"].get("q12"),
                "packs": c["underwater"],
                "estimated": c["estimated"],
            }
            for c in underwater
        ],
        "worstQ12": [
            {
                "size": c["size"],
                "merv": c["merv"],
                "cost": c["cost"],
                "heroQ12": c["hero"].get("q12"),
                "marginQ12": c["margin"].get("q12"),
                "pctQ12": c["marginPct"].get("q12"),
            }
            for c in worst_q12
        ],
        "popular": [
            {
                "size": c["size"],
                "merv": c["merv"],
                "cost": c["cost"],
                "fkQ1": c["fk"].get("q1"),
                "fkQ6": c["fk"].get("q6"),
                "fkQ12": c["fk"].get("q12"),
                "heroQ1": c["hero"].get("q1"),
                "heroQ6": c["hero"].get("q6"),
                "heroQ12": c["hero"].get("q12"),
                "marginQ6": c["margin"].get("q6"),
                "marginQ12": c["margin"].get("q12"),
                "pctQ6": c["marginPct"].get("q6"),
                "pctQ12": c["marginPct"].get("q12"),
                "estimated": c["estimated"],
                "underwater": c["underwater"],
            }
            for c in popular
        ],
    }
    OUT.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({k: summary[k] for k in summary if k not in {"popular", "underwater", "worstQ12", "unmatchedSample"}}, indent=2))
    print("UNMATCHED", len(unmatched_cost), [f"{u['size']} M{u['merv']}" for u in unmatched_cost])
    print("UNDERWATER", len(underwater))
    for u in underwater:
        print(" ", u["size"], "M"+u["merv"], "cost", u["cost"], "hero6", u["hero"].get("q6"), "hero12", u["hero"].get("q12"), u["underwater"], "est" if u["estimated"] else "live")
    print("POPULAR")
    for p in popular:
        print(
            f"  {p['size']:10} M{p['merv']:2} cost ${p['cost']:5.2f}  "
            f"hero1 ${p['heroQ1']:6.2f}  hero6 ${p['heroQ6']:5.2f} ({p['pctQ6']}%)  "
            f"hero12 ${p['heroQ12']:5.2f} ({p['pctQ12']}%)  "
            f"{'EST' if p['estimated'] else 'LIVE'} {p['underwater'] or ''}"
        )


if __name__ == "__main__":
    main()
