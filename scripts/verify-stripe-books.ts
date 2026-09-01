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
  const settings = await stripe.tax.settings.retrieve();
  const regs = await stripe.tax.registrations.list({ status: "active", limit: 100 });
  console.log(`Tax Settings status: ${settings.status}`);
  if (settings.status !== "active") {
    const missing = settings.status_details?.pending?.missing_fields?.join(", ") || "unknown";
    console.log(`Head office / settings incomplete (missing: ${missing}).`);
    console.log("Dashboard: https://dashboard.stripe.com/settings/tax");
  }
  console.log(`Active tax registrations: ${regs.data.length}`);
  if (regs.data.length === 0) {
    console.log("No active registrations — Checkout will calculate $0 tax.");
    console.log("Dashboard: https://dashboard.stripe.com/tax/registrations");
    console.log("Do not add a state until a tax advisor says you collect there.");
  }
  console.log("See docs/STRIPE-BOOKS.md");
}

void checkLiveTax();
