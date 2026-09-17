import "dotenv/config";
import { getProductById, sellableSheetProducts } from "../shared/products.ts";
import { getKlaviyoAccount, syncPlacedOrder } from "../server/klaviyo.ts";
import { klaviyoApi } from "../server/klaviyo.ts";
import type { StoredOrder } from "../server/stripe.ts";

const EMAIL = "klaviyo-stripe-check@filterhero.net";

async function main() {
  const account = await getKlaviyoAccount();
  if (!account.ok) throw new Error(account.error || "Klaviyo account failed");
  const product = sellableSheetProducts()[0] || getProductById(2105);
  if (!product) throw new Error("No sellable product for Placed Order test");
  const sessionId = `cs_test_klaviyo_connect_${Date.now()}`;
  const order: StoredOrder = {
    id: `ord_klaviyo_connect_${Date.now()}`,
    sessionId,
    amountSubtotal: Math.round(product.price * 6 * 100),
    amountTax: 0,
    amountTotal: Math.round(product.price * 6 * 100),
    currency: "usd",
    customerId: "cus_VH59xSCDf0JlYU",
    invoiceId: "in_1UGWz6790NnFGDLvw4ntGV8A",
    paymentIntentId: null,
    customerEmail: EMAIL,
    shipping: null,
    phone: null,
    items: JSON.stringify([{ productId: product.id, quantity: 6 }]),
    taxStatus: "recorded",
    paidAt: new Date().toISOString(),
  };
  await syncPlacedOrder(order);
  const filter = encodeURIComponent(`equals(email,"${EMAIL}")`);
  const profile = await klaviyoApi<{ data?: Array<{ id?: string }> }>(
    "GET",
    `/api/profiles?filter=${filter}&fields[profile]=email`,
  );
  console.log(
    JSON.stringify(
      {
        accountId: account.accountId,
        metric: "Placed Order",
        email: EMAIL,
        sessionId,
        productId: product.id,
        profileFound: Boolean(profile.data?.data?.length),
        profileId: profile.data?.data?.[0]?.id || null,
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
