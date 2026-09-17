import "dotenv/config";
import { klaviyoApi } from "../server/klaviyo.ts";

const METRICS = {
  "Successfully Paid": "XHuURz",
  "Issued Invoice": "Vi3YJt",
};

async function counts() {
  const out: Record<string, number> = {};
  for (const [name, id] of Object.entries(METRICS)) {
    const filter = encodeURIComponent(`equals(metric_id,"${id}")`);
    const res = await klaviyoApi<{ data?: unknown[] }>("GET", `/api/events?filter=${filter}&page[size]=5`);
    out[name] = res.data?.data?.length ?? 0;
  }
  return out;
}

async function main() {
  const attempts = Number(process.argv[2] || 20);
  const delayMs = Number(process.argv[3] || 30000);
  for (let i = 1; i <= attempts; i += 1) {
    const found = await counts();
    console.log(JSON.stringify({ attempt: i, ...found }));
    if (found["Successfully Paid"] > 0 || found["Issued Invoice"] > 0) {
      process.exit(0);
    }
    if (i < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  process.exit(2);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
