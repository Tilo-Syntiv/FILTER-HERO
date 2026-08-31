import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { HVAC_BRAND_LIST } from "@shared/hvac-brands";
import { MERV_TYPES } from "@shared/products";
import type { PreferredMerv } from "@/lib/merv-pref";

const ASSET = "?v=fh113";

const COMPAT = [
  { slug: "trane", name: "Trane" },
  { slug: "carrier", name: "Carrier" },
  { slug: "rheem", name: "Rheem" },
  { slug: "goodman", name: "Goodman" },
  { slug: "lennox", name: "Lennox" },
] as const;

const SHOWCASE: {
  src: string;
  merv: PreferredMerv;
  grade: string;
  kicker: string;
  use: string;
  href: string;
  className: string;
  alt: string;
}[] = [
  {
    src: `/hero/pack-merv8.png${ASSET}`,
    merv: "8",
    grade: "8",
    kicker: "MERV",
    use: "Dust",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-merv8",
    alt: "Filter King MERV 8 standard air filter",
  },
  {
    src: `/hero/showcase-carbon.png${ASSET}`,
    merv: "carbon",
    grade: "C",
    kicker: "Carbon",
    use: "Odors",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-carbon",
    alt: "Filter King carbon odor-eliminator air filter",
  },
  {
    src: `/hero/pack-merv11.png${ASSET}`,
    merv: "11",
    grade: "11",
    kicker: "MERV",
    use: "Pets",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-merv11",
    alt: "Filter King MERV 11 advanced air filter",
  },
  {
    src: `/hero/pack-merv13.png${ASSET}`,
    merv: "13",
    grade: "13",
    kicker: "MERV",
    use: "Allergies",
    href: "/sizes/20x25x1",
    className: "hero-product hero-product-merv13",
    alt: "Filter King MERV 13 superior air filter",
  },
];

function HeroCharacter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setLive(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!live) return;
    const node = videoRef.current;
    if (!node) return;
    node.muted = true;
    const play = () => {
      void node.play().catch(() => undefined);
    };
    play();
    node.addEventListener("canplay", play);
    return () => node.removeEventListener("canplay", play);
  }, [live]);

  const shared = {
    className: "hero-character",
    width: 1280,
    height: 720,
  } as const;

  if (!live) {
    return (
      <img
        {...shared}
        className="hero-character hero-character-still"
        src={`/hero/character-fly-still.png${ASSET}`}
        alt=""
        aria-hidden
        fetchPriority="high"
        decoding="async"
      />
    );
  }

  return (
    <video
      {...shared}
      className="hero-character hero-character-video"
      ref={videoRef}
      autoPlay
      muted
      defaultMuted
      loop
      playsInline
      disablePictureInPicture
      poster={`/hero/character-fly-still.png${ASSET}`}
      aria-hidden
    >
      <source src={`/hero/character-fly-natural.webm${ASSET}`} type="video/webm" />
      <source src={`/hero/character-fly-natural.mp4${ASSET}`} type="video/mp4" />
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
        <div className="hero-orb hero-orb-ice" />
        <div className="hero-orb hero-orb-red" />
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
                variant="ghost"
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
                <p className="hero-build-tag">
                  <span className="hero-build-tag-visual">
                    <img
                      src={`/hero/fh-sells-fk.png${ASSET}`}
                      alt="Filter King now at Filter Hero"
                      width={1096}
                      height={236}
                      decoding="async"
                    />
                  </span>
                </p>
                <p className="hero-filter-claim-sub">
                  Guaranteed to fit Trane, Carrier, Rheem + 30 more.
                </p>
              </div>
              <div className="hero-pack-row">
                {SHOWCASE.map((item) => {
                  const type = MERV_TYPES.find((t) => t.key === item.merv) ?? MERV_TYPES[0];
                  return (
                    <div key={item.merv} className={item.className}>
                      <Link href={item.href} className="hero-product-link">
                        <img
                          src={item.src}
                          alt={item.alt}
                          width={508}
                          height={834}
                          decoding="async"
                        />
                        <span
                          className={
                            item.merv === "carbon"
                              ? "hero-pack-ticket hero-pack-ticket-carbon"
                              : "hero-pack-ticket"
                          }
                          style={{ "--ticket": type.badgeColor } as CSSProperties}
                        >
                          <span className="hero-pack-ticket-grade">{item.grade}</span>
                          <span className="hero-pack-ticket-copy">
                            <span className="hero-pack-ticket-kicker">{item.kicker}</span>
                            <span className="hero-pack-ticket-use">{item.use}</span>
                          </span>
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
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
                        className="h-9 w-auto max-w-[6.75rem]"
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
