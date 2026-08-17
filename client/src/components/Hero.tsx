import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_DESKTOP = "/hero-banner.webp?v=reset";
const HERO_MOBILE = "/hero-banner-mobile.webp?v=reset";

const scrollToFinder = () => {
  document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" });
};

export default function Hero() {
  return (
    <section className="hero-stage relative">
      {/* Mobile: character crop + live copy */}
      <div className="relative overflow-hidden lg:hidden min-h-[min(78dvh,42rem)]">
        <img
          src={HERO_MOBILE}
          alt="Filter Hero standing guard with MERV 8 air filters"
          width={1024}
          height={868}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#d7eef8] via-[#d7eef8]/90 to-transparent px-5 pt-24 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mb-3 text-[1.55rem] font-bold leading-[1.08] tracking-[-0.04em] text-deep sm:text-4xl">
              The First Line of Defense for Your Indoor Air.
            </h1>
            <p className="seo-answer mb-6 max-w-lg text-sm leading-relaxed text-deep/75">
              Filter Hero sells exact-fit HVAC and furnace air filters. Measure
              Width, Length, and Depth — then shop MERV 8, 11, 13, or carbon in
              seconds.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="hero-shop-btn hero-shop-btn-glow w-full text-white sm:w-auto"
                onClick={scrollToFinder}
              >
                Find your filter size
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-navy/20 bg-white/80 text-navy hover:bg-white hover:text-navy sm:w-auto"
                asChild
              >
                <Link href="/sizes">Shop now</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Desktop: RESET artwork with the painted Shop Now as a live control */}
      <div className="relative hidden lg:block">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src={HERO_DESKTOP}
          alt="Filter Hero — the first line of defense for your indoor air"
          width={2048}
          height={868}
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full"
        />
        <h1 className="sr-only">The First Line of Defense for Your Indoor Air.</h1>
        <p className="seo-answer sr-only">
          Filter Hero sells exact-fit HVAC and furnace air filters. Measure
          Width, Length, and Depth — then shop MERV 8, 11, 13, or carbon in
          seconds.
        </p>
        <Link href="/sizes" className="hero-live-cta" aria-label="Shop now">
          <span className="hero-live-cta-glow" aria-hidden />
          <img
            src="/hero-shop-now.webp?v=reset"
            alt=""
            width={330}
            height={88}
            decoding="async"
            draggable={false}
            className="hero-live-cta-art"
          />
        </Link>
      </div>
    </section>
  );
}
