import fs from "node:fs";
import { nanoid } from "nanoid";
import { z } from "zod";
import { resendSendsShopperReceipt } from "../shared/email-channels";
import { recordLeadInCrm } from "./crm/intake";
import { dataFile } from "./data-store";
import { syncContactToKlaviyo } from "./klaviyo";
import { sendContactReceipt, sendLeadAlert } from "./mailer";
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

export type StoredLead = ContactPayload & { id: string; createdAt: string };

export function listAllLeads(): StoredLead[] {
  ensureLeadsFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(LEADS_PATH, "utf-8")) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredLead[]) : [];
  } catch {
    return [];
  }
}

function appendLead(lead: StoredLead) {
  ensureLeadsFile();
  const leads = JSON.parse(fs.readFileSync(LEADS_PATH, "utf-8")) as unknown[];
  leads.push(lead);
  fs.writeFileSync(LEADS_PATH, JSON.stringify(leads, null, 2), "utf-8");
}

async function sendLeadEmail(lead: ContactPayload & { id: string }) {
  const staff = await sendLeadAlert(lead);
  if (resendSendsShopperReceipt(lead.intent)) {
    try {
      await sendContactReceipt(lead);
    } catch (err) {
      console.error("[contact] shopper receipt failed after save", err);
    }
  }
  return { emailed: staff.sent };
}

export async function submitContact(raw: unknown, ip?: string) {
  const parsed = contactSchema.parse(raw);
  if (isHoneypotTripped(parsed.website)) {
    return { ok: true as const, id: "ignored", emailed: false as const };
  }
  if (shouldEnforceTurnstile(parsed.intent)) {
    const human = await verifyTurnstile(parsed.turnstileToken || undefined, ip);
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
