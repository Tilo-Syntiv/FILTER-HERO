import "dotenv/config";
import { Resend } from "resend";
import { BRAND_EMAIL, BRAND_NAME } from "../shared/const.ts";

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(message);
}

function redactKey(value: string | undefined): string {
  if (!value) return "(unset)";
  if (value.startsWith("re_")) return "re_…set";
  return "(not a Resend key)";
}

type Json = Record<string, unknown>;

const apiKey = process.env.RESEND_API_KEY;
assert(apiKey && apiKey.startsWith("re_"), `RESEND_API_KEY missing or not a Resend key (${redactKey(apiKey)})`);

const from = process.env.RESEND_FROM || `${BRAND_NAME} <${BRAND_EMAIL}>`;
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
assert(to.toLowerCase().includes("@filterhero.net"), `CONTACT_TO should be a Filter Hero inbox, got ${to}`);

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
  console.log(`Domain filterhero.net: ${hero.status} / region ${hero.region ?? "n/a"}`);
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
const { data, error } = await resend.emails.send(
  {
    from,
    to: ["delivered@resend.dev"],
    subject: `[${BRAND_NAME}] Resend verify`,
    text: "Filter Hero Resend probe. Safe test address delivered@resend.dev.",
  },
  { idempotencyKey: probeId },
);

if (error) {
  throw new Error(`send failed: ${error.message}`);
}
assert(data?.id, "send returned no email id");
console.log(`Probe sent to delivered@resend.dev id=${data.id}`);
console.log("Resend checks passed.");
