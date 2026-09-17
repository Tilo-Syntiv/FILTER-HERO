import "dotenv/config";
import fs from "node:fs";
import {
  CLOCK_NEXT_CHANGE_PROPERTY,
  CRM_SENDS_MAIL,
  EMAIL_OWNER,
  klaviyoMaySubscribe,
  klaviyoMetricForIntent,
  REPLENISH_DATE_PROPERTY,
} from "../shared/email-channels.ts";
import {
  catalogStripeProductId,
  findProductVariant,
  sellableSheetProducts,
} from "../shared/products.ts";
import {
  buildKlaviyoCatalog,
  cadenceProperties,
  CLIENT_METRICS,
  depthFromSize,
  intervalDaysForSize,
  isClientMetric,
  getKlaviyoAccount,
  isKlaviyoEnabled,
  klaviyoApi,
  klaviyoLineFromProduct,
  klaviyoPublicConfig,
  linesFromCheckoutItems,
  nextChangeDateIso,
  orderProfileProperties,
  parseCheckoutItems,
  shouldSubscribeFromLead,
  splitPersonName,
  toE164,
} from "../server/klaviyo.ts";
import {
  KLAVIYO_STRIPE_EVENTS,
  KLAVIYO_STRIPE_OAUTH_ACCOUNT_ID,
  isKlaviyoStripeWebhookUrl,
  klaviyoStripeWebhookUrl,
} from "../shared/klaviyo-stripe.ts";
import { httpsKlaviyoClientUrl } from "../shared/klaviyo-onsite.ts";
import { emailLogoUrl } from "../shared/email-brand.ts";
import type { StoredOrder } from "../server/stripe.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

process.env.KLAVIYO_DISABLE = "1";

assert(!isKlaviyoEnabled(), "KLAVIYO_DISABLE must turn Klaviyo off");
assert(isClientMetric("Viewed Product"), "Viewed Product is a client metric");
assert(isClientMetric("Added to Cart"), "Added to Cart is a client metric");
assert(!isClientMetric("Placed Order"), "Placed Order is server-only");
assert(!isClientMetric("Started Checkout"), "Started Checkout is server-only");
assert(CLIENT_METRICS.includes("Selected MERV"), "Selected MERV is tracked");

assert(EMAIL_OWNER.welcome === "klaviyo", "welcome is Klaviyo");
assert(EMAIL_OWNER.order_confirmation === "resend", "Klaviyo must not send the order confirmation");
assert(CRM_SENDS_MAIL === false, "CRM is not a sender");
assert(
  !Object.values(EMAIL_OWNER).includes("crm" as never),
  "EMAIL_OWNER must never list the CRM as a mailbox",
);
assert(klaviyoMetricForIntent("reminder") === "Signed Up Reminder", "clock metric");
assert(klaviyoMetricForIntent("quote") === "Requested Quote", "quote metric");
assert(!klaviyoMaySubscribe({ intent: "reminder", marketingConsent: true }), "channels block clock subscribe");
assert(!shouldSubscribeFromLead({ intent: "reminder" }), "clock save must not subscribe");
assert(
  !shouldSubscribeFromLead({ intent: "reminder", marketingConsent: true }),
  "clock cannot opt into marketing",
);
assert(!shouldSubscribeFromLead({ intent: "quote" }), "quote without box does not subscribe");
assert(
  shouldSubscribeFromLead({ intent: "quote", marketingConsent: true }),
  "quote + box subscribes",
);
assert(
  shouldSubscribeFromLead({ intent: "support", marketingConsent: true }),
  "support + box subscribes",
);

assert(splitPersonName("Ada Lovelace").firstName === "Ada", "split first name");
assert(splitPersonName("Ada Lovelace").lastName === "Lovelace", "split last name");
assert(!splitPersonName("Filter Clock reminder").firstName, "clock name is not a person");
assert(toE164("5551234567") === "+15551234567", "10-digit US to E.164");
assert(toE164("1-555-123-4567") === "+15551234567", "11-digit US to E.164");
assert(!toE164("not-a-phone"), "junk phone is omitted");

assert(depthFromSize("20x25x1") === 1, "depth from size");
assert(intervalDaysForSize("20x25x1") === 90, "1-inch interval is 90");
assert(intervalDaysForSize("20x25x4") === 270, "4-inch interval is 270");
assert(intervalDaysForSize("20x25x1", 45) === 45, "saved clock interval wins");
assert(nextChangeDateIso("2026-09-04T12:00:00.000Z", 90) === "2026-12-03", "paid + 90 days");

const cadence = cadenceProperties({
  next_change_date: "2026-12-01",
  change_interval_days: 90,
  house_type: "pet",
  selected_merv: "13",
  extra_ignored: true,
});
assert(cadence.preferred_merv === "13", "selected merch becomes preferred_merv");
assert(cadence.house_type === "pet", "house type stored");
assert(cadence.extra_ignored === undefined, "unknown cadence keys dropped");
assert(
  cadence[REPLENISH_DATE_PROPERTY] === undefined,
  "clock cadence must not write the sendable replenish date",
);
assert(
  cadence[CLOCK_NEXT_CHANGE_PROPERTY] === "2026-12-01",
  "clock date is stored under clock_next_change_date",
);

const klaviyoSource = fs.readFileSync("server/klaviyo.ts", "utf-8");
assert(
  !/from\s+["'].*\/mailer["']/.test(klaviyoSource),
  "Klaviyo must not import the mailer — catalog URLs live in shared/seo",
);
assert(
  !/from\s+["'].*\/crm/.test(klaviyoSource),
  "Klaviyo must not import the CRM",
);
assert(!/from\s+["']resend["']/.test(klaviyoSource), "Klaviyo must not import Resend");
assert(
  !/\bsendEmail\b|\bsendLeadAlert\b|\bsendContactReceipt\b|\bsendOrderConfirmation\b/.test(
    klaviyoSource,
  ),
  "Klaviyo tracks events; it does not send mail",
);

const variant = findProductVariant("20x25x1", 8);
assert(variant, "20x25x1 MERV 8");
const line = klaviyoLineFromProduct(variant, 6, "https://filterhero.net");
assert(line.ProductID === String(variant.id), "line product id");
assert(line.Quantity === 6, "line qty");
assert(line.ProductURL.includes("/sizes/20x25x1"), "line PDP url");
assert(line.ImageURL.includes("/products/"), "line image url");
assert(line.Brand === "Filter Hero", "line brand");

const setupSource = fs.readFileSync("scripts/setup-klaviyo-account.ts", "utf-8");
assert(setupSource.includes("${LOGO_URL}"), "Klaviyo templates embed the logo");
assert(setupSource.includes("emailLogoUrl"), "Klaviyo logo helper is the shop mark");
assert(setupSource.includes("EMAIL_BRAND"), "Klaviyo templates use the shared Filter Hero kit");
assert(
  setupSource.includes("collectLiveFlowTemplateIds"),
  "setup must patch live flow clones, not only library templates",
);
assert(
  setupSource.includes("/api/flow-actions/"),
  "live clones remount via flow-action PATCH because template PATCH 404s",
);
assert(
  fs.readFileSync("shared/email-brand.ts", "utf-8").includes('/logo.png'),
  "Klaviyo logo is the shop mark",
);
assert(
  !setupSource.includes("color:#8eb0d8;font-weight:800;font-size:20px"),
  "Klaviyo emails must use the logo image, not ice wordmark text",
);

const items = [{ productId: variant.id, quantity: 6 }];
const lines = linesFromCheckoutItems(items, "https://filterhero.net");
assert(lines.length === 1, "one checkout line");
assert(parseCheckoutItems(JSON.stringify(items)).length === 1, "parse items json");
assert(parseCheckoutItems("not-json").length === 0, "bad items json is empty");

const order: StoredOrder = {
  id: "ord_verify",
  sessionId: "cs_test_verify",
  amountSubtotal: 1999,
  amountTax: 160,
  amountTotal: 2159,
  currency: "usd",
  customerId: "cus_verify",
  invoiceId: null,
  paymentIntentId: null,
  customerEmail: "buyer@example.com",
  shipping: null,
  phone: "+15555550199",
  items: JSON.stringify(items),
  taxStatus: "recorded",
  paidAt: "2026-09-04T16:00:00.000Z",
};
const props = orderProfileProperties(order);
assert(props.last_order_sizes, "order sizes stored");
assert(props[REPLENISH_DATE_PROPERTY] === "2026-12-03", "purchase sets sendable next_change_date");
assert(props.change_interval_days === 90, "purchase interval from depth");

const catalog = buildKlaviyoCatalog("https://filterhero.net");
assert(catalog.items.length === 293, `catalog should be 293 SKUs, got ${catalog.items.length}`);
assert(
  catalog.items.every((row) => row.link.startsWith("https://filterhero.net/sizes/")),
  "catalog links are PDPs",
);
assert(
  catalog.items.some((row) => row.id === String(variant.id)),
  "20x25x1 MERV 8 is in the catalog",
);
assert(
  catalogStripeProductId(variant.id) === `prod_fh_${variant.id}`,
  "Stripe product ids are stable",
);
assert(sellableSheetProducts().length === 293, "sheet products match Klaviyo feed");

assert(
  klaviyoStripeWebhookUrl("VnVNmQ") ===
    "https://a.klaviyo.com/api/webhook/integration/stripe?c=VnVNmQ",
  "native Stripe webhook URL uses the Klaviyo company id",
);
assert(isKlaviyoStripeWebhookUrl(klaviyoStripeWebhookUrl("VnVNmQ")), "native URL is recognized");
assert(!isKlaviyoStripeWebhookUrl("https://filterhero.net/api/stripe/webhook"), "shop webhook is not native");
assert(
  httpsKlaviyoClientUrl("http://a.klaviyo.com/client/profiles/?company_id=VnVNmQ") ===
    "https://a.klaviyo.com/client/profiles/?company_id=VnVNmQ",
  "HTTP Klaviyo onsite identify must upgrade to HTTPS",
);
assert(
  httpsKlaviyoClientUrl("https://a.klaviyo.com/client/profiles/") ===
    "https://a.klaviyo.com/client/profiles/",
  "HTTPS Klaviyo URLs stay HTTPS",
);
assert(
  httpsKlaviyoClientUrl("http://example.com/client?host=a.klaviyo.com") ===
    "http://example.com/client?host=a.klaviyo.com",
  "non-Klaviyo HTTP URLs are left alone",
);
assert(httpsKlaviyoClientUrl("/api/identify") === "/api/identify", "same-origin identify is not rewritten");
assert(KLAVIYO_STRIPE_EVENTS.includes("charge.succeeded"), "charges sync");
assert(KLAVIYO_STRIPE_EVENTS.includes("invoice.payment_succeeded"), "invoices sync");
assert(
  KLAVIYO_STRIPE_OAUTH_ACCOUNT_ID === "acct_1U9bqlQEENEs0Qmw",
  "Klaviyo OAuth targets FILTER HERO, not sandbox",
);
assert(
  !(KLAVIYO_STRIPE_EVENTS as readonly string[]).includes("checkout.session.completed"),
  "Checkout stays on Filter Hero",
);

const config = klaviyoPublicConfig();
assert(typeof config.enabled === "boolean", "public config shape");
assert(typeof config.publicKey === "string", "public key is a string");

async function livePing() {
  delete process.env.KLAVIYO_DISABLE;
  if (!isKlaviyoEnabled()) {
    console.log("Klaviyo payload checks passed. No private key — skipped live account ping.");
    return;
  }
  let account = await getKlaviyoAccount();
  if (!account.ok && /throttled/i.test(account.error || "")) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    account = await getKlaviyoAccount();
  }
  assert(account.ok, `live Klaviyo account failed: ${account.error || "unknown"}`);

  type FlowAction = {
    attributes?: {
      definition?: {
        type?: string;
        data?: { message?: { template_id?: string; name?: string }; status?: string };
      };
    };
  };
  const flows = await klaviyoApi<{
    data?: Array<{
      attributes?: { name?: string; status?: string };
      relationships?: { "flow-actions"?: { data?: Array<FlowAction & { id?: string }> } };
    }>;
    included?: Array<{ type?: string; id?: string; attributes?: FlowAction["attributes"] }>;
  }>("GET", "/api/flows?filter=equals(archived,false)&include=flow-actions");
  assert(flows.ok && (flows.data?.data?.length || 0) >= 7, "seven live Filter Hero flows");
  const includedActions = new Map(
    (flows.data?.included || [])
      .filter((row) => row.type === "flow-action" && row.id)
      .map((row) => [row.id as string, row]),
  );
  const logo = emailLogoUrl();
  const missing: string[] = [];
  const wordmark: string[] = [];
  for (const flow of flows.data?.data || []) {
    assert(flow.attributes?.status === "live", `${flow.attributes?.name} must stay live`);
    for (const rel of flow.relationships?.["flow-actions"]?.data || []) {
      const action = rel.attributes ? rel : includedActions.get(rel.id || "");
      if (action?.attributes?.definition?.type !== "send-email") continue;
      const templateId = action.attributes.definition.data?.message?.template_id;
      const actionName = action.attributes.definition.data?.message?.name || templateId || "email";
      assert(templateId, `${flow.attributes?.name} ${actionName} is missing a template`);
      const tpl = await klaviyoApi<{ data?: { attributes?: { html?: string } } }>(
        "GET",
        `/api/templates/${templateId}?fields[template]=html`,
      );
      const html = tpl.data?.data?.attributes?.html || "";
      if (!html.includes(logo)) missing.push(`${flow.attributes?.name} ${actionName}`);
      if (/color:#8eb0d8;font-weight:800;font-size:20px/.test(html)) {
        wordmark.push(`${flow.attributes?.name} ${actionName}`);
      }
    }
  }
  assert(!missing.length, `live flow templates missing ${logo}: ${missing.join(", ")}`);
  assert(!wordmark.length, `live flow templates still use ice wordmark text: ${wordmark.join(", ")}`);

  await new Promise((resolve) => setTimeout(resolve, 800));

  type EmailDefaultRow = {
    attributes?: { header?: { links?: Array<{ url?: string }> } };
    relationships?: { "brand-logo"?: { data?: { id?: string } | null } };
  };
  const key = process.env.KLAVIYO_PRIVATE_API_KEY?.trim() || "";
  const defaultsRes = await fetch("https://a.klaviyo.com/api/brand-email-defaults?include=brand-logo", {
    headers: {
      Authorization: `Klaviyo-API-Key ${key}`,
      accept: "application/vnd.api+json",
      revision: "2026-07-15.pre",
    },
  });
  const defaultsJson = (await defaultsRes.json()) as {
    data?: EmailDefaultRow[] | EmailDefaultRow;
    included?: Array<{ type?: string; id?: string }>;
    errors?: Array<{ detail?: string; title?: string }>;
  };
  assert(
    defaultsRes.ok,
    `email defaults failed: ${defaultsJson.errors?.map((row) => row.detail || row.title).join("; ") || defaultsRes.status}`,
  );
  const emailDefault = Array.isArray(defaultsJson.data) ? defaultsJson.data[0] : defaultsJson.data;
  const logoId =
    emailDefault?.relationships?.["brand-logo"]?.data?.id ||
    defaultsJson.included?.find((row) => row.type === "brand-logo")?.id;
  assert(logoId, "email defaults have a Filter Hero logo");
  const headerLinks = emailDefault?.attributes?.header?.links || [];
  assert(
    headerLinks.every((link) => !/\/shop$|\/measure$/.test(link.url || "")),
    "email default header links must be live shop URLs",
  );

  console.log(`Klaviyo payload checks passed. Live account ${account.accountId} ok. Flow templates branded.`);
}

livePing().catch((err) => {
  console.error(err);
  process.exit(1);
});
