import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { HVAC_BRAND_LIST } from "@shared/hvac-brands";

const ASSET = "?v=fh074";

const COMPAT = [
  { slug: "trane", name: "Trane" },
  { slug: "carrier", name: "Carrier" },
  { slug: "rheem", name: "Rheem" },
] as const;

const SHOWCASE = [
  {
    src: `/hero/showcase-merv8.png${ASSET}`,
    label: "MERV 8",
    hint: "Standard",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-merv8",
    alt: "MERV 8 standard air filter",
    hideCaption: false,
  },
  {
    src: `/hero/showcase-carbon.png${ASSET}`,
    label: "Carbon",
    hint: "Odor eliminator",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-carbon",
    alt: "Carbon odor-eliminator air filter",
    hideCaption: true,
  },
  {
    src: `/hero/showcase-merv11.png${ASSET}`,
    label: "MERV 11",
    hint: "Advanced",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-merv11",
    alt: "MERV 11 advanced air filter",
    hideCaption: false,
  },
  {
    src: `/hero/showcase-merv13.png${ASSET}`,
    label: "MERV 13",
    hint: "Superior",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-merv13",
    alt: "MERV 13 superior air filter",
    hideCaption: true,
  },
] as const;

function HeroCharacter() {
  const [live, setLive] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setLive(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const shared = {
    className: "hero-character",
    width: 900,
    height: 906,
  } as const;

  if (!live) {
    return (
      <img
        {...shared}
        src={`/hero/character.png${ASSET}`}
        alt="Filter Hero standing guard"
        fetchPriority="high"
        decoding="async"
      />
    );
  }

  return (
    <video
      {...shared}
      autoPlay
      muted
      loop
      playsInline
      poster={`/hero/character.png${ASSET}`}
      aria-label="Filter Hero standing guard"
    >
      <source src={`/hero/character-idle.webm${ASSET}`} type="video/webm" />
    </video>
  );
}

function BrandMarks({ compact }: { compact?: boolean }) {
  return (
    <>
      {COMPAT.map((brand) => (
        <Link
          key={brand.slug}
          href={`/brands/${brand.slug}`}
          className="hero-compat-mark"
          aria-label={`Shop ${brand.name} filter sizes`}
        >
          <BrandLogo
            slug={brand.slug}
            name={brand.name}
            className={compact ? "h-6 w-auto max-w-[4.75rem]" : "h-7 w-auto max-w-[5.75rem]"}
          />
        </Link>
      ))}
    </>
  );
}

export default function Hero() {
  const [, setLocation] = useLocation();
  const brandCount = HVAC_BRAND_LIST.length;

  return (
    <section className="hero-stage hero-cast-stage">
      <div className="hero-atmosphere" aria-hidden>
        <div className="hero-mesh" />
        <div className="hero-rays" />
        <div className="hero-orb hero-orb-ice" />
        <div className="hero-orb hero-orb-red" />
        <div className="hero-slash" />
        <div className="hero-dust" />
      </div>

      <div className="hero-cast">
        <div className="hero-copy">
          <motion.div
            initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hero-lockup" aria-hidden>
              <span className="hero-lockup-filter">Filter</span>
              <span className="hero-lockup-hero">Hero</span>
            </p>
            <p className="hero-kicker">
              <span className="hero-live-dot" aria-hidden />
              Exact-fit HVAC filters
            </p>
            <h1 className="hero-title">
              The first line
              <em>of defense</em>
              <span className="hero-title-rest">
                for your <em>indoor air.</em>
              </span>
            </h1>
            <p className="seo-answer hero-lede">
              Filter Hero&apos;s Filter King filters are exact-fit replacements
              for Trane, Carrier, Rheem, and 30+ major HVAC brands. Measure
              Width, Length, and Depth — then shop MERV 8, 11, or 13.
            </p>
            <div className="hero-actions">
              <Button
                size="lg"
                className="hero-shop-btn hero-shop-btn-glow w-full text-white sm:w-auto"
                onClick={() => setLocation("/sizes")}
              >
                Find your filter size
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hero-ghost-btn w-full sm:w-auto"
                onClick={() => setLocation("/how-often-to-change-air-filter")}
              >
                Start your clock
              </Button>
            </div>
            <div className="hero-compat hero-compat-mobile">
              <p className="hero-compat-label">
                Fits {COMPAT[0].name}, {COMPAT[1].name}, {COMPAT[2].name}
                {" + "}
                {brandCount} brands
              </p>
              <div className="hero-compat-row">
                <BrandMarks />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="hero-art">
          <div className="hero-glow" aria-hidden />
          <div className="hero-showcase">
            <div className="hero-lineup">
              <div className="hero-ground" aria-hidden />
              <div className="hero-character-slot">
                <div className="hero-character-float">
                  <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="hero-character-motion"
                  >
                    <HeroCharacter />
                  </motion.div>
                </div>
              </div>
              <div className="hero-filter-claim">
                <p className="hero-fk-kicker">Filter King — by Filter Hero</p>
                <p className="hero-filter-claim-title">Our Filter King filters.</p>
                <p className="hero-filter-claim-sub">
                  Guaranteed to fit Trane, Carrier, Rheem + 30 more.
                </p>
              </div>
              {SHOWCASE.map((item) => (
                <div key={item.label} className={item.className}>
                  <Link href={item.href} className="hero-product-link">
                    <img
                      src={item.src}
                      alt={item.alt}
                      width={482}
                      height={810}
                      decoding="async"
                    />
                    {item.hideCaption ? null : (
                      <span className="hero-product-meta">
                        <span className="hero-product-label">{item.label}</span>
                        <span className="hero-product-hint">{item.hint}</span>
                      </span>
                    )}
                  </Link>
                </div>
              ))}
              <div className="hero-brands">
                <p className="hero-brands-label">
                  Filter King also fits <strong>30+ major brands</strong>
                </p>
                <div className="hero-brands-row">
                  {COMPAT.map((brand) => (
                    <Link
                      key={brand.slug}
                      href={`/brands/${brand.slug}`}
                      className="hero-compat-mark"
                      aria-label={`Shop ${brand.name} filter sizes`}
                    >
                      <BrandLogo
                        slug={brand.slug}
                        name={brand.name}
                        className="h-9 w-auto max-w-[7.25rem]"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
