import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import type { Session } from "@supabase/supabase-js";
import { authClient, isAdminConfigured } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import AdminLogin from "./Login";

/**
 * Wraps every /admin page: keeps the console out of search results, holds the
 * session, and renders the login screen instead of the page when signed out.
 *
 * The gate here is convenience, not security. The real check is `requireStaff`
 * on the server — a signed-in non-staff user sees this shell and then gets 403
 * from every request it makes.
 */
export default function AdminShell({
  title,
  children,
}: {
  title: string;
  children: (session: Session) => ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.title = `${title} · Filter Hero`;
    const meta =
      document.querySelector<HTMLMetaElement>('meta[name="robots"]') ??
      document.head.appendChild(
        Object.assign(document.createElement("meta"), { name: "robots" }),
      );
    const previous = meta.content;
    meta.content = "noindex, nofollow";
    return () => {
      meta.content = previous;
    };
  }, [title]);

  useEffect(() => {
    const supabase = authClient();
    if (!supabase) {
      setReady(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const boot = (async () => {
      // The email link lands on /admin?code=... . Exchange it before the first
      // render so the board does not flash the login form and lose the code.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) console.error("[admin] code exchange", error.message);
        window.history.replaceState({}, "", window.location.pathname);
      }
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setReady(true);
    })();
    void boot;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isAdminConfigured()) {
    return (
      <Frame title={title}>
        <p className="text-sm text-muted-foreground">
          Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>,
          then restart the dev server.
        </p>
      </Frame>
    );
  }

  if (!ready) {
    return (
      <Frame title={title}>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Frame>
    );
  }

  if (!session) return <AdminLogin />;

  return (
    <Frame
      title={title}
      right={
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {session.user.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void authClient()?.auth.signOut()}
          >
            Sign out
          </Button>
        </div>
      }
    >
      {children(session)}
    </Frame>
  );
}

function Frame({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-baseline gap-3">
            <Link
              href="/admin"
              className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary"
            >
              Filter Hero
            </Link>
            <h1 className="text-lg font-bold text-navy">{title}</h1>
          </div>
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
