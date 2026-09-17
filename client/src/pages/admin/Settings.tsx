import { useMemo, useState } from "react";
import AdminShell from "./AdminShell";
import { useAdminLoad } from "./use-admin-load";
import { AdminError, AdminLoading, AdminPanel, StatusDot } from "./ui";
import { Button } from "@/components/ui/button";
import {
  disconnectIntuit,
  getAdminSettings,
  startIntuitConnect,
} from "@/lib/admin-api";
import { staffMessageFor, type OauthErrorKind } from "@shared/intuit-oauth";

const OAUTH_KINDS = new Set<OauthErrorKind>([
  "expired_access_token",
  "expired_refresh_token",
  "invalid_grant",
  "csrf",
  "oauth_denied",
  "other",
]);

function intuitNotice(): { tone: "ok" | "error"; text: string } | null {
  const kind = new URLSearchParams(window.location.search).get("intuit");
  if (!kind) return null;
  if (kind === "connected") {
    return { tone: "ok", text: "QuickBooks is connected." };
  }
  if (OAUTH_KINDS.has(kind as OauthErrorKind)) {
    return { tone: "error", text: staffMessageFor(kind as OauthErrorKind) };
  }
  return { tone: "error", text: "QuickBooks could not complete that request." };
}

export default function AdminSettings() {
  return <AdminShell title="Settings">{() => <SettingsBody />}</AdminShell>;
}

function SettingsBody() {
  const { data, error, loading, reload } = useAdminLoad(getAdminSettings);
  const notice = useMemo(intuitNotice, []);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [copiedUri, setCopiedUri] = useState(false);

  if (loading) return <AdminLoading />;
  if (error) return <AdminError>{error}</AdminError>;
  if (!data) return null;

  const integrations = [
    ["Stripe secret", data.integrations.stripe],
    ["Stripe publishable", data.integrations.stripePublishable],
    ["Stripe webhook", data.integrations.stripeWebhook],
    ["Klaviyo private", data.integrations.klaviyoPrivate],
    ["Klaviyo public", data.integrations.klaviyoPublic],
    ["Klaviyo list", data.integrations.klaviyoList],
    ["Resend", data.integrations.resend],
    ["Supabase", data.integrations.supabase],
    ["Turnstile", data.integrations.turnstile],
    ["QuickBooks keys", data.integrations.intuit],
  ] as const;

  const connect = async () => {
    setBusy(true);
    setActionError("");
    try {
      const next = await startIntuitConnect();
      window.location.assign(next.url);
    } catch (err) {
      setBusy(false);
      setActionError(err instanceof Error ? err.message : "Could not start QuickBooks connect.");
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setActionError("");
    try {
      await disconnectIntuit();
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not disconnect QuickBooks.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {notice ? (
        <p
          className={
            notice.tone === "ok"
              ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-navy"
              : "rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive"
          }
        >
          {notice.text}
        </p>
      ) : null}
      {actionError ? (
        <p className="text-sm font-semibold text-destructive">{actionError}</p>
      ) : null}

      <AdminPanel title="Site">
        <dl className="space-y-2 text-sm">
          <Row label="Canonical URL" value={data.siteUrl} />
          <Row label="Client URL" value={data.clientUrl} />
          <Row
            label="Catalog"
            value={data.catalog.sellableOnly ? "Sellable sheet only" : "Full archive"}
          />
          <Row label="CRM kill switch" value={data.flags.crmDisable ? "CRM_DISABLE=1" : "Off"} />
          <Row
            label="Accounts kill switch"
            value={data.flags.accountDisable ? "ACCOUNT_DISABLE=1" : "Off"}
          />
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Env flags are read-only here. Change them in Railway / .env and restart.
          Homepage copy and featured sizes are under Content.
        </p>
      </AdminPanel>

      <AdminPanel
        title="QuickBooks Online"
        action={
          data.intuit.connected ? (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void disconnect()}>
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              className="text-white"
              disabled={busy || !data.intuit.configured}
              onClick={() => void connect()}
            >
              {data.intuit.needsReauthorize ? "Connect again" : "Connect"}
            </Button>
          )
        }
      >
        <div className="space-y-2 text-sm">
          <StatusDot ok={data.intuit.configured} label="Client ID and secret" />
          <StatusDot ok={data.intuit.connected} label="Connected company" />
          {data.intuit.environment ? (
            <p className="text-muted-foreground">
              Environment: {data.intuit.environment}
              {data.intuit.realmId ? ` · realm ${data.intuit.realmId}` : ""}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Set INTUIT_CLIENT_ID and INTUIT_CLIENT_SECRET to connect a company.
            </p>
          )}
          {data.intuit.redirectUri ? (
            <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3">
              <p className="font-medium text-navy">Redirect URI Intuit must list</p>
              <p className="text-xs text-muted-foreground">
                App dashboard → FILTER HERO → Keys &amp; OAuth →{" "}
                {data.intuit.environment === "production" ? "Production" : "Development"}{" "}
                → Redirect URIs → Add URI. Paste this exactly, then Save.
                {data.intuit.environment === "production"
                  ? " Localhost is not allowed on Production keys."
                  : " Production cannot use localhost."}
              </p>
              <code className="block break-all rounded-lg bg-white px-2 py-1.5 text-xs text-navy">
                {data.intuit.redirectUri}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(data.intuit.redirectUri || "").then(() => {
                    setCopiedUri(true);
                    window.setTimeout(() => setCopiedUri(false), 2000);
                  });
                }}
              >
                {copiedUri ? "Copied" : "Copy URI"}
              </Button>
            </div>
          ) : null}
          {data.intuit.needsReauthorize ? (
            <p className="font-semibold text-destructive">
              {staffMessageFor(
                data.intuit.lastError === "invalid_grant"
                  ? "invalid_grant"
                  : "expired_refresh_token",
              )}
            </p>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel title="Integrations">
        <div className="grid gap-2 sm:grid-cols-2">
          {integrations.map(([label, ok]) => (
            <StatusDot key={label} ok={Boolean(ok)} label={label} />
          ))}
        </div>
        {data.integrations.resendFrom ? (
          <p className="mt-3 text-sm text-muted-foreground">From {String(data.integrations.resendFrom)}</p>
        ) : null}
        {data.integrations.contactTo ? (
          <p className="text-sm text-muted-foreground">Lead alerts to {String(data.integrations.contactTo)}</p>
        ) : null}
      </AdminPanel>

      <AdminPanel title="External consoles">
        <ul className="space-y-2 text-sm">
          <li>
            <a className="font-semibold text-primary" href={data.links.stripe} target="_blank" rel="noreferrer">
              Stripe Dashboard
            </a>
          </li>
          <li>
            <a className="font-semibold text-primary" href={data.links.klaviyo} target="_blank" rel="noreferrer">
              Klaviyo
            </a>
          </li>
          <li>
            <a className="font-semibold text-primary" href={data.links.resend} target="_blank" rel="noreferrer">
              Resend
            </a>
          </li>
        </ul>
      </AdminPanel>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-navy">{value}</dd>
    </div>
  );
}
