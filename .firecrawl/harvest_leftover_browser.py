"""Harvest leftover Filter King hubs via one Firecrawl browser session.

HTML product pages are Cloudflare-blocked from this machine. A Firecrawl
browser that already loaded filterking.com can same-origin fetch hub HTML
(1 credit per scrape) and each hub page embeds every MERV price ladder.
"""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
URLS_FILE = Path(os.environ.get("FK_URLS_FILE", ROOT / "_fk-still-need-scrape.txt"))
OUT = ROOT / "fk-direct-leftover.json"
PROGRESS = ROOT / "fk-direct-leftover-progress.json"
CHUNK = int(os.environ.get("FK_HUB_CHUNK", "250"))
MAX_CHUNKS = int(os.environ.get("FK_MAX_CHUNKS", "0") or "0")
CONCURRENCY = int(os.environ.get("FK_HUB_CONCURRENCY", "6"))
TIMEOUT_MS = int(os.environ.get("FK_TIMEOUT_MS", "240000"))
SEED_URL = os.environ.get(
    "FK_SEED_URL", "https://filterking.com/air-filter-sizes/20x25x1"
)

TYPE_TO_PATH = {
    "merv-8": "merv-8",
    "merv-11": "merv-11",
    "merv-13": "merv-13",
    "merv-8-carbon": "odor",
}


def api_key() -> str:
    key = os.environ.get("FIRECRAWL_API_KEY")
    if not key:
        raise SystemExit("Set FIRECRAWL_API_KEY")
    return key


def leftover_hubs() -> list[str]:
    hubs: list[str] = []
    seen: set[str] = set()
    for line in URLS_FILE.read_text(encoding="utf-8").splitlines():
        url = line.strip().rstrip("/")
        if "/air-filter-sizes/" not in url:
            continue
        slug = url.split("/air-filter-sizes/", 1)[1].split("/", 1)[0]
        if slug and slug not in seen:
            seen.add(slug)
            hubs.append(slug)
    return hubs


def load_progress() -> dict:
    if not PROGRESS.exists():
        return {"done_hubs": [], "failed_hubs": [], "credits": 0, "chunks": 0}
    return json.loads(PROGRESS.read_text(encoding="utf-8"))


def load_products() -> list[dict]:
    if not OUT.exists():
        return []
    payload = json.loads(OUT.read_text(encoding="utf-8"))
    return list(payload.get("products") or [])


def save_products(products: list[dict], extra: dict) -> None:
    by_key: dict[str, dict] = {}
    for row in products:
        key = f"{row.get('size')}|{row.get('merv')}"
        by_key[key] = row
    rows = list(by_key.values())
    OUT.write_text(
        json.dumps(
            {
                "count": len(rows),
                "source": "filterking-browser-same-origin",
                "notes": (
                    "Unit prices from hub HTML product JSON. One hub fetch "
                    "includes MERV 8/11/13/carbon ladders. No cost fields stored."
                ),
                **extra,
                "products": rows,
            },
            indent=2,
        ),
        encoding="utf-8",
    )


def row_from_product(prod: dict) -> dict | None:
    prices = prod.get("prices") or []
    if len(prices) < 7:
        return None
    type_slug = str(prod.get("type_slug") or "")
    path_merv = TYPE_TO_PATH.get(type_slug)
    if not path_merv:
        return None
    size = str(prod.get("size") or "")
    try:
        q1, q2, q4, q6, q12 = (
            float(prices[0]),
            float(prices[1]),
            float(prices[3]),
            float(prices[5]),
            float(prices[6]),
        )
    except (TypeError, ValueError, IndexError):
        return None
    return {
        "url": f"https://filterking.com/air-filter-sizes/{size}/{path_merv}",
        "size": size,
        "merv": "carbon" if path_merv == "odor" else path_merv,
        "sku": prod.get("item_id") or prod.get("model"),
        "q1": q1,
        "q2": q2,
        "q4": q4,
        "q6": q6,
        "q12": q12,
        "estimated": False,
    }


BROWSER_JS = r"""
(async () => {
  const hubs = HUBS;
  const concurrency = CONCURRENCY;
  function extractProducts(html) {
    const out = [];
    let idx = 0;
    while ((idx = html.indexOf('"sale_tiers"', idx)) !== -1) {
      let start = idx;
      let depth = 0;
      for (let i = idx; i >= 0 && i > idx - 60000; i--) {
        if (html[i] === '}') depth++;
        else if (html[i] === '{') {
          if (depth === 0) { start = i; break; }
          depth--;
        }
      }
      depth = 0;
      let end = start;
      for (let i = start; i < html.length && i < start + 80000; i++) {
        if (html[i] === '{') depth++;
        else if (html[i] === '}') {
          depth--;
          if (depth === 0) { end = i + 1; break; }
        }
      }
      try {
        const obj = JSON.parse(html.slice(start, end));
        if (obj && Array.isArray(obj.prices) && obj.prices.length >= 7 && obj.size && obj.type_slug) {
          out.push({
            id: obj.id,
            item_id: obj.item_id,
            size: obj.size,
            type_slug: obj.type_slug,
            model: obj.model,
            prices: obj.prices
          });
        }
      } catch (err) {}
      idx += 12;
    }
    return out;
  }
  async function fetchHub(slug) {
    const path = '/air-filter-sizes/' + slug;
    try {
      const resp = await fetch(path, { credentials: 'same-origin' });
      const html = await resp.text();
      if (html.includes('Just a moment')) {
        return { slug, ok: false, error: 'challenge', status: resp.status };
      }
      const products = extractProducts(html);
      return { slug, ok: products.length > 0, status: resp.status, products };
    } catch (err) {
      return { slug, ok: false, error: String(err) };
    }
  }
  const results = [];
  let i = 0;
  async function worker() {
    while (i < hubs.length) {
      const slug = hubs[i++];
      results.push(await fetchHub(slug));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, hubs.length) }, worker));
  return JSON.stringify({ n: results.length, results });
})()
"""


def scrape_chunk(hubs: list[str]) -> dict:
    script = (
        BROWSER_JS
        .replace("HUBS", json.dumps(hubs))
        .replace("CONCURRENCY", str(CONCURRENCY))
    )
    payload = {
        "url": SEED_URL,
        "formats": ["markdown"],
        "onlyMainContent": True,
        "timeout": TIMEOUT_MS,
        "actions": [
            {"type": "wait", "milliseconds": 2000},
            {"type": "executeJavascript", "script": script},
        ],
    }
    req = urllib.request.Request(
        "https://api.firecrawl.dev/v2/scrape",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {api_key()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_MS / 1000 + 30) as resp:
            doc = json.loads(resp.read())
    except urllib.error.HTTPError as err:
        detail = err.read().decode("utf-8", "replace")[:800]
        raise RuntimeError(f"HTTP {err.code}: {detail}") from err
    data = doc.get("data") or doc
    credits = (data.get("metadata") or {}).get("creditsUsed")
    returns = ((data.get("actions") or {}).get("javascriptReturns") or [])
    if not returns:
        raise RuntimeError("no javascriptReturns")
    value = returns[0].get("value")
    if isinstance(value, str):
        parsed = json.loads(value)
    elif isinstance(value, dict):
        parsed = value
    else:
        raise RuntimeError(f"unexpected js return {type(value)}")
    parsed["creditsUsed"] = credits
    return parsed


def main() -> None:
    hubs = leftover_hubs()
    progress = load_progress()
    done = set(progress.get("done_hubs") or [])
    failed = set(progress.get("failed_hubs") or [])
    products = load_products()
    pending = [h for h in hubs if h not in done]
    print(
        f"hubs={len(hubs)} done={len(done)} pending={len(pending)} "
        f"saved_products={len(products)} chunk={CHUNK}",
        flush=True,
    )
    chunks_run = 0
    while pending:
        if MAX_CHUNKS and chunks_run >= MAX_CHUNKS:
            print(f"stop after {MAX_CHUNKS} chunk(s)", flush=True)
            break
        chunks_run += 1
        chunk = pending[:CHUNK]
        pending = pending[CHUNK:]
        print(f"scrape {len(chunk)} hubs remaining_after={len(pending)}", flush=True)
        try:
            result = scrape_chunk(chunk)
        except RuntimeError as exc:
            print("chunk failed", exc, flush=True)
            if "402" in str(exc):
                break
            time.sleep(3)
            pending = chunk + pending
            continue
        progress["credits"] = int(progress.get("credits") or 0) + int(result.get("creditsUsed") or 1)
        progress["chunks"] = int(progress.get("chunks") or 0) + 1
        ok_n = fail_n = 0
        for row in result.get("results") or []:
            slug = row.get("slug")
            if row.get("ok"):
                done.add(slug)
                failed.discard(slug)
                ok_n += 1
                for prod in row.get("products") or []:
                    live = row_from_product(prod)
                    if live:
                        products.append(live)
            else:
                failed.add(slug)
                fail_n += 1
        progress["done_hubs"] = sorted(done)
        progress["failed_hubs"] = sorted(failed)
        PROGRESS.write_text(json.dumps(progress, indent=2), encoding="utf-8")
        save_products(products, {"creditsUsed": progress["credits"], "hubsDone": len(done)})
        print(
            f"chunk ok={ok_n} fail={fail_n} products={len(products)} "
            f"credits={progress['credits']}",
            flush=True,
        )
        time.sleep(0.5)
    print(
        f"done products={len(products)} hubs={len(done)} failed={len(failed)} "
        f"credits={progress.get('credits')}",
        flush=True,
    )


if __name__ == "__main__":
    main()
