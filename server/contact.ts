import fs from "node:fs";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { z } from "zod";
import { BRAND_EMAIL, BRAND_NAME } from "../shared/const";
import { recordLeadInCrm } from "./crm/intake";
import { dataFile } from "./data-store";
import { syncContactToKlaviyo } from "./klaviyo";
import { isHoneypotTripped, shouldEnforceTurnstile, verifyTurnstile } from "./security";

const LEADS_PATH = dataFile("leads.json");

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  filterSize: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
  intent: z.enum(["quote", "support", "reminder"]).default("quote"),
  cartSummary: z.string().trim().max(4000).optional().or(z.literal("")),
  marketingConsent: z.boolean().optional(),
  cadence: z.record(z.string(), z.unknown()).optional(),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  turnstileToken: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ContactPayload = z.infer<typeof contactSchema>;

function ensureLeadsFile() {
  if (!fs.existsSync(LEADS_PATH)) fs.writeFileSync(LEADS_PATH, "[]", "utf-8");
}

function appendLead(lead: ContactPayload & { id: string; createdAt: string }) {
  ensureLeadsFile();
  const leads = JSON.parse(fs.readFileSync(LEADS_PATH, "utf-8")) as unknown[];
  leads.push(lead);
  fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2), "utf-8");
}

async function sendLeadEmail(lead: ContactPayload & { id: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO || BRAND_EMAIL;
  const from = process.env.RESEND_FROM || `${BRAND_NAME} <${BRAND_EMAIL}>`;

  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY not set — lead saved to leads.json only");
    return { emailed: false as const };
  }

  const resend = new Resend(apiKey);
  const intentLabel =
    lead.intent === "quote" ? "Quote" : lead.intent === "reminder" ? "Filter Reminder" : "Support";
  const subject = `[${BRAND_NAME}] ${intentLabel} — ${lead.name}`;
  const text = [
    `Lead ID: ${lead.id}`,
    `Intent: ${lead.intent}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "—"}`,
    `Filter size: ${lead.filterSize || "—"}`,
    `Cart: ${lead.cartSummary || "—"}`,
    "",
    lead.message,
  ].join("\n");

  const { error } = await resend.emails.send(
    {
      from,
      to: [to],
      replyTo: lead.email,
      subject,
      text,
    },
    { idempotencyKey: `lead-email/${lead.id}` },
  );
  if (error) {
    console.error("[contact] resend", error);
    return { emailed: false as const };
  }

  return { emailed: true as const };
}

export async function submitContact(raw: unknown) {
  const parsed = contactSchema.parse(raw);
  if (isHoneypotTripped(parsed.website)) {
    return { ok: true as const, id: "ignored", emailed: false as const };
  }
  if (shouldEnforceTurnstile(parsed.intent, parsed.turnstileToken || undefined)) {
    const human = await verifyTurnstile(parsed.turnstileToken || undefined);
    if (!human.ok) {
      throw new Error("Could not verify that form.");
    }
  }
  const { website: _website, turnstileToken: _turnstileToken, ...payload } = parsed;
  const lead = {
    ...payload,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  appendLead(lead);
  try {
    const crm = await recordLeadInCrm(lead);
    if (!crm.ok && !crm.skipped) {
      console.error("[contact] crm failed after save", crm.error);
    }
  } catch (err) {
    console.error("[contact] crm failed after save", err);
  }
  try {
    await syncContactToKlaviyo(lead);
  } catch (err) {
    console.error("[contact] klaviyo failed after save", err);
  }
  try {
    const emailResult = await sendLeadEmail(lead);
    return { ok: true as const, id: lead.id, ...emailResult };
  } catch (err) {
    console.error("[contact] email failed after save", err);
    return { ok: true as const, id: lead.id, emailed: false as const };
  }
}
