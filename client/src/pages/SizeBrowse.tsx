import { useMemo } from "react";
import { Link } from "wouter";
import { THICKNESSES, getSizesByThickness } from "@shared/products";
import {
  allSizesSeo,
  buildBreadcrumbSchema,
  buildItemListSchema,
  thicknessSeo,
} from "@shared/seo";
import SiteHeader from "@/components/SiteHeader";
import SizeDirectory from "@/components/SizeDirectory";
import CartDrawer from "@/components/CartDrawer";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
import { BRAND_NAME } from "@/const";

function SiteFooter() {
  return (
    <footer className="site-footer pt-8 mt-12">
      <div className="container flex flex-col sm:flex-row justify-between gap-4 text-sm">
        <p>&copy; {new Date().getFullYear()} {BRAND_NAME}</p>
        <Link href="/" className="section-link !text-ice hover:!text-white">
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
        <span className="section-label">Size catalog</span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Every Filter Hero size</h1>
        <p className="seo-answer text-muted-foreground mb-10 max-w-2xl">
          Browse every {BRAND_NAME} HVAC size by depth. Pick a whole-inch width
          to narrow the list, or browse all sizes. {allSizes.length} sizes in
          the catalog.
        </p>
        <SizeDirectory compact />
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
            <span className="section-label">Depth first</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              {depth}" depth air filters
            </h1>
            <p className="seo-answer text-muted-foreground mb-10 max-w-2xl">
              Shop {depth}-inch depth HVAC and furnace air filters. Pick a
              whole-inch width to narrow the list, or browse every length at this
              depth. Every size is available in MERV 8, 11, 13, and Carbon.
            </p>
            <SizeDirectory
              depth={depth}
              heading={`${depth}" filters`}
              compact
            />
          </>
        )}
      </main>
      <SiteFooter />
      <CartDrawer onRequestQuote={() => { window.location.href = "/#contact"; }} />
    </div>
  );
}
