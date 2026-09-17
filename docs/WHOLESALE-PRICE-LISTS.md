# Wholesale price lists

Shop catalog = Paul Sellaro’s Filter King contractor commerce sheet when `VITE_FULL_CATALOG=false` (default as of FH-216). That sheet is both the **product list** and the **wholesale cost source**. Set `VITE_FULL_CATALOG=true` to sell the archived Filter King size universe instead.

- **Written:** 2026-09-16
- **Wholesale:** `shared/pricing/fk-contractor-commerce.csv` (extract: `.firecrawl/fk-wholesale-contractor.txt`)
- **Filter King website:** `shared/pricing/fk-live-prices.json`, scraped 2026-08-20
- **Filter Hero website:** Shopper prices stay on the Filtrete / Filter King / FilterBuy undercut engine. This file is dealer cost, not storefront tickets.
- **Allowlist in code:** `shared/sellable-skus.json` (rebuild: `pnpm exec tsx scripts/build-sellable-skus.ts`)
- **Live copies:** `pnpm sync:catalog` writes the same 293 SKUs to Stripe, Klaviyo, and Supabase `catalog_skus`. Dealer cost stays out of those systems.
- **Shop switch:** `VITE_FULL_CATALOG` / `FULL_CATALOG` in `.env`. `false` sells this contractor list, including carbon rows. `true` sells every archived size × MERV. The size archive stays in `shared/filter-catalog.json` for finder and custom-quote routing.

Every wholesale price is **dollars per filter**.

## Coverage

| | Count |
| --- | ---: |
| Sheet line items | 314 |
| Unique size × MERV (this catalog) | 293 |
| Unique sizes | 153 |
| MERV 8 | 153 |
| MERV 11 | 64 |
| MERV 13 | 67 |
| Carbon / odor | 9 |

When Paul quotes a new size × MERV, add it to `shared/pricing/fk-contractor-commerce.csv` and run `pnpm exec tsx scripts/build-sellable-skus.ts`.

---

## List 1 — Contractor wholesale cost

What you pay Filter King on the contractor commerce sheet.

| Size | MERV | Wholesale SKU | Your cost |
| --- | --- | --- | ---: |
| 10x10x1 | 8 | AF10x10x1-M8 | $2.84 |
| 10x10x1 | 11 | AF10x10x1-M11 | $7.12 |
| 10x10x1 | 13 | AF10x10x1-M13 | $7.30 |
| 10x10x2 | 8 | AF10x10x2-M8 | $3.68 |
| 10x12x1 | 8 | AF10x12x1-M8 | $4.10 |
| 10x14x1 | 8 | AF10x14x1-M8 | $4.10 |
| 10x20x1 | 8 | AF10x20x1-M8 | $4.88 |
| 10x30x1 | 8 | AF10x30x1N-M8 | $3.92 |
| 10x30x1 | 13 | AF10x30x1N-M13 | $4.70 |
| 10x36x1 | 8 | AF10x36x1-M8 | $4.12 |
| 10x36x1 | 11 | AF10x36x1-M11 | $4.91 |
| 10x36x1 | 13 | AF10x36x1-M13 | $5.04 |
| 12x12x1 | 8 | AF12x12x1-M8 | $2.98 |
| 12x12x1 | 11 | AF12x12x1-M11 | $3.22 |
| 12x12x1 | 13 | AF12x12x1-M13 | $3.30 |
| 12x14x1 | 8 | AF12x14x1-M8 | $5.66 |
| 12x14x1 | 11 | AF12x14x1-M11 | $4.86 |
| 12x14x1 | 13 | AF12x14x1-M13 | $4.98 |
| 12x18x1 | 8 | AF12x18x1-M8 | $7.58 |
| 12x20x1 | 8 | AF12x20x1-M8 | $3.52 |
| 12x24x1 | 8 | AF12x24x1-M8 | $3.80 |
| 12x24x1 | 11 | AF12x24x1-M11 | $4.49 |
| 12x24x1 | 13 | AF12x24x1-M13 | $4.60 |
| 12x24x2 | 8 | AF12x24x2-M8 | $5.02 |
| 12x36x1 | 8 | AF12x36x1-M8 | $4.56 |
| 13x13x1 | 8 | AF13x13x1-M8 | $4.06 |
| 13x20x1 | 8 | AF13x20x1A-M8 | $4.54 |
| 13x21.5x1 | 8 | AF13x21.5x1A-M8 | $4.08 |
| 13x21x1 | 8 | AF13x21x1A-M8 | $3.74 |
| 13x25x1 | 8 | AF13x25x1-M8 | $6.18 |
| 14x14x1 | 8 | AF14x14x1-M8 | $3.40 |
| 14x14x1 | 11 | AF14x14x1-M11 | $3.59 |
| 14x14x1 | 13 | AF14x14x1-M13 | $3.68 |
| 14x14x2 | 8 | AF14x14x2-M8 | $5.96 |
| 14x16x1 | 8 | AF14x16x1-M8 | $4.42 |
| 14x18x1 | 8 | AF14x18x1-M8 | $3.66 |
| 14x18x2 | 8 | AF14x18x2-M8 | $7.24 |
| 14x20x1 | 8 | AF14x20x1-M8 | $3.80 |
| 14x20x1 | 11 | AF14x20x1-M11 | $4.39 |
| 14x20x1 | 13 | AF14x20x1-M13 | $4.50 |
| 14x20x2 | 8 | AF14x20x2-M8 | $5.94 |
| 14x21x1 | 8 | AF14x21x1-M8 | $4.38 |
| 14x22x1 | 8 | AF14x22x1-M8 | $3.96 |
| 14x24x1 | 8 | AF14x24x1-M8 | $3.96 |
| 14x24x1 | 11 | AF14x24x1-M11 | $4.76 |
| 14x25x1 | 8 | AF14x25x1-M8 | $4.38 |
| 14x25x2 | 8 | AF14x25x2-M8 | $4.76 |
| 14x30x1 | 8 | AF14x30x1-M8 | $4.84 |
| 14x30x1 | 11 | AF14x30x1-M11 | $5.81 |
| 14x30x1 | 13 | AF14x30x1-M13 | $5.96 |
| 15x15x1 | 8 | AF15x15x1A-M8 | $3.72 |
| 15x20x1 | 8 | AF15x20x1-M8 | $3.96 |
| 15x24x1 | 8 | AF15x24x1-M8 | $4.00 |
| 16x16x1 | 8 | AF16x16x1-M8 | $3.66 |
| 16x16x1 | 11 | AF16x16x1-M11 | $4.23 |
| 16x16x1 | 13 | AF16x16x1-M13 | $4.34 |
| 16x16x2 | 8 | AF16x16x2-M8 | $4.20 |
| 16x19x1 | 8 | AF16x19x1-M8 | $3.88 |
| 16x19x1 | 11 | AF16x19x1-M11 | $4.78 |
| 16x19x1 | 13 | AF16x19x1-M13 | $4.90 |
| 16x20x1 | 8 | AF16x20x1-M8 | $3.82 |
| 16x20x1 | 11 | AF16x20x1-M11 | $3.92 |
| 16x20x1 | 13 | AF16x20x1-M13 | $4.02 |
| 16x20x2 | 8 | AF16x20x2-M8 | $4.26 |
| 16x20x2 | 11 | AF16x20x2-M11 | $5.71 |
| 16x20x2 | 13 | AF16x20x2-M13 | $5.86 |
| 16x20x4 | 8 | AF16x20x4-M8 | $6.04 |
| 16x20x4 | 11 | AF16x20x4-M11 | $6.79 |
| 16x20x4 | 13 | AF16x20x4-M13 | $6.96 |
| 16x20x5 | 8 | AF16x20x5-CAR-M8 | $16.48 |
| 16x20x5 | 11 | AF16x20x5-CAR-M11 | $18.08 |
| 16x20x5 | 13 | AF16x20x5-CAR-M13 | $18.54 |
| 16x21x1 | 8 | AF16x21x1A-M8 | $4.04 |
| 16x22x1 | 8 | AF16x22x1A-M8 | $4.42 |
| 16x23x1 | 8 | AF16x23x1-M8 | $5.06 |
| 16x24x1 | 8 | AF16x24x1-M8 | $4.24 |
| 16x24x2 | 8 | AF16x24x2-M8 | $5.48 |
| 16x24x4 | 8 | AF16x24x4-M8 | $6.36 |
| 16x25x0.5 | 8 | AF16x25x0.5-M8 | $8.24 |
| 16x25x1 | 8 | AF16x25x1-M8 | $4.00 |
| 16x25x1 | 11 | AF16x25x1-M11 | $4.15 |
| 16x25x1 | 13 | AF16x25x1-M13 | $4.26 |
| 16x25x1 | Carbon | AF16x25x1-CO | $12.41 |
| 16x25x2 | 8 | AF16x25x2-M8 | $5.24 |
| 16x25x2 | 11 | AF16x25x2-M11 | $6.98 |
| 16x25x2 | 13 | AF16x25x2-M13 | $7.16 |
| 16x25x4 | 8 | AF16x25x4-M8 | $6.84 |
| 16x25x4 | 11 | AF16x25x4-M11 | $10.02 |
| 16x25x4 | 13 | AF16x25x4-M13 | $10.28 |
| 16x25x5 | 8 | AF16x25x5-HW-M8 | $11.82 |
| 16x25x5 | 13 | AF16X25X5-HW-M13 | $14.50 |
| 16x30x1 | 8 | AF16x30x1-M8 | $4.60 |
| 16x30x1 | 11 | AF16x30x1-M11 | $5.19 |
| 16x30x1 | 13 | AF16x30x1-M13 | $5.32 |
| 16x30x2 | 8 | AF16x30x2-M8 | $6.08 |
| 16x36x1 | 8 | AF16x36x1-M8 | $6.54 |
| 17.5x20x1 | 8 | AF17.5x20x1A-M8 | $9.00 |
| 17.5x21x1 | 8 | AF17.5x21x1A-M8 | $4.90 |
| 17.5x22x1 | 8 | AF17.5x22x1A-M8 | $4.70 |
| 17.5x22x1 | 11 | AF17.5x22x1A-M11 | $5.56 |
| 17.5x22x1 | 13 | AF17.5x22x1A-M13 | $5.70 |
| 17x10x2 | 8 | AF17x10x2-M8 | $6.18 |
| 17x17x1 | 8 | AF17x17x1A-M8 | $4.02 |
| 17x19x1 | 8 | AF17x19x1A-M8 | $9.06 |
| 17x20x1 | 8 | AF17x20x1-M8 | $4.08 |
| 17x21x1 | 8 | AF17x21x1A-M8 | $4.12 |
| 17x21x1 | 11 | AF17x21x1A-M11 | $4.93 |
| 17x21x1 | 13 | AF17x21x1A-M13 | $5.06 |
| 17x22x1 | 8 | AF17x22x1-M8 | $4.16 |
| 18x18x1 | 8 | AF18x18x1-M8 | $3.94 |
| 18x18x1 | 11 | AF18x18x1-M11 | $4.68 |
| 18x18x1 | 13 | AF18x18x1-M13 | $4.80 |
| 18x18x2 | 8 | AF18x18x2-M8 | $5.76 |
| 18x18x4 | 8 | AF18x18x4-M8 | $7.50 |
| 18x20x1 | 8 | AF18x20x1-M8 | $4.14 |
| 18x20x1 | 11 | AF18X20X1-M11 | $4.93 |
| 18x20x1 | 13 | AF18x20x1-M13 | $5.06 |
| 18x20x2 | 8 | AF18x20x2-M8 | $9.92 |
| 18x21x1 | 8 | AF18x21x1-M8 | $4.88 |
| 18x22x1 | 8 | AF18x22x1-M8 | $4.14 |
| 18x24x1 | 8 | AF18x24x1-M8 | $4.42 |
| 18x24x1 | 11 | AF18x24x1-M11 | $5.42 |
| 18x24x1 | 13 | AF18x24x1-M13 | $5.56 |
| 18x24x2 | 8 | AF18x24x2-M8 | $5.42 |
| 18x25x1 | 8 | AF18x25x1-M8 | $4.08 |
| 18x30x1 | 8 | AF18x30x1-M8 | $5.08 |
| 18x30x1 | 11 | AF18x30x1-M11 | $6.32 |
| 18x30x1 | 13 | AF18x30x1-M13 | $6.48 |
| 18x36x1 | 8 | AF18x36x1-M8 | $5.56 |
| 18x36x1 | 11 | AF18x36x1-M11 | $6.94 |
| 18x36x1 | 13 | AF18x36x1-M13 | $7.12 |
| 19.25x23.25x1 | 8 | AF19.25x23.25x1A-M8 | $4.62 |
| 19.5x21x1 | 8 | AF19.5x21x1A-M8 | $4.70 |
| 19.88x21.5x1 | 8 | AF19.88x21.5x1A-M8 | $4.66 |
| 19x19x1 | 8 | AF19x19x1A-M8 | $4.44 |
| 19x19x1 | 11 | AF19x19x1A-M11 | $5.23 |
| 19x19x1 | 13 | AF19x19x1A-M13 | $5.36 |
| 19x20x1 | 8 | AF19x20x1A-M8 | $4.52 |
| 19x20x5 | 8 | AF19x20x5-CAR-M8 | $16.48 |
| 19x20x5 | 11 | AF19x20x5-CAR-M11 | $24.10 |
| 19x20x5 | 13 | AF19x20x5-CAR-M13 | $24.72 |
| 19x21x1 | 8 | AF19x21x1-M8 | $4.38 |
| 19x22x1 | 8 | AF19x22x1A-M8 | $4.42 |
| 19x22x1 | 11 | AF19x22x1A-M11 | $5.30 |
| 19x22x1 | 13 | AF19x22x1A-M13 | $5.44 |
| 19x23x1 | 8 | AF19x23x1A-M8 | $4.66 |
| 19x23x1 | 11 | AF19x23x1A-M11 | $5.58 |
| 19x23x1 | 13 | AF19x23x1A-M13 | $5.72 |
| 19x25x1 | 8 | AF19x25x1-M8 | $5.02 |
| 19x26x1 | 8 | AF19x26x1-M8 | $5.42 |
| 19x27x1 | 8 | AF19x27x1A-M8 | $4.98 |
| 19x27x1 | 11 | AF19x27x1A-M11 | $6.03 |
| 19x27x1 | 13 | AF19x27x1A-M13 | $6.18 |
| 20x20x1 | 8 | AF20x20x1-M8 | $4.42 |
| 20x20x1 | 11 | AF20x20x1-M11 | $5.38 |
| 20x20x1 | 13 | AF20x20x1-M13 | $5.52 |
| 20x20x1 | Carbon | AF20x20x1-CO | $11.33 |
| 20x20x2 | 8 | AF20x20x2-M8 | $4.92 |
| 20x20x2 | 11 | AF20x20x2-M11 | $6.65 |
| 20x20x2 | 13 | AF20x20x2-M13 | $6.82 |
| 20x20x4 | 8 | AF20X20X4-M8 | $6.64 |
| 20x20x4 | 11 | AF20x20x4-M11 | $10.00 |
| 20x20x4 | 13 | AF20x20x4-M13 | $10.26 |
| 20x20x5 | 8 | AF20x20x5-HW-M8 | $14.40 |
| 20x20x5 | 13 | AF20X20X5-HW-M13 | $18.52 |
| 20x20x5 | Carbon | AF20X20X5-HW-CO | $20.37 |
| 20x21.5x1 | 8 | AF20x21.5x1A-M8 | $4.58 |
| 20x21x1 | 8 | AF20x21x1A-M8 | $4.88 |
| 20x21x1 | 11 | AF20x21x1A-M11 | $5.81 |
| 20x21x1 | 13 | AF20x21x1A-M13 | $5.96 |
| 20x22x1 | 8 | AF20x22x1-M8 | $4.58 |
| 20x22x2 | 8 | AF20x22x2-M8 | $5.10 |
| 20x23x1 | 8 | AF20x23x1-M8 | $4.82 |
| 20x23x1 | 11 | AF20x23x1-M11 | $5.97 |
| 20x23x1 | 13 | AF20x23x1-M13 | $6.12 |
| 20x24x1 | 8 | AF20x24x1-M8 | $4.76 |
| 20x24x1 | 11 | AF20x24x1-M11 | $5.97 |
| 20x24x1 | 13 | AF20x24x1-M13 | $6.12 |
| 20x24x2 | 8 | AF20x24x2-M8 | $5.42 |
| 20x24x2 | 11 | AF20x24x2-M11 | $7.94 |
| 20x24x2 | 13 | AF20x24x2-M13 | $8.14 |
| 20x24x4 | 8 | AF20x24x4-M8 | $6.08 |
| 20x25x1 | 8 | AF20x25x1-M8 | $4.82 |
| 20x25x1 | 11 | AF20x25x1-M11 | $6.05 |
| 20x25x1 | 13 | AF20x25x1-M13 | $6.20 |
| 20x25x1 | Carbon | AF20x25x1-CO | $15.36 |
| 20x25x2 | 8 | AF20x25x2-M8 | $5.64 |
| 20x25x2 | 11 | AF20x25x2-M11 | $7.84 |
| 20x25x2 | 13 | AF20x25x2-M13 | $8.04 |
| 20x25x2 | Carbon | AF20x25x2-CO | $11.33 |
| 20x25x4 | 8 | AF20x25x4-M8 | $7.40 |
| 20x25x4 | 11 | AF20x25x4-M11 | $11.82 |
| 20x25x4 | 13 | AF20x25x4-M13 | $12.12 |
| 20x25x4 | Carbon | AF20x25x4-CO | $13.60 |
| 20x25x5 | 8 | AF20X25X5-HW-M8 | $14.94 |
| 20x25x5 | 13 | AF20X25X5-HW-M13 | $20.50 |
| 20x26x1 | 8 | AF20x26x1A-M8 | $5.00 |
| 20x30x1 | 8 | AF20x30x1-M8 | $5.12 |
| 20x30x1 | 11 | AF20x30x1-M11 | $6.81 |
| 20x30x1 | 13 | AF20x30x1-M13 | $6.98 |
| 20x30x2 | 8 | AF20x30x2-M8 | $6.00 |
| 20x30x2 | 11 | AF20x30x2-M11 | $8.56 |
| 20x30x2 | 13 | AF20x30x2-M13 | $8.78 |
| 20x35x2 | 8 | AF20x35x2-M8 | $6.84 |
| 20x35x2 | 11 | AF20x35x2-M11 | $9.87 |
| 20x35x2 | 13 | AF20x35x2-M13 | $10.12 |
| 20x36x1 | 8 | AF20x36x1-M8 | $5.60 |
| 20x36x1 | 11 | AF20x36x1-M11 | $6.86 |
| 20x36x1 | 13 | AF20x36x1-M13 | $7.04 |
| 20x40x1 | 8 | AF20x40x1-M8 | $5.96 |
| 20x40x1 | 11 | AF20x40x1-M11 | $7.90 |
| 20x40x1 | 13 | AF20x40x1-M13 | $8.10 |
| 21.5x23.25x1 | 8 | AF21.5x23.25x1A-M8 | $5.24 |
| 21.5x24x1 | 8 | AF21.5x24x1A-M8 | $4.82 |
| 21x21x1 | 8 | AF21x21x1-M8 | $4.86 |
| 21x21x1 | 11 | AF21x21x1-M11 | $5.85 |
| 21x21x1 | 13 | AF21x21x1-M13 | $6.00 |
| 21x22x1 | 8 | AF21x22x1-M8 | $5.70 |
| 21x23x1 | 8 | AF21x23x1A-M8 | $5.02 |
| 21x23x1 | 11 | AF21x23x1A-M11 | $6.03 |
| 21x23x1 | 13 | AF21x23x1A-M13 | $6.18 |
| 21x24x1 | 8 | AF21x24x1A-M8 | $4.92 |
| 22x22x1 | 8 | AF22x22x1-M8 | $4.86 |
| 22x23.5x1 | 8 | AF22x23.5x1A-M8 | $5.96 |
| 22x23x1 | 8 | AF22x23x1A-M8 | $10.08 |
| 22x24x1 | 8 | AF22x24x1-M8 | $5.04 |
| 22x24x1 | 11 | AF22x24x1-M11 | $6.06 |
| 22x24x1 | 13 | AF22x24x1-M13 | $6.22 |
| 22x37x2 | 8 | AF22x37x2-M8 | $7.32 |
| 23x23x1 | 8 | AF23x23x1A-M8 | $5.38 |
| 24x24x1 | 8 | AF24x24x1-M8 | $5.38 |
| 24x24x1 | 11 | AF24x24x1-M11 | $8.33 |
| 24x24x1 | 13 | AF24x24x1-M13 | $8.54 |
| 24x24x2 | 8 | AF24x24x2N-M8 | $5.94 |
| 24x24x2 | 11 | AF24x24x2N-M11 | $8.81 |
| 24x24x2 | 13 | AF24x24x2N-M13 | $9.04 |
| 24x24x4 | 8 | AF24x24x4N-M8 | $8.42 |
| 24x24x4 | 11 | AF24x24x4N-M11 | $11.13 |
| 24x24x4 | 13 | AF24x24x4N-M13 | $11.42 |
| 24x30x0.5 | 8 | AF24x30x0.5-M8 | $5.42 |
| 24x30x0.5 | 11 | AF24x30x0.5-M11 | $6.84 |
| 24x30x0.5 | 13 | AF24x30x0.5-M13 | $7.02 |
| 24x30x1 | 8 | AF24x30x1-M8 | $5.56 |
| 24x30x1 | 11 | AF24x30x1-M11 | $7.37 |
| 24x30x1 | 13 | AF24x30x1-M13 | $7.56 |
| 24x30x2 | 8 | AF24x30x2-M8 | $6.64 |
| 24x36x1 | 8 | AF24x36x1-M8 | $6.16 |
| 24x36x1 | 11 | AF24x36x1-M11 | $8.35 |
| 24x36x1 | 13 | AF24x36x1-M13 | $8.56 |
| 24x40x1 | 8 | AF24X40X1-M8 | $7.14 |
| 24x40x1 | 11 | AF24X40X1-M11 | $9.75 |
| 24x40x1 | 13 | AF24X40X1-M13 | $10.00 |
| 25x25x1 | 8 | AF25x25x1-M8 | $5.26 |
| 25x25x2 | 8 | AF25x25x2-M8 | $6.34 |
| 25x25x2 | Carbon | AF25x25x2-CO | $6.80 |
| 25x30x1 | 8 | AF25X30x1-M8 | $5.66 |
| 25x30x1 | 11 | AF25x30x1-M11 | $7.53 |
| 25x30x1 | 13 | AF25X30x1-M13 | $7.72 |
| 25x32x1 | 8 | AF25x32x1-M8 | $5.88 |
| 25x32x1 | 11 | AF25x32x1-M11 | $7.94 |
| 25x32x1 | 13 | AF25x32x1-M13 | $8.14 |
| 25x32x1 | Carbon | AF25x32x1-CO | $8.54 |
| 25x37x4 | 8 | AF25x37x4A-M8 | $10.30 |
| 28x30x1 | 8 | AF28x30x1-M8 | $6.60 |
| 28x30x2 | 8 | AF28x30x2-M8 | $8.82 |
| 30x30x1 | 8 | AF30x30x1-M8 | $6.60 |
| 30x30x1 | 11 | AF30x30x1-M11 | $8.87 |
| 30x30x1 | 13 | AF30x30x1-M13 | $9.10 |
| 30x30x1 | Carbon | AF30x30x1-CO | $18.13 |
| 30x30x2 | 8 | AF30x30x2-M8 | $8.82 |
| 30x30x2 | 11 | AF30x30x2-M11 | $9.17 |
| 30x30x2 | 13 | AF30x30x2-M13 | $9.40 |
| 30x30x4 | 8 | AF30x30x4-M8 | $11.98 |
| 30x30x4 | 11 | AF30x30x4-M11 | $19.29 |
| 30x30x4 | 13 | AF30x30x4-M13 | $19.78 |
| 30x32x2 | 8 | AF30x32x2-M8 | $8.82 |
| 30x36x1 | 8 | AF30x36x1A-M8 | $8.20 |
| 30x36x1 | 11 | AF30x36x1A-M11 | $10.78 |
| 30x36x1 | 13 | AF30x36x1A-M13 | $11.06 |
| 30x36x2 | 8 | AF30x36x2-M8 | $12.34 |
| 6x14x1 | 8 | AF6x14x1-M8 | $6.38 |
| 6x30x1 | 8 | AF6x30x1-M8 | $5.12 |
| 8x12x1 | 8 | AF8x12x1-M8 | $6.44 |
| 8x14x1 | 8 | AF8x14x1A-M8 | $3.76 |
| 8x24x1 | 8 | AF8x24x1A-M8 | $3.14 |
| 8x24x1 | 11 | AF8x24x1A-M11 | $3.59 |
| 8x24x1 | 13 | AF8x24x1A-M13 | $3.68 |
| 8x30x1 | 8 | AF8x30x1-M8 | $3.82 |
| 8x8x1 | 8 | AF8x8x1A-M8 | $2.50 |
| 8x8x1 | 11 | AF8x8x1A-M11 | $2.73 |
| 8x8x1 | 13 | AF8x8x1A-M13 | $2.80 |
| 9x11.38x1 | 8 | AF9x11.38x1A-M8 | $3.10 |
| 9x11x1 | 8 | AF9x11x1A-M8 | $2.94 |
