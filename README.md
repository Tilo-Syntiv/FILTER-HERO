# Filter Hero

HVAC filter storefront: size finder, catalog, cart, Stripe Checkout, and quote/contact form.

## Stack

- React 19 + Vite 7 + Tailwind 4 + wouter
- Express API (checkout, webhook, contact, products)
- Stripe Checkout + optional Resend email for leads

## Setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env`:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `3001`) |
| `CLIENT_URL` | Frontend origin for Stripe redirects (`http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` / `sk_live_…`) — required for Checkout |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_…`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Same publishable key for the Vite client |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `CONTACT_TO` | Inbox for lead emails |
| `RESEND_API_KEY` | Optional — if unset, leads save to `server/data/leads.json` only |
| `RESEND_FROM` | Verified Resend from address |

## Develop

```bash
pnpm dev
```

- Client: http://localhost:3000 (proxies `/api` → API)
- API: http://localhost:3001

### Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Paste the webhook signing secret into `.env` as `STRIPE_WEBHOOK_SECRET`.

## Production

```bash
pnpm build
pnpm start
```

Serves the SPA and API from the Express server (`NODE_ENV=production`).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | API + Vite concurrently |
| `pnpm build` | Client + server bundle → `dist/` |
| `pnpm start` | Run production server |
| `pnpm check` | TypeScript check |
