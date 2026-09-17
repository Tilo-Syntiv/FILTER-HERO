import "dotenv/config";
import Stripe from "stripe";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY must be set");
  const stripe = new Stripe(key);
  const result = await stripe.rawRequest(
    "POST",
    "/v1/events/evt_1UGX9f790NnFGDLvRkp2LGlb/retry",
    { webhook_endpoint: "we_1UGWbF790NnFGDLvIVtyg0bK" },
  );
  console.log(JSON.stringify({ ok: true, status: result.lastResponse.statusCode ?? null }, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
