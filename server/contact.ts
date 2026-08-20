import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { z } from "zod";
import { BRAND_EMAIL, BRAND_NAME } from "../shared/const";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADS_PATH = path.resolve(__dirname, "data", "leads.json");

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  filterSize: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(4000),
  intent: z.enum(["quote", "support", "reminder"]).default("quote"),
  cartSummary: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ContactPayload = z.infer<typeof contactSchema>;

function ensureLeadsFile() {
  const dir = path.dirname(LEADS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
  const from =
    process.env.RESEND_FROM || `${BRAND_NAME} <onboarding@resend.dev>`;

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

  await resend.emails.send({
    from,
    to: [to],
    replyTo: lead.email,
    subject,
    text,
  });

  return { emailed: true as const };
}

export async function submitContact(raw: unknown) {
  const parsed = contactSchema.parse(raw);
  const lead = {
    ...parsed,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  };
  appendLead(lead);
  const emailResult = await sendLeadEmail(lead);
  return { ok: true as const, id: lead.id, ...emailResult };
}
