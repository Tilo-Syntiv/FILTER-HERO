import { useEffect, useState } from "react";
import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import FilterFinder from "@/components/FilterFinder";
import ContactForm from "@/components/ContactForm";
import FaqSection from "@/components/FaqSection";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
import { takeQuoteHandoff } from "@/lib/quote-handoff";
import { BRAND_NAME } from "@/const";
import {
  CUSTOM_FAQS,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSpeakableSchema,
  customAirFiltersSeo,
} from "@shared/seo";

export default function CustomAirFiltersPage() {
  const siteUrl = getSiteUrl();
  const seo = customAirFiltersSeo(siteUrl);
  const [quoteCart, setQuoteCart] = useState("");

  useSeo({
    ...seo,
    jsonLd: [
      buildBreadcrumbSchema(siteUrl, [
        { name: "Home", path: "/" },
        { name: "Custom air filters", path: "/custom-air-filters" },
      ]),
      buildFaqSchema(CUSTOM_FAQS),
      buildSpeakableSchema(siteUrl, [
        ".seo-answer",
        ".seo-speakable-q",
        ".seo-speakable-a",
      ]),
    ],
  });

  useEffect(() => {
    const handed = takeQuoteHandoff();
    if (handed.cart) setQuoteCart(handed.cart);
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          / Custom air filters
        </nav>
        <span className="section-label">Odd size</span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Custom Air Filters</h1>
        <p className="seo-answer text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          If your slot is not on the standard size list, send Width × Length ×
          Depth (or a photo of the label) and we will quote a custom HVAC filter.
        </p>
        <div className="mb-16">
          <FilterFinder showPopular compact />
        </div>
        <FaqSection
          faqs={CUSTOM_FAQS}
          title="Custom size questions"
          subtitle="How custom HVAC filter quotes work."
        />
        <div id="custom-quote" className="max-w-xl scroll-mt-20">
          <span className="section-label">Custom quote</span>
          <h2 className="text-xl font-bold mb-4 tracking-tight">Request a custom quote</h2>
          <ContactForm intent="support" cartSummary={quoteCart} />
        </div>
      </main>
      <footer className="site-footer pt-8 mt-12">
        <div className="container flex flex-col sm:flex-row justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} {BRAND_NAME}</p>
          <Link href="/" className="section-link !text-ice hover:!text-white">
            Home
          </Link>
        </div>
      </footer>
      <CartDrawer
        onRequestQuote={() => {
          const handed = takeQuoteHandoff();
          if (handed.cart) setQuoteCart(handed.cart);
          document.getElementById("custom-quote")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />
    </div>
  );
}
