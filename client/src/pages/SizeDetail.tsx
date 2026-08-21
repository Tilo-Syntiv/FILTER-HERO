import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Check,
  Crosshair,
  Layers,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wind,
} from "lucide-react";
import {
  FILTER_PRODUCT_GALLERY,
  FILTER_PRODUCT_IMAGE,
  MERV_TYPES,
  PACK_TIERS,
  findProductVariant,
  getFilterSize,
  mervTypesForDisplay,
  packTotal,
  unitPriceForQty,
  type MervRating,
  type Product,
} from "@shared/products";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
  buildSpeakableSchema,
  CHANGE_GUIDE_PATH,
  sizeSeo,
  type FaqItem,
} from "@shared/seo";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import FilterFinder from "@/components/FilterFinder";
import FaqSection from "@/components/FaqSection";
import LifeImage from "@/components/LifeImage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
import { BRAND_NAME } from "@/const";
import { brandsForSize } from "@shared/hvac-brands";
import BrandLogo from "@/components/BrandLogo";
import { LIFE } from "@/data/life-photos";
import { MERV_GUIDE } from "@/lib/merv-guide";
import {
  getPreferredMerv,
  getPowerPackQty,
  isPreferredMerv,
  setPreferredMerv,
  type PreferredMerv,
} from "@/lib/merv-pref";

type SizeDetailPageProps = {
  sizeSlug: string;
};

function CapturePips({ filled, accent }: { filled: number; accent: string }) {
  return (
    <div className="flex items-end gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="rounded-sm"
          style={{
            width: 6 + i * 2,
            height: 8 + i * 2,
            background: i < filled ? accent : "rgba(32, 56, 104, 0.14)",
          }}
        />
      ))}
    </div>
  );
}

export default function SizeDetailPage({ sizeSlug }: SizeDetailPageProps) {
  const decoded = decodeURIComponent(sizeSlug);
  const sizeMeta = getFilterSize(decoded);
  const { addItem } = useCart();

  const [mervKey, setMervKey] = useState<PreferredMerv>("8");
  const [qty, setQty] = useState(6);
  const [shot, setShot] = useState(0);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("merv");
    const next = isPreferredMerv(fromUrl) ? fromUrl : getPreferredMerv();
    if (next) setMervKey(next);
    const pack = getPowerPackQty();
    if (pack) setQty(pack);
  }, []);

  const pickMerv = (key: PreferredMerv) => {
    setMervKey(key);
    setPreferredMerv(key);
  };

  const selectedType = MERV_TYPES.find((t) => t.key === mervKey)!;
  const guide = MERV_GUIDE[mervKey];
  const variant: Product | undefined = findProductVariant(
    decoded,
    selectedType.merv as MervRating,
    selectedType.isCarbon,
  );

  const unitPrice = variant ? unitPriceForQty(variant.price, qty, variant) : 0;
  const total = variant ? packTotal(variant.price, qty, variant) : 0;
  const saveVsSingle =
    variant && qty > 1
      ? Math.max(0, Math.round((variant.price * qty - total) * 100) / 100)
      : 0;

  const handleAdd = () => {
    if (!variant || !variant.inStock) return;
    addItem(variant, qty);
    toast.success(`Added ${qty}× ${variant.size} (${selectedType.name})`);
  };

  const inCatalog = Boolean(sizeMeta);
  const matchingBrands = inCatalog ? brandsForSize(decoded) : [];

  const related = useMemo(() => {
    if (!sizeMeta) return [];
    return [0.5, 1, 2, 4, 5]
      .filter((d) => d !== sizeMeta.depth)
      .map((d) => `${sizeMeta.width}x${sizeMeta.length}x${d}`)
      .filter((slug) => getFilterSize(slug))
      .slice(0, 4);
  }, [sizeMeta]);

  const siteUrl = getSiteUrl();
  const seo = sizeSeo(siteUrl, sizeMeta ?? decoded);
  const sizeFaqs: FaqItem[] = useMemo(
    () => [
      {
        question: `Will a ${decoded} filter fit my HVAC system?`,
        category: "Fit",
        answer: sizeMeta
          ? `A ${decoded} filter is the nominal size. The actual dimensions are ${sizeMeta.actualWidth}×${sizeMeta.actualLength}×${sizeMeta.actualDepth} inches so it slides into a standard ${decoded} slot. Match the label on your current filter or measure the slot.`
          : `If ${decoded} matches the label on your current filter, request a quote and we will confirm fit and lead time for that custom size.`,
        action: { href: "/#finder", label: "Measure and confirm size" },
      },
      {
        question: `How often should I replace a ${decoded} air filter?`,
        category: "Replacement",
        answer:
          "Replace every 30–90 days depending on pets, allergies, dust, and how often your system runs. Higher MERV filters may load faster in dusty homes.",
        action: { href: CHANGE_GUIDE_PATH, label: "Get a change date" },
      },
      {
        question: `What MERV options are available for ${decoded}?`,
        category: "MERV",
        answer: inCatalog
          ? `${decoded} is available in MERV 8, MERV 11, MERV 13, and MERV 8 Carbon. Choose based on everyday dust, pets/allergies, high filtration needs, or odor control.`
          : "Once we confirm your custom size, we can quote MERV 8, 11, 13, or carbon options when available.",
        action: { href: "/#merv", label: "Compare MERV ratings" },
      },
    ],
    [decoded, sizeMeta, inCatalog],
  );

  const jsonLd = useMemo(() => {
    const crumbs = [
      { name: "Home", path: "/" },
      { name: "Sizes", path: "/sizes" },
      ...(sizeMeta
        ? [
            {
              name: `${sizeMeta.depth}" filters`,
              path: `/filters/${sizeMeta.depth}-inch`,
            },
          ]
        : []),
      { name: decoded, path: `/sizes/${encodeURIComponent(decoded)}` },
    ];
    const schemas: unknown[] = [
      buildBreadcrumbSchema(siteUrl, crumbs),
      buildFaqSchema(sizeFaqs),
      buildSpeakableSchema(siteUrl, [
        ".seo-answer",
        ".seo-speakable-q",
        ".seo-speakable-a",
      ]),
    ];
    if (sizeMeta && variant) {
      schemas.push(
        buildProductSchema(siteUrl, sizeMeta, {
          mervName: selectedType.name,
          price: unitPriceForQty(variant.price, 1, variant),
          description: `${decoded} ${selectedType.name} pleated HVAC air filter. ${selectedType.description}`,
        }),
      );
    }
    return schemas;
  }, [siteUrl, sizeMeta, decoded, sizeFaqs, variant, selectedType]);

  useSeo({
    ...seo,
    image: FILTER_PRODUCT_IMAGE,
    noindex: !inCatalog,
    jsonLd,
  });

  const specs = sizeMeta
    ? [
        {
          icon: Ruler,
          label: "Nominal size",
          value: `${sizeMeta.width} × ${sizeMeta.length} × ${sizeMeta.depth} in`,
        },
        {
          icon: Crosshair,
          label: "Actual size",
          value: `${sizeMeta.actualWidth} × ${sizeMeta.actualLength} × ${sizeMeta.actualDepth} in`,
        },
        { icon: ShieldCheck, label: "MERV", value: selectedType.name },
        { icon: Layers, label: "Filter type", value: "Pleated" },
        { icon: Wind, label: "Frame", value: "Rigid cardboard" },
        { icon: Truck, label: "Best for", value: "HVAC / furnace" },
      ]
    : [];

  return (
    <div className="product-page min-h-screen">
      <SiteHeader />

      <main>
        <div className="container py-8 md:py-12">
          <nav aria-label="Breadcrumb" className="text-sm text-ice/80 mb-5 break-words">
            <Link href="/" className="hover:text-white">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/sizes" className="hover:text-white">
              Sizes
            </Link>{" "}
            /{" "}
            {sizeMeta ? (
              <Link
                href={`/filters/${sizeMeta.depth}-inch`}
                className="hover:text-white"
              >
                {sizeMeta.depth}" filters
              </Link>
            ) : (
              "Custom"
            )}{" "}
            / <span className="text-white">{decoded}</span>
          </nav>

          {!inCatalog ? (
            <>
              <div className="product-deck product-deck-custom overflow-hidden">
                <LifeImage
                  photo={LIFE.installWall}
                  className="h-44 sm:h-56"
                  sizes="100vw"
                  priority
                />
                <div className="bg-white p-5 sm:p-8 text-foreground">
                  <span className="section-label !text-mesh">Odd size</span>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-3 break-words">
                    {decoded}
                  </h1>
                  <p className="text-muted-foreground mb-6 max-w-xl">
                    We don't list this exact size in the standard catalog yet.
                    Request a quote and we'll confirm pricing and lead time for
                    your dimensions.
                  </p>
                  <Button size="lg" className="hero-shop-btn w-full text-white sm:w-auto" asChild>
                    <Link href={`/custom-air-filters?size=${encodeURIComponent(decoded)}`}>
                      Request a quote for {decoded}
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mt-10 rounded-3xl bg-white p-4 sm:p-6 text-foreground">
                <FilterFinder showPopular compact />
              </div>
            </>
          ) : (
            <div
              className="product-deck"
              style={
                {
                  "--pdp-glow": selectedType.badgeColor,
                  "--pdp-accent": guide.accent,
                } as CSSProperties
              }
            >
              <div className="product-theater">
                <div className="product-theater-glow" aria-hidden />
                <div className="product-theater-mesh" aria-hidden />

                <div className="relative z-[1] flex flex-wrap items-center gap-2">
                  <span className="product-size-plaque">{decoded}</span>
                  <span
                    className="product-merv-chip"
                    style={{ backgroundColor: selectedType.badgeColor }}
                  >
                    {selectedType.name}
                  </span>
                </div>

                <div className="product-shot-wrap">
                  <img
                    src={FILTER_PRODUCT_GALLERY[shot].src}
                    alt={`${decoded} ${selectedType.name} — ${FILTER_PRODUCT_GALLERY[shot].alt}`}
                    className="product-shot"
                  />
                </div>

                <div className="product-thumbs" role="list">
                  {FILTER_PRODUCT_GALLERY.map((item, i) => (
                    <button
                      key={item.src}
                      type="button"
                      role="listitem"
                      className={cn("product-thumb", i === shot && "product-thumb-active")}
                      aria-label={item.alt}
                      aria-pressed={i === shot}
                      onClick={() => setShot(i)}
                    >
                      <img src={item.src} alt="" />
                    </button>
                  ))}
                </div>

                <ul className="product-trust">
                  <li>
                    <Crosshair className="h-4 w-4" /> Guaranteed fit
                  </li>
                  <li>
                    <Truck className="h-4 w-4" /> Free shipping
                  </li>
                  <li>
                    <ShieldCheck className="h-4 w-4" /> 30-day guarantee
                  </li>
                </ul>
              </div>

              <div className="product-buy">
                <h1 className="text-2xl sm:text-3xl md:text-[2.65rem] font-bold tracking-tight break-words text-deep">
                  {decoded} Air Filters
                </h1>
                <p className="seo-answer mt-3 mb-7 text-[0.95rem] leading-relaxed text-muted-foreground">
                  Buy {decoded} HVAC and furnace air filters from {BRAND_NAME}.
                  Choose MERV 8, 11, 13, or carbon and replace every 30–90 days
                  depending on use.{" "}
                  <Link
                    href="/how-often-to-change-air-filter"
                    className="font-semibold text-navy underline decoration-ice underline-offset-4 hover:text-hero"
                  >
                    Get a change date for your home
                  </Link>
                  .
                </p>

                <div className="mb-7">
                  <h2 className="section-label !text-mesh">1 · Choose MERV</h2>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {mervTypesForDisplay().map((t) => {
                      const active = t.key === mervKey;
                      const g = MERV_GUIDE[t.key];
                      const Icon = g.icon;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => pickMerv(t.key)}
                          aria-pressed={active}
                          className={cn("pdp-merv", active && "pdp-merv-active")}
                          style={{ "--merv-wash": t.badgeColor } as CSSProperties}
                        >
                          <span
                            className="pdp-merv-bar"
                            style={{ backgroundColor: t.badgeColor }}
                          >
                            {t.key === "carbon" ? "Carbon" : t.name}
                          </span>
                          <span className="pdp-merv-body">
                            <Icon className="h-4 w-4" style={{ color: t.badgeColor }} />
                            <span className="text-[0.72rem] font-bold leading-tight text-deep">
                              {t.shortLabel}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pdp-merv-note">
                    <CapturePips filled={guide.strength} accent={selectedType.badgeColor} />
                    <p>
                      <span className="font-semibold text-deep">{guide.bestFor}.</span>{" "}
                      {selectedType.description}. Catches {guide.catches.join(", ").toLowerCase()}.
                    </p>
                  </div>
                </div>

                <div className="mb-7">
                  <h2 className="section-label !text-mesh">2 · Select quantity</h2>
                  <div className="space-y-2">
                    {PACK_TIERS.map((tier) => {
                      if (!variant) return null;
                      const price = unitPriceForQty(variant.price, tier.minQty, variant);
                      const pct = Math.round((1 - price / variant.price) * 100);
                      const active = qty === tier.minQty;
                      const popular = tier.minQty === 6;
                      const best = tier.minQty === 12;
                      return (
                        <button
                          key={tier.minQty}
                          type="button"
                          onClick={() => setQty(tier.minQty)}
                          aria-pressed={active}
                          className={cn("pdp-pack", active && "pdp-pack-active")}
                        >
                          <span className={cn("pdp-pack-dot", active && "pdp-pack-dot-on")}>
                            {active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                          </span>
                          <span className="min-w-0 flex-1 text-left">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-deep">
                                {tier.label} {tier.minQty === 1 ? "filter" : "filters"}
                              </span>
                              {popular && <span className="pdp-pack-tag">Most popular</span>}
                              {best && <span className="pdp-pack-tag pdp-pack-tag-hero">Best value</span>}
                            </span>
                            {pct > 0 && (
                              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-navy/10">
                                <span
                                  className="block h-full rounded-full bg-navy"
                                  style={{ width: `${Math.min(100, pct)}%` }}
                                />
                              </span>
                            )}
                          </span>
                          <span className="flex flex-col items-end gap-1">
                            {pct > 0 && (
                              <span className="pdp-save">−{pct}%</span>
                            )}
                            <span className="text-sm font-extrabold text-deep">
                              ${price.toFixed(2)} <span className="text-xs font-bold text-muted-foreground">ea</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pdp-checkout">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
                        Pack total
                      </p>
                      <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-deep">
                        ${total.toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ${unitPrice.toFixed(2)} per filter
                        {saveVsSingle > 0 ? ` · save $${saveVsSingle.toFixed(2)} vs singles` : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="hero-shop-btn hero-shop-btn-glow w-full text-white"
                    disabled={!variant?.inStock}
                    onClick={handleAdd}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add {qty} to cart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {inCatalog && (
            <>
              <section className="mt-12 md:mt-16">
                <span className="section-label">The facts</span>
                <h2 className="mb-5 text-xl font-bold text-white md:text-2xl">
                  Specifications
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {specs.map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div key={spec.label} className="pdp-spec">
                        <Icon className="h-4 w-4 text-ice" />
                        <div>
                          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-ice/70">
                            {spec.label}
                          </p>
                          <p className="mt-0.5 font-bold tracking-tight text-white">
                            {spec.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { photo: LIFE.installWall, caption: "Drops into the slot" },
                  { photo: LIFE.filterCleanDirty, caption: "New vs. overdue" },
                  { photo: LIFE.girlDog, caption: "Air the house can feel" },
                ].map((tile) => (
                  <figure key={tile.caption} className="pdp-mosaic">
                    <LifeImage
                      photo={tile.photo}
                      className="h-40 sm:h-44"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <figcaption>{tile.caption}</figcaption>
                  </figure>
                ))}
              </div>

              {matchingBrands.length > 0 && (
                <div className="mt-10">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ice/80">
                    Fits these HVAC brands
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
                    {matchingBrands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brands/${b.slug}`}
                        className="brand-chip"
                      >
                        <BrandLogo
                          slug={b.slug}
                          name={b.name}
                          className="h-5 w-full max-w-[4rem]"
                        />
                        <span>{b.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ice/80">
                    Other thicknesses
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {related.map((slug) => (
                      <Link
                        key={slug}
                        href={`/sizes/${encodeURIComponent(slug)}`}
                        className="size-chip !py-2 !px-3 !text-xs"
                      >
                        {slug}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 rounded-3xl bg-white p-4 sm:p-6 text-foreground">
                <FilterFinder showPopular compact />
              </div>
            </>
          )}

          <FaqSection
            faqs={sizeFaqs}
            title={`${decoded} filter FAQ`}
            subtitle="Fit, replacement timing, and MERV choices for this size."
            tone="band"
          />
        </div>
      </main>

      {inCatalog && (
        <div className="pdp-sticky lg:hidden">
          <div>
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-ice/80">
              {qty} × {selectedType.name}
            </p>
            <p className="text-lg font-extrabold text-white">${total.toFixed(2)}</p>
          </div>
          <Button
            className="hero-shop-btn text-white"
            disabled={!variant?.inStock}
            onClick={handleAdd}
          >
            Add to cart
          </Button>
        </div>
      )}

      <footer className="site-footer pt-8">
        <div className="container text-sm">
          &copy; {new Date().getFullYear()} {BRAND_NAME}
        </div>
      </footer>

      <CartDrawer onRequestQuote={() => { window.location.href = "/#contact"; }} />
    </div>
  );
}
