# Filter Hero — Resend

Resend sends **transactional** mail only. Marketing stays in Klaviyo. Stripe still sends the payment receipt. Ownership is in `shared/email-channels.ts`.

| Message | Sender |
|---|---|
| Staff lead alert (quote / support / Filter Clock) | Resend → `CONTACT_TO` (`info@filterhero.net`) |
| Quote / support confirmation to the shopper | Resend |
| Order confirmation | Resend (branded) |
| Payment receipt | Stripe |
| Welcome, abandon, replenish, win-back, campaigns | Klaviyo — not Resend |

Do **not** send welcome, abandon, replenish, or a second receipt from Resend. Filter Clock never emails the shopper.

## Brand kit

Same Filter Hero kit as Stripe Branding and Klaviyo email defaults, in `shared/email-brand.ts`:

| Token | Value |
|---|---|
| From | `Filter Hero <info@filterhero.net>` |
| Logo | `https://filterhero.net/logo.png` (shop lockup, 200×141) |
| Navy | `#203868` (header rule, headings, links) |
| Burgundy | `#7F2328` (CTA buttons) |
| Body / canvas | `#141E30` / `#F6F7F9` |
| Ice | `#8EB0D8` (footer accents only — never a text wordmark) |

HTML lives in `server/mailer.ts`. Do not send ice “Filter Hero” text in place of `/logo.png`. Do not send from `onboarding@resend.dev`.

## Env

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Server only. Sending key is enough. |
| `RESEND_FROM` | `Filter Hero <info@filterhero.net>` |
| `CONTACT_TO` | `info@filterhero.net` |

Sending domain is `filterhero.net` / `send.filterhero.net`. Klaviyo already uses `klv.filterhero.net` — do not point `send` at Klaviyo. Do not enable Resend receiving on `@` (that steals Google MX).

## Verify

`pnpm verify:resend` checks the From address, domain, branded HTML (logo + navy + burgundy), sends staff / quote / support / order templates to `delivered@resend.dev`, then runs `submitContact` (honeypot, quote, Filter Clock) with CRM, Klaviyo, and Turnstile off. It also fires a signed `checkout.session.completed` payload twice: first with Resend off (order saved, no stamp), then with Resend on (`confirmationSentAt` lands), then a third time (stamp unchanged).
