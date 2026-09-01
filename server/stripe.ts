import fs from "node:fs";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { getProductById, unitPriceForQty } from "../shared/products";
import { productTaxCode } from "../shared/stripe-tax";
import { dataFile } from "./data-store";

const ORDERS_PATH = dataFile("orders.json");
const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;
const META_MAX = 490;

function ensureOrdersFile() {
  if (!fs.existsSync(ORDERS_PATH)) fs.writeFileSync(ORDERS_PATH, "[]", "utf-8");
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) return null;
  return new Stripe(key);
}

export type CheckoutItem = { productId: number; quantity: number };

export type StoredOrder = {
  id: string;
  sessionId: string;
  amountSubtotal: number | null;
  amountTax: number | null;
  amountTotal: number | null;
  currency: string | null;
  customerId: string | null;
  invoiceId: string | null;
  paymentIntentId: string | null;
  customerEmail: string | null;
  shipping: Stripe.Checkout.Session.ShippingDetails | null;
  phone: string | null;
  items: string;
  taxStatus: string | null;
  paidAt: string;
};

export function compactItemsMeta(items: CheckoutItem[]): string {
  const raw = JSON.stringify(items);
  if (raw.length <= META_MAX) return raw;
  return JSON.stringify(items.slice(0, 8));
}

export function orderFromCheckoutSession(
  session: Stripe.Checkout.Session,
): Omit<StoredOrder, "id"> {
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const invoiceId =
    typeof session.invoice === "string"
      ? session.invoice
      : session.invoice?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  return {
    sessionId: session.id,
    amountSubtotal: session.amount_subtotal ?? null,
    amountTax: session.total_details?.amount_tax ?? null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    customerId,
    invoiceId,
    paymentIntentId,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
    shipping: session.shipping_details ?? null,
    phone: session.customer_details?.phone ?? null,
    items: session.metadata?.items ?? "[]",
    taxStatus: session.total_details?.amount_tax != null ? "recorded" : null,
    paidAt: new Date().toISOString(),
  };
}

async function logTaxReadiness(stripe: Stripe) {
  try {
    const settings = await stripe.tax.settings.retrieve();
    const regs = await stripe.tax.registrations.list({ status: "active", limit: 1 });
    const collecting = settings.status === "active" && regs.data.length > 0;
    if (collecting) {
      console.info("[stripe tax] head office set; active registration present");
      return;
    }
    const missing = settings.status_details?.pending?.missing_fields?.join(", ") || "none";
    console.warn(
      `[stripe tax] automatic_tax is on, but Stripe will collect $0 until Tax Settings are active and a registration exists (status=${settings.status}, missing=${missing}, activeRegs=${regs.data.length}). See docs/STRIPE-BOOKS.md`,
    );
  } catch (err) {
    console.warn("[stripe tax] could not read Tax Settings / registrations", err);
  }
}

function lineLabel(
  product: NonNullable<ReturnType<typeof getProductById>>,
): string {
  return product.isCarbon
    ? `${product.name} (Carbon) — ${product.size}`
    : `${product.name} — ${product.size} MERV ${product.merv}`;
}

export async function createCheckoutSession(items: CheckoutItem[], clientUrl: string) {
  const taxCode = productTaxCode();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) throw new Error(`Unknown product: ${item.productId}`);
    if (!product.inStock) throw new Error(`Out of stock: ${product.size}`);
    if (item.quantity < 1 || item.quantity > 50) {
      throw new Error(`Invalid quantity for product ${item.productId}`);
    }

    const unit = unitPriceForQty(product.price, item.quantity, product);

    line_items.push({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(unit * 100),
        tax_behavior: "exclusive",
        product_data: {
          name: lineLabel(product),
          description: "HVAC pleated filter",
          tax_code: taxCode,
          metadata: {
            productId: String(product.id),
            size: product.size,
            merv: String(product.merv),
          },
        },
      },
    });
  }

  if (line_items.length === 0) throw new Error("Cart is empty");

  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
  }

  await logTaxReadiness(stripe);

  const itemsMeta = compactItemsMeta(items);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/checkout/cancel`,
    shipping_address_collection: { allowed_countries: ["US"] },
    phone_number_collection: { enabled: true },
    customer_creation: "always",
    invoice_creation: { enabled: true },
    automatic_tax: { enabled: true },
    metadata: { items: itemsMeta },
    payment_intent_data: {
      metadata: { items: itemsMeta },
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
    const orders = JSON.parse(fs.readFileSync(ORDERS_PATH, "utf-8")) as Array<
      Record<string, unknown>
    >;
    if (orders.some((order) => order.sessionId === session.id)) {
      return { received: true };
    }
    orders.push({
      id: nanoid(),
      ...orderFromCheckoutSession(session),
    });
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
  }

  return { received: true };
}

export async function getCheckoutSessionStatus(sessionId: string) {
  if (!SESSION_ID.test(sessionId)) {
    throw new Error("Invalid checkout session");
  }
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    paid: session.payment_status === "paid",
    status: session.payment_status,
    amountSubtotal: session.amount_subtotal,
    amountTax: session.total_details?.amount_tax ?? 0,
    amountTotal: session.amount_total,
    currency: session.currency,
  };
}
