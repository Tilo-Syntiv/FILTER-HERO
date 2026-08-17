import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
import { THICKNESSES, getSizesByThickness } from "@shared/products";

export default function ThicknessCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const { selected, count, scrollTo } = useCarouselDots(api);

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="section-label">Depth first</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Shop by thickness
            </h2>
            <p className="text-muted-foreground">
              Depth first — then choose Width × Length
            </p>
          </div>
          <Link href="/sizes" className="section-link">
            View all sizes <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: false }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {THICKNESSES.map((d, i) => {
              const sizeCount = getSizesByThickness(d).length;
              return (
                <CarouselItem
                  key={d}
                  className="pl-3 md:pl-4 basis-[55%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    <Link
                      href={`/filters/${d}-inch`}
                      className="group block surface-panel rounded-2xl p-5 md:p-8 text-center transition-all duration-300 hover:border-ice hover:shadow-md hover:-translate-y-0.5"
                    >
                      <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight group-hover:scale-105 transition-transform origin-center">
                        {d}"
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {sizeCount} sizes
                      </p>
                    </Link>
                  </motion.div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex -left-3 bg-white border-border shadow-sm" />
          <CarouselNext className="hidden lg:flex -right-3 bg-white border-border shadow-sm" />
        </Carousel>

        <CarouselDots
          count={count}
          selected={selected}
          onSelect={scrollTo}
          className="mt-6 md:hidden"
        />
      </div>
    </section>
  );
}
