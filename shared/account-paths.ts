/** Same-origin post-login path. Reject protocol-relative, absolute, and staff/API URLs. */
export function safeNextPath(raw: string | null | undefined): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return "/account";
  }
  if (raw.startsWith("/admin") || raw.startsWith("/api")) return "/account";
  return raw;
}
