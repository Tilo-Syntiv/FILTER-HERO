import "dotenv/config";
import Stripe from "stripe";

const EMAIL = `klaviyo.stripe.ok.${Date.now()}@mailinator.com`;

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) throw new Error("STRIPE_SECRET_KEY must be set");
  const stripe = new Stripe(key);

  const customer = await stripe.customers.create({
    email: EMAIL,
    name: "Klaviyo Stripe Check",
    metadata: { purpose: "klaviyo-stripe-check" },
  });

  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_visa" },
    billing_details: { email: EMAIL, name: "Klaviyo Stripe Check" },
  });
  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });

  const draft = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "charge_automatically",
    auto_advance: false,
    metadata: { purpose: "klaviyo-stripe-check" },
  });
  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: draft.id,
    amount: 1999,
    currency: "usd",
    description: "Klaviyo Stripe connection check",
  });
  const finalized = await stripe.invoices.finalizeInvoice(draft.id);
  const paid = finalized.status === "paid" ? finalized : await stripe.invoices.pay(finalized.id);

  console.log(
    JSON.stringify(
      {
        email: EMAIL,
        customerId: customer.id,
        invoiceId: paid.id,
        status: paid.status,
        paid: paid.status === "paid",
        amountPaid: paid.amount_paid,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
