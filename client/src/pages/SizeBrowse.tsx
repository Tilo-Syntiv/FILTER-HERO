import { useMemo } from "react";
import { Link } from "wouter";
import { THICKNESSES, getSizesByThickness, type FilterSize } from "@shared/products";
import {
  allSizesSeo,
  buildBreadcrumbSchema,
  buildItemListSchema,
  thicknessSeo,
} from "@shared/seo";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
import { BRAND_NAME } from "@/const";

function SizeChip({ size }: { size: FilterSize }) {
  return (
    <Link
      href={`/sizes/${encodeURIComponent(size.slug)}`}
      className="size-chip"
    >
      {size.slug}
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-deep text-white/80 py-8 mt-12">
      <div className="container flex flex-col sm:flex-row justify-between gap-4 text-sm">
        <p>&copy; {new Date().getFullYear()} {BRAND_NAME}</p>
        <Link href="/" className="hover:text-ice">
          Home
        </Link>
      </div>
    </footer>
  );
}

export function AllSizesPage() {
  const siteUrl = getSiteUrl();
  const seo = allSizesSeo(siteUrl);
  const allSizes = useMemo(
    () => THICKNESSES.flatMap((d) => getSizesByThickness(d)),
    [],
  );
  const jsonLd = useMemo(
    () => [
      buildBreadcrumbSchema(siteUrl, [
        { name: "Home", path: "/" },
        { name: "All sizes", path: "/sizes" },
      ]),
      buildItemListSchema(siteUrl, "All HVAC air filter sizes", "/sizes", allSizes),
    ],
    [siteUrl, allSizes],
  );
  useSeo({ ...seo, jsonLd });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">All filter sizes</h1>
        <p className="seo-answer text-muted-foreground mb-10 max-w-2xl">
          Browse every {BRAND_NAME} HVAC size by thickness. Pick your
          exact Width × Length × Depth, then choose MERV quality and pack quantity
          on the next page.
        </p>

        {THICKNESSES.map((depth) => {
          const sizes = getSizesByThickness(depth);
          if (sizes.length === 0) return null;
          return (
            <section key={depth} className="mb-12" aria-labelledby={`depth-${depth}`}>
              <div className="flex items-end justify-between mb-4 gap-4">
                <h2 id={`depth-${depth}`} className="text-xl md:text-2xl font-bold">
                  {depth}" filters
                </h2>
                <Link
                  href={`/filters/${depth}-inch`}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  View hub
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {sizes.map((s) => (
                  <SizeChip key={s.slug} size={s} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
      <CartDrawer onRequestQuote={() => { window.location.href = "/#contact"; }} />
    </div>
  );
}

export function ThicknessHubPage({ depth }: { depth: number }) {
  const valid = (THICKNESSES as readonly number[]).includes(depth);
  const sizes = valid ? getSizesByThickness(depth) : [];
  const siteUrl = getSiteUrl();
  const seo = thicknessSeo(siteUrl, valid ? depth : 1);
  const jsonLd = useMemo(
    () =>
      valid
        ? [
            buildBreadcrumbSchema(siteUrl, [
              { name: "Home", path: "/" },
              { name: "All sizes", path: "/sizes" },
              { name: `${depth}" filters`, path: `/filters/${depth}-inch` },
            ]),
            buildItemListSchema(
              siteUrl,
              `${depth}" air filters`,
              `/filters/${depth}-inch`,
              sizes,
            ),
          ]
        : [],
    [siteUrl, depth, valid, sizes],
  );
  useSeo({
    ...seo,
    title: valid ? seo.title : `Thickness not found | ${BRAND_NAME}`,
    noindex: !valid,
    jsonLd,
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        {!valid ? (
          <>
            <h1 className="text-3xl font-bold mb-4">Thickness not found</h1>
            <Link href="/sizes" className="text-primary font-semibold">
              Browse all sizes
            </Link>
          </>
        ) : (
          <>
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-2">
              <Link href="/sizes" className="hover:text-foreground">
                All sizes
              </Link>{" "}
              / {depth}" filters
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {depth}" air filters
            </h1>
            <p className="seo-answer text-muted-foreground mb-10 max-w-2xl">
              Shop {depth}-inch thick HVAC and furnace air filters. Select your
              width × length. Every size is available in MERV 8, 11, 13, and Carbon.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sizes.map((s) => (
                <SizeChip key={s.slug} size={s} />
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
      <CartDrawer onRequestQuote={() => { window.location.href = "/#contact"; }} />
    </div>
  );
}
