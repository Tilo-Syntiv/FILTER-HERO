"""Download paginated results from an in-progress Firecrawl crawl job."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
JOB_ID = os.environ.get("FK_CRAWL_JOB_ID", "01a00e4d-75db-71cb-a0f3-dd7766a77872")
API_KEY = os.environ.get("FIRECRAWL_API_KEY")
OUT = ROOT / "fk-full-catalog-crawl.json"
PAGE_SIZE = 100


def api_get(path: str) -> dict:
    if not API_KEY:
        raise SystemExit("Set FIRECRAWL_API_KEY")
    req = urllib.request.Request(
        f"https://api.firecrawl.dev{path}",
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())


def load_existing() -> tuple[dict, list[dict], set[str]]:
    if not OUT.exists():
        return {}, [], set()
    payload = json.loads(OUT.read_text(encoding="utf-8"))
    docs = payload.get("data") or []
    if not isinstance(docs, list):
        docs = []
    seen = set()
    for doc in docs:
        url = doc.get("url") or (doc.get("metadata") or {}).get("sourceURL")
        if url:
            seen.add(url.rstrip("/"))
    meta = {k: payload.get(k) for k in ("success", "status", "completed", "total", "creditsUsed")}
    return meta, docs, seen


def main() -> None:
    meta, docs, seen = load_existing()
    skip = len(docs)
    pages = 0
    while True:
        try:
            payload = api_get(f"/v2/crawl/{JOB_ID}?skip={skip}&limit={PAGE_SIZE}")
        except urllib.error.HTTPError as err:
            print("http", err.code, err.read()[:200], file=sys.stderr)
            break
        batch = payload.get("data") or []
        if not batch:
            break
        for doc in batch:
            url = doc.get("url") or (doc.get("metadata") or {}).get("sourceURL")
            key = url.rstrip("/") if url else None
            if key and key in seen:
                continue
            if key:
                seen.add(key)
            docs.append(doc)
        skip += len(batch)
        pages += 1
        meta = {
            "success": payload.get("success", True),
            "status": payload.get("status"),
            "completed": payload.get("completed"),
            "total": payload.get("total"),
            "creditsUsed": payload.get("creditsUsed"),
            "jobId": JOB_ID,
        }
        OUT.write_text(
            json.dumps({**meta, "data": docs}, ensure_ascii=False),
            encoding="utf-8",
        )
        print(
            f"page={pages} batch={len(batch)} saved={len(docs)} "
            f"status={meta.get('status')} completed={meta.get('completed')}/{meta.get('total')}",
            flush=True,
        )
        if len(batch) < PAGE_SIZE:
            break
        time.sleep(0.25)
    print("done", OUT, "docs", len(docs), flush=True)


if __name__ == "__main__":
    main()
