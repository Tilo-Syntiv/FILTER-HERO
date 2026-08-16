import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { THICKNESSES } from "@shared/products";
import {
  SITE_FAQS,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHowToMeasureSchema,
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
import MervCarousel from "@/components/MervCarousel";
import ContactForm from "@/components/ContactForm";
import CartDrawer from "@/components/CartDrawer";
import SiteHeader from "@/components/SiteHeader";
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

      <section className="relative min-h-[88vh] flex items-end md:items-center overflow-hidden bg-deep">
        <div className="absolute inset-0 bg-[linear-gradient(155deg,#141e30_0%,#203868_52%,#7f2328_120%)]" />
        <div
          className="hero-orb absolute -top-24 -right-24 w-[55vw] max-w-[640px] aspect-square rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(142,176,216,0.55) 0%, transparent 68%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background:
              "linear-gradient(to top, rgba(246,247,249,1) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="container relative z-10 pb-20 pt-28 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="relative inline-block mb-10">
              <div
                aria-hidden
                className="absolute -inset-8 md:-inset-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.55)_45%,transparent_70%)]"
              />
              <img
                src="/logo.png"
                alt={BRAND_NAME}
                className="relative h-16 md:h-24 w-auto"
                width={320}
                height={96}
              />
            </div>
            <h1 className="text-[2.75rem] sm:text-5xl md:text-7xl font-bold text-white mb-5 leading-[1.02] tracking-[-0.04em]">
              Every size.
              <br />
              <span className="text-ice">Exact fit.</span>
            </h1>
            <p className="seo-answer text-base md:text-xl text-white/75 mb-10 max-w-lg leading-relaxed">
              Filter Hero sells exact-fit HVAC and furnace air filters.
              Measure Width, Length, and Depth — then shop MERV 8, 11, 13, or carbon
              in seconds.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                size="lg"
                className="bg-hero text-white hover:bg-hero/90 font-semibold"
                onClick={() =>
                  document
                    .getElementById("finder")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Find your filter size
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/50"
                asChild
              >
                <Link href="/sizes">Browse sizes</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

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

        <ThicknessCarousel />

        <PopularSizesCarousel />

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
              <img
                src="/logo.png"
                alt={BRAND_NAME}
                className="h-12 w-auto mb-5 bg-white rounded-lg px-3 py-2"
                width={200}
                height={48}
              />
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
