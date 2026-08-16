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

  const unitPrice = variant ? unitPriceForQty(variant.price, qty) : 0;
  const total = variant ? packTotal(variant.price, qty) : 0;
  const savingsPct =
    variant && variant.price > 0
      ? Math.round((1 - unitPrice / variant.price) * 100)
      : 0;

  const handleAdd = () => {
    if (!variant || !variant.inStock) return;
    addItem(variant, qty, unitPrice);
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
    ];
    if (sizeMeta && variant) {
      schemas.push(
        buildProductSchema(siteUrl, sizeMeta, {
          mervName: selectedType.name,
          price: unitPriceForQty(variant.price, 1),
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
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
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
          <div className="max-w-xl rounded-xl border border-dashed border-primary/30 bg-white/80 p-8">
            <h1 className="text-3xl font-bold mb-3">{decoded}</h1>
            <p className="text-muted-foreground mb-6">
              We don't list this exact size in the standard catalog yet. Request a
              quote and we'll confirm pricing and lead time for your dimensions.
            </p>
            <Button size="lg" asChild>
              <a href={`/#contact`}>Request a quote for {decoded}</a>
            </Button>
            <div className="mt-12">
              <FilterFinder showPopular compact />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
            {/* Visual */}
            <div>
              <div className="relative rounded-3xl overflow-hidden bg-[linear-gradient(145deg,#141e30_0%,#203868_55%,#3a66a3_100%)] aspect-[4/3] flex flex-col items-center justify-center text-white p-8">
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
                  <p className="text-4xl md:text-6xl font-bold tracking-tight">
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
              <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">
                {decoded} Air Filters
              </h1>
              <p className="seo-answer text-muted-foreground mb-10 leading-relaxed">
                Buy {decoded} HVAC and furnace air filters from {BRAND_NAME}.
                Choose MERV 8, 11, 13, or carbon and replace every 30–90
                days depending on use.
              </p>

              <div className="mb-8">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  1 · Choose quality
                </h2>
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
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  2 · Select quantity
                </h2>
                <div className="space-y-2">
                  {PACK_TIERS.map((tier) => {
                    if (!variant) return null;
                    const price = unitPriceForQty(variant.price, tier.minQty);
                    const pct = Math.round((1 - price / variant.price) * 100);
                    const active = qty === tier.minQty;
                    return (
                      <button
                        key={tier.minQty}
                        type="button"
                        onClick={() => setQty(tier.minQty)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 ${
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
                    <p className="text-4xl font-bold tracking-tight">${total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${unitPrice.toFixed(2)} per filter
                    </p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full"
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
                    <Check className="h-4 w-4 text-primary" /> Free shipping over $50
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> 30-day guarantee
                  </li>
                </ul>
              </div>

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
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm max-w-2xl">
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">Nominal size</dt>
                <dd className="font-semibold">
                  {sizeMeta!.width} × {sizeMeta!.length} × {sizeMeta!.depth} in
                </dd>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">Actual size</dt>
                <dd className="font-semibold">
                  {sizeMeta!.actualWidth} × {sizeMeta!.actualLength} ×{" "}
                  {sizeMeta!.actualDepth} in
                </dd>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">MERV</dt>
                <dd className="font-semibold">{selectedType.name}</dd>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">Filter type</dt>
                <dd className="font-semibold">Pleated</dd>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">Frame</dt>
                <dd className="font-semibold">Rigid cardboard</dd>
              </div>
              <div className="flex justify-between border-b border-border py-2">
                <dt className="text-muted-foreground">Best for</dt>
                <dd className="font-semibold">HVAC / furnace</dd>
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

      <footer className="border-t border-border bg-deep text-white/80 py-8 mt-12">
        <div className="container text-sm">
          &copy; {new Date().getFullYear()} {BRAND_NAME}
        </div>
      </footer>

      <CartDrawer onRequestQuote={() => { window.location.href = "/#contact"; }} />
    </div>
  );
}
