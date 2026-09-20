import "dotenv/config";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Resend } from "resend";
import { BRAND_EMAIL, BRAND_NAME } from "../shared/const.ts";
import {
  EMAIL_BRAND,
  emailFromAddress,
  emailLogoUrl,
  renderBrandedEmail,
  transactionalFooterNote,
} from "../shared/email-brand.ts";
import { EMAIL_OWNER, resendSendsShopperReceipt } from "../shared/email-channels.ts";
import { findProductVariant } from "../shared/products.ts";
import {
  getStripe,
  handleStripeWebhook,
  listAllOrders,
} from "../server/stripe.ts";
import {
  buildContactReceipt,
  buildLeadAlert,
  buildOrderConfirmation,
  sendContactReceipt,
  sendLeadAlert,
  sendOrderConfirmation,
} from "../server/mailer.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

function redactKey(value: string | undefined): string {
  if (!value) return "(unset)";
  if (value.startsWith("re_")) return "re_…set";
  return "(not a Resend key)";
}

function assertBranded(html: string, label: string) {
  assert(html.includes(emailLogoUrl()), `${label} embeds https://filterhero.net/logo.png`);
  assert(html.includes(`alt="${BRAND_NAME}"`), `${label} uses the Filter Hero logo alt`);
  assert(html.includes(EMAIL_BRAND.navy), `${label} uses navy ${EMAIL_BRAND.navy}`);
  assert(html.includes(EMAIL_BRAND.burgundy), `${label} uses burgundy CTA ${EMAIL_BRAND.burgundy}`);
  assert(!/color:#8eb0d8;font-weight:800;font-size:20px/.test(html), `${label} must not use ice wordmark text`);
}

type Json = Record<string, unknown>;

const apiKey = process.env.RESEND_API_KEY;
assert(apiKey && apiKey.startsWith("re_"), `RESEND_API_KEY missing or not a Resend key (${redactKey(apiKey)})`);

const from = emailFromAddress();
const to = process.env.CONTACT_TO || BRAND_EMAIL;
const verifiedFrom = `${BRAND_NAME} <${BRAND_EMAIL}>`;

assert(
  !from.toLowerCase().includes("onboarding@resend.dev"),
  `RESEND_FROM is still the sandbox address (${from}). Use ${verifiedFrom}`,
);
assert(
  from.toLowerCase().includes("@filterhero.net"),
  `RESEND_FROM must use the verified filterhero.net domain, got ${from}`,
);
assert(from === verifiedFrom, `RESEND_FROM must be exactly ${verifiedFrom}, got ${from}`);
assert(to.toLowerCase().includes("@filterhero.net"), `CONTACT_TO should be a Filter Hero inbox, got ${to}`);

assert(EMAIL_OWNER.order_confirmation === "resend", "Resend owns the order confirmation");
assert(EMAIL_OWNER.quote_receipt === "resend", "Resend owns the quote receipt");
assert(EMAIL_OWNER.support_receipt === "resend", "Resend owns the support receipt");
assert(EMAIL_OWNER.staff_lead_alert === "resend", "Resend owns the staff lead alert");
assert(EMAIL_OWNER.stripe_receipt === "stripe", "Stripe owns the payment receipt");
assert(EMAIL_OWNER.welcome === "klaviyo", "welcome stays on Klaviyo");
assert(EMAIL_OWNER.abandoned_checkout === "klaviyo", "abandon stays on Klaviyo");
assert(EMAIL_OWNER.replenish === "klaviyo", "replenish stays on Klaviyo");
assert(EMAIL_OWNER.clock_cadence === "none", "Filter Clock is not a mailbox");
assert(resendSendsShopperReceipt("quote"), "quote sends a shopper receipt");
assert(resendSendsShopperReceipt("support"), "support sends a shopper receipt");
assert(!resendSendsShopperReceipt("reminder"), "Filter Clock must not email the shopper");

const mailerSource = fs.readFileSync("server/mailer.ts", "utf-8");
assert(mailerSource.includes("emailLogoUrl") || mailerSource.includes("EMAIL_BRAND"), "mailer uses the brand kit");
assert(mailerSource.includes("/logo.png") || fs.readFileSync("shared/email-brand.ts", "utf-8").includes('/logo.png'), "logo path is the shop mark");
assert(!/from\s+["'].*klaviyo["']/.test(mailerSource), "mailer must not import Klaviyo");
assert(!/welcome|abandoned checkout|win-back|replenish/i.test(mailerSource), "mailer must not send marketing");

const contactSource = fs.readFileSync("server/contact.ts", "utf-8");
assert(contactSource.includes("sendLeadAlert"), "contact sends the branded staff alert");
assert(contactSource.includes("sendContactReceipt"), "contact sends the branded shopper receipt");
assert(contactSource.includes("shouldEnforceTurnstile"), "quote/support still require Turnstile in production");
assert(!/from\s+["']resend["']/.test(contactSource), "contact must send through the mailer");

const stripeSource = fs.readFileSync("server/stripe.ts", "utf-8");
assert(stripeSource.includes("sendOrderConfirmation"), "paid checkout sends the branded confirmation");
assert(stripeSource.includes("confirmationSentAt"), "webhook persists a successful confirmation so retries do not double-send");
assert(
  /if\s*\(\s*!stored\.confirmationSentAt\s*\)/.test(stripeSource),
  "webhook only sends the confirmation until Resend accepts it",
);

const quoteLead = {
  id: "verify-quote",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "555-0100",
  filterSize: "20x25x1",
  cartSummary: "20x25x1 MERV 8 × 6",
  message: "Need a pack for the furnace.",
  intent: "quote" as const,
};
const quoteAlert = buildLeadAlert(quoteLead);
const quoteReceipt = buildContactReceipt(quoteLead);
assert(quoteReceipt, "quote builds a shopper receipt");
assertBranded(quoteAlert.html, "staff quote alert");
assertBranded(quoteReceipt.html, "quote receipt");
assert(quoteAlert.replyTo === "ada@example.com", "staff alert replies to the shopper");
assert(quoteReceipt.replyTo === BRAND_EMAIL, "shopper receipt replies to Filter Hero");
assert(quoteAlert.html.includes("Need a pack for the furnace."), "staff alert includes the message");
assert(!buildContactReceipt({ ...quoteLead, intent: "reminder" }), "clock save has no shopper receipt");

const variant = findProductVariant("20x25x1", 8);
assert(variant, "20x25x1 MERV 8 exists");
const orderMail = buildOrderConfirmation({
  id: "ord_verify",
  sessionId: "cs_test_verify_brand",
  customerEmail: "ada@example.com",
  amountSubtotal: 4594,
  amountTax: 0,
  amountTotal: 4594,
  currency: "usd",
  items: JSON.stringify([{ productId: variant.id, quantity: 6 }]),
  shipping: {
    name: "Ada Lovelace",
    address: { line1: "1 Market St", city: "San Francisco", state: "CA", postal_code: "94105" },
  },
});
assert(orderMail, "paid order builds a confirmation");
assertBranded(orderMail.html, "order confirmation");
assert(orderMail.html.includes("20x25x1"), "order confirmation lists the size");
assert(orderMail.html.includes("/products/merv-8-packshot.png"), "order confirmation uses the pack shot");
assert(orderMail.subject.includes(BRAND_NAME), "order subject is Filter Hero");
assert(orderMail.html.includes("1 Market St"), "order confirmation includes the ship-to street");
assert(!orderMail.html.includes(">Tax "), "zero tax is omitted");

const xssLead = {
  ...quoteLead,
  id: "verify-xss",
  name: `Ada <img src=x onerror=alert(1)>`,
  message: `<script>alert("xss")</script>`,
};
const xssAlert = buildLeadAlert(xssLead);
assert(xssAlert.html.includes("&lt;script&gt;"), "staff HTML escapes the message");
assert(!xssAlert.html.includes("<script>"), "staff HTML must not execute message markup");
assert(xssAlert.html.includes("&lt;img"), "staff HTML escapes the name");

const supportReceipt = buildContactReceipt({ ...quoteLead, intent: "support" });
assert(supportReceipt, "support builds a shopper receipt");
assertBranded(supportReceipt.html, "support receipt");
assert(supportReceipt.subject.includes("message"), "support subject is not a quote");

const taxed = buildOrderConfirmation({
  id: "ord_tax",
  sessionId: "cs_test_tax",
  customerEmail: "ada@example.com",
  amountSubtotal: 4594,
  amountTax: 367,
  amountTotal: 4961,
  currency: "usd",
  items: JSON.stringify([{ productId: variant.id, quantity: 6 }]),
  shipping: null,
});
assert(taxed, "taxed order builds");
assert(taxed.html.includes("Tax "), "tax line shows when Stripe recorded tax");
assert(
  !buildOrderConfirmation({
    id: "ord_none",
    sessionId: "cs_test_none",
    customerEmail: null,
    amountSubtotal: 100,
    amountTax: 0,
    amountTotal: 100,
    currency: "usd",
    items: "[]",
  }),
  "no email means no confirmation",
);
assert(
  !buildOrderConfirmation({
    id: "ord_blank",
    sessionId: "cs_test_blank",
    customerEmail: "  ",
    amountSubtotal: 100,
    amountTax: 0,
    amountTotal: 100,
    currency: "usd",
    items: "[]",
  }),
  "blank email means no confirmation",
);

async function resendGet(path: string): Promise<{ status: number; body: Json }> {
  const res = await fetch(`https://api.resend.com${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const body = (await res.json()) as Json;
  return { status: res.status, body };
}

const { status: domainStatus, body: domainsBody } = await resendGet("/domains");
if (domainStatus === 200) {
  const domains = (domainsBody.data as Json[] | undefined) ?? [];
  const hero = domains.find((d) => d.name === "filterhero.net");
  assert(hero, "filterhero.net is not on this Resend account");
  assert(hero.status === "verified", `filterhero.net status is ${hero.status}, expected verified`);
  const sending = (hero as { capabilities?: { sending?: string } }).capabilities?.sending;
  if (sending) {
    assert(sending === "enabled", `filterhero.net sending is ${sending}`);
  }
  console.log(`Domain ${hero.name}: ${hero.status} / region ${hero.region ?? "n/a"}`);
} else if (domainStatus === 401 || domainStatus === 403) {
  console.log("API key is sending-only (cannot list domains). Dashboard already shows filterhero.net verified.");
} else {
  throw new Error(`/domains returned ${domainStatus}: ${JSON.stringify(domainsBody)}`);
}

const sendingOnly = domainStatus === 401 || domainStatus === 403;

console.log(`API key: ${redactKey(apiKey)}`);
console.log(`RESEND_FROM: ${from}`);
console.log(`CONTACT_TO: ${to}`);

const resend = new Resend(apiKey);
const probeId = `verify-resend/${Date.now()}`;
const probeHtml = renderBrandedEmail({
  title: "Resend is on-brand",
  preview: `${BRAND_NAME} transactional mail uses the shop logo, navy, and burgundy.`,
  bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.5">Probe to delivered@resend.dev. This is how quote receipts and order confirmations look.</p>`,
  cta: { href: "https://filterhero.net", label: "Shop filters" },
  footerNote: transactionalFooterNote(),
});
assertBranded(probeHtml, "verify probe");

const { data, error } = await resend.emails.send(
  {
    from,
    to: ["delivered@resend.dev"],
    subject: `[${BRAND_NAME}] Resend verify`,
    html: probeHtml,
    text: "Filter Hero Resend probe. Safe test address delivered@resend.dev.",
  },
  { idempotencyKey: probeId },
);

if (error) {
  throw new Error(`send failed: ${error.message}`);
}
assert(data?.id, "send returned no email id");
console.log(`Branded probe sent to delivered@resend.dev id=${data.id}`);

const savedTo = process.env.CONTACT_TO;
process.env.CONTACT_TO = "delivered@resend.dev";
const stamp = Date.now();
const liveLead = {
  ...quoteLead,
  id: `qa-quote-${stamp}`,
  email: "delivered@resend.dev",
  name: "Resend QA",
  message: "Ignore — local Resend brand QA.",
};
const staffSend = await sendLeadAlert(liveLead);
assert(staffSend.sent, `staff alert send failed${staffSend.id ? ` id=${staffSend.id}` : ""}`);
const quoteSend = await sendContactReceipt(liveLead);
assert(quoteSend.sent, "quote receipt send failed");
const supportSend = await sendContactReceipt({ ...liveLead, id: `qa-support-${stamp}`, intent: "support" });
assert(supportSend.sent, "support receipt send failed");
const reminderSend = await sendContactReceipt({ ...liveLead, id: `qa-clock-${stamp}`, intent: "reminder" });
assert(!reminderSend.sent, "Filter Clock must not send a shopper receipt");
const orderSend = await sendOrderConfirmation({
  id: `ord_qa_${stamp}`,
  sessionId: `cs_test_qa_${stamp}`,
  customerEmail: "delivered@resend.dev",
  amountSubtotal: 4594,
  amountTax: 0,
  amountTotal: 4594,
  currency: "usd",
  items: JSON.stringify([{ productId: variant.id, quantity: 6 }]),
  shipping: {
    name: "Resend QA",
    address: { line1: "1 Market St", city: "San Francisco", state: "CA", postal_code: "94105" },
  },
});
assert(orderSend.sent, "order confirmation send failed");
if (savedTo) process.env.CONTACT_TO = savedTo;
else delete process.env.CONTACT_TO;

if (!sendingOnly) {
  for (const [label, id] of [
    ["probe", data.id],
    ["staff", staffSend.id],
    ["quote", quoteSend.id],
    ["support", supportSend.id],
    ["order", orderSend.id],
  ] as const) {
    if (!id) continue;
    const got = await resend.emails.get(id);
    if (got.error) throw new Error(`GET ${label} failed: ${got.error.message}`);
    assert(got.data?.id === id, `${label} GET id mismatch`);
    const fromField = Array.isArray(got.data.from) ? got.data.from.join(" ") : String(got.data.from || "");
    assert(
      fromField.toLowerCase().includes("filterhero.net"),
      `${label} From must be filterhero.net, got ${fromField || "(empty)"}`,
    );
    console.log(`${label} accepted id=${id} last_event=${got.data.last_event ?? "n/a"}`);
  }
} else {
  console.log("Skip email GET (sending-only key). Send ids:");
  console.log(`  staff=${staffSend.id} quote=${quoteSend.id} support=${supportSend.id} order=${orderSend.id}`);
}

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "fh-resend-"));
const prevDataDir = process.env.DATA_DIR;
const prevCrm = process.env.CRM_DISABLE;
const prevKlaviyo = process.env.KLAVIYO_DISABLE;
const prevTurnstile = process.env.TURNSTILE_SECRET_KEY;
const prevNodeEnv = process.env.NODE_ENV;
const prevAccount = process.env.ACCOUNT_DISABLE;
const prevWebhook = process.env.STRIPE_WEBHOOK_SECRET;
process.env.DATA_DIR = dataDir;
process.env.CRM_DISABLE = "1";
process.env.KLAVIYO_DISABLE = "1";
process.env.ACCOUNT_DISABLE = "1";
process.env.CONTACT_TO = "delivered@resend.dev";
delete process.env.TURNSTILE_SECRET_KEY;
if (process.env.NODE_ENV === "production") process.env.NODE_ENV = "test";
try {
  const { submitContact } = await import("../server/contact.ts");
  const trapped = await submitContact({
    name: "Smoke Bot",
    email: "smoke-bot@example.com",
    message: "honeypot",
    intent: "support",
    website: "http://spam.example",
  });
  assert(trapped.ok && trapped.id === "ignored" && trapped.emailed === false, "honeypot must not mail");
  const quotePosted = await submitContact({
    name: "Resend QA",
    email: "delivered@resend.dev",
    message: "Ignore — submitContact brand QA.",
    intent: "quote",
    filterSize: "20x25x1",
  });
  assert(quotePosted.ok && quotePosted.emailed, "quote submitContact must send the staff alert");
  const clockPosted = await submitContact({
    name: "Filter Clock reminder",
    email: "delivered@resend.dev",
    message: "Clock cadence saved (no shopper email).",
    intent: "reminder",
    marketingConsent: false,
    cadence: { next_change_date: "2026-12-16", change_interval_days: 90, house_type: "pet" },
  });
  assert(clockPosted.ok && clockPosted.emailed, "clock save still alerts staff");
  console.log(`submitContact quote id=${quotePosted.id} clock id=${clockPosted.id}`);

  const stripeClient = getStripe();
  assert(stripeClient, "STRIPE_SECRET_KEY required to exercise checkout.session.completed");
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes("...")
      ? process.env.STRIPE_WEBHOOK_SECRET
      : "whsec_resend_verify_filter_hero";
  process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
  const sessionId = `cs_test_fhresend${stamp}`;
  const payload = JSON.stringify({
    id: `evt_resend_${stamp}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        amount_subtotal: 4594,
        amount_total: 4594,
        currency: "usd",
        customer: "cus_resend_qa",
        invoice: "in_resend_qa",
        payment_intent: "pi_resend_qa",
        customer_email: "delivered@resend.dev",
        customer_details: { email: "delivered@resend.dev", phone: "+15555550100" },
        shipping_details: {
          name: "Resend QA",
          address: {
            line1: "1 Market St",
            city: "San Francisco",
            state: "CA",
            postal_code: "94105",
            country: "US",
          },
        },
        metadata: { items: JSON.stringify([{ productId: variant.id, quantity: 6 }]) },
        total_details: { amount_tax: 0, amount_discount: 0, amount_shipping: 0 },
        payment_status: "paid",
      },
    },
  });
  const header = stripeClient.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
  const savedResend = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    await handleStripeWebhook(Buffer.from(payload), header);
    const pending = listAllOrders();
    assert(pending.length === 1, `paid webhook writes one order (got ${pending.length})`);
    assert(pending[0]?.sessionId === sessionId, "webhook stores the checkout session");
    assert(!pending[0]?.confirmationSentAt, "failed confirmation must not stamp confirmationSentAt");
  } finally {
    if (savedResend) process.env.RESEND_API_KEY = savedResend;
    else delete process.env.RESEND_API_KEY;
  }
  await handleStripeWebhook(Buffer.from(payload), header);
  const sentOrder = listAllOrders();
  assert(sentOrder.length === 1, "retry still has one order");
  assert(sentOrder[0]?.confirmationSentAt, "retry sends the confirmation once Resend is back");
  const sentAt = sentOrder[0]?.confirmationSentAt;
  await new Promise((resolve) => setTimeout(resolve, 25));
  await handleStripeWebhook(Buffer.from(payload), header);
  const again = listAllOrders();
  assert(again.length === 1, "second retry does not duplicate the order");
  assert(again[0]?.confirmationSentAt === sentAt, "successful confirmation is not sent twice");
  console.log(`webhook confirmationSentAt=${sentAt} session=${sessionId}`);
} finally {
  if (prevDataDir) process.env.DATA_DIR = prevDataDir;
  else delete process.env.DATA_DIR;
  if (prevCrm) process.env.CRM_DISABLE = prevCrm;
  else delete process.env.CRM_DISABLE;
  if (prevKlaviyo) process.env.KLAVIYO_DISABLE = prevKlaviyo;
  else delete process.env.KLAVIYO_DISABLE;
  if (prevAccount) process.env.ACCOUNT_DISABLE = prevAccount;
  else delete process.env.ACCOUNT_DISABLE;
  if (prevWebhook) process.env.STRIPE_WEBHOOK_SECRET = prevWebhook;
  else delete process.env.STRIPE_WEBHOOK_SECRET;
  if (prevTurnstile) process.env.TURNSTILE_SECRET_KEY = prevTurnstile;
  else delete process.env.TURNSTILE_SECRET_KEY;
  if (prevNodeEnv) process.env.NODE_ENV = prevNodeEnv;
  else delete process.env.NODE_ENV;
  if (savedTo) process.env.CONTACT_TO = savedTo;
  else delete process.env.CONTACT_TO;
  fs.rmSync(dataDir, { recursive: true, force: true });
}

console.log("Resend checks passed.");
