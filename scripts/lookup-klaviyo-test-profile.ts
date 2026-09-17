import "dotenv/config";
import { klaviyoApi } from "../server/klaviyo.ts";

const EMAIL = "klaviyo.stripe.ok.1789626816887@mailinator.com";

async function main() {
  const filter = encodeURIComponent(`equals(email,"${EMAIL}")`);
  const res = await klaviyoApi<{ data?: Array<{ id?: string }> }>(
    "GET",
    `/api/profiles?filter=${filter}&fields[profile]=email`,
  );
  console.log(
    JSON.stringify(
      {
        email: EMAIL,
        ok: res.ok,
        error: res.error || null,
        found: Boolean(res.data?.data?.length),
        id: res.data?.data?.[0]?.id || null,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
