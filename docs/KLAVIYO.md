# Filter Hero — live Klaviyo

This is the **Klaviyo account** integration. Shopper profiles, ecommerce metrics, marketing consent, and the catalog feed go to Klaviyo’s API. Flows, campaigns, and segments are built in the Klaviyo UI.

The in-house CDP write-up stays at [KLAVIYO-REPLICA-PLAN.md](./KLAVIYO-REPLICA-PLAN.md) for later. It is not what the app runs.

## Resend vs Klaviyo vs CRM (do not overlap)

Ownership is in `shared/email-channels.ts`. One shopper message, one sender.
The CRM is a staff board — it never sends and never writes a Klaviyo profile.

| Message | Sender | Not |
|---|---|---|
| Staff lead alert (quote / support / clock save) | Resend → `CONTACT_TO` | Klaviyo, CRM |
| Quote / support confirmation to the shopper | Resend | Klaviyo welcome or “we got your quote” flow, CRM |
| Filter Clock cadence save | **No shopper email** | Resend receipt, Klaviyo list, replenish (`next_change_date`), CRM deal |
| Order confirmation | Resend (branded HTML in `server/mailer.ts`) + Stripe payment receipt | Klaviyo “Order confirmed” / receipt flow, CRM |
| Welcome, abandoned checkout, install/review, replenish, win-back, campaigns | Klaviyo | `server/mailer.ts`, CRM |
| Quote follow-up board | CRM (staff only) | Resend, Klaviyo |

In the Klaviyo UI, **do not** add a flow that sends another order confirmation or quote receipt. Post-purchase should be install / review only. Replenish triggers on **Placed Order** only.

## Env

| Variable | Where |
|---|---|
| `KLAVIYO_PRIVATE_API_KEY` | Klaviyo → Settings → API keys → Private. Server only. |
| `KLAVIYO_PUBLIC_API_KEY` | Same page, six-character public / site ID. Loads `onsite.js`. |
| `KLAVIYO_LIST_ID` | Optional. Prefer `RiTKiS` (**Email List**). If empty, the API reuses that list (or **Filter Hero Marketing**). It does not create a second welcome list. |
| `KLAVIYO_DISABLE=1` | Scripts and local tests. |

Never put the private key in a `VITE_` variable.

## What the app sends

| Metric | Source | Notes |
|---|---|---|
| Active on Site | `onsite.js` | After the public key is set |
| Viewed Product / Viewed Size | Size page | Also `trackViewedItem` for recently viewed |
| Selected MERV | MERV chips | Profile + event |
| Added to Cart | Cart add | Needs an identified profile for abandon-from-cart |
| Started Checkout | `POST /api/checkout` | Requires the cart email field. Includes `CheckoutURL` |
| Checkout Expired | Stripe `checkout.session.expired` | People who typed an email on Stripe or in the drawer |
| Placed Order + Ordered Product | Stripe `checkout.session.completed` | Idempotent on session id. Sets `next_change_date` |
| Successfully Paid / Failed Payment / Refunded Payment / Issued Invoice | Native Klaviyo Stripe app | Charge + invoice webhooks. **Not** a second Placed Order |
| Requested Quote / Requested Support | Contact + custom quote | Subscribe only if the marketing box is checked |
| Signed Up Reminder | Filter Clock save | Profile properties only, date stored as `clock_next_change_date`. **No list subscribe. Does not set `next_change_date`.** |

Filter Clock does not enroll replenish. In Klaviyo, trigger replacement / restock flows on **Placed Order** only (FH-131).

## Native Stripe app

Filter Hero already sends **Placed Order** from `https://filterhero.net/api/stripe/webhook`. The native Klaviyo Stripe app is extra: refunds, failed charges, and invoices.

`pnpm setup:klaviyo-stripe` (or staff Settings → Klaviyo + Stripe → Connect) creates a second Stripe endpoint:

`https://a.klaviyo.com/api/webhook/integration/stripe?c=VnVNmQ`

Events: all `charge.*` and `invoice.*` from [Klaviyo’s Stripe guide](https://help.klaviyo.com/hc/en-us/articles/115005082267). Do **not** add Checkout session events there — those stay on the Filter Hero webhook.

After the endpoint exists, finish **Connect to Stripe** in Klaviyo (`https://www.klaviyo.com/integration/stripe`) on **FILTER HERO** (`acct_1U9bqlQEENEs0Qmw`, created Aug 28) — not **FILTER HERO sandbox**. Stripe Sandboxes cannot OAuth to live Klaviyo. Paste that same account’s signing secret into webhook verification.

Local `STRIPE_SECRET_KEY` is the sandbox account, so `pnpm setup:klaviyo-stripe` creates `we_1UGWbF790NnFGDLvIVtyg0bK` there. Klaviyo records charge/invoice metrics from the OAuth account only. The native test-mode destination on FILTER HERO is `we_1UGgz8QEENEs0QmwgI31tz6f` (`https://a.klaviyo.com/api/webhook/integration/stripe?c=VnVNmQ`). Integration status: **Enabled** (created Sep 17, 2026); signing secret filled; historical invoices/payments last synced Sep 17 2:38 AM; **Sync Stripe test data** on.

Do **not** trigger welcome, abandon, replenish, or a receipt from **Successfully Paid**.

## Brand (email defaults)

Klaviyo marketing mail uses the same Filter Hero kit as Stripe Branding and Resend (`shared/email-brand.ts`, [RESEND.md](./RESEND.md)). Live defaults (`VnVNmQ`): logo `6540539` (links to https://filterhero.net), primary button `6540565` Shop Now `#7F2328`, headings/links/footer navy `#203868`, body `#141E30`, canvas `#F6F7F9`, footer links ice `#8EB0D8`. New campaigns and flow emails should pull from **Media & brand** (`/brand-library`). Do not leave Klaviyo on Helvetica gray with `#0000ee` links.

Existing live flows were built before this kit. If a flow template still looks generic, restyle it from the brand library — do not invent a second order-confirmation template while doing that. Do **not** click **Save** on Klaviyo’s “Review your brand” wizard; it replaces these defaults with a generic theme.

## Catalog

JSON feed for a custom catalog in Klaviyo:

`https://filterhero.net/api/klaviyo/catalog.json`

Local: `http://localhost:3001/api/klaviyo/catalog.json`

## Live account (VnVNmQ)

Account **Filter Hero**. Public / site ID `VnVNmQ`. Marketing list is `RiTKiS` (Klaviyo name: **Email List**). From-address on draft flows: `info@filterhero.net`.

Brand library uses the shop lockup at `https://filterhero.net/logo.png`. Email defaults header is white with that logo; footer is navy `#203868`. Header links are `/sizes` and `/how-often-to-change-air-filter` — not `/shop` or `/measure`. CODE flow templates embed the same `/logo.png` — do not send ice wordmark text in place of the mark.

`pnpm setup:klaviyo` is idempotent and now upserts/deletes catalog items so the live custom catalog matches the contractor sheet (293 SKUs). `pnpm setup:klaviyo --templates-only` refreshes the library templates **and** remounts live send-email actions onto those copies (Klaviyo clones HTML on go-live; `PATCH /api/templates/{cloneId}` 404s, so do not patch clones directly). `pnpm sync:catalog` refreshes Stripe + Klaviyo + Supabase without touching flows. `pnpm inspect:klaviyo` prints the live objects.

### Flows (Live — sending domain `klv.filterhero.net` is active)

| Flow | Id | Trigger |
|---|---|---|
| FH Welcome | `UMtCJP` | Added to `RiTKiS` |
| FH Abandoned checkout | `SN8epW` | Started Checkout. Exits if Placed Order happens after entry |
| FH Post-purchase nurture | `WVmMG9` | Placed Order — install + review only, **not** a receipt |
| FH Replenish T-7 / T-2 / due | `WPU3gW` / `RZ2b2J` / `TaqZUA` | Profile date `next_change_date` |
| FH Win-back | `UkEkSf` | Segment **FH Lapsed 120** (`TfSLjM`) |

Do **not** add an order-confirmation or quote-receipt flow. Resend + Stripe already send those.

Mapped metrics: **Placed Order** → revenue (`TeVwgw`), **Ordered Product** → ordered_product, **Started Checkout** → started_checkout, **Added to Cart** → added_to_cart, **Viewed Product** → viewed_product, **Refunded Payment** → refunded_sales (`TvC7dY`). Leave **cancelled_sales** unmapped — Checkout Expired is not a cancelled sale. Do **not** map revenue to Successfully Paid.

### Sending domain

Klaviyo marketing uses **`klv.filterhero.net`**. Resend already uses `send.filterhero.net` for transactional mail — do not point `send` at Klaviyo.

Nameservers are Cloudflare (`ganz` / `marjory`). Records are in `docs/CLOUDFLARE-NAMESERVERS.md`. After Klaviyo shows the domain as verified, turn the Draft flows **Live**.

| Type | Host | Value |
|---|---|---|
| CNAME | `klv` | `3840918940202419532.klaviyodns.com` |
| CNAME | `mtd1._domainkey` | `mtd1._domainkey.3840918940202419532.klaviyodns.com` |
| CNAME | `mtd2._domainkey` | `mtd2._domainkey.3840918940202419532.klaviyodns.com` |
| TXT | `@` | `klaviyo-site-verification=VnVNmQ` |

Keep the existing Google SPF TXT on `@`. Add a second TXT for the Klaviyo site verification — do not replace SPF. Leave `send` / `rsend` / `resend._domainkey` for Resend.

## Recommended flows (Klaviyo UI)

The objects above are in the account, the sending domain is **active**, the seven Filter Hero flows are **Live**, and ecommerce metric mapping is set. Do **not** trigger replenish on Signed Up Reminder (FH-131).

## Health

- `GET /api/health` is a bare `{ ok: true }` liveness probe
- `GET /api/health/detail` includes `klaviyo: true|false` — **staff only** (FH-175)
- `GET /api/klaviyo/health` pings the account (no secrets) — **staff only**
- `GET /api/klaviyo/catalog.json` is the contractor-sheet catalog (293 SKUs)
- `pnpm sync:catalog` upserts that feed into the Klaviyo custom catalog (and Stripe / Supabase)
- `pnpm setup:klaviyo-stripe` creates Stripe’s charge/invoice webhook into the native Klaviyo Stripe app
- `pnpm verify:klaviyo` checks payloads and, when a private key is set, the live account
- `pnpm inspect:klaviyo` lists metrics, flows, templates, catalog, sending domain
