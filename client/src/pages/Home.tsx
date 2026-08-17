import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { THICKNESSES } from "@shared/products";
import { featuredHvacBrands } from "@shared/hvac-brands";
import {
  SITE_FAQS,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHowToMeasureSchema,
  buildOnlineStoreSchema,
  buildOrganizationSchema,
  buildSpeakableSchema,
  buildWebSiteSchema,
  homeSeo,
} from "@shared/seo";
import { BRAND_EMAIL, BRAND_NAME } from "@/const";
import { Button } from "@/components/ui/button";
import FilterFinder from "@/components/FilterFinder";
import TrustSection from "@/components/TrustSection";
import TrustMarquee from "@/components/TrustMarquee";
import ThicknessCarousel from "@/components/ThicknessCarousel";
import PopularSizesCarousel from "@/components/PopularSizesCarousel";
import SizeDirectory from "@/components/SizeDirectory";
import MervCarousel from "@/components/MervCarousel";
import ContactForm from "@/components/ContactForm";
import CartDrawer from "@/components/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import BrandLockup from "@/components/BrandLockup";
import Hero from "@/components/Hero";
import FaqSection from "@/components/FaqSection";
import { useCart } from "@/contexts/CartContext";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";

export default function Home() {
  const { cartSummaryText } = useCart();
  const [quoteSize, setQuoteSize] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteCartSummary, setQuoteCartSummary] = useState("");
  const contactRef = useRef<HTMLElement>(null);

  const siteUrl = getSiteUrl();
  const seo = homeSeo(siteUrl);
  const jsonLd = useMemo(
    () => [
      buildOrganizationSchema(siteUrl),
      buildOnlineStoreSchema(siteUrl),
      buildWebSiteSchema(siteUrl),
      buildFaqSchema(SITE_FAQS),
      buildHowToMeasureSchema(siteUrl),
      buildSpeakableSchema(siteUrl, [
        ".seo-answer",
        ".seo-speakable-q",
        ".seo-speakable-a",
        "#faq-heading",
      ]),
      buildBreadcrumbSchema(siteUrl, [{ name: "Home", path: "/" }]),
    ],
    [siteUrl],
  );
  useSeo({ ...seo, jsonLd });

  const scrollToContact = (opts?: {
    size?: string;
    message?: string;
    withCart?: boolean;
  }) => {
    if (opts?.size) setQuoteSize(opts.size);
    if (opts?.message) setQuoteMessage(opts.message);
    setQuoteCartSummary(opts?.withCart ? cartSummaryText() : "");
    contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <Hero />

      <TrustMarquee />

      <main>
        <section
          id="finder"
          className="py-16 md:py-24 scroll-mt-20 -mt-6 relative z-10"
        >
          <div className="container">
            <FilterFinder />
          </div>
        </section>

        <SizeDirectory />

        <ThicknessCarousel />

        <PopularSizesCarousel />

        <section className="py-16 md:py-20">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="section-label">Replacement filters</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  Shop by HVAC brand
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Filter Hero filters fit Carrier, Trane, Honeywell, Lennox, and
                  other OEM slots. Same size as the original media.
                </p>
              </div>
              <Link
                href="/brands"
                className="text-primary font-semibold text-sm hover:underline"
              >
                See all brands
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {featuredHvacBrands().map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="size-chip !py-4 text-center"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <MervCarousel />

        <TrustSection />

        <FaqSection faqs={SITE_FAQS} />

        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#203868_0%,#141e30_70%,#7f2328_160%)]" />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 70% 50%, rgba(142,176,216,0.45), transparent 60%)",
            }}
          />
          <div className="container relative text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Not sure of your size?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Send a photo of the label on your current filter — we’ll match it for
              you.
            </p>
            <Button
              size="lg"
              className="bg-white text-navy hover:bg-ice"
              onClick={() =>
                scrollToContact({
                  message:
                    "I need help identifying my filter size. Here's what I know…",
                })
              }
            >
              Get size help
            </Button>
          </div>
        </section>

        <section
          id="contact"
          ref={contactRef}
          className="py-16 md:py-24 scroll-mt-20"
        >
          <div className="container max-w-xl">
            <span className="section-label">Support</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Contact</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Questions about size, MERV, or an order — we’ll respond promptly.
            </p>
            <div className="surface-panel rounded-2xl p-6 md:p-8">
              <ContactForm
                defaultSize={quoteSize}
                defaultMessage={quoteMessage}
                cartSummary={quoteCartSummary}
                intent="support"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-deep text-white/70 py-14">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-12">
            <div className="col-span-2 md:col-span-5">
              <BrandLockup tone="footer" className="mb-5" />
              <p className="text-sm leading-relaxed max-w-xs">
                Precise HVAC filters. Find your exact size and order with
                confidence.
              </p>
              <p className="text-sm mt-4 text-ice/90">{BRAND_EMAIL}</p>
            </div>
            <div className="md:col-span-3">
              <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">
                Shop
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#finder" className="hover:text-ice transition-colors">
                    Find size
                  </a>
                </li>
                <li>
                  <Link href="/sizes" className="hover:text-ice transition-colors">
                    All sizes
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="hover:text-ice transition-colors">
                    Shop by brand
                  </Link>
                </li>
                {THICKNESSES.map((d) => (
                  <li key={d}>
                    <Link
                      href={`/filters/${d}-inch`}
                      className="hover:text-ice transition-colors"
                    >
                      {d}" filters
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/custom-air-filters"
                    className="hover:text-ice transition-colors"
                  >
                    Custom Air Filters
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="font-bold text-white mb-4 text-sm tracking-wide uppercase">
                Support
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#faq" className="hover:text-ice transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-ice transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-xs">
            <p>
              &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer
        onRequestQuote={() =>
          scrollToContact({
            withCart: true,
            message: "Please help with the items in my cart (details attached).",
          })
        }
      />
    </div>
  );
}
