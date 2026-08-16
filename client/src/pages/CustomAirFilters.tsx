import { Link } from "wouter";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import FilterFinder from "@/components/FilterFinder";
import ContactForm from "@/components/ContactForm";
import FaqSection from "@/components/FaqSection";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
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
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Custom Air Filters</h1>
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
        <div className="max-w-xl">
          <h2 className="text-xl font-bold mb-4">Request a custom quote</h2>
          <ContactForm intent="support" />
        </div>
      </main>
      <CartDrawer onRequestQuote={() => { window.location.href = "/custom-air-filters"; }} />
    </div>
  );
}
