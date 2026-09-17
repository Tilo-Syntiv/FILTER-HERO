import "dotenv/config";
import { klaviyoApi } from "../server/klaviyo.ts";

const METRICS = {
  "Successfully Paid": "XHuURz",
  "Failed Payment": "RHcdHv",
  "Refunded Payment": "TvC7dY",
  "Issued Invoice": "Vi3YJt",
};

async function main() {
  const out: Record<string, unknown> = {};
  for (const [name, id] of Object.entries(METRICS)) {
    const filter = encodeURIComponent(`equals(metric_id,"${id}")`);
    const res = await klaviyoApi<{ data?: unknown[] }>("GET", `/api/events?filter=${filter}&page[size]=5`);
    out[name] = { ok: res.ok, error: res.error || null, count: res.data?.data?.length ?? 0 };
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
