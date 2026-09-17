import "dotenv/config";
import fs from "node:fs";
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
  buildContactReceipt,
  buildLeadAlert,
  buildOrderConfirmation,
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
assert(!/from\s+["']resend["']/.test(contactSource), "contact must send through the mailer");

const stripeSource = fs.readFileSync("server/stripe.ts", "utf-8");
assert(stripeSource.includes("sendOrderConfirmation"), "paid checkout sends the branded confirmation");

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
console.log("Resend checks passed.");
