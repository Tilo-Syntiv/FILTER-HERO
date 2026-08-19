"""Batch-scrape remaining FilterKing product URLs via Firecrawl /v2/scrape."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from pathlib import Path

ROOT = Path(__file__).parent
URLS_FILE = Path(os.environ.get("FK_URLS_FILE", ROOT / "fk-all-product-urls.txt"))
CRAWL_FILE = ROOT / "fk-full-catalog-crawl.json"
OUT = Path(os.environ.get("FK_OUT", ROOT / "fk-batch-results.ndjson"))
PROGRESS = Path(os.environ.get("FK_PROGRESS", ROOT / "fk-batch-progress.json"))
SCRAPE_BODY = {
    "formats": ["markdown"],
    "onlyMainContent": True,
    "waitFor": 1500,
}
WORKERS = int(os.environ.get("FK_BATCH_WORKERS", "1"))
BATCH_LIMIT = int(os.environ.get("FK_BATCH_LIMIT", "0"))  # 0 = no cap this run
MAX_RETRIES = int(os.environ.get("FK_BATCH_RETRIES", "5"))


def api_key() -> str:
    key = os.environ.get("FIRECRAWL_API_KEY")
    if not key:
        raise SystemExit("Set FIRECRAWL_API_KEY")
    return key


def norm(url: str) -> str:
    return url.strip().rstrip("/")


def urls_from_huge_json(path: Path) -> set[str]:
    """Pull FilterKing URLs out of a crawl dump without json.loads()."""
    found: set[str] = set()
    leftover = ""
    pattern = re.compile(r"https?://filterking\.com/[^\"\\\s]{1,300}")
    with path.open("r", encoding="utf-8", errors="ignore") as fh:
        while True:
            chunk = fh.read(4 * 1024 * 1024)
            if not chunk:
                break
            text = leftover + chunk
            leftover = text[-400:]
            for match in pattern.findall(text):
                found.add(norm(match))
    return found


def load_done() -> set[str]:
    done: set[str] = set()
    if CRAWL_FILE.exists():
        try:
            if CRAWL_FILE.stat().st_size > 80 * 1024 * 1024:
                done |= urls_from_huge_json(CRAWL_FILE)
            else:
                payload = json.loads(CRAWL_FILE.read_text(encoding="utf-8"))
                for doc in payload.get("data") or []:
                    if not isinstance(doc, dict):
                        continue
                    url = doc.get("url") or (doc.get("metadata") or {}).get("sourceURL")
                    if url:
                        done.add(norm(url))
        except (json.JSONDecodeError, OSError):
            pass
    for ndjson in ROOT.glob("fk-batch*.ndjson"):
        for line in ndjson.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            url = row.get("url")
            if url:
                done.add(norm(url))
    return done


def scrape_one(url: str) -> dict:
    body = json.dumps({"url": url, **SCRAPE_BODY}).encode()
    last_error = None
    for attempt in range(MAX_RETRIES):
        req = urllib.request.Request(
            "https://api.firecrawl.dev/v2/scrape",
            data=body,
            headers={
                "Authorization": f"Bearer {api_key()}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                payload = json.loads(resp.read())
            data = payload.get("data") or {}
            md = data.get("markdown") or ""
            return {
                "ok": payload.get("success", False) and bool(md),
                "url": url,
                "markdown": md,
                "metadata": data.get("metadata") or {},
                "error": None,
            }
        except urllib.error.HTTPError as err:
            detail = err.read().decode("utf-8", "replace")[:500]
            last_error = f"HTTP {err.code}: {detail}"
            if err.code in (402, 429) and attempt + 1 < MAX_RETRIES:
                time.sleep(min(30, 2 ** attempt))
                continue
            return {"ok": False, "url": url, "markdown": "", "metadata": {}, "error": last_error}
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            if attempt + 1 < MAX_RETRIES:
                time.sleep(min(30, 2 ** attempt))
                continue
            return {"ok": False, "url": url, "markdown": "", "metadata": {}, "error": last_error}
    return {"ok": False, "url": url, "markdown": "", "metadata": {}, "error": last_error}


def save_progress(stats: dict) -> None:
    PROGRESS.write_text(json.dumps(stats, indent=2), encoding="utf-8")


def main() -> None:
    all_urls = [norm(u) for u in URLS_FILE.read_text(encoding="utf-8").splitlines() if u.strip()]
    done = load_done()
    pending = [u for u in all_urls if u not in done]
    if BATCH_LIMIT > 0:
        pending = pending[:BATCH_LIMIT]

    stats = {
        "total_urls": len(all_urls),
        "already_done": len(done),
        "pending": len(pending),
        "scraped_this_run": 0,
        "failed_this_run": 0,
    }
    save_progress(stats)
    print(
        f"catalog={len(all_urls)} done={len(done)} pending={len(pending)} workers={WORKERS}",
        flush=True,
    )
    if not pending:
        print("nothing to scrape")
        return

    with OUT.open("a", encoding="utf-8") as fh, ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(scrape_one, url): url for url in pending}
        for i, future in enumerate(as_completed(futures), start=1):
            row = future.result()
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
            fh.flush()
            if row.get("ok"):
                stats["scraped_this_run"] += 1
            else:
                stats["failed_this_run"] += 1
            if i % 25 == 0 or i == len(pending):
                stats["already_done"] = len(done) + stats["scraped_this_run"]
                stats["pending"] = len(pending) - i
                save_progress(stats)
                print(
                    f"{i}/{len(pending)} ok={stats['scraped_this_run']} fail={stats['failed_this_run']} last={row.get('url')}",
                    flush=True,
                )
            if row.get("error") and "402" in str(row.get("error")):
                print("out of credits, stopping", flush=True)
                pool.shutdown(wait=False, cancel_futures=True)
                break
            time.sleep(0.35)

    save_progress(stats)
    print("finished", stats)


if __name__ == "__main__":
    main()
