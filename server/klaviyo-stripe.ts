import {
  KLAVIYO_STRIPE_EVENTS,
  KLAVIYO_STRIPE_INSTALL_URL,
  isKlaviyoStripeWebhookUrl,
  klaviyoStripeWebhookUrl,
} from "../shared/klaviyo-stripe";
import { getKlaviyoAccount, klaviyoPublicKey } from "./klaviyo";
import { getStripe } from "./stripe";

export type KlaviyoStripeStatus = {
  shopEvents: true;
  configured: boolean;
  nativeWebhook: boolean;
  url: string | null;
  connectUrl: string;
  companyId: string;
};

function last4(secret: string | null | undefined): string | null {
  if (!secret) return null;
  return secret.slice(-4);
}

export async function resolveKlaviyoCompanyId(): Promise<string> {
  const fromEnv = klaviyoPublicKey();
  try {
    const account = await getKlaviyoAccount();
    if (account.ok && account.accountId) return account.accountId;
    if (account.ok && account.publicKey) return account.publicKey;
  } catch (err) {
    console.warn("[klaviyo-stripe] account ping failed", err);
  }
  if (fromEnv) return fromEnv;
  throw new Error("Set KLAVIYO_PUBLIC_API_KEY or KLAVIYO_PRIVATE_API_KEY");
}

export async function klaviyoStripeStatus(): Promise<KlaviyoStripeStatus> {
  const companyId = klaviyoPublicKey();
  const expected = companyId ? klaviyoStripeWebhookUrl(companyId) : null;
  const stripe = getStripe();
  if (!stripe) {
    return {
      shopEvents: true,
      configured: false,
      nativeWebhook: false,
      url: expected,
      connectUrl: KLAVIYO_STRIPE_INSTALL_URL,
      companyId,
    };
  }
  try {
    const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
    const found = hooks.data.find(
      (hook) => isKlaviyoStripeWebhookUrl(hook.url) && hook.status === "enabled",
    );
    return {
      shopEvents: true,
      configured: true,
      nativeWebhook: Boolean(found),
      url: found?.url || expected,
      connectUrl: KLAVIYO_STRIPE_INSTALL_URL,
      companyId,
    };
  } catch (err) {
    console.error("[klaviyo-stripe] list webhooks", err);
    return {
      shopEvents: true,
      configured: true,
      nativeWebhook: false,
      url: expected,
      connectUrl: KLAVIYO_STRIPE_INSTALL_URL,
      companyId,
    };
  }
}

export async function ensureKlaviyoStripeWebhook(opts?: {
  rotate?: boolean;
}): Promise<{
  id: string;
  url: string;
  created: boolean;
  secret: string | null;
  secretLast4: string | null;
  connectUrl: string;
}> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured");
  const companyId = await resolveKlaviyoCompanyId();
  const url = klaviyoStripeWebhookUrl(companyId);
  const events = [...KLAVIYO_STRIPE_EVENTS];
  const hooks = await stripe.webhookEndpoints.list({ limit: 100 });
  let existing = hooks.data.find((hook) => isKlaviyoStripeWebhookUrl(hook.url));
  if (opts?.rotate && existing) {
    await stripe.webhookEndpoints.del(existing.id);
    existing = undefined;
  }

  if (existing && existing.status === "enabled") {
    const missing = events.filter((event) => !existing.enabled_events.includes(event));
    const endpoint =
      missing.length || existing.url !== url
        ? await stripe.webhookEndpoints.update(existing.id, {
            url,
            enabled_events: events,
          })
        : existing;
    return {
      id: endpoint.id,
      url: endpoint.url,
      created: false,
      secret: null,
      secretLast4: null,
      connectUrl: KLAVIYO_STRIPE_INSTALL_URL,
    };
  }

  if (existing && existing.status !== "enabled") {
    const endpoint = await stripe.webhookEndpoints.update(existing.id, {
      disabled: false,
      url,
      enabled_events: events,
    });
    return {
      id: endpoint.id,
      url: endpoint.url,
      created: false,
      secret: null,
      secretLast4: null,
      connectUrl: KLAVIYO_STRIPE_INSTALL_URL,
    };
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url,
    enabled_events: events,
    description: "Klaviyo Stripe app (charges + invoices)",
  });
  return {
    id: endpoint.id,
    url: endpoint.url,
    created: true,
    secret: endpoint.secret || null,
    secretLast4: last4(endpoint.secret),
    connectUrl: KLAVIYO_STRIPE_INSTALL_URL,
  };
}
