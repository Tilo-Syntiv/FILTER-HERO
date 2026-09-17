import { BRAND_EMAIL, BRAND_NAME, BRAND_TAGLINE } from "./const";
import { DEFAULT_SITE_URL } from "./seo";

/**
 * One Filter Hero kit for every mailbox. Stripe Branding, Klaviyo defaults,
 * and Resend transactional HTML all use these values.
 */
export const EMAIL_BRAND = {
  navy: "#203868",
  burgundy: "#7F2328",
  ice: "#8EB0D8",
  mesh: "#3A66A3",
  deep: "#141e30",
  canvas: "#f6f7f9",
  white: "#ffffff",
  muted: "#5b6475",
  logoPath: "/logo.png",
  logoWidth: 200,
  logoHeight: 141,
} as const;

export function emailOrigin(origin = DEFAULT_SITE_URL): string {
  return origin.replace(/\/$/, "");
}

export function emailLogoUrl(origin = DEFAULT_SITE_URL): string {
  return `${emailOrigin(origin)}${EMAIL_BRAND.logoPath}`;
}

export function emailFromAddress(): string {
  const env = (process.env.RESEND_FROM || "").trim();
  return env || `${BRAND_NAME} <${BRAND_EMAIL}>`;
}

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type BrandedEmailCta = {
  href: string;
  label: string;
};

export type BrandedEmailInput = {
  title: string;
  preview?: string;
  bodyHtml: string;
  cta?: BrandedEmailCta;
  footerNote: string;
  origin?: string;
};

/** Table-based Filter Hero shell. Logo on white, navy rule, burgundy CTA. */
export function renderBrandedEmail(input: BrandedEmailInput): string {
  const origin = emailOrigin(input.origin ?? DEFAULT_SITE_URL);
  const logo = emailLogoUrl(origin);
  const preview = input.preview ? escapeEmailHtml(input.preview) : "";
  const title = escapeEmailHtml(input.title);
  const cta = input.cta
    ? `<p style="margin:24px 0 0">
            <a href="${escapeEmailHtml(input.cta.href)}" style="display:inline-block;background:${EMAIL_BRAND.burgundy};color:${EMAIL_BRAND.white};padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;font-family:Arial,Helvetica,sans-serif">${escapeEmailHtml(input.cta.label)}</a>
          </p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;background:${EMAIL_BRAND.canvas};font-family:Arial,Helvetica,sans-serif;color:${EMAIL_BRAND.deep}">
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${preview}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:${EMAIL_BRAND.white};border-radius:12px;overflow:hidden">
        <tr><td align="center" style="background:${EMAIL_BRAND.white};padding:24px 28px 16px;border-bottom:4px solid ${EMAIL_BRAND.navy}">
          <a href="${origin}" style="text-decoration:none">
            <img src="${logo}" alt="${BRAND_NAME}" width="${EMAIL_BRAND.logoWidth}" height="${EMAIL_BRAND.logoHeight}" style="display:block;width:${EMAIL_BRAND.logoWidth}px;max-width:${EMAIL_BRAND.logoWidth}px;height:auto;border:0;outline:none" />
          </a>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 16px;font-size:22px;color:${EMAIL_BRAND.navy}">${title}</h1>
          ${input.bodyHtml}
          ${cta}
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:${EMAIL_BRAND.muted}">
        ${input.footerNote}
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function transactionalFooterNote(): string {
  return `${BRAND_NAME} · ${BRAND_TAGLINE}<br /><a href="${DEFAULT_SITE_URL}" style="color:${EMAIL_BRAND.navy};text-decoration:none">${DEFAULT_SITE_URL.replace("https://", "")}</a> · ${BRAND_EMAIL}`;
}
