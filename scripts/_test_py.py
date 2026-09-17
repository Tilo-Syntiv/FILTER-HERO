"""Smoke-test Filter Hero Python scripts. No paid APIs. No live-price rewrite.

Run: py -3.12 scripts/_test_py.py
"""
from __future__ import annotations

import importlib.util
import io
import json
import py_compile
import subprocess
import sys
import traceback
from contextlib import redirect_stdout
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PY = sys.executable
SKIP_PARTS = {"venv", "node_modules", ".venv", "__pycache__"}


def collect_py() -> list[Path]:
    files: list[Path] = []
    seen: set[str] = set()
    extra = Path(r"E:\FILTER HEROE")
    for root in (REPO, extra):
        if not root.exists():
            continue
        for p in root.rglob("*.py"):
            if any(x in p.parts for x in SKIP_PARTS):
                continue
            if p.name in {"_test_py.py", "_py_healthcheck.py"}:
                continue
            key = str(p.resolve()).lower()
            if key in seen:
                continue
            seen.add(key)
            files.append(p)
    return sorted(files)


def load(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


def run_script(path: Path, cwd: Path | None = None) -> str:
    proc = subprocess.run(
        [PY, str(path)],
        cwd=str(cwd or REPO),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode != 0:
        raise SystemExit(
            f"{path.name} failed ({proc.returncode})\n{proc.stdout}\n{proc.stderr}"
        )
    return proc.stdout


def main() -> int:
    files = collect_py()
    print(f"python {sys.version.split()[0]} files={len(files)}")
    failed = 0

    print("\n=== compile ===")
    for p in files:
        try:
            py_compile.compile(str(p), doraise=True)
        except Exception as e:
            failed += 1
            print(f"FAIL {p}: {e}")
    if failed:
        return 1
    print("ok", len(files))

    print("\n=== import ===")
    for p in files:
        name = f"fh_test_{p.stem}"
        try:
            load(p, name)
            print(f"OK   {p.relative_to(p.anchor) if False else p.name}")
        except Exception:
            failed += 1
            print(f"FAIL {p.name}: {traceback.format_exc().splitlines()[-1]}")
        finally:
            sys.modules.pop(name, None)
    if failed:
        return 1

    print("\n=== pack shots ===")
    out = run_script(REPO / "scripts" / "label-pack-shots.py")
    print(out.strip())
    src = REPO / "client" / "public" / "products"
    for name in (
        "merv-8-packshot.png",
        "merv-11-packshot.png",
        "merv-13-packshot.png",
        "merv-carbon-layers.png",
        "merv-carbon-thin-rectangle-6pack.png",
    ):
        path = src / name
        if not path.exists() or path.stat().st_size < 1000:
            raise SystemExit(f"missing/empty pack shot {path}")
    print("official pack shots present")

    print("\n=== price audit ===")
    audit = run_script(REPO / ".firecrawl" / "_audit_remaining.py")
    if "catalog missing ANY local scrape (would cost a credit) 0" not in audit:
        raise SystemExit("price audit: catalog still missing scrapes\n" + audit[-1500:])
    if "catalog missing live price 0" not in audit:
        raise SystemExit("price audit: catalog missing live price\n" + audit[-1500:])
    print("catalog missing scrape 0, missing live price 0")

    print("\n=== harvest (no write) ===")
    sys.path.insert(0, str(REPO / ".firecrawl"))
    build = load(REPO / ".firecrawl" / "build_prices_from_local.py", "fh_build_prices")
    harvested = build.harvest_local()
    by_key = build.merge_rows(harvested)
    scraped = sum(1 for r in by_key.values() if not r.get("estimated"))
    print(f"harvested_raw={len(harvested)} unique_scraped={scraped}")
    if scraped < 39000:
        raise SystemExit(f"harvest too small: {scraped}")
    live = json.loads((REPO / "shared" / "pricing" / "fk-live-prices.json").read_text(encoding="utf-8"))
    if live["counts"]["scraped"] != scraped and abs(live["counts"]["scraped"] - scraped) > 50:
        print("warn live-file scraped count drifted", live["counts"]["scraped"], "vs", scraped)

    print("\n=== wholesale compare ===")
    print(run_script(REPO / ".firecrawl" / "compare_wholesale.py").strip()[:800])

    print("\n=== cwd-independent firecrawl ===")
    other = REPO / "tmp"
    for name in ("count_gaps.py", "count_sitemap_urls.py", "parse_qty_blocks.py"):
        text = run_script(REPO / ".firecrawl" / name, cwd=other)
        print(name, "ok", text.strip().splitlines()[0])

    print("\n=== sitemap URL collect (no write) ===")
    urls_mod = load(REPO / ".firecrawl" / "write_all_product_urls.py", "fh_urls")
    urls = urls_mod.collect_urls()
    listed = (REPO / ".firecrawl" / "fk-all-product-urls.txt").read_text(encoding="utf-8").strip().splitlines()
    print("sitemap unique", len(urls), "listed", len(listed))
    if len(urls) < 39000:
        raise SystemExit(f"sitemap URL collect too small: {len(urls)}")

    print("\n=== lockup sources ===")
    from PIL import Image as PILImage

    lock = load(REPO / "scripts" / "compose-brand-lockup.py", "fh_lockup")
    if not lock.HERO_SRC.exists() or not lock.KING_SRC.exists():
        raise SystemExit("brand lockup sources missing")
    hero = lock.hero_on_navy(lock.trim(lock.knock_white(PILImage.open(lock.HERO_SRC))))
    if hero.mode != "RGBA" or hero.width < 10:
        raise SystemExit("lockup hero cutout empty")
    print("hero", hero.size, "king", lock.KING_SRC.name)

    print("\n=== hero banner source ===")
    banner = load(REPO / "scripts" / "process-hero-banner.py", "fh_banner")
    if not banner.SRC.exists():
        raise SystemExit(f"missing {banner.SRC}")
    print("RESET.png", banner.SRC.stat().st_size)

    print("\n=== write_wholesale_doc import ===")
    buf = io.StringIO()
    with redirect_stdout(buf):
        doc_mod = load(REPO / ".firecrawl" / "write_wholesale_doc.py", "fh_wholesale_doc")
    if not hasattr(doc_mod, "main"):
        raise SystemExit("write_wholesale_doc has no main")
    print("import ok")

    print("\n=== md_to_docx import ===")
    docx_mod = load(REPO / ".firecrawl" / "md_to_docx.py", "fh_docx")
    if not (REPO / "docs" / "FILTER-KING-PRICING-BRIEF.md").exists():
        raise SystemExit("pricing brief markdown missing")
    print("import ok", "main" if hasattr(docx_mod, "main") else "no-main")

    print("\n=== railway probe usage ===")
    proc = subprocess.run(
        [PY, str(REPO / "tmp" / "railway-probe.py")],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if proc.returncode == 0 or "usage:" not in (proc.stderr + proc.stdout):
        raise SystemExit("railway-probe should exit with usage without argv")
    print("usage guard ok")

    print("\nALL PYTHON CHECKS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
