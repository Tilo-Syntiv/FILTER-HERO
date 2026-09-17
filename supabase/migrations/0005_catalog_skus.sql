-- FH-223: contractor catalog mirror for CRM / accounts.
-- Shop source of truth remains shared/sellable-skus.json.
-- This table is the Postgres copy staff SQL can query. No wholesale cost
-- column — Stripe and the CRM never see dealer cost.

create table if not exists catalog_skus (
  product_id integer primary key,
  size text not null,
  merv integer not null,
  is_carbon boolean not null default false,
  name text not null,
  wholesale_sku text not null,
  list_price numeric(10, 2) not null,
  in_stock boolean not null default true,
  stripe_product_id text,
  klaviyo_external_id text not null,
  updated_at timestamptz not null default now(),
  constraint catalog_skus_merv_check check (merv in (8, 11, 13))
);

create index if not exists catalog_skus_size_idx
  on catalog_skus (size, merv, is_carbon);

alter table catalog_skus enable row level security;
alter table catalog_skus force row level security;

revoke all on table catalog_skus from anon, authenticated, public;
