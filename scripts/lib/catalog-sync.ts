import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import {
  catalogExternalId,
  catalogStripeProductId,
  sellableSheetProducts,
  unitPriceForQty,
  wholesaleSkuFor,
  type Product,
} from "../../shared/products.ts";
import {
  mappedStripeProductId,
  stripeKeyIsLive,
  writeStripeCatalogFile,
} from "../../shared/stripe-catalog.ts";
import { DEFAULT_SITE_URL } from "../../shared/seo.ts";
import { productTaxCode } from "../../shared/stripe-tax.ts";
import {
  buildKlaviyoCatalog,
  isKlaviyoEnabled,
  klaviyoApi,
  productImageUrl,
  productUrl,
} from "../../server/klaviyo.ts";
function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) return null;
  return new Stripe(key);
}

const CATALOG_ORIGIN = DEFAULT_SITE_URL;
const CATALOG_SOURCE = "filterhero-catalog";
const CHUNK = 100;

type Named = { id?: string; attributes?: Record<string, unknown> };
type Page<T> = { data?: T[]; links?: { next?: string | null } };
type CatalogJob = { id?: string; status: string; completed: number; failed: number; total: number };

export type StripeSyncResult = {
  skipped?: boolean;
  reason?: string;
  created: number;
  updated: number;
  archived: number;
  count: number;
  account?: string;
  livemode?: boolean;
  error?: string;
};

export type KlaviyoSyncResult = {
  skipped?: boolean;
  reason?: string;
  created: number;
  updated: number;
  deleted: number;
  count: number;
  jobs?: CatalogJob[];
  error?: string;
};

export type SupabaseSyncResult = {
  skipped?: boolean;
  reason?: string;
  upserted: number;
  deleted: number;
  count: number;
  error?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripeName(product: Product): string {
  return product.isCarbon
    ? `${product.size} MERV 8 Carbon`
    : `${product.size} MERV ${product.merv}`;
}

function qty1Cents(product: Product): number {
  return Math.round(unitPriceForQty(product.price, 1, product) * 100);
}

function productMetadata(product: Product): Record<string, string> {
  return {
    source: CATALOG_SOURCE,
    productId: String(product.id),
    size: product.size,
    merv: String(product.merv),
    carbon: product.isCarbon ? "1" : "0",
    wholesaleSku: wholesaleSkuFor(product.size, product.merv, Boolean(product.isCarbon)) || "",
  };
}

async function listManagedStripeProducts(stripe: Stripe): Promise<Stripe.Product[]> {
  const out: Stripe.Product[] = [];
  for await (const product of stripe.products.list({
    limit: 100,
    active: true,
    expand: ["data.default_price"],
  })) {
    if (isManagedStripeProduct(product)) out.push(product);
  }
  return out;
}

async function retrieveManagedProduct(
  stripe: Stripe,
  id: string,
): Promise<Stripe.Product | undefined> {
  try {
    const product = await stripe.products.retrieve(id, { expand: ["default_price"] });
    return isManagedStripeProduct(product) ? product : undefined;
  } catch {
    return undefined;
  }
}

function isManagedStripeProduct(product: Stripe.Product): boolean {
  return (
    product.metadata?.source === CATALOG_SOURCE ||
    product.id.startsWith("prod_fh_")
  );
}

function defaultPriceAmount(product: Stripe.Product): number | null {
  const price = product.default_price;
  if (!price || typeof price === "string") return null;
  return typeof price.unit_amount === "number" ? price.unit_amount : null;
}

function defaultPriceId(product: Stripe.Product): string | null {
  const price = product.default_price;
  if (!price) return null;
  return typeof price === "string" ? price : price.id;
}

async function ensureQty1Price(
  stripe: Stripe,
  productId: string,
  cents: number,
  existing?: Stripe.Product,
): Promise<void> {
  const lookupKey = `fh_${existing?.metadata?.productId || productId.replace(/^prod_fh_/, "")}_q1`;
  const currentAmount = existing ? defaultPriceAmount(existing) : null;
  const currentId = existing ? defaultPriceId(existing) : null;
  if (currentId && currentAmount === cents) {
    try {
      await stripe.prices.update(currentId, {
        lookup_key: lookupKey,
        transfer_lookup_key: true,
      });
    } catch {
      // lookup_key already on this price, or another price owns it
    }
    return;
  }
  const created = await stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: cents,
    tax_behavior: "exclusive",
    lookup_key: lookupKey,
    transfer_lookup_key: true,
  });
  await stripe.products.update(productId, { default_price: created.id });
  if (currentId && currentId !== created.id) {
    await stripe.prices.update(currentId, { active: false });
  }
}

async function createStripeProduct(
  stripe: Stripe,
  product: Product,
  taxCode: string,
): Promise<Stripe.Product> {
  const payload: Stripe.ProductCreateParams = {
    name: stripeName(product),
    description: product.description,
    images: [productImageUrl(product, CATALOG_ORIGIN)],
    url: productUrl(product, CATALOG_ORIGIN),
    tax_code: taxCode,
    shippable: true,
    type: "good",
    unit_label: "filter",
    metadata: productMetadata(product),
    default_price_data: {
      currency: "usd",
      unit_amount: qty1Cents(product),
      tax_behavior: "exclusive",
    },
    active: true,
  };
  try {
    return await stripe.products.create({
      ...payload,
      id: catalogStripeProductId(product.id),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/invalid.*id|already exists/i.test(message)) throw err;
    if (/already exists/i.test(message)) {
      return stripe.products.update(catalogStripeProductId(product.id), {
        name: payload.name,
        description: payload.description,
        images: payload.images,
        url: payload.url,
        tax_code: payload.tax_code,
        metadata: payload.metadata,
        active: true,
      });
    }
    return stripe.products.create(payload);
  }
}

export async function syncStripeCatalog(): Promise<StripeSyncResult> {
  const stripe = stripeClient();
  if (!stripe) {
    return {
      skipped: true,
      reason: "STRIPE_SECRET_KEY missing",
      created: 0,
      updated: 0,
      archived: 0,
      count: 0,
    };
  }

  const wanted = sellableSheetProducts();
  const taxCode = productTaxCode();
  const existing = await listManagedStripeProducts(stripe);
  const byProductId = new Map<number, Stripe.Product>();
  const byStripeId = new Map<string, Stripe.Product>();
  for (const row of existing) {
    byStripeId.set(row.id, row);
    const productId = Number(row.metadata?.productId || row.id.replace(/^prod_fh_/, ""));
    if (Number.isInteger(productId) && productId > 0) byProductId.set(productId, row);
  }

  let created = 0;
  let updated = 0;
  const keep = new Set<string>();

  for (const product of wanted) {
    const mapped = mappedStripeProductId(product.id, stripeKeyIsLive());
    const current =
      byProductId.get(product.id) ||
      byStripeId.get(catalogStripeProductId(product.id)) ||
      (mapped ? byStripeId.get(mapped) : undefined) ||
      (await retrieveManagedProduct(stripe, catalogStripeProductId(product.id))) ||
      (mapped ? await retrieveManagedProduct(stripe, mapped) : undefined);
    if (current) {
      await stripe.products.update(current.id, {
        name: stripeName(product),
        description: product.description,
        images: [productImageUrl(product, CATALOG_ORIGIN)],
        url: productUrl(product, CATALOG_ORIGIN),
        tax_code: taxCode,
        shippable: true,
        metadata: productMetadata(product),
        active: true,
      });
      await ensureQty1Price(stripe, current.id, qty1Cents(product), current);
      keep.add(current.id);
      byProductId.set(product.id, current);
      updated += 1;
    } else {
      const row = await createStripeProduct(stripe, product, taxCode);
      const priceId = typeof row.default_price === "string" ? row.default_price : row.default_price?.id;
      if (priceId) {
        try {
          await stripe.prices.update(priceId, {
            lookup_key: `fh_${product.id}_q1`,
            transfer_lookup_key: true,
          });
        } catch {
          // lookup_key already assigned
        }
      }
      keep.add(row.id);
      byProductId.set(product.id, row);
      created += 1;
    }
  }

  let archived = 0;
  for (const row of existing) {
    if (keep.has(row.id) || row.active === false) continue;
    await stripe.products.update(row.id, { active: false });
    archived += 1;
  }

  let accountId: string | null = null;
  try {
    const account = await stripe.accounts.retrieve();
    accountId = account.id;
  } catch {
    accountId = null;
  }
  const products: Record<string, string> = {};
  for (const product of wanted) {
    const row = byProductId.get(product.id);
    if (row) products[String(product.id)] = row.id;
  }
  writeStripeCatalogFile({
    syncedAt: new Date().toISOString(),
    account: accountId,
    livemode: stripeKeyIsLive(),
    count: Object.keys(products).length,
    products,
  });

  return {
    created,
    updated,
    archived,
    count: wanted.length,
    account: accountId || undefined,
    livemode: stripeKeyIsLive(),
  };
}

async function collectKlaviyo<T extends Named>(firstPath: string): Promise<T[]> {
  const out: T[] = [];
  let path: string | null = firstPath;
  let pages = 0;
  while (path && pages < 40) {
    let res: { ok: boolean; error?: string; data: Page<T> | null } = await klaviyoApi<Page<T>>(
      "GET",
      path,
    );
    if (!res.ok && /throttled/i.test(res.error || "")) {
      await sleep(1500);
      res = await klaviyoApi<Page<T>>("GET", path);
    }
    if (!res.ok || !res.data?.data) {
      if (res.error) throw new Error(res.error);
      break;
    }
    out.push(...res.data.data);
    const next: string | null | undefined = res.data.links?.next;
    path = next ? next.replace("https://a.klaviyo.com", "") : null;
    pages += 1;
  }
  return out;
}

async function snapshotJobs(path: string): Promise<CatalogJob[]> {
  const res = await klaviyoApi<{
    data?: Array<{
      id?: string;
      attributes?: {
        status?: string;
        completed_count?: number;
        failed_count?: number;
        total_count?: number;
      };
    }>;
  }>("GET", path);
  return (res.data?.data || []).map((row) => ({
    id: row.id,
    status: row.attributes?.status || "unknown",
    completed: row.attributes?.completed_count ?? 0,
    failed: row.attributes?.failed_count ?? 0,
    total: row.attributes?.total_count ?? 0,
  }));
}

async function waitForJobs(paths: string[], timeoutMs = 120000): Promise<CatalogJob[]> {
  const start = Date.now();
  let jobs: CatalogJob[] = [];
  while (Date.now() - start < timeoutMs) {
    jobs = (await Promise.all(paths.map(snapshotJobs))).flat();
    if (!jobs.some((job) => job.status === "processing")) return jobs;
    await sleep(4000);
  }
  return jobs;
}

const JOB_PATHS = [
  "/api/catalog-item-bulk-create-jobs",
  "/api/catalog-item-bulk-update-jobs",
  "/api/catalog-item-bulk-delete-jobs",
];

function chunk<T>(rows: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

function klaviyoItemId(externalId: string): string {
  return `$custom:::$default:::${externalId}`;
}

export async function syncKlaviyoCatalog(): Promise<KlaviyoSyncResult> {
  if (!isKlaviyoEnabled()) {
    return {
      skipped: true,
      reason: "KLAVIYO_PRIVATE_API_KEY missing",
      created: 0,
      updated: 0,
      deleted: 0,
      count: 0,
    };
  }

  await waitForJobs(JOB_PATHS, 30000);
  const catalog = buildKlaviyoCatalog(CATALOG_ORIGIN);
  const existing = await collectKlaviyo<Named>("/api/catalog-items?page[size]=100");
  const byExternal = new Map<string, string>();
  for (const row of existing) {
    const external =
      String(row.attributes?.external_id || "") ||
      String(row.id || "").split(":::").pop() ||
      "";
    if (external && row.id) byExternal.set(external, row.id);
  }

  const wantedIds = new Set(catalog.items.map((item) => item.id));
  const toCreate = catalog.items.filter((item) => !byExternal.has(item.id));
  const toUpdate = catalog.items.filter((item) => byExternal.has(item.id));
  const toDelete = [...byExternal.entries()]
    .filter(([external]) => !wantedIds.has(external))
    .map(([, id]) => id);

  const postJob = async (type: string, items: unknown) => {
    const res = await klaviyoApi("POST", `/api/${type}s`, {
      data: {
        type,
        attributes: { items: { data: items } },
      },
    });
    if (!res.ok) throw new Error(res.error || type);
  };

  try {
    for (const group of chunk(toCreate)) {
      await postJob(
        "catalog-item-bulk-create-job",
        group.map((item) => ({
          type: "catalog-item",
          attributes: {
            external_id: item.id,
            integration_type: "$custom",
            title: item.title,
            description: item.description,
            url: item.link,
            image_full_url: item.image_link,
            published: true,
            price: item.price,
          },
        })),
      );
      await waitForJobs(["/api/catalog-item-bulk-create-jobs"]);
    }
    for (const group of chunk(toUpdate)) {
      await postJob(
        "catalog-item-bulk-update-job",
        group.map((item) => ({
          type: "catalog-item",
          id: byExternal.get(item.id) || klaviyoItemId(item.id),
          attributes: {
            title: item.title,
            description: item.description,
            url: item.link,
            image_full_url: item.image_link,
            published: true,
            price: item.price,
          },
        })),
      );
      await waitForJobs(["/api/catalog-item-bulk-update-jobs"]);
    }
    for (const group of chunk(toDelete)) {
      await postJob(
        "catalog-item-bulk-delete-job",
        group.map((id) => ({ type: "catalog-item", id })),
      );
      await waitForJobs(["/api/catalog-item-bulk-delete-jobs"]);
    }
  } catch (err) {
    return {
      created: toCreate.length,
      updated: toUpdate.length,
      deleted: toDelete.length,
      count: existing.length,
      error: err instanceof Error ? err.message : String(err),
      jobs: await waitForJobs(JOB_PATHS, 1000),
    };
  }

  const after = await collectKlaviyo<Named>("/api/catalog-items?page[size]=100");
  return {
    created: toCreate.length,
    updated: toUpdate.length,
    deleted: toDelete.length,
    count: after.length,
    jobs: await waitForJobs(JOB_PATHS, 1000),
  };
}

export async function syncSupabaseCatalog(): Promise<SupabaseSyncResult> {
  const url = (process.env.SUPABASE_URL || "").trim();
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !service || service.includes("...")) {
    return {
      skipped: true,
      reason: "Supabase service role missing",
      upserted: 0,
      deleted: 0,
      count: 0,
    };
  }

  const db = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const wanted = sellableSheetProducts();
  const livemode = stripeKeyIsLive();
  const now = new Date().toISOString();
  const rows = wanted.map((product) => ({
    product_id: product.id,
    size: product.size,
    merv: product.merv,
    is_carbon: Boolean(product.isCarbon),
    name: product.isCarbon ? `${product.name} (Carbon)` : product.name,
    wholesale_sku:
      wholesaleSkuFor(product.size, product.merv, Boolean(product.isCarbon)) ||
      `${product.size}-M${product.merv}`,
    list_price: product.price,
    in_stock: product.inStock,
    stripe_product_id:
      mappedStripeProductId(product.id, livemode) || catalogStripeProductId(product.id),
    klaviyo_external_id: catalogExternalId(product.id),
    updated_at: now,
  }));

  const { error: upsertError } = await db.from("catalog_skus").upsert(rows, {
    onConflict: "product_id",
  });
  if (upsertError) {
    return {
      upserted: 0,
      deleted: 0,
      count: 0,
      error: upsertError.message,
    };
  }

  const { data: existing, error: readError } = await db
    .from("catalog_skus")
    .select("product_id");
  if (readError) {
    return { upserted: rows.length, deleted: 0, count: rows.length, error: readError.message };
  }

  const keep = new Set(wanted.map((product) => product.id));
  const extra = (existing || [])
    .map((row) => row.product_id as number)
    .filter((id) => !keep.has(id));
  if (extra.length) {
    const { error: deleteError } = await db.from("catalog_skus").delete().in("product_id", extra);
    if (deleteError) {
      return {
        upserted: rows.length,
        deleted: 0,
        count: rows.length,
        error: deleteError.message,
      };
    }
  }

  return { upserted: rows.length, deleted: extra.length, count: rows.length };
}
