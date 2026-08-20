import { useEffect, useMemo, useRef, useState } from "react";
import { useHashScroll } from "@/hooks/useHashScroll";
import { Link } from "wouter";
import { THICKNESSES } from "@shared/products";
import { featuredBrandFamilies } from "@shared/hvac-brands";
import BrandLogo from "@/components/BrandLogo";
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
import PopularSizesCarousel from "@/components/PopularSizesCarousel";
import SizeDirectory from "@/components/SizeDirectory";
import MervCarousel from "@/components/MervCarousel";
import DeliverySection from "@/components/DeliverySection";
import ContactForm from "@/components/ContactForm";
import CartDrawer from "@/components/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
import BrandLockup from "@/components/BrandLockup";
import Hero from "@/components/Hero";
import FaqSection from "@/components/FaqSection";
import FilterPower from "@/components/FilterPower";
import FamilyAirSection from "@/components/FamilyAirSection";
import { LIFE } from "@/data/life-photos";
import { useCart } from "@/contexts/CartContext";
import { takeQuoteHandoff } from "@/lib/quote-handoff";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";

export default function Home() {
  useHashScroll();
  const { cartSummaryText } = useCart();
  const [quoteSize, setQuoteSize] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteCartSummary, setQuoteCartSummary] = useState("");
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handed = takeQuoteHandoff();
    if (handed.size) setQuoteSize(handed.size);
    if (handed.message) setQuoteMessage(handed.message);
    if (handed.cart) setQuoteCartSummary(handed.cart);
    const size = new URLSearchParams(window.location.search).get("size");
    if (size) setQuoteSize(size);
  }, []);

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
          className="sheet-section pt-16 md:pt-24 pb-10 md:pb-12 scroll-mt-28 -mt-6 relative z-10"
        >
          <div className="container">
            <FilterFinder showPopular={false} />
          </div>
        </section>

        <FamilyAirSection />

        <section
          id="clock"
          className="sheet-section scroll-mt-28 py-12 md:py-16"
        >
          <div className="container">
            <div className="mb-8 max-w-2xl">
              <span className="section-label">Filter Clock</span>
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                When's your next filter change?
              </h2>
              <p className="text-muted-foreground leading-relaxed md:text-lg">
                Pets, kids, allergies, and a fan that never shuts off pull the
                date closer. Tell us about the house. We'll give you the date.
              </p>
            </div>
            <FilterPower />
          </div>
        </section>

        <PopularSizesCarousel />

        <div className="sheet-section">
          <SizeDirectory />
        </div>

        <MervCarousel />

        <DeliverySection />

        <section className="sheet-section py-16 md:py-20">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <span className="section-label">System match</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
                  Shop by HVAC brand
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Filter Hero filters fit Carrier, Trane, Honeywell, Lennox, and
                  other OEM slots. Same size as the original media.
                </p>
              </div>
              <Link href="/brands" className="section-link">
                See all brands
              </Link>
            </div>
            <div className="grid gap-6">
              {featuredBrandFamilies().map((family) => (
                <div key={family.id}>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                    {family.label}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {family.brands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brands/${b.slug}`}
                        className="brand-chip"
                      >
                        <BrandLogo slug={b.slug} name={b.name} />
                        <span>{b.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="sheet-section">
          <TrustSection />
        </div>

        <div className="sheet-section">
          <FaqSection faqs={SITE_FAQS} />
        </div>

        <section className="brand-band cta-photo-band py-20 md:py-28 relative overflow-hidden">
          <img
            src={LIFE.familyHug.src}
            alt=""
            width={LIFE.familyHug.width}
            height={LIFE.familyHug.height}
            decoding="async"
            className="cta-photo-img"
            style={{ objectPosition: LIFE.familyHug.position }}
          />
          <div className="container relative text-center">
            <span className="section-label">Need a match</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Can't read the label?
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Send a photo of the label on your current filter — we’ll match it for
              you.
            </p>
            <Button
              size="lg"
              className="hero-shop-btn w-full text-white sm:w-auto"
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
          className="sheet-section py-16 md:py-24 scroll-mt-28"
        >
          <div className="container max-w-xl">
            <span className="section-label">Real support</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Contact Filter Hero</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">
              Questions about size, MERV, or an order — we’ll respond promptly.
            </p>
            <div className="surface-panel rounded-2xl p-4 sm:p-6 md:p-8">
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

      <footer className="site-footer pt-14">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 mb-12">
            <div className="col-span-2 md:col-span-5">
              <BrandLockup tone="footer" className="mb-5" />
              <p className="text-sm leading-relaxed max-w-xs">
                Precise HVAC filters for the people and pets under your roof.
                Find your exact size and order with confidence.
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
                  <a href="#clock" className="hover:text-ice transition-colors">
                    Filter Clock
                  </a>
                </li>
                <li>
                  <Link
                    href="/how-often-to-change-air-filter"
                    className="hover:text-ice transition-colors"
                  >
                    When to change your filter
                  </Link>
                </li>
                <li>
                  <a href="#delivery" className="hover:text-ice transition-colors">
                    Shipping
                  </a>
                </li>
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
        onRequestQuote={() => {
          takeQuoteHandoff();
          scrollToContact({
            withCart: true,
            message: "Please help with the items in my cart (details attached).",
          });
        }}
      />
    </div>
  );
}
