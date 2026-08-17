import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const scrollToFinder = () => {
  document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" });
};

export default function Hero() {
  return (
    <section className="hero-stage relative overflow-hidden">
      {/* Mobile: character crop + live copy */}
      <div className="relative lg:hidden min-h-[78vh]">
        <img
          src="/hero-banner-mobile.webp"
          alt="Filter Hero standing guard with MERV 8 air filters"
          width={1200}
          height={1156}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#d7eef8] via-[#d7eef8]/90 to-transparent px-5 pt-28 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="mb-3 text-[1.85rem] font-bold leading-[1.08] tracking-[-0.04em] text-deep sm:text-4xl">
              The Ultimate Defense for Your Indoor Air.
            </h1>
            <p className="seo-answer mb-6 max-w-lg text-sm leading-relaxed text-deep/75">
              Filter Hero sells exact-fit HVAC and furnace air filters. Measure
              Width, Length, and Depth — then shop MERV 8, 11, 13, or carbon in
              seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="hero-shop-btn text-white"
                onClick={scrollToFinder}
              >
                Find your filter size
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-navy/20 bg-white/80 text-navy hover:bg-white hover:text-navy"
                asChild
              >
                <Link href="/sizes">Shop now</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Desktop: full artwork, clickable Shop Now */}
      <div className="relative hidden lg:block">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          src="/hero-banner.webp"
          alt="Filter Hero — the ultimate defense for your indoor air"
          width={2400}
          height={1018}
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full"
        />
        <h1 className="sr-only">The Ultimate Defense for Your Indoor Air.</h1>
        <p className="seo-answer sr-only">
          Filter Hero sells exact-fit HVAC and furnace air filters. Measure
          Width, Length, and Depth — then shop MERV 8, 11, 13, or carbon in
          seconds.
        </p>
        <Link
          href="/sizes"
          className="absolute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero/50"
          style={{
            right: "3.8%",
            bottom: "8%",
            width: "16%",
            height: "11%",
          }}
        >
          <span className="sr-only">Shop now</span>
        </Link>
        <div className="absolute bottom-8 left-8">
          <Button
            size="lg"
            className="hero-shop-btn text-white shadow-lg"
            onClick={scrollToFinder}
          >
            Find your filter size
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{
            background:
              "linear-gradient(to top, rgba(246,247,249,0.85) 0%, transparent 100%)",
          }}
        />
      </div>
    </section>
  );
}
