/**
 * Klaviyo.js follows the page scheme. On http://localhost it posts to
 * http://a.klaviyo.com, which 301s to HTTPS. Chrome then blocks the
 * preflight ("Redirect is not allowed for a preflight request").
 * Upgrade those client URLs before the request leaves the browser.
 */
export function httpsKlaviyoClientUrl(url: string): string {
  if (!/^http:\/\//i.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (!/(^|\.)klaviyo\.com$/i.test(parsed.hostname)) return url;
    parsed.protocol = "https:";
    return parsed.toString();
  } catch {
    return url;
  }
}
