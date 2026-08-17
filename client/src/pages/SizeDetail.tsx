import { useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Check, ShoppingCart } from "lucide-react";
import {
  MERV_TYPES,
  PACK_TIERS,
  findProductVariant,
  getFilterSize,
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
  sizeSeo,
  type FaqItem,
} from "@shared/seo";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import FilterFinder from "@/components/FilterFinder";
import FaqSection from "@/components/FaqSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
import { BRAND_NAME } from "@/const";
import { brandsForSize } from "@shared/hvac-brands";

type SizeDetailPageProps = {
  sizeSlug: string;
};

export default function SizeDetailPage({ sizeSlug }: SizeDetailPageProps) {
  const decoded = decodeURIComponent(sizeSlug);
  const sizeMeta = getFilterSize(decoded);
  const { addItem } = useCart();

  const [mervKey, setMervKey] = useState<"8" | "11" | "13" | "carbon">("8");
  const [qty, setQty] = useState(6);

  const selectedType = MERV_TYPES.find((t) => t.key === mervKey)!;
  const variant: Product | undefined = findProductVariant(
    decoded,
    selectedType.merv as MervRating,
    selectedType.isCarbon,
  );

  const unitPrice = variant ? unitPriceForQty(variant.price, qty, variant) : 0;
  const total = variant ? packTotal(variant.price, qty, variant) : 0;
  const savingsPct =
    variant && variant.price > 0
      ? Math.round((1 - unitPrice / variant.price) * 100)
      : 0;

  const handleAdd = () => {
    if (!variant || !variant.inStock) return;
    addItem(variant, qty);
    toast.success(`Added ${qty}× ${variant.size} (${selectedType.name})`);
  };

  const inCatalog = Boolean(sizeMeta);

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
        answer: sizeMeta
          ? `A ${decoded} filter is the nominal size. The actual dimensions are ${sizeMeta.actualWidth}×${sizeMeta.actualLength}×${sizeMeta.actualDepth} inches so it slides into a standard ${decoded} slot. Match the label on your current filter or measure the slot.`
          : `If ${decoded} matches the label on your current filter, request a quote and we will confirm fit and lead time for that custom size.`,
      },
      {
        question: `How often should I replace a ${decoded} air filter?`,
        answer:
          "Replace every 30–90 days depending on pets, allergies, dust, and how often your system runs. Higher MERV filters may load faster in dusty homes.",
      },
      {
        question: `What MERV options are available for ${decoded}?`,
        answer: inCatalog
          ? `${decoded} is available in MERV 8, MERV 11, MERV 13, and MERV 8 Carbon. Choose based on everyday dust, pets/allergies, high filtration needs, or odor control.`
          : "Once we confirm your custom size, we can quote MERV 8, 11, 13, or carbon options when available.",
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
    noindex: !inCatalog,
    jsonLd,
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4 break-words">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/sizes" className="hover:text-foreground">
            Sizes
          </Link>{" "}
          /{" "}
          {sizeMeta ? (
            <Link
              href={`/filters/${sizeMeta.depth}-inch`}
              className="hover:text-foreground"
            >
              {sizeMeta.depth}" filters
            </Link>
          ) : (
            "Custom"
          )}{" "}
          / <span className="text-foreground">{decoded}</span>
        </nav>

        {!inCatalog ? (
          <>
            <div className="max-w-xl rounded-xl border border-dashed border-primary/30 bg-white/80 p-5 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 break-words">{decoded}</h1>
              <p className="text-muted-foreground mb-6">
                We don't list this exact size in the standard catalog yet. Request a
                quote and we'll confirm pricing and lead time for your dimensions.
              </p>
              <Button size="lg" className="hero-shop-btn w-full text-white sm:w-auto" asChild>
                <Link href={`/custom-air-filters?size=${encodeURIComponent(decoded)}`}>
                  Request a quote for {decoded}
                </Link>
              </Button>
            </div>
            <div className="mt-12">
              <FilterFinder showPopular compact />
            </div>
          </>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Visual */}
            <div>
              <div className="relative rounded-3xl overflow-hidden bg-[linear-gradient(145deg,#141e30_0%,#203868_55%,#3a66a3_100%)] aspect-[4/3] flex flex-col items-center justify-center text-white p-5 sm:p-8">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background:
                      "radial-gradient(circle at 70% 30%, rgba(142,176,216,0.5), transparent 55%)",
                  }}
                />
                <div className="relative text-center">
                  <p className="text-xs uppercase tracking-[0.22em] text-ice/90 mb-4 font-semibold">
                    Filter Hero
                  </p>
                  <p className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight break-all">
                    {decoded}
                  </p>
                  <p className="mt-3 text-white/75 font-medium">{selectedType.name}</p>
                  {savingsPct > 0 && (
                    <Badge className="mt-6 bg-hero text-white hover:bg-hero border-0 font-bold">
                      Save {savingsPct}% per filter
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-5 leading-relaxed">
                Actual size: {sizeMeta!.actualWidth} × {sizeMeta!.actualLength} ×{" "}
                {sizeMeta!.actualDepth} inches — designed to fit standard{" "}
                {decoded} slots.
              </p>
            </div>

            {/* Buy box */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 tracking-tight break-words">
                {decoded} Air Filters
              </h1>
              <p className="seo-answer text-muted-foreground mb-10 leading-relaxed">
                Buy {decoded} HVAC and furnace air filters from {BRAND_NAME}.
                Choose MERV 8, 11, 13, or carbon and replace every 30–90
                days depending on use.{" "}
                <Link
                  href="/how-often-to-change-air-filter"
                  className="font-semibold text-primary hover:underline"
                >
                  Get a change date for your home
                </Link>
                .
              </p>

              <div className="mb-8">
                <h2 className="section-label">1 · Choose MERV</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {MERV_TYPES.map((t) => {
                    const active = t.key === mervKey;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setMervKey(t.key)}
                        className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                          active
                            ? "border-primary bg-primary/[0.06] ring-1 ring-primary/25"
                            : "border-border bg-white/60 hover:border-primary/35"
                        }`}
                      >
                        <p className="font-bold text-sm tracking-tight">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.shortLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  {selectedType.description}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="section-label">2 · Select quantity</h2>
                <div className="space-y-2">
                  {PACK_TIERS.map((tier) => {
                    if (!variant) return null;
                    const price = unitPriceForQty(variant.price, tier.minQty, variant);
                    const pct = Math.round((1 - price / variant.price) * 100);
                    const active = qty === tier.minQty;
                    return (
                      <button
                        key={tier.minQty}
                        type="button"
                        onClick={() => setQty(tier.minQty)}
                        className={`w-full flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 ${
                          active
                            ? "border-primary bg-primary/[0.06]"
                            : "border-border bg-white/60 hover:border-primary/35"
                        }`}
                      >
                        <span className="font-semibold">
                          {tier.label} {tier.minQty === 1 ? "filter" : "filters"}
                        </span>
                        <span className="flex items-center gap-3">
                          {pct > 0 && (
                            <span className="text-xs font-bold text-primary">
                              −{pct}%
                            </span>
                          )}
                          <span className="font-bold">${price.toFixed(2)} ea</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="surface-panel rounded-2xl p-6 mb-4">
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Pack total</p>
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight">${total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${unitPrice.toFixed(2)} per filter
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="hero-shop-btn w-full text-white"
                  disabled={!variant?.inStock}
                  onClick={handleAdd}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add {qty} to cart
                </Button>
                <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> Guaranteed fit
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> FREE SHIPPING
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> 30-day guarantee
                  </li>
                </ul>
              </div>

              {brandsForSize(decoded).length > 0 && (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Fits these HVAC brands
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brandsForSize(decoded).map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brands/${b.slug}`}
                        className="size-chip !py-2 !px-3 !text-xs"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
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
            </div>
          </div>
        )}

        {inCatalog && (
          <section className="mt-16 pt-12 border-t border-border">
            <span className="section-label">The facts</span>
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm max-w-2xl">
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <dt className="text-muted-foreground shrink-0">Nominal size</dt>
                <dd className="font-semibold text-right break-words">
                  {sizeMeta!.width} × {sizeMeta!.length} × {sizeMeta!.depth} in
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <dt className="text-muted-foreground shrink-0">Actual size</dt>
                <dd className="font-semibold text-right break-words">
                  {sizeMeta!.actualWidth} × {sizeMeta!.actualLength} ×{" "}
                  {sizeMeta!.actualDepth} in
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <dt className="text-muted-foreground shrink-0">MERV</dt>
                <dd className="font-semibold text-right break-words">{selectedType.name}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <dt className="text-muted-foreground shrink-0">Filter type</dt>
                <dd className="font-semibold text-right">Pleated</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <dt className="text-muted-foreground shrink-0">Frame</dt>
                <dd className="font-semibold text-right">Rigid cardboard</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-border py-2">
                <dt className="text-muted-foreground shrink-0">Best for</dt>
                <dd className="font-semibold text-right">HVAC / furnace</dd>
              </div>
            </dl>
          </section>
        )}

        <FaqSection
          faqs={sizeFaqs}
          title={`${decoded} filter FAQ`}
          subtitle="Fit, replacement timing, and MERV choices for this size."
        />
      </main>

      <footer className="site-footer pt-8 mt-12">
        <div className="container text-sm">
          &copy; {new Date().getFullYear()} {BRAND_NAME}
        </div>
      </footer>

      <CartDrawer onRequestQuote={() => { window.location.href = "/#contact"; }} />
    </div>
  );
}
