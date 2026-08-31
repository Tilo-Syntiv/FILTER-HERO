import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { getProductById, unitPriceForQty } from "../shared/products";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_PATH = path.resolve(__dirname, "data", "orders.json");

function ensureOrdersFile() {
  const dir = path.dirname(ORDERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ORDERS_PATH)) fs.writeFileSync(ORDERS_PATH, "[]", "utf-8");
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) return null;
  return new Stripe(key);
}

export type CheckoutItem = { productId: number; quantity: number };

export async function createCheckoutSession(items: CheckoutItem[], clientUrl: string) {
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) throw new Error(`Unknown product: ${item.productId}`);
    if (!product.inStock) throw new Error(`Out of stock: ${product.size}`);
    if (item.quantity < 1 || item.quantity > 50) {
      throw new Error(`Invalid quantity for product ${item.productId}`);
    }

    const unit = unitPriceForQty(product.price, item.quantity, product);
    const label = product.isCarbon
      ? `${product.name} (Carbon) — ${product.size}`
      : `${product.name} — ${product.size} MERV ${product.merv}`;

    line_items.push({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(unit * 100),
        product_data: {
          name: label,
          description: `HVAC pleated filter`,
        },
      },
    });
  }

  if (line_items.length === 0) throw new Error("Cart is empty");

  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/checkout/cancel`,
    metadata: {
      items: JSON.stringify(items),
    },
  });

  return session;
}

export async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
): Promise<{ received: true }> {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret || secret.includes("...")) {
    throw new Error("Stripe webhook is not configured");
  }
  if (!signature) throw new Error("Missing stripe-signature header");

  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    ensureOrdersFile();
    const orders = JSON.parse(fs.readFileSync(ORDERS_PATH, "utf-8")) as unknown[];
    orders.push({
      id: nanoid(),
      sessionId: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email ?? session.customer_email,
      items: session.metadata?.items ?? "[]",
      paidAt: new Date().toISOString(),
    });
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
  }

  return { received: true };
}
