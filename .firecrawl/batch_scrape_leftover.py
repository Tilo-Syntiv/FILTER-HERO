"""Scrape leftover FilterKing product URLs. Failed rows are retried. Stops on 402."""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
URLS_FILE = Path(os.environ.get("FK_URLS_FILE", ROOT / "_fk-still-need-scrape.txt"))
OUT = Path(os.environ.get("FK_OUT", ROOT / "fk-batch-leftover.ndjson"))
PROGRESS = Path(os.environ.get("FK_PROGRESS", ROOT / "fk-batch-leftover-progress.json"))
CHUNK = int(os.environ.get("FK_CHUNK", "100"))
MAX_CONCURRENCY = int(os.environ.get("FK_MAX_CONCURRENCY", "5"))
POLL_SEC = float(os.environ.get("FK_POLL_SEC", "8"))


def api_key() -> str:
    key = os.environ.get("FIRECRAWL_API_KEY")
    if not key:
        raise SystemExit("Set FIRECRAWL_API_KEY")
    return key


def norm(url: str) -> str:
    return url.strip().rstrip("/")


def request_json(method: str, path: str, payload: dict | None = None) -> dict:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        f"https://api.firecrawl.dev{path}",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key()}",
            "Content-Type": "application/json",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace")[:800]
        raise RuntimeError(f"HTTP {err.code}: {detail}") from err


def load_ok_urls() -> set[str]:
    done: set[str] = set()
    for path in ROOT.glob("fk-batch*.ndjson"):
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if row.get("ok") and row.get("url") and (row.get("markdown") or ""):
                done.add(norm(row["url"]))
    return done


def save_progress(stats: dict) -> None:
    PROGRESS.write_text(json.dumps(stats, indent=2), encoding="utf-8")


def append_docs(docs: list[dict], wanted: set[str], stats: dict) -> None:
    with OUT.open("a", encoding="utf-8") as fh:
        for doc in docs:
            if not isinstance(doc, dict):
                continue
            url = norm(
                doc.get("url")
                or (doc.get("metadata") or {}).get("sourceURL")
                or ""
            )
            if url and wanted and url not in wanted:
                # still keep it if it is a leftover page
                pass
            md = doc.get("markdown") or ""
            ok = bool(md)
            fh.write(
                json.dumps(
                    {
                        "ok": ok,
                        "url": url,
                        "markdown": md,
                        "metadata": doc.get("metadata") or {},
                        "error": None if ok else "empty markdown",
                    },
                    ensure_ascii=False,
                )
                + "\n"
            )
            if ok:
                stats["scraped_this_run"] += 1
            else:
                stats["failed_this_run"] += 1


def poll_batch(job_id: str) -> dict:
    skip = 0
    collected: list[dict] = []
    while True:
        payload = request_json("GET", f"/v2/batch/scrape/{job_id}?skip={skip}&limit=100")
        data = payload.get("data") or []
        if isinstance(data, list) and data:
            collected.extend(data)
            skip += len(data)
        status = payload.get("status")
        completed = payload.get("completed")
        total = payload.get("total")
        print(
            f"  job {job_id[:8]} status={status} completed={completed}/{total} got={len(collected)}",
            flush=True,
        )
        if status in {"completed", "failed"}:
            payload["_collected"] = collected
            return payload
        time.sleep(POLL_SEC)


def main() -> None:
    wanted = [norm(u) for u in URLS_FILE.read_text(encoding="utf-8").splitlines() if u.strip()]
    already = load_ok_urls()
    pending = [u for u in wanted if u not in already]
    stats = {
        "total_urls": len(wanted),
        "already_done": len(wanted) - len(pending),
        "pending": len(pending),
        "scraped_this_run": 0,
        "failed_this_run": 0,
        "chunks_done": 0,
    }
    save_progress(stats)
    print(
        f"leftover={len(wanted)} already_ok={stats['already_done']} pending={len(pending)} chunk={CHUNK}",
        flush=True,
    )
    if not pending:
        print("nothing to scrape")
        return

    for i in range(0, len(pending), CHUNK):
        chunk = pending[i : i + CHUNK]
        print(f"submitting chunk {i // CHUNK + 1} size={len(chunk)}", flush=True)
        try:
            started = request_json(
                "POST",
                "/v2/batch/scrape",
                {
                    "urls": chunk,
                    "formats": ["markdown"],
                    "onlyMainContent": True,
                    "waitFor": 1500,
                    "maxConcurrency": MAX_CONCURRENCY,
                    "ignoreInvalidURLs": True,
                },
            )
        except RuntimeError as err:
            print(err, flush=True)
            if "402" in str(err):
                print("out of credits, stopping", flush=True)
            save_progress(stats)
            return
        job_id = started.get("id")
        if not job_id:
            print("no job id", started, flush=True)
            save_progress(stats)
            return
        result = poll_batch(job_id)
        docs = result.get("_collected") or result.get("data") or []
        append_docs(docs, set(chunk), stats)
        got_urls = {
            norm(d.get("url") or (d.get("metadata") or {}).get("sourceURL") or "")
            for d in docs
            if isinstance(d, dict)
        }
        missing = [u for u in chunk if u not in got_urls]
        if missing:
            with OUT.open("a", encoding="utf-8") as fh:
                for url in missing:
                    fh.write(
                        json.dumps(
                            {
                                "ok": False,
                                "url": url,
                                "markdown": "",
                                "metadata": {},
                                "error": f"missing from job {job_id} status={result.get('status')}",
                            },
                            ensure_ascii=False,
                        )
                        + "\n"
                    )
                    stats["failed_this_run"] += 1
        stats["chunks_done"] += 1
        stats["pending"] = max(0, len(pending) - (i + len(chunk)))
        stats["already_done"] = (len(wanted) - len(pending)) + stats["scraped_this_run"]
        save_progress(stats)
        print(
            f"chunk done ok={stats['scraped_this_run']} fail={stats['failed_this_run']} pending={stats['pending']}",
            flush=True,
        )
        if result.get("status") == "failed":
            print("batch job failed, stopping", flush=True)
            break

    save_progress(stats)
    print("finished", stats)


if __name__ == "__main__":
    main()
