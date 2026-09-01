/**
 * Stripe Tax product tax code for HVAC pleated filters (physical goods).
 * Canonical: GET /v1/tax_codes/txcd_99999999 — "General - Tangible Goods".
 * Confirm with a tax advisor if a narrower physical-goods code is required.
 * Override with STRIPE_TAX_CODE.
 */
export const TANGIBLE_GOODS_TAX_CODE = "txcd_99999999";

export function productTaxCode(): string {
  const override = process.env.STRIPE_TAX_CODE?.trim();
  return override || TANGIBLE_GOODS_TAX_CODE;
}
