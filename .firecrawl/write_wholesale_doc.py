"""Write a complete markdown brief of Filter King pricing research."""
from __future__ import annotations

import json
import statistics
from collections import defaultdict
from pathlib import Path

from compare_wholesale import (
    EST_UNDERCUT,
    LIVE,
    POPULAR,
    UNDERCUT,
    build_ladders,
    hero,
    money,
    parse_sheet,
    preferred_cost,
)

ROOT = Path(__file__).resolve().parent.parent
DOC = ROOT / "docs" / "FILTER-KING-PRICING-BRIEF.md"
QTY = ("q1", "q2", "q4", "q6", "q12")
QTY_LABEL = {
    "q1": "1-filter",
    "q2": "2-pack",
    "q4": "4-pack",
    "q6": "6-pack",
    "q12": "12-pack",
}

TOP100 = [
    (1, "20x20x1", '1"', "Core", "High", "Most common US face; return grille + furnace", "FilterBuy Jul 2026 #1; Atomic orders #1; Amazon BSR #1/#3/#8"),
    (2, "16x25x1", '1"', "Core", "High", "Most common furnace slot", "Remember The Filter MOST ORDERED; FilterBuy #2; Home Depot first listed"),
    (3, "20x25x1", '1"', "Core", "High", "Larger air handler / whole-house return", "Amazon BSR #2; ASInsight ~10k/mo Apr 2026; Home Depot"),
    (4, "16x20x1", '1"', "Core", "High", "Smaller furnace / return grille", "FilterBuy #3; Amazon BSR #4; Lowe's featured"),
    (5, "20x25x4", '4"', "Media", "High", "AprilAire / Honeywell / Lennox media cabinets", "8 of Amazon top-50 SKUs; Honeywell FC100A1037"),
    (6, "14x25x1", '1"', "Next", "High", "Compact furnace slot", "Remember The Filter top 1\" set; Atomic orders; Walmart Filtrete bestseller"),
    (7, "14x20x1", '1"', "Next", "High", "Compact furnace / townhome", "Atomic top-sellers; Lowe's common; Quality Home Air Care"),
    (8, "20x30x1", '1"', "Next", "High", "Large return grille", "Amazon BSR #9 Filtrete; FilterBuy; Lowe's"),
    (9, "16x25x4", '4"', "Media", "High", "Honeywell / AprilAire 16x25 cabinets", "Home Depot popular; Honeywell FC100A1029; Remember The Filter"),
    (10, "20x25x5", '5"', "Media", "High", "Lennox X6673/X6675, AprilAire 213, Air Bear", "4 Amazon top-50 SKUs; OEM cabinets"),
    (11, "18x20x1", '1"', "Next", "Medium", "Return grille", "Atomic top-sellers; Walmart Filtrete bestseller"),
    (12, "24x24x1", '1"', "Next", "Medium", "Large return / light commercial in homes", "Atomic top-sellers; Lowe's; FilterBuy"),
    (13, "16x24x1", '1"', "Next", "Medium", "Return grille", "Home Depot popular sizes; Lowe's"),
    (14, "12x24x1", '1"', "Next", "Medium", "Narrow return grille", "Home Depot popular; Filter King; FilterBuy"),
    (15, "18x24x1", '1"', "Next", "Medium", "Return grille", "Amazon BSR #34; Filter King; FilterBuy"),
    (16, "20x20x2", '2"', "Next", "High", "Most common 2\" residential", "Remember The Filter; 2 Amazon top-50 SKUs"),
    (17, "20x25x2", '2"', "Next", "Medium", "Deeper air-handler slot", "FilterBuy; Filter King popular 2\""),
    (18, "16x25x2", '2"', "Next", "Medium", "Deeper furnace slot", "FilterBuy; Filter King popular 2\""),
    (19, "16x20x4", '4"', "Media", "Medium", "Honeywell FC100A1003 cabinets", "Honeywell OEM; FilterBuy 4\""),
    (20, "20x20x4", '4"', "Media", "Medium", "Square media cabinet", "Lowe's merchandised; Honeywell FC100A1011"),
    (21, "12x20x1", '1"', "Standard", "Medium", "Small return", "Home Depot popular; Lowe's; FilterBuy"),
    (22, "16x16x1", '1"', "Standard", "Medium", "Small return", "Home Depot popular; Lowe's"),
    (23, "14x24x1", '1"', "Standard", "Medium", "Return grille", "Amazon BSR #46; Lowe's"),
    (24, "18x18x1", '1"', "Standard", "Medium", "Square return", "Amazon BSR #43; Lowe's"),
    (25, "16x25x5", '5"', "Media", "High", "AprilAire 201/2200/2400, Lennox X6670/X6672", "OEM cabinets; FilterBuy; Remember The Filter"),
    (26, "16x20x2", '2"', "Standard", "Medium", "Deeper 16x20 slot", "FilterBuy; Filter King"),
    (27, "14x14x1", '1"', "Standard", "Medium", "Small return", "Lowe's featured; FilterBuy"),
    (28, "12x12x1", '1"', "Standard", "Medium", "Compact return / apartment", "2 Amazon top-50 SKUs; Lowe's"),
    (29, "20x24x1", '1"', "Standard", "Medium", "Air handler", "Lowe's; FilterBuy"),
    (30, "18x30x1", '1"', "Standard", "Medium", "Large return", "Amazon BSR #17; Lowe's"),
    (31, "16x30x1", '1"', "Standard", "Medium", "Large return", "Home Depot popular; Lowe's"),
    (32, "14x30x1", '1"', "Standard", "Medium", "Large return", "Atomic chart; Lowe's"),
    (33, "20x22x1", '1"', "Standard", "Medium", "Air handler", "FilterBuy"),
    (34, "24x30x1", '1"', "Standard", "Medium", "Large return", "Lowe's; FilterBuy"),
    (35, "16x20x5", '5"', "Media", "Medium", "Lennox Healthy Climate / Carrier FILXXFNC0017", "OEM; Remember The Filter"),
    (36, "20x20x5", '5"', "Media", "Medium", "Goodman P102-2020, Lennox X7935", "OEM"),
    (37, "12x30x1", '1"', "Standard", "Medium", "Narrow large return", "Lowe's; FilterBuy"),
    (38, "25x25x1", '1"', "Standard", "Medium", "Large square return", "FilterBuy; Filter King"),
    (39, "14x25x4", '4"', "Media", "Medium", "Compact media cabinet", "FilterBuy 4\""),
    (40, "14x25x2", '2"', "Standard", "Medium", "Deeper compact furnace", "FilterBuy 2\""),
    (41, "15x20x1", '1"', "Standard", "Medium", "Return grille", "Amazon BSR #47; FilterBuy"),
    (42, "14x18x1", '1"', "Standard", "Inferred", "Return grille", "FilterBuy standard 1\" chart"),
    (43, "10x20x1", '1"', "Standard", "Inferred", "Small return", "FilterBuy; Filter King"),
    (44, "20x24x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy 4\""),
    (45, "16x24x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy 4\""),
    (46, "18x24x2", '2"', "Standard", "Inferred", "Deeper return", "FilterBuy 2\""),
    (47, "20x30x2", '2"', "Standard", "Inferred", "Deeper large return", "FilterBuy 2\""),
    (48, "16x24x2", '2"', "Standard", "Inferred", "Deeper return", "FilterBuy 2\""),
    (49, "18x20x2", '2"', "Standard", "Inferred", "Deeper return", "FilterBuy 2\""),
    (50, "14x20x4", '4"', "Media", "Inferred", "Compact media cabinet", "FilterBuy most-popular catalog"),
    (51, "12x24x4", '4"', "Media", "Inferred", "Narrow media cabinet", "FilterBuy 4\""),
    (52, "20x22x4", '4"', "Media", "Inferred", "Air-handler cabinet", "FilterBuy most-popular catalog"),
    (53, "24x24x2", '2"', "Standard", "Medium", "Large 2\" / light commercial in homes", "FilterBuy; Remember The Filter commercial overlap"),
    (54, "20x30x4", '4"', "Media", "Inferred", "Large media cabinet", "FilterBuy most-popular catalog"),
    (55, "18x20x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy most-popular catalog"),
    (56, "14x20x2", '2"', "Standard", "Inferred", "Deeper compact furnace", "FilterBuy 2\""),
    (57, "12x20x2", '2"', "Standard", "Inferred", "Deeper small return", "FilterBuy most-popular catalog"),
    (58, "12x24x2", '2"', "Standard", "Inferred", "Deeper narrow return", "FilterBuy 2\""),
    (59, "16x16x4", '4"', "Media", "Inferred", "Small square cabinet", "FilterBuy most-popular catalog"),
    (60, "16x16x2", '2"', "Standard", "Inferred", "Deeper small return", "FilterBuy most-popular catalog"),
    (61, "18x18x2", '2"', "Standard", "Inferred", "Deeper square return", "FilterBuy most-popular catalog"),
    (62, "18x18x4", '4"', "Media", "Inferred", "Square media cabinet", "FilterBuy most-popular catalog"),
    (63, "14x14x2", '2"', "Standard", "Inferred", "Deeper small return", "FilterBuy most-popular catalog"),
    (64, "14x14x4", '4"', "Media", "Inferred", "Small media cabinet", "FilterBuy most-popular catalog"),
    (65, "12x12x2", '2"', "Standard", "Inferred", "Deeper compact return", "FilterBuy most-popular catalog"),
    (66, "12x12x4", '4"', "Media", "Inferred", "Compact cabinet", "FilterBuy most-popular catalog"),
    (67, "24x24x4", '4"', "Media", "Medium", "Large media / light commercial", "FilterBuy 4\"; Remember The Filter"),
    (68, "14x24x2", '2"', "Standard", "Inferred", "Deeper return", "FilterBuy most-popular catalog"),
    (69, "14x24x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy most-popular catalog"),
    (70, "12x20x4", '4"', "Media", "Inferred", "Narrow media cabinet", "FilterBuy most-popular catalog"),
    (71, "18x24x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy most-popular catalog"),
    (72, "24x30x2", '2"', "Standard", "Inferred", "Large 2\" return", "FilterBuy 2\""),
    (73, "24x30x4", '4"', "Media", "Inferred", "Large media cabinet", "FilterBuy most-popular catalog"),
    (74, "14x30x2", '2"', "Standard", "Inferred", "Deeper large return", "FilterBuy most-popular catalog"),
    (75, "14x30x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy most-popular catalog"),
    (76, "16x30x2", '2"', "Standard", "Inferred", "Deeper large return", "FilterBuy most-popular catalog"),
    (77, "16x30x4", '4"', "Media", "Inferred", "Media cabinet", "FilterBuy most-popular catalog"),
    (78, "12x30x2", '2"', "Standard", "Inferred", "Deeper narrow return", "FilterBuy most-popular catalog"),
    (79, "12x30x4", '4"', "Media", "Inferred", "Narrow media cabinet", "FilterBuy most-popular catalog"),
    (80, "18x30x2", '2"', "Standard", "Inferred", "Deeper large return", "FilterBuy most-popular catalog"),
    (81, "18x30x4", '4"', "Long-tail", "Inferred", "Large media cabinet", "FilterBuy most-popular catalog"),
    (82, "20x22x2", '2"', "Long-tail", "Inferred", "Deeper air handler", "FilterBuy 2\""),
    (83, "25x25x2", '2"', "Long-tail", "Inferred", "Large square 2\"", "FilterBuy 2\""),
    (84, "25x25x4", '4"', "Long-tail", "Inferred", "Large square cabinet", "FilterBuy most-popular catalog"),
    (85, "10x10x1", '1"', "Long-tail", "Medium", "Very small return", "FilterBuy popular list; Filter King"),
    (86, "12x36x1", '1"', "Long-tail", "Medium", "Narrow extra-long return", "Lowe's shop-by-common-size"),
    (87, "10x24x1", '1"', "Long-tail", "Inferred", "Narrow return", "Filter King popular; Remember The Filter catalog"),
    (88, "10x30x1", '1"', "Long-tail", "Inferred", "Narrow large return", "Filter King; Remember The Filter"),
    (89, "20x21x1", '1"', "Long-tail", "Inferred", "Air handler odd face", "Filter King popular 1\""),
    (90, "20x23x1", '1"', "Long-tail", "Inferred", "Air handler odd face", "Filter King popular 1\""),
    (91, "19x20x5", '5"', "Long-tail", "Medium", "Trion Air Bear / Payne / Day & Night cabinets", "Filter King 5\" popular; OEM"),
    (92, "24x25x5", '5"', "Long-tail", "Medium", "Carrier FILXXCAR0024", "Carrier OEM"),
    (93, "20x26x5", '5"', "Long-tail", "Medium", "Lennox X8788", "Lennox OEM"),
    (94, "16x26x5", '5"', "Long-tail", "Medium", "Lennox X8789", "Lennox OEM"),
    (95, "17x26x4", '4"', "Long-tail", "Medium", "Lennox X6666 Healthy Climate", "Lennox OEM"),
    (96, "21x26x4", '4"', "Long-tail", "Medium", "Lennox X6669", "Lennox OEM"),
    (97, "20x25x0.5", '0.5"', "Long-tail", "Medium", "Thin return grille", "Filter King popular 0.5\"; verified FK ladder"),
    (98, "16x25x0.5", '0.5"', "Long-tail", "Inferred", "Thin return grille", "Filter King popular 0.5\""),
    (99, "8x14x1", '1"', "Long-tail", "Inferred", "Narrow slot / older equipment", "Filter King popular 1\" narrow"),
    (100, "30x30x1", '1"', "Long-tail", "Inferred", "Very large return", "Filter King popular 1\" wide"),
]

HERO_SHORTCUTS = [
    ("16x25x1", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("20x25x1", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("20x20x1", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("16x20x1", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("14x25x1", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("16x25x2", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("16x20x2", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("16x25x4", "Live scrape", "Live scrape", "Live scrape", "Live scrape"),
    ("20x25x2", "Live scrape", "Modeled", "Live scrape", "Live scrape"),
    ("12x24x1", "Live scrape", "Modeled", "Live scrape", "Live scrape"),
    ("18x24x1", "Live scrape", "Live scrape", "Modeled", "Live scrape"),
    ("20x25x4", "Live scrape", "Live scrape", "Live scrape", "Modeled"),
    ("20x30x1", "Live scrape", "Live scrape", "Modeled", "Modeled"),
]

INDUSTRY_COMMON = [
    ("16x20x1", "Live", "Live", "Live", "Live"),
    ("16x25x1", "Live", "Live", "Live", "Live"),
    ("20x20x1", "Live", "Live", "Live", "Live"),
    ("20x25x1", "Live", "Live", "Live", "Live"),
    ("14x20x1", "Live", "Live", "Live", "Live"),
    ("14x25x1", "Live", "Live", "Live", "Live"),
    ("16x20x2", "Live", "Live", "Live", "Live"),
    ("16x25x2", "Live", "Live", "Live", "Live"),
    ("20x20x2", "Live", "Live", "Live", "Live"),
    ("14x25x2", "Live", "Live", "Live", "Live"),
    ("16x25x4", "Live", "Live", "Live", "Live"),
    ("20x20x4", "Live", "Live", "Live", "Live"),
    ("16x20x4", "Live", "Live", "Live", "Live"),
    ("16x25x5", "Live", "Live", "Live", "Live"),
    ("20x20x5", "Live", "Live", "Live", "Live"),
    ("14x14x1", "Live", "Live", "Live", "Live"),
    ("12x12x1", "Live", "Live", "Live", "Live"),
    ("16x16x1", "Live", "Live", "Live", "Live"),
    ("16x24x1", "Live", "Live", "Live", "Live"),
    ("24x24x1", "Live", "Live", "Live", "Modeled"),
    ("20x25x4", "Live", "Live", "Live", "Modeled"),
    ("20x25x5", "Live", "Live", "Live", "Modeled"),
    ("20x24x1", "Live", "Live", "Live", "Modeled"),
    ("24x30x1", "Live", "Live", "Live", "Modeled"),
    ("20x25x2", "Live", "Modeled", "Live", "Live"),
    ("12x24x1", "Live", "Modeled", "Live", "Live"),
    ("18x20x1", "Live", "Live", "Modeled", "Live"),
    ("18x24x1", "Live", "Live", "Modeled", "Live"),
    ("10x20x1", "Live", "Live", "Modeled", "Modeled"),
    ("20x30x1", "Live", "Live", "Modeled", "Modeled"),
]


def md_money(n: float | None) -> str:
    if n is None:
        return "—"
    return f"${n:.2f}"


def md_pct(n: float | None) -> str:
    if n is None:
        return "—"
    return f"{n:.1f}%"


def depth_of(size: str) -> str:
    return size.rsplit("x", 1)[-1]


def table(headers: list[str], rows: list[list[str]]) -> str:
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    return "\n".join(lines)


def full_row(c: dict) -> list[str]:
    return [
        c["size"],
        c["merv"],
        c["sku"],
        md_money(c["cost"]),
        md_money(c.get("fk", {}).get("q1")),
        md_money(c.get("hero", {}).get("q1")),
        md_money(c.get("margin", {}).get("q1")),
        md_pct(c.get("marginPct", {}).get("q1")),
        md_money(c.get("fk", {}).get("q2")),
        md_money(c.get("hero", {}).get("q2")),
        md_money(c.get("margin", {}).get("q2")),
        md_pct(c.get("marginPct", {}).get("q2")),
        md_money(c.get("fk", {}).get("q4")),
        md_money(c.get("hero", {}).get("q4")),
        md_money(c.get("margin", {}).get("q4")),
        md_pct(c.get("marginPct", {}).get("q4")),
        md_money(c.get("fk", {}).get("q6")),
        md_money(c.get("hero", {}).get("q6")),
        md_money(c.get("margin", {}).get("q6")),
        md_pct(c.get("marginPct", {}).get("q6")),
        md_money(c.get("fk", {}).get("q12")),
        md_money(c.get("hero", {}).get("q12")),
        md_money(c.get("margin", {}).get("q12")),
        md_pct(c.get("marginPct", {}).get("q12")),
        "Modeled" if c.get("estimated") else "Live scrape",
        ", ".join(a["sku"] for a in c.get("alts", [])) or "—",
    ]


FULL_HEADERS = [
    "Size",
    "MERV",
    "Wholesale SKU used",
    "Your cost",
    "FK 1",
    "Hero 1",
    "Hero 1 $",
    "Hero 1 %",
    "FK 2",
    "Hero 2",
    "Hero 2 $",
    "Hero 2 %",
    "FK 4",
    "Hero 4",
    "Hero 4 $",
    "Hero 4 %",
    "FK 6",
    "Hero 6",
    "Hero 6 $",
    "Hero 6 %",
    "FK 12",
    "Hero 12",
    "Hero 12 $",
    "Hero 12 %",
    "Retail source",
    "Other sheet SKUs for this size",
]


def build_comparisons(sheet, ladders):
    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for r in sheet:
        grouped[(r["size"], r["merv"])].append(r)

    comparisons = []
    for key, cands in grouped.items():
        chosen = preferred_cost(cands)
        ladder = ladders.get(key)
        rec = {
            "size": key[0],
            "merv": key[1],
            "sku": chosen["sku"],
            "cost": chosen["cost"],
            "suffix": chosen["suffix"],
            "alts": [
                {"sku": c["sku"], "cost": c["cost"], "suffix": c["suffix"]}
                for c in cands
                if c["sku"] != chosen["sku"]
            ],
        }
        if not ladder:
            rec["matched"] = False
            comparisons.append(rec)
            continue
        rec["matched"] = True
        rec["estimated"] = bool(ladder.get("estimated"))
        rec["fk"] = {k: ladder[k] for k in QTY if isinstance(ladder.get(k), (int, float))}
        rec["hero"] = {k: hero(ladder[k], rec["estimated"]) for k in rec["fk"]}
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
    return comparisons


def research_sections() -> str:
    shortcut_table = table(
        ["Size", "MERV 8", "MERV 11", "MERV 13", "Carbon"],
        [list(r) for r in HERO_SHORTCUTS],
    )
    industry_table = table(
        ["Size", "MERV 8", "MERV 11", "MERV 13", "Carbon"],
        [list(r) for r in INDUSTRY_COMMON],
    )
    top100_table = table(
        ["#", "Size", "Depth", "Band", "Confidence", "Typical use", "Why it ranks here"],
        [[str(r[0]), r[1], r[2], r[3], r[4], r[5], r[6]] for r in TOP100],
    )
    amazon_table = table(
        ["Nominal size", "SKUs in Amazon top 50 (Aug 22, 2026)"],
        [
            ["20x20x1", "9"],
            ["20x25x4", "8"],
            ["20x25x1", "7"],
            ["16x20x1", "6"],
            ["16x25x1", "4"],
            ["20x25x5", "4"],
            ["20x20x2", "2"],
            ["12x12x1", "2"],
            ["Other sizes (remaining 8 of 50)", "8"],
        ],
    )
    depth_table = table(
        ["Depth", "SKUs in Amazon top 50"],
        [
            ["1 inch", "35 (70%)"],
            ["4 inch", "8"],
            ["5 inch", "4"],
            ["2 inch", "2"],
        ],
    )
    modeled_table = table(
        ["Size", "Line", "Why it matters"],
        [
            ["20x25x2", "MERV 11", "Hero shortcut + industry common"],
            ["12x24x1", "MERV 11", "Hero shortcut + industry common"],
            ["18x24x1", "MERV 13", "Hero shortcut + industry common"],
            ["20x30x1", "MERV 13", "Hero shortcut + industry common"],
            ["20x30x1", "Carbon", "Hero shortcut + industry common"],
            ["20x25x4", "Carbon", "Hero shortcut"],
            ["10x20x1", "MERV 13", "Industry common"],
            ["18x20x1", "MERV 13", "Industry common"],
        ],
    )
    fk_home_table = table(
        ["List", "Live scrape", "Modeled", "Missing"],
        [
            ["MERV 8 popular (30 sizes)", "25", "5", "0"],
            ["MERV 11 popular (30 sizes)", "28", "2", "0"],
            ["MERV 13 popular (30 sizes)", "22", "8", "0"],
            ["Carbon popular (30 sizes)", "18", "12", "0"],
        ],
    )
    coverage_bars = table(
        ["Common list", "Live scrape ladders", "Modeled fill ladders", "Missing"],
        [
            ["Hero shortcuts (13 sizes × 4 MERV lines = 52)", "46", "6", "0"],
            ["Industry common (30 sizes × MERV 8/11/13 = 90)", "84", "6", "0"],
            ["FK homepage popular MERV 8", "25", "5", "0"],
            ["FK homepage popular MERV 11", "28", "2", "0"],
            ["FK homepage popular MERV 13", "22", "8", "0"],
            ["FK homepage popular carbon", "18", "12", "0"],
        ],
    )
    return "\n".join(
        [
            "# Filter King pricing and size research",
            "",
            "Complete written record of the Aug 21–23, 2026 Filter Hero pricing work: common Filter King retail coverage, the 100 most-bought residential sizes, and every line of Paul Sellaro’s 2025 wholesale sheet compared with Filter Hero sell prices. Chat and the live canvases are summaries of this file. Nothing from those three analyses is omitted.",
            "",
            "- **Written:** 2026-08-23",
            "- **Retail scrape:** `shared/pricing/fk-live-prices.json`, dated 2026-08-20, source `filterking-local+model`. Notes in the file: “Sale / one-time unit prices. Real scrapes preferred. estimated=true rows are filled from same-size MERV ratios or nearest same-depth area peers.”",
            "- **Catalog counts in that file:** 19,337 scraped + 20,555 estimated = 39,892 size × MERV ladders.",
            "- **Hero formula:** live Filter King sale unit × 0.90 (`UNDERCUT_RATIO`); modeled ladder × 0.88 (`ESTIMATED_UNDERCUT_RATIO`). Files: `shared/pricing/engine.ts`, `shared/products.ts` (`unitPriceForQty`, `PACK_TIERS` fallback only when no live ladder).",
            "- **Wholesale source:** `E:\\FILTER HEROE\\FK PRICING_SHEET PS (1).pdf` (5 pages, labeled 2025; extracted text in `.firecrawl/fk-wholesale-2025.txt`).",
            "- **Wholesale contact on the sheet:** Filter King LLC, 7301 NW 36th Ct, Miami FL 33147; Paul Sellaro; 305-300-2431; paul@filterking.com.",
            "- **Carbon / odor:** not priced on the wholesale sheet. Page 4: “Our dedicated team will quote any carbon filter size you need in just a minute!”",
            "",
            "## Contents",
            "",
            "1. [Part 1 — Common Filter King retail prices](#part-1--common-filter-king-retail-prices)",
            "2. [Part 2 — 100 most-bought residential sizes](#part-2--100-most-bought-residential-sizes)",
            "3. [Part 3 — Wholesale sheet vs Filter Hero sell prices](#part-3--wholesale-sheet-vs-filter-hero-sell-prices)",
            "",
            "---",
            "",
            "## Part 1 — Common Filter King retail prices",
            "",
            "Question answered: Filter Hero does not have a complete live scrape of Filter King’s ~40k size × MERV catalog, but **the SKUs people actually buy have live Filter King ladders.** Every Filter Hero shortcut size, every industry-common residential size, and every size on Filter King’s own “popular” homepage lists has a qty 1/2/4/6/12 price. The remaining catalog gap is the long tail (odd custom sizes), not 16x25x1 / 20x25x1 and friends.",
            "",
            "### Headline coverage",
            "",
            "- **46 / 52** Hero shortcut ladders live-scraped (13 sizes × MERV 8 / 11 / 13 / carbon). **6** modeled. **0** missing.",
            "- **30 / 30** industry-common sizes have a live MERV 8 ladder. **84 / 90** of those sizes × MERV 8/11/13 are live.",
            "- **0** common sizes with no price at all.",
            "- Full catalog: **19,337 live scrapes vs 20,555 modeled fills** = 39,892 ladders (**about 48% live-scraped**).",
            "",
            coverage_bars,
            "",
            "Hero shortcuts come from `popularSizeSlugs()` in `shared/products.ts`: 16x25x1, 20x25x1, 20x20x1, 16x20x1, 14x25x1, 16x25x2, 20x25x2, 12x24x1, 18x24x1, 20x30x1, 16x20x2, 16x25x4, 20x25x4.",
            "",
            "Flagship 1-inch SKUs (16x25x1, 20x25x1, 20x20x1, 16x20x1, 14x25x1) are live-scraped on every MERV line, including carbon.",
            "",
            "### Filter Hero shortcut sizes (13 × 4 MERV lines)",
            "",
            shortcut_table,
            "",
            "### Modeled leftovers on common SKUs",
            "",
            "Still priced. Filled from same-size MERV ratios or nearest same-depth peers, then undercut **12% instead of 10%**.",
            "",
            modeled_table,
            "",
            "### Filter King homepage “popular” lists",
            "",
            "Their own popular lists by MERV. Zero missing. Modeled SKUs are mostly oddball 6-inch, half-inch, and carbon variants — not the retail 16×25 / 20×25 pack.",
            "",
            fk_home_table,
            "",
            "**Thickness popular (125 sizes):** 121 have at least one live scrape. Only 9.75x23.75x0.5, 6x14x1, 6x30x1, and 30x32x4 are modeled-only. None are missing.",
            "",
            "### Industry-common residential sizes (30 faces)",
            "",
            "Sizes that dominate retail HVAC (1/2/4/5 inch). Every size has a live MERV 8 ladder.",
            "",
            industry_table,
            "",
            "### What we still do not have (retail)",
            "",
            "A complete live scrape of Filter King’s ~40k size × MERV catalog. About half of those ladders are modeled. That gap is custom and low-volume sizes, not the filters that show up in a typical residential order.",
            "",
            "---",
            "",
            "## Part 2 — 100 most-bought residential sizes",
            "",
            "US homes, nominal W×L×D in inches. Synthesized Aug 22–23, 2026 from live Amazon Best Sellers, FilterBuy manufacturing claims, Atomic Filters order data, Home Depot / Lowe’s merchandising, Remember The Filter, Filter King popular lists, and OEM media-cabinet SKUs.",
            "",
            "**There is no public Nielsen-style unit-sales file that ranks all 100 sizes.** Ranks 1–20 are high-signal (multiple independent sales or order sources). Ranks 21–50 are well-attested standard residential sizes. Ranks 51–100 are catalog-inferred from what big-box and DTC vendors actually stock as “popular,” plus OEM 4–5″ cabinets.",
            "",
            "### Core Four (~60–70% of homes)",
            "",
            "20x20x1, 16x25x1, 20x25x1, and 16x20x1. There is **no single undisputed #1**:",
            "",
            "- **FilterBuy** (Jul 2026, manufacturer): 20x20x1, then 16x25x1, 16x20x1, 20x25x1. FilterBuy also calls 16x25x1 the most common furnace slot — square 20x20 wins more return grilles.",
            "- **Atomic Filters** (order data): 20x20x1 is #1 bestseller. Atomic: popular sizes cover ~80% of systems.",
            "- **Remember The Filter:** 16x25x1 is “MOST ORDERED / Top US size.”",
            "- **Amazon Best Sellers** (furnace filters, live Aug 22, 2026) currently leads with 20x20x1 products.",
            "- **whatairfilter.com:** Core Four cover 60–70% of homes.",
            "- **American Lung Association:** the default residential filter is still 1-inch. Amazon mix matches that (~70% of top-50 SKUs are 1-inch).",
            "",
            "### Amazon Best Sellers size mix",
            "",
            "Count of furnace-filter SKUs in Amazon’s live top 50 (Aug 22, 2026). This is product rank, not unique households — 20x25x4 is inflated by AprilAire / Filtrete / Filterbuy SKU competition. Source: amazon.com/Best-Sellers-Furnace-Filters/zgbs/hi/13399891",
            "",
            amazon_table,
            "",
            depth_table,
            "",
            "### Ranks 1–10 (high evidence, Aug 2026)",
            "",
            "1. 20x20x1 — FilterBuy manufacturing #1, Atomic order #1, Amazon bestseller #1",
            "2. 16x25x1 — most common furnace slot; Remember The Filter most ordered",
            "3. 20x25x1 — Amazon BSR #2; larger air handler / whole-house return",
            "4. 16x20x1 — FilterBuy #3; Amazon BSR #4",
            "5. 20x25x4 — AprilAire / Honeywell / Lennox media cabinets; 8 of Amazon top-50 SKUs",
            "6. 14x25x1 — compact furnace slot",
            "7. 14x20x1 — compact furnace / townhome",
            "8. 20x30x1 — large return grille",
            "9. 16x25x4 — Honeywell / AprilAire 16x25 cabinets",
            "10. 20x25x5 — Lennox X6673/X6675, AprilAire 213, Air Bear",
            "",
            "Next merchandising adds after the Core Four and those media sizes: **20x25x5, 16x25x5, 16x20x4, 20x20x4, and 20x20x2.**",
            "",
            "### Full ranked 100",
            "",
            "Confidence: **High** = two or more independent sales/order sources. **Medium** = merchandised as popular plus at least one retailer bestseller or OEM cabinet. **Inferred** = catalog-inferred from FilterBuy / Filter King / OEM lists.",
            "",
            "Bands: Core (the four faces that cover most homes), Next (must-stock after Core), Standard (well-attested residential), Media (4–5 inch cabinets), Long-tail (OEM odd faces, thin grilles, extra-large returns).",
            "",
            "Ranks 51–80 are the same faces as the 1-inch staples in thicker slots. Stocked as “most popular” by FilterBuy; lower unit volume than 1-inch because fewer homes have 2/4-inch racks.",
            "",
            "Ranks 81–100 are still bought in volume nationally, but each SKU serves a smaller slice of housing stock. Lennox / Carrier / Air Bear cabinets matter for Filter Hero because they are recurring 6–12 month replacements.",
            "",
            top100_table,
            "",
            "### What this means for Filter Hero merchandising",
            "",
            "All 13 Filter Hero shortcut sizes sit inside ranks 1–26. The Core Four plus 14x25x1, 20x30x1, 16x25x4, 20x25x4, 16x25x2, 20x25x2, 16x20x2, 12x24x1, and 18x24x1 are the SKUs a residential store must price from live Filter King ladders — and those ladders are already scraped (see Part 1).",
            "",
            "Add merchandising weight for 20x25x5, 16x25x5, 16x20x4, 20x20x4, and 20x20x2. Those are the next media-cabinet and 2-inch sizes people actually search on Amazon and OEM lists.",
            "",
            "### Sources (Aug 2026)",
            "",
            "- Amazon Best Sellers — Furnace Filters, live Aug 22, 2026 (`amazon.com/Best-Sellers-Furnace-Filters/zgbs/hi/13399891`).",
            "- FilterBuy size chart and manufacturing claim, dated July 2026.",
            "- Atomic Filters size chart / order bestsellers, 2025–2026.",
            "- Home Depot air-filter buying guide.",
            "- Lowe’s shop-by-common-size.",
            "- Remember The Filter homepage (“MOST ORDERED 16x25x1”) and common-size FAQ.",
            "- Filter King homepage popular lists.",
            "- Honeywell FC100A, Lennox X66xx/X87xx, AprilAire 201/213, Carrier FILXXCAR, Goodman P102, Trion Air Bear.",
            "- American Lung Association: default residential filter is 1-inch.",
            "- whatairfilter.com: Core Four cover 60–70% of homes.",
            "- Atomic: popular sizes cover ~80% of systems.",
            "- ASInsight ~10k/mo Apr 2026 on 20x25x1 (cited in rank 3).",
            "",
            "Research tooling notes: Firecrawl CLI was out of credits (0/1000). Tavily CLI was not authenticated. This ranking used web search and page fetches, not those CLIs.",
            "",
            "---",
            "",
            "## Part 3 — Wholesale sheet vs Filter Hero sell prices",
            "",
            "2025 dealer cost sheet from Paul Sellaro (Filter King LLC) vs Filter King public sale ladders scraped Aug 20, 2026. Filter Hero still sells at 10% under those public ladders (12% under when the ladder was modeled).",
            "",
        ]
    )


def main() -> None:
    sheet = parse_sheet()
    live = json.loads(LIVE.read_text(encoding="utf-8"))
    ladders = build_ladders(live)
    comparisons = build_comparisons(sheet, ladders)
    matched = [c for c in comparisons if c["matched"]]
    unmatched = [c for c in comparisons if not c["matched"]]
    matched.sort(key=lambda c: (float(depth_of(c["size"]) or 0), c["size"], int(c["merv"])))

    def avg(xs):
        return round(statistics.mean(xs), 1) if xs else None

    def med(xs):
        return round(statistics.median(xs), 1) if xs else None

    avgs = {}
    meds = {}
    for k in QTY:
        pcts = [c["marginPct"][k] for c in matched if k in c["marginPct"]]
        dollars = [c["margin"][k] for c in matched if k in c["margin"]]
        avgs[k] = {
            "pct": avg(pcts),
            "dollars": round(statistics.mean(dollars), 2) if dollars else None,
        }
        meds[k] = {
            "pct": med(pcts),
            "dollars": round(statistics.median(dollars), 2) if dollars else None,
        }

    underwater = [c for c in matched if c["underwater"]]
    thin_q6 = [c for c in matched if 0 <= c["margin"].get("q6", 99) < 1]
    thin_q12 = [c for c in matched if 0 <= c["margin"].get("q12", 99) < 1]
    tight_q12 = [c for c in matched if c["marginPct"].get("q12", 99) < 20]
    tight_q6 = [c for c in matched if c["marginPct"].get("q6", 99) < 20]

    duals = []
    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for r in sheet:
        grouped[(r["size"], r["merv"])].append(r)
    for key, cands in grouped.items():
        if len(cands) < 2:
            continue
        if len({c["cost"] for c in cands}) == 1:
            duals.append({"size": key[0], "merv": key[1], "kind": "same-price-aliases", "rows": cands})
        else:
            duals.append({"size": key[0], "merv": key[1], "kind": "different-prices", "rows": cands})

    popular_missing = []
    for size in POPULAR:
        for merv in ("8", "11", "13"):
            hit = next((c for c in comparisons if c["size"] == size and c["merv"] == merv), None)
            if not hit:
                popular_missing.append(f"{size} MERV {merv}")

    by_merv_sheet = {m: [r for r in sheet if r["merv"] == m] for m in ("8", "11", "13")}
    by_depth: dict[str, int] = defaultdict(int)
    for c in matched:
        by_depth[depth_of(c["size"])] += 1

    unique_by_merv = {m: sum(1 for c in comparisons if c["merv"] == m) for m in ("8", "11", "13")}

    lines: list[str] = [research_sections()]
    a = lines.append

    a("### How to read the three prices")
    a("")
    a("| Column | What it is |")
    a("| --- | --- |")
    a("| Your cost | Dealer unit cost from Paul’s 2025 sheet, dollars per filter |")
    a("| FK 1 / 2 / 4 / 6 / 12 | Filter King’s public website unit price at that quantity (what we scraped them selling at) |")
    a("| Hero 1 / 2 / 4 / 6 / 12 | What Filter Hero charges today = FK public unit × 0.90 (or × 0.88 if that ladder was modeled) |")
    a("| Hero $ / % | Hero sell minus your cost, as dollars and as a percent of the Hero sell price |")
    a("")
    a("Filter King’s public 1-filter prices (~$28–$31 on common 1-inch sizes) are not your cost. Your cost on those SKUs is about $3.76–$5.96. Hero’s 10% undercut is versus their public sale ladder, not versus wholesale.")
    a("")
    a("When the sheet listed both a nominal SKU and an `A` / `N` actual-size SKU for the same face, the comparison uses the **nominal (no suffix) SKU** if one exists; otherwise the cheaper listed cost. Matching: regex `FK` + size, strip trailing A/N; prefer non-A/N when both exist. Alternate SKUs are in the last column of the full table and in the duplicate-SKU appendix.")
    a("")
    a("The sheet is dated **2025**. Retail ladders were scraped **2026-08-20**. If dealer cost has increased since the PDF, 12-pack 1-inch bestsellers go underwater first.")
    a("")
    a("### Headline results")
    a("")
    a(f"- Sheet line items parsed: **{len(sheet)}**")
    a(f"- Unique size × MERV combos: **{len(comparisons)}**")
    a(f"- Matched to a Filter King retail ladder (and therefore to a Hero sell price): **{len(matched)}**")
    a(f"- Unmatched (on the sheet, no retail ladder): **{len(unmatched)}**")
    a(f"- Selling below cost at any pack size: **{len(underwater)}**")
    a(f"- 6-pack Hero margin under $1.00: **{len(thin_q6)}**")
    a(f"- 12-pack Hero margin under $1.00: **{len(thin_q12)}**")
    a(f"- 6-pack Hero margin under 20%: **{len(tight_q6)}**")
    a(f"- 12-pack Hero margin under 20%: **{len(tight_q12)}**")
    a(f"- Unique sizes on sheet by MERV: MERV 8 **{unique_by_merv['8']}**, MERV 11 **{unique_by_merv['11']}**, MERV 13 **{unique_by_merv['13']}**")
    a("")
    a("### Average and median Hero margin, all matched SKUs")
    a("")
    a(
        table(
            ["Pack", "Avg Hero margin $", "Avg Hero margin %", "Median Hero margin $", "Median Hero margin %"],
            [
                [
                    QTY_LABEL[k],
                    md_money(avgs[k]["dollars"]),
                    md_pct(avgs[k]["pct"]),
                    md_money(meds[k]["dollars"]),
                    md_pct(meds[k]["pct"]),
                ]
                for k in QTY
            ],
        )
    )
    a("")
    a("### Average 6-pack and 12-pack margin by MERV")
    a("")
    merv_rows = []
    for m in ("8", "11", "13"):
        subset = [c for c in matched if c["merv"] == m]
        merv_rows.append(
            [
                f"MERV {m}",
                str(len(subset)),
                str(len(by_merv_sheet[m])),
                md_pct(avg([c["marginPct"]["q6"] for c in subset if "q6" in c["marginPct"]])),
                md_pct(avg([c["marginPct"]["q12"] for c in subset if "q12" in c["marginPct"]])),
                md_money(round(statistics.mean([c["cost"] for c in subset]), 2)),
            ]
        )
    a(
        table(
            ["MERV", "Matched unique sizes", "Sheet line items", "Avg Hero 6-pack %", "Avg Hero 12-pack %", "Avg wholesale cost"],
            merv_rows,
        )
    )
    a("")
    a("Matched SKUs by filter depth:")
    a("")
    for d in sorted(by_depth, key=lambda x: float(x)):
        a(f"- **{d} in:** {by_depth[d]}")
    a("")
    a("At 6-packs you still keep about $2–$3 per common 1-inch filter. At 12-packs that drops to about $1–$2 on the Core Four. Thicker filters have more dollars of margin even when the percent looks similar. 5-inch media is about $5–$8 per filter at Hero’s 6-pack.")
    a("")
    a("---")
    a("")
    a("### Core Four (highest-volume residential 1-inch)")
    a("")
    a("These four faces are the sizes US homes actually buy most. Numbers below are the full pack ladder.")
    a("")
    core = ["16x25x1", "20x25x1", "20x20x1", "16x20x1"]
    core_rows = [c for c in matched if c["size"] in core]
    core_rows.sort(key=lambda c: (core.index(c["size"]), int(c["merv"])))
    a(table(FULL_HEADERS, [full_row(c) for c in core_rows]))
    a("")
    a("#### Core Four in words")
    a("")
    for c in core_rows:
        extra = ""
        if c["size"] == "16x25x1" and c["merv"] == "13":
            extra = " Tightest common 6-pack."
        if c["size"] == "20x20x1" and c["merv"] == "8":
            extra = " One of the two 12-packs to watch."
        if c["size"] == "16x20x1" and c["merv"] == "8":
            extra = " Widest Core Four 1-inch 6-pack."
        a(
            f"- **{c['size']} MERV {c['merv']}:** cost {md_money(c['cost'])}. "
            f"Filter King 1-filter {md_money(c['fk'].get('q1'))} / 2-pack {md_money(c['fk'].get('q2'))} / "
            f"4-pack {md_money(c['fk'].get('q4'))} / 6-pack {md_money(c['fk'].get('q6'))} / "
            f"12-pack {md_money(c['fk'].get('q12'))}. "
            f"Hero 1-filter {md_money(c['hero'].get('q1'))} / 2-pack {md_money(c['hero'].get('q2'))} / "
            f"4-pack {md_money(c['hero'].get('q4'))} / 6-pack {md_money(c['hero'].get('q6'))} / "
            f"12-pack {md_money(c['hero'].get('q12'))}. "
            f"Margin 6-pack {md_money(c['margin'].get('q6'))} ({md_pct(c['marginPct'].get('q6'))}), "
            f"12-pack {md_money(c['margin'].get('q12'))} ({md_pct(c['marginPct'].get('q12'))})."
            f"{extra}"
        )
    a("")
    a("---")
    a("")
    a("### Tightest SKUs (watch list)")
    a("")
    a("Shipping is extra. Anything under ~20% at 12-pack is the first place a cost increase or a freight bill wipes the margin. 16x25x1 MERV 13 and 20x20x1 MERV 8 12-packs are the ones to watch on the Core Four. 24x24x1 MERV 8 12-pack is the thinnest in the whole sheet.")
    a("")
    a("#### 6-pack Hero margin under $1.00")
    a("")
    if thin_q6:
        a(table(FULL_HEADERS, [full_row(c) for c in sorted(thin_q6, key=lambda c: c["margin"]["q6"])]))
    else:
        a("None.")
    a("")
    a("#### 12-pack Hero margin under $1.00")
    a("")
    if thin_q12:
        a(table(FULL_HEADERS, [full_row(c) for c in sorted(thin_q12, key=lambda c: c["margin"]["q12"])]))
    else:
        a("None.")
    a("")
    a("#### All SKUs with 12-pack Hero margin under 20%")
    a("")
    a(table(FULL_HEADERS, [full_row(c) for c in sorted(tight_q12, key=lambda c: c["marginPct"].get("q12", 99))]))
    a("")
    a("#### All SKUs with 6-pack Hero margin under 20%")
    a("")
    a(table(FULL_HEADERS, [full_row(c) for c in sorted(tight_q6, key=lambda c: c["marginPct"].get("q6", 99))]))
    a("")
    a("#### Lowest 12-pack margin $ (15 SKUs)")
    a("")
    worst = sorted(matched, key=lambda c: c["margin"].get("q12", 99))[:15]
    a(table(FULL_HEADERS, [full_row(c) for c in worst]))
    a("")
    a("#### Highest 6-pack margin $ (15 SKUs)")
    a("")
    best = sorted(matched, key=lambda c: -c["margin"].get("q6", -99))[:15]
    a(table(FULL_HEADERS, [full_row(c) for c in best]))
    a("")
    a("---")
    a("")
    a("### Popular residential sizes vs this sheet")
    a("")
    a("Cross-check against the sizes US homes actually order (Core Four plus the next-most-common 1/2/4/5-inch faces from Part 2).")
    a("")
    a("#### On the sheet")
    a("")
    pop_sorted = [c for c in matched if c["size"] in POPULAR]
    pop_sorted.sort(key=lambda c: (POPULAR.index(c["size"]), int(c["merv"])))
    a(table(FULL_HEADERS, [full_row(c) for c in pop_sorted]))
    a("")
    a("#### Popular size × MERV **not** on the wholesale sheet")
    a("")
    if popular_missing:
        for item in popular_missing:
            a(f"- {item}")
    else:
        a("None.")
    a("")
    a("Ask Paul for these if you intend to stock them from Filter King:")
    a("")
    a("- **20x25x4 MERV 8 / 11 / 13** — top-10 residential media-cabinet size (AprilAire / Honeywell / Lennox). Not on the PDF at all.")
    a("- **16x25x4 MERV 8** — MERV 11 and MERV 13 are listed; MERV 8 is not.")
    a("- **14x25x1 MERV 11 and MERV 13** — MERV 8 is on the sheet; 11 and 13 are not.")
    a("- **20x20x4 MERV 8** — MERV 11 and MERV 13 are listed; MERV 8 is not.")
    a("- **16x20x4 MERV 8** — MERV 11 and MERV 13 are listed; MERV 8 is not.")
    a("- **Carbon / odor filters** — quote-only per page 4.")
    a("- MERV 11 and 13 lists are much shorter than MERV 8. Oddball actual-size (`A`) 1-inch SKUs are almost all MERV 8-only.")
    a("")
    a("---")
    a("")
    a("### Duplicate SKUs on the sheet (nominal vs A/N)")
    a("")
    a("Some faces appear twice: a nominal SKU and an actual-size `A` or `N` SKU. The comparison table uses the nominal SKU when it exists.")
    a("")
    same = [d for d in duals if d["kind"] == "same-price-aliases"]
    diff = [d for d in duals if d["kind"] == "different-prices"]
    a(f"#### Same size, same price, extra suffix ({len(same)})")
    a("")
    if same:
        a(
            table(
                ["Size", "MERV", "SKUs", "Cost"],
                [
                    [
                        d["size"],
                        d["merv"],
                        ", ".join(f"{r['sku']} ({r['suffix'] or 'nominal'})" for r in d["rows"]),
                        md_money(d["rows"][0]["cost"]),
                    ]
                    for d in sorted(same, key=lambda d: (d["size"], d["merv"]))
                ],
            )
        )
    else:
        a("None.")
    a("")
    a(f"#### Same size, **different** costs ({len(diff)}) — do not mix these up")
    a("")
    if diff:
        a(
            table(
                ["Size", "MERV", "SKU", "Suffix", "Cost"],
                [
                    [d["size"], d["merv"], r["sku"], r["suffix"] or "nominal", md_money(r["cost"])]
                    for d in sorted(diff, key=lambda d: (d["size"], d["merv"]))
                    for r in d["rows"]
                ],
            )
        )
        a("")
        a("Material gaps in that list (from the sheet):")
        a("")
        a("- **6x14x1** MERV 8: `FK6x14x1` vs `FK6x14x1A` — different costs. The comparison uses the nominal SKU.")
        a("- **20x23x1** MERV 8: `FK20x23x1` vs `FK20x23x1A` — different costs.")
        a("- **6x12x1** MERV 8: `FK6x12x1` vs `FK6x12x1A` — different costs.")
        a("- **22x24x1** MERV 11 and 13: nominal vs `A` have different costs.")
        a("- **18x36x1** MERV 11 and 13: check the table — some duals are same price, some are not.")
    else:
        a("None.")
    a("")
    a("---")
    a("")
    a("### Full match table — every size × MERV on the sheet")
    a("")
    a(f"{len(matched)} rows. Sorted by depth, then size, then MERV. This is the complete comparison.")
    a("")
    a(table(FULL_HEADERS, [full_row(c) for c in matched]))
    a("")
    a("---")
    a("")
    a("### Complete wholesale sheet transcription")
    a("")
    a("Every line item from the PDF, grouped the way the sheet is grouped. Prices are per filter.")
    a("")
    for merv in ("8", "11", "13"):
        rows = by_merv_sheet[merv]
        a(f"#### MERV {merv} ({len(rows)} line items)")
        a("")
        a(
            table(
                ["SKU as printed", "Normalized size", "Suffix", "Cost"],
                [
                    [r["sku"], r["size"], r["suffix"] or "—", md_money(r["cost"])]
                    for r in rows
                ],
            )
        )
        a("")
    a("#### Page 4 of the PDF (no prices)")
    a("")
    a("Filter King LLC  ")
    a("7301 NW 36th Ct, Miami FL 33147  ")
    a("Paul Sellaro  ")
    a("305-300-2431  ")
    a("paul@filterking.com  ")
    a("")
    a("“Our dedicated team will quote any carbon filter size you need in just a minute!”")
    a("")
    a("Page 5 is blank besides the 2025 label.")
    a("")
    a("---")
    a("")
    a("### Pricing engine notes (how Hero gets to the sell price)")
    a("")
    a(f"- `UNDERCUT_RATIO` = {UNDERCUT} (live Filter King sale unit × 0.90)")
    a(f"- `ESTIMATED_UNDERCUT_RATIO` = {EST_UNDERCUT} (modeled ladder × 0.88, extra cushion)")
    a("- Qty breaks used: 1, 2, 4, 6+, 12+ (`q1`, `q2`, `q4`, `q6`, `q12`)")
    a("- Live ladders prefer a scraped row over an estimated row when both exist")
    a("- Files: `shared/pricing/engine.ts`, `shared/pricing/fk-live-prices.json`, `shared/products.ts` (`unitPriceForQty`)")
    a(f"- Catalog-wide live file ({live.get('scraped', 'unknown date')}): {live.get('counts', {}).get('scraped', '?')} scraped ladders + {live.get('counts', {}).get('estimated', '?')} estimated = {live.get('counts', {}).get('total', '?')} size × MERV rows. This wholesale sheet only covers {len(comparisons)} of those.")
    a("- Fallback pack multipliers in `PACK_TIERS` apply only if no live ladder exists.")
    a("")
    a("### What this document does not contain")
    a("")
    a("- Shipping, freight, tax, payment processing, returns, or payment terms from Paul")
    a("- Carbon filter costs (quote-only)")
    a("- Any 2026 updated dealer sheet (this PDF is 2025)")
    a("- Filter King’s subscribe-and-save extra 5% (Hero does not use that ladder)")
    a("")
    a("Working files used to build Part 3: `.firecrawl/fk-wholesale-2025.txt`, `.firecrawl/compare_wholesale.py`, `.firecrawl/fk-wholesale-vs-hero.json`, `.firecrawl/write_wholesale_doc.py`.")
    a("")

    DOC.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {DOC} ({DOC.stat().st_size} bytes, {len(lines)} lines, {len(matched)} matched SKUs)")


if __name__ == "__main__":
    main()
