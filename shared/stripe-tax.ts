/**
 * Catalog label only. Checkout does not enable Stripe Tax (paid per calculation).
 * Canonical: GET /v1/tax_codes/txcd_99999999 — "General - Tangible Goods".
 * Sales tax is QuickBooks Online. Override with STRIPE_TAX_CODE if needed later.
 */
export const TANGIBLE_GOODS_TAX_CODE = "txcd_99999999";

export function productTaxCode(): string {
  const override = process.env.STRIPE_TAX_CODE?.trim();
  return override || TANGIBLE_GOODS_TAX_CODE;
}
