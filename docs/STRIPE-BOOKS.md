# Stripe + books (Filter Hero)

Checkout stays on Stripe. **Stripe Tax** calculates sales tax on the hosted payment page. QuickBooks Online is the ledger — it records the tax Stripe already collected. Do not move payment into QuickBooks or an ERP. Do not let QBO Automated Sales Tax recalculate the same sale.

Intuit Developer OAuth/OpenID URLs: [INTUIT-OAUTH-DISCOVERY.md](./INTUIT-OAUTH-DISCOVERY.md) (`pnpm verify:intuit-discovery`). OAuth error handling (expired tokens, `invalid_grant`, CSRF): [INTUIT-OAUTH.md](./INTUIT-OAUTH.md) (`pnpm verify:intuit-oauth`). That is for a QBO app, not a replacement for the Stripe Connector.

Sandbox account seen 2026-09-07: Checkout Sessions create. A Dashboard webhook to `https://filterhero.net/api/stripe/webhook` is required for fulfillment.

`automatic_tax` is **on** when Tax Settings `status` is `active` (head office set). Checkout does not force it while status is `pending` — that 400s the cart (FH-139). Stripe Tax only adds a tax line in jurisdictions with an **active registration**. No matching registration means $0 tax and no error.

## 1. Stripe Tax (checkout)

1. [Tax settings](https://dashboard.stripe.com/settings/tax): set a head office so status is `active`. Defaults stay exclusive + `txcd_99999999` (General - Tangible Goods).
2. [Tax registrations](https://dashboard.stripe.com/tax/registrations): add each state where you are **already** registered to collect. Adding a row in Stripe does not register you with the state.
3. Tax → Integrations automatic collection on invoices and Payment Links can stay off. Shop Checkout sets `automatic_tax` on the session.
4. Stripe bills a tax-calculation fee on completed live Checkouts and finalized invoices.

Catalog prices stay exclusive. The hosted Checkout page adds sales tax after the shopper enters a US shipping address in a registered state.

## 2. QuickBooks Online + Stripe (books)

1. Create QBO (Simple Start is enough).
2. Chart of accounts: **Stripe Clearing** (Bank), **Stripe fees** (Expense), **Sales tax payable** (Liability), **Filter sales** (Income), **Inventory / COGS**, **Filter King** (Accounts payable).
3. App store: **Stripe Connector by QuickBooks** (free). Connect the same Stripe account as `STRIPE_SECRET_KEY`.
4. Map: charges → Filter sales; **Stripe Tax line → Sales tax payable**; fees → Stripe fees; payouts → transfer Stripe Clearing → checking. If fees/payouts don’t match the bank, switch to [Acodei](https://www.acodei.com/) (~$12/mo).
5. Connect the **real bank** in QBO. Match Stripe payout deposits to Clearing transfers.

Checkout still creates a Stripe **Customer** and a Stripe **Invoice** on payment so the connector has someone to attach the sale to.

QBO cannot inject tax onto the Stripe-hosted payment page. Confirm the mapping with your bookkeeper so Sales tax payable matches what Stripe collected — do not apply Automated Sales Tax on top of that line.

## 3. Filter King bills (not Stripe)

Stripe never sees wholesale. In QBO: Supplier **Filter King LLC**, enter each dealer invoice as a Bill (AP). Pay it from checking. That is COGS / inventory — not a Checkout event.

## 4. What the app already does

| Piece | Where |
|---|---|
| Hosted Checkout | `server/stripe.ts` |
| US shipping + phone | Checkout Session |
| US shipping option (`txcd_92010001`) | Checkout Session `shipping_options` — labeled Shipping, not Free shipping |
| Stripe Tax | **On** when Tax Settings are `active`. Registrations in the Dashboard. |
| Customer + invoice on pay | `customer_creation`, `invoice_creation` |
| Order log for packing | `server/data/orders.json` (subtotal, tax, customer, invoice, payment intent) |
| Reuse Stripe Customer | Lookup by email before `checkout.sessions.create` |
| Production webhook | FILTER HERO **live** Dashboard → `https://filterhero.net/api/stripe/webhook` (`pnpm setup:stripe-webhook`). Sandbox and FILTER HERO test mode use `stripe listen` — they must not point at the live URL. |
| Klaviyo Stripe app | FILTER HERO Dashboard → `https://a.klaviyo.com/api/webhook/integration/stripe?c=VnVNmQ` (`pnpm setup:klaviyo-stripe`). Charge/invoice only. Connect **FILTER HERO** (`acct_1U9bqlQEENEs0Qmw`), never sandbox. Klaviyo (`VnVNmQ`) owns welcome / abandon / replenish / win-back email — Stripe only sends the payment receipt. |
| Product catalog | `pnpm sync:catalog` writes 293 contractor SKUs as Stripe Products (`prod_fh_{id}`). Checkout attaches those products and still uses `price_data` for pack-qty unit prices. |

Klaviyo / Resend / `orders.json` are not the ledger.
