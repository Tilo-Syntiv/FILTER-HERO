# Stripe + books (Filter Hero)

Checkout stays on Stripe. Books sit next to it. Do not move payment into QuickBooks or an ERP.

Sandbox account seen 2026-09-01: Tax Settings `status=pending` (missing `head_office`), **zero** tax registrations.

`automatic_tax` is **off** until Tax Settings are `active`. Stripe returns 400 (`You must have a valid head office address`) if we enable it earlier — that blocks Checkout entirely. After you set a head office, the next session turns tax on automatically. Without a registration, tax still calculates **$0**.

## 1. Stripe Tax (Dashboard)

You must do this. The API will not invent a legal address or nexus.

1. [Tax settings](https://dashboard.stripe.com/settings/tax) — set the **head office** (legal business address).
2. [Tax registrations](https://dashboard.stripe.com/tax/registrations) — add a registration only for jurisdictions a tax advisor says you already collect in. Adding a row in Stripe does **not** register you with the state.
3. Optional: [Register for me](https://dashboard.stripe.com/tax/registrations) (US remote sellers, eligibility required).
4. Repeat head office + registrations in **live** mode before the first real charge. Sandbox registrations do not copy.

Product code in Checkout is `txcd_99999999` (General - Tangible Goods). Catalog prices are **exclusive**; tax is added on the Stripe page.

Verify: `pnpm exec tsx scripts/verify-stripe-books.ts`  
Then a test Checkout to a registered state — tax line > $0. Retrieve the session with `expand[]=line_items.data.taxes` if it is still $0.

## 2. QuickBooks Online + Stripe

1. Create QBO (Simple Start is enough).
2. Chart of accounts: **Stripe Clearing** (Bank), **Stripe fees** (Expense), **Sales tax payable** (Liability), **Filter sales** (Income), **Inventory / COGS**, **Filter King** (Accounts payable).
3. App store: **Stripe Connector by QuickBooks** (free). Connect the same Stripe account as `STRIPE_SECRET_KEY`.
4. Map: charges → Filter sales; fees → Stripe fees; payouts → transfer Stripe Clearing → checking. If fees/payouts don’t match the bank, switch to [Acodei](https://www.acodei.com/) (~$12/mo).
5. Connect the **real bank** in QBO. Match Stripe payout deposits to Clearing transfers.

Checkout now always creates a Stripe **Customer** and a Stripe **Invoice** on payment so the connector has someone to attach the sale to.

## 3. Filter King bills (not Stripe)

Stripe never sees wholesale. In QBO: Supplier **Filter King LLC**, enter each dealer invoice as a Bill (AP). Pay it from checking. That is COGS / inventory — not a Checkout event.

## 4. What the app already does

| Piece | Where |
|---|---|
| Hosted Checkout | `server/stripe.ts` |
| US shipping + phone | Checkout Session |
| Stripe Tax | `automatic_tax` only when Tax Settings are `active` |
| Customer + invoice on pay | `customer_creation`, `invoice_creation` |
| Order log for packing | `server/data/orders.json` (subtotal, tax, customer, invoice, payment intent) |

Klaviyo / Resend / `orders.json` are not the ledger.
