import { Resend } from "resend";
import { BRAND_EMAIL, BRAND_NAME } from "../shared/const";
import {
  EMAIL_BRAND,
  emailFromAddress,
  emailOrigin,
  escapeEmailHtml,
  renderBrandedEmail,
  transactionalFooterNote,
} from "../shared/email-brand";
import { resendSendsShopperReceipt, type ContactIntent } from "../shared/email-channels";
import {
  getProductById,
  packShotSrc,
  unitPriceForQty,
  type Product,
} from "../shared/products";

export type LeadMail = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  filterSize?: string | null;
  cartSummary?: string | null;
  message: string;
  intent: ContactIntent;
};

export type OrderMail = {
  id: string;
  sessionId: string;
  customerEmail: string | null;
  amountSubtotal: number | null;
  amountTax: number | null;
  amountTotal: number | null;
  currency: string | null;
  items: string;
  shipping?: {
    name?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
    } | null;
  } | null;
};

export type MailResult = { sent: boolean; id?: string };

type BuiltMail = {
  subject: string;
  html: string;
  text: string;
  to: string;
  replyTo?: string;
};

type CheckoutLine = { productId: number; quantity: number };

function resendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function contactInbox(): string {
  return (process.env.CONTACT_TO || "").trim() || BRAND_EMAIL;
}

function intentLabel(intent: ContactIntent): string {
  if (intent === "quote") return "Quote";
  if (intent === "reminder") return "Filter Reminder";
  return "Support";
}

function firstName(name: string): string {
  const part = name.trim().split(/\s+/)[0];
  return part || "there";
}

function money(cents: number | null | undefined, currency = "usd"): string {
  if (cents == null || !Number.isFinite(cents)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function dollars(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function parseCheckoutItems(raw: string | undefined): CheckoutLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const rec = row as { productId?: unknown; quantity?: unknown };
        const productId = Number(rec.productId);
        const quantity = Number(rec.quantity);
        if (!Number.isInteger(productId) || productId < 1) return null;
        if (!Number.isInteger(quantity) || quantity < 1) return null;
        return { productId, quantity };
      })
      .filter((row): row is CheckoutLine => row !== null);
  } catch {
    return [];
  }
}

function productLabel(product: Product): string {
  return product.isCarbon
    ? `${product.name} (Carbon) — ${product.size}`
    : `${product.name} — ${product.size} MERV ${product.merv}`;
}

function nl2br(value: string): string {
  return escapeEmailHtml(value).replace(/\r\n|\n|\r/g, "<br />");
}

function staffRows(lead: LeadMail): { label: string; value: string }[] {
  return [
    { label: "Lead ID", value: lead.id },
    { label: "Intent", value: lead.intent },
    { label: "Name", value: lead.name },
    { label: "Email", value: lead.email },
    { label: "Phone", value: lead.phone || "—" },
    { label: "Filter size", value: lead.filterSize || "—" },
    { label: "Cart", value: lead.cartSummary || "—" },
  ];
}

function definitionTable(rows: { label: string; value: string }[]): string {
  const cells = rows
    .map(
      (row) => `<tr>
        <td style="padding:6px 12px 6px 0;color:${EMAIL_BRAND.muted};font-size:13px;vertical-align:top;white-space:nowrap">${escapeEmailHtml(row.label)}</td>
        <td style="padding:6px 0;color:${EMAIL_BRAND.deep};font-size:13px">${nl2br(row.value)}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${cells}</table>`;
}

export function buildLeadAlert(lead: LeadMail): BuiltMail {
  const label = intentLabel(lead.intent);
  const origin = emailOrigin();
  const rows = staffRows(lead);
  const html = renderBrandedEmail({
    title: `${label} from ${lead.name}`,
    preview: `${label} lead ${lead.id} — reply from this thread.`,
    bodyHtml: `${definitionTable(rows)}
          <p style="margin:20px 0 8px;font-size:13px;color:${EMAIL_BRAND.muted}">Message</p>
          <p style="margin:0;font-size:15px;line-height:1.5;color:${EMAIL_BRAND.deep}">${nl2br(lead.message)}</p>`,
    cta: { href: origin, label: "Open Filter Hero" },
    footerNote: transactionalFooterNote(),
  });
  const text = [
    `${BRAND_NAME} ${label}`,
    ...rows.map((row) => `${row.label}: ${row.value}`),
    "",
    lead.message,
  ].join("\n");
  return {
    subject: `[${BRAND_NAME}] ${label} — ${lead.name}`,
    html,
    text,
    to: contactInbox(),
    replyTo: lead.email,
  };
}

export function buildContactReceipt(lead: LeadMail): BuiltMail | null {
  if (!resendSendsShopperReceipt(lead.intent)) return null;
  const origin = emailOrigin();
  const quote = lead.intent === "quote";
  const title = quote ? "We got your quote request" : "We got your message";
  const preview = quote
    ? `${BRAND_NAME} will reply from ${BRAND_EMAIL} with pricing.`
    : `${BRAND_NAME} will reply from ${BRAND_EMAIL}.`;
  const sizeLine = lead.filterSize
    ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">Size on file: <strong>${escapeEmailHtml(lead.filterSize)}</strong>.</p>`
    : "";
  const html = renderBrandedEmail({
    title,
    preview,
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">Hi ${escapeEmailHtml(firstName(lead.name))},</p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.5">${
            quote
              ? `Thanks for writing ${BRAND_NAME}. We have your request and will follow up from <a href="mailto:${BRAND_EMAIL}" style="color:${EMAIL_BRAND.navy}">${BRAND_EMAIL}</a> with pricing and lead time.`
              : `Thanks for writing ${BRAND_NAME}. We have your support request and will follow up from <a href="mailto:${BRAND_EMAIL}" style="color:${EMAIL_BRAND.navy}">${BRAND_EMAIL}</a>.`
          }</p>
          ${sizeLine}
          <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.muted}">This is a receipt for the form you just sent — not a marketing email. Stripe still sends the payment receipt when you buy.</p>`,
    cta: { href: origin, label: "Shop filters" },
    footerNote: transactionalFooterNote(),
  });
  const text = [
    `Hi ${firstName(lead.name)},`,
    "",
    quote
      ? `Thanks for writing ${BRAND_NAME}. We have your quote request and will follow up from ${BRAND_EMAIL}.`
      : `Thanks for writing ${BRAND_NAME}. We have your support request and will follow up from ${BRAND_EMAIL}.`,
    lead.filterSize ? `Size on file: ${lead.filterSize}` : "",
    "",
    origin,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    subject: quote ? `We got your ${BRAND_NAME} quote request` : `We got your ${BRAND_NAME} message`,
    html,
    text,
    to: lead.email,
    replyTo: BRAND_EMAIL,
  };
}

function orderLinesHtml(order: OrderMail): { html: string; text: string[] } {
  const origin = emailOrigin();
  const items = parseCheckoutItems(order.items);
  const text: string[] = [];
  if (!items.length) {
    return { html: "", text };
  }
  const rows = items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return "";
      const qty = item.quantity;
      const unit = unitPriceForQty(product.price, qty, product);
      const label = productLabel(product);
      const image = `${origin}${packShotSrc(product.merv, Boolean(product.isCarbon))}`;
      text.push(`${qty}× ${label} — ${dollars(unit * qty)}`);
      return `<tr>
        <td style="padding:10px 12px 10px 0;vertical-align:top;width:72px">
          <img src="${escapeEmailHtml(image)}" alt="${escapeEmailHtml(label)}" width="64" height="64" style="display:block;border:0;outline:none;border-radius:8px" />
        </td>
        <td style="padding:10px 0;vertical-align:top;font-size:14px;color:${EMAIL_BRAND.deep}">
          ${escapeEmailHtml(label)}<br />
          <span style="color:${EMAIL_BRAND.muted};font-size:13px">Qty ${qty} · ${dollars(unit)} each</span>
        </td>
        <td align="right" style="padding:10px 0 10px 12px;vertical-align:top;font-size:14px;white-space:nowrap;color:${EMAIL_BRAND.navy}">${dollars(unit * qty)}</td>
      </tr>`;
    })
    .filter(Boolean)
    .join("");
  if (!rows) return { html: "", text };
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:8px 0 16px;border-top:1px solid #d0d8e4;border-bottom:1px solid #d0d8e4">${rows}</table>`,
    text,
  };
}

function shipBlock(order: OrderMail): { html: string; text: string } {
  const ship = order.shipping;
  if (!ship?.address?.line1 && !ship?.name) return { html: "", text: "" };
  const lines = [
    ship.name,
    ship.address?.line1,
    ship.address?.line2,
    [ship.address?.city, ship.address?.state, ship.address?.postal_code].filter(Boolean).join(", "),
  ].filter((line): line is string => Boolean(line && line.trim()));
  if (!lines.length) return { html: "", text: "" };
  return {
    html: `<p style="margin:0 0 8px;font-size:13px;color:${EMAIL_BRAND.muted}">Ship to</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5">${lines.map((line) => escapeEmailHtml(line)).join("<br />")}</p>`,
    text: `Ship to:\n${lines.join("\n")}`,
  };
}

export function buildOrderConfirmation(order: OrderMail): BuiltMail | null {
  const email = order.customerEmail?.trim();
  if (!email) return null;
  const origin = emailOrigin();
  const currency = order.currency || "usd";
  const { html: linesHtml, text: linesText } = orderLinesHtml(order);
  const ship = shipBlock(order);
  const hi = firstName(order.shipping?.name || "");
  const greeting = hi !== "there" ? `Hi ${escapeEmailHtml(hi)},` : "Hi there,";
  const html = renderBrandedEmail({
    title: "Your order is confirmed",
    preview: `${BRAND_NAME} is packing your filters. Stripe will send the payment receipt separately.`,
    bodyHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">${greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5">Thanks for the order. ${BRAND_NAME} is getting your filters ready. Stripe will email the payment receipt separately — this is not a marketing message.</p>
          ${linesHtml}
          <p style="margin:0 0 4px;font-size:13px;color:${EMAIL_BRAND.muted}">Subtotal ${money(order.amountSubtotal, currency)}</p>
          ${typeof order.amountTax === "number" && order.amountTax > 0 ? `<p style="margin:0 0 4px;font-size:13px;color:${EMAIL_BRAND.muted}">Tax ${money(order.amountTax, currency)}</p>` : ""}
          <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:${EMAIL_BRAND.navy}">Total ${money(order.amountTotal, currency)}</p>
          ${ship.html}
          <p style="margin:0;font-size:13px;color:${EMAIL_BRAND.muted}">Order ${escapeEmailHtml(order.id)}</p>`,
    cta: { href: `${origin}/how-often-to-change-air-filter`, label: "When to change the filter" },
    footerNote: transactionalFooterNote(),
  });
  const text = [
    greeting.replace(/,$/, ""),
    "",
    `Thanks for the order. ${BRAND_NAME} is getting your filters ready.`,
    `Total ${money(order.amountTotal, currency)}`,
    ...linesText,
    ship.text,
    `Order ${order.id}`,
    origin,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    subject: `Your ${BRAND_NAME} order is confirmed`,
    html,
    text,
    to: email,
    replyTo: BRAND_EMAIL,
  };
}

async function sendBuilt(
  mail: BuiltMail,
  idempotencyKey: string,
): Promise<MailResult> {
  const resend = resendClient();
  if (!resend) {
    console.info("[mailer] RESEND_API_KEY not set — skip send", mail.subject);
    return { sent: false };
  }
  const { data, error } = await resend.emails.send(
    {
      from: emailFromAddress(),
      to: [mail.to],
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    },
    { idempotencyKey },
  );
  if (error) {
    console.error("[mailer] resend", error);
    return { sent: false };
  }
  return { sent: true, id: data?.id };
}

/** Staff inbox only. Clock saves still alert staff; they never email the shopper. */
export async function sendLeadAlert(lead: LeadMail): Promise<MailResult> {
  return sendBuilt(buildLeadAlert(lead), `lead-email/${lead.id}`);
}

/** Quote and support only. Filter Clock is staff-alert only (email-channels). */
export async function sendContactReceipt(lead: LeadMail): Promise<MailResult> {
  const mail = buildContactReceipt(lead);
  if (!mail) return { sent: false };
  return sendBuilt(mail, `lead-receipt/${lead.id}`);
}

export async function sendOrderConfirmation(order: OrderMail): Promise<MailResult> {
  const mail = buildOrderConfirmation(order);
  if (!mail) return { sent: false };
  return sendBuilt(mail, `order-confirmation/${order.sessionId}`);
}
