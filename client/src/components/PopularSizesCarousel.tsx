import { useState } from "react";
import { Link } from "wouter";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import CarouselDots from "@/components/CarouselDots";
import { useCarouselDots } from "@/hooks/useCarouselDots";
import { popularSizeSlugs } from "@shared/products";

export default function PopularSizesCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const { selected, count, scrollTo } = useCarouselDots(api);
  const sizes = popularSizeSlugs(16);

  return (
    <section className="py-16 md:py-20 bg-deep text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(142,176,216,0.35), transparent)",
        }}
      />
      <div className="container relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="section-label !text-ice !opacity-90">Bestsellers</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Popular sizes
            </h2>
            <p className="text-white/60 max-w-lg">
              Swipe through the most requested residential HVAC dimensions
            </p>
          </div>
          <Link
            href="/sizes"
            className="text-ice font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all sizes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true, skipSnaps: false }}
          plugins={[
            Autoplay({
              delay: 3200,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {sizes.map((slug) => (
              <CarouselItem
                key={slug}
                className="pl-3 md:pl-4 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link
                  href={`/sizes/${encodeURIComponent(slug)}`}
                  className="group block rounded-2xl border border-white/15 bg-white/5 px-5 py-8 text-center transition-all duration-300 hover:bg-white/12 hover:border-ice/50 hover:-translate-y-0.5"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ice/80 mb-3 font-semibold">
                    Exact fit
                  </p>
                  <p className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-ice transition-colors">
                    {slug}
                  </p>
                  <p className="mt-4 text-xs text-white/50 group-hover:text-white/70 transition-colors">
                    Shop this size →
                  </p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-3 border-white/20 bg-deep/80 text-white hover:bg-white hover:text-deep disabled:opacity-30" />
          <CarouselNext className="hidden md:flex -right-3 border-white/20 bg-deep/80 text-white hover:bg-white hover:text-deep disabled:opacity-30" />
        </Carousel>

        <CarouselDots
          count={count}
          selected={selected}
          onSelect={scrollTo}
          tone="light"
          className="mt-8"
        />
      </div>
    </section>
  );
}
