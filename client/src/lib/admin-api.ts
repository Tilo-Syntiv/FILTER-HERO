import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared Supabase Auth client for staff (/admin) and shoppers (/login).
 *
 * Supabase is used for authentication only. CRM reads go through /api/crm/*,
 * customer reads through /api/account/*. The browser never queries Postgres,
 * which is why RLS is deny-by-default with no policies.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

export function authClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  client =
    url && anonKey
      ? createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce",
          },
        })
      : null;
  return client;
}

export function isAdminConfigured(): boolean {
  return Boolean(url && anonKey);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function accessToken(): Promise<string | null> {
  const supabase = authClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Shared by CRM and customer account. Same session, different API prefix. */
export async function authedFetch<T>(
  prefix: "/api/crm" | "/api/account",
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await accessToken();
  if (!token) throw new ApiError("Sign in required.", 401, "unauthenticated");

  const res = await fetch(`${prefix}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: T;
    error?: string;
    code?: string;
  };

  if (!res.ok || payload.ok === false) {
    throw new ApiError(
      payload.error || "Request failed.",
      res.status,
      payload.code,
    );
  }
  return payload.data as T;
}

export async function crmFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return authedFetch<T>("/api/crm", path, init);
}

// --- Shapes returned by the API --------------------------------------------

export type Stage = {
  id: string;
  label: string;
  display_order: number;
  closed_won: boolean;
  closed_lost: boolean;
};

export type Deal = {
  id: string;
  name: string;
  stage_id: string;
  contact_id: string | null;
  owner_id: string | null;
  amount: string | number | null;
  next_action_at: string | null;
  closed_at: string | null;
  lost_reason: string | null;
  source: string;
  lead_id: string | null;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};

export type Activity = {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  status: string | null;
  due_at: string | null;
  occurred_at: string;
};

export type DealDetail = {
  deal: Deal;
  contact: Contact | null;
  activities: Activity[];
};

export const listStages = () => crmFetch<Stage[]>("/stages");

export const listDeals = () => crmFetch<Deal[]>("/deals?limit=200");

export const getDealDetail = (id: string) => crmFetch<DealDetail>(`/deals/${id}`);

export const patchDeal = (id: string, patch: Record<string, unknown>) =>
  crmFetch<Deal>(`/deals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const addNote = (dealId: string, body: string) =>
  crmFetch<Activity>("/activities", {
    method: "POST",
    body: JSON.stringify({ type: "note", dealId, body }),
  });

// --- Display helpers --------------------------------------------------------

export function dealAmount(deal: Deal): number | null {
  if (deal.amount === null) return null;
  const value = typeof deal.amount === "string" ? Number(deal.amount) : deal.amount;
  return Number.isFinite(value) ? value : null;
}

export function formatMoney(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A deal is overdue when its next action has passed and it is still open.
 *  Closed deals have their next action cleared, so they never light up. */
export function isOverdue(deal: Deal): boolean {
  if (deal.closed_at || !deal.next_action_at) return false;
  return new Date(deal.next_action_at).getTime() < Date.now();
}

/** No next action on an open deal is how quotes went quiet in the first
 *  place, so the board calls it out rather than leaving the cell blank. */
export function isUnscheduled(deal: Deal): boolean {
  return !deal.closed_at && !deal.next_action_at;
}
