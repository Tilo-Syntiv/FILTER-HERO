import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";
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
import { MERV_TYPES } from "@shared/products";

export default function MervCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const { selected, count, scrollTo } = useCarouselDots(api);

  return (
    <section className="py-16 md:py-24" aria-labelledby="merv-heading">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="section-label">Filtration level</span>
            <h2
              id="merv-heading"
              className="text-3xl md:text-4xl font-bold tracking-tight"
            >
              Choose your quality
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Pick the MERV that matches your air quality goals
            </p>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true }}
          plugins={[
            Autoplay({
              delay: 4200,
              stopOnInteraction: true,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {MERV_TYPES.map((type, i) => (
              <CarouselItem
                key={type.key}
                className="pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <article className="h-full surface-panel rounded-2xl p-6 md:p-8 transition-shadow hover:shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="h-1.5 w-14 rounded-full"
                      style={{
                        background:
                          i % 2 === 0
                            ? "var(--ice)"
                            : "var(--hero)",
                      }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {type.shortLabel}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl mb-2 tracking-tight">
                    {type.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 min-h-[4.5rem]">
                    {type.description}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    from ${type.fromPrice.toFixed(2)}
                  </p>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-3 bg-white border-border shadow-sm" />
          <CarouselNext className="hidden sm:flex -right-3 bg-white border-border shadow-sm" />
        </Carousel>

        <CarouselDots
          count={count}
          selected={selected}
          onSelect={scrollTo}
          className="mt-8"
        />
      </div>
    </section>
  );
}
