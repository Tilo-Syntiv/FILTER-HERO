import "dotenv/config";
import Stripe from "stripe";
import { TANGIBLE_GOODS_TAX_CODE, productTaxCode } from "../shared/stripe-tax.ts";
import { compactItemsMeta, orderFromCheckoutSession } from "../server/stripe.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

assert(productTaxCode() === TANGIBLE_GOODS_TAX_CODE, "default tax code must be tangible goods");
assert(TANGIBLE_GOODS_TAX_CODE === "txcd_99999999", "canonical Stripe General - Tangible Goods");

const compact = compactItemsMeta(
  Array.from({ length: 40 }, (_, i) => ({ productId: i + 1, quantity: 1 })),
);
assert(compact.length <= 490, `items metadata must fit Stripe's 500-char cap, got ${compact.length}`);

const session = {
  id: "cs_test_verify",
  amount_subtotal: 1999,
  amount_total: 2159,
  currency: "usd",
  customer: "cus_test",
  invoice: "in_test",
  payment_intent: "pi_test",
  customer_email: "buyer@example.com",
  customer_details: { email: "buyer@example.com", phone: "+15555550100" },
  shipping_details: null,
  metadata: { items: '[{"productId":1,"quantity":6}]' },
  total_details: { amount_tax: 160, amount_discount: 0, amount_shipping: 0 },
} as unknown as Stripe.Checkout.Session;

const order = orderFromCheckoutSession(session);
assert(order.sessionId === "cs_test_verify", "session id");
assert(order.amountTax === 160, "tax cents");
assert(order.customerId === "cus_test", "customer for QBO match");
assert(order.invoiceId === "in_test", "invoice for connector");
assert(order.paymentIntentId === "pi_test", "payment intent");

console.log("Stripe books mapping checks passed.");

async function checkLiveTax() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) {
    console.log("Skip live Tax Settings: STRIPE_SECRET_KEY unset.");
    return;
  }

  const stripe = new Stripe(key);
  console.log("Checkout does not enable Stripe Tax (no calculation fee).");
  console.log("Sales tax is QuickBooks Online Automated Sales Tax + the Stripe Connector.");
  console.log("Dashboard: turn off Tax → Integrations automatic collection if it is still on.");
  const hooks = await stripe.webhookEndpoints.list({ limit: 20 });
  const fulfillment = hooks.data.find((hook) => hook.url.includes("/api/stripe/webhook"));
  if (fulfillment && fulfillment.status === "enabled") {
    console.log(`Fulfillment webhook: ${fulfillment.url} (${fulfillment.status})`);
  } else {
    console.log("No enabled Dashboard webhook to /api/stripe/webhook.");
    console.log("Paid Checkout will not write orders or sync Klaviyo / CRM / accounts.");
    console.log("Run: pnpm setup:stripe-webhook");
  }
  console.log("See docs/STRIPE-BOOKS.md");
}

void checkLiveTax();
