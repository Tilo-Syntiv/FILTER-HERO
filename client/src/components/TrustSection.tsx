import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  Crosshair,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import LifeImage from "@/components/LifeImage";
import { LIFE, type LifePhoto } from "@/data/life-photos";
import { cn } from "@/lib/utils";

export default function TrustSection() {
  const trustPoints: {
    icon: LucideIcon;
    title: string;
    description: string;
    photo: LifePhoto;
    graphic?: boolean;
  }[] = [
    {
      icon: Truck,
      title: "FREE SHIPPING",
      description: "Contiguous US orders — clean air shouldn't wait",
      photo: LIFE.freeShipping,
      graphic: true,
    },
    {
      icon: ShieldCheck,
      title: "30-day guarantee",
      description: "Wrong fit? Full refund within 30 days",
      photo: LIFE.installCeilingMan,
    },
    {
      icon: Crosshair,
      title: "Precision matching",
      description: "Size finder built for exact HVAC dimensions",
      photo: LIFE.installCeiling,
    },
    {
      icon: MessageCircle,
      title: "Real support",
      description: "People who know filters — ask anytime",
      photo: LIFE.filterTech,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-14 max-w-2xl text-center md:text-left">
          <span className="section-label">Why Filter Hero</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for an exact-fit buy — and the people at home
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
            Free shipping, a 30-day fit guarantee, and real humans if the
            label is unreadable. The point is cleaner air for kids, pets, and
            anyone who sleeps in the house.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {trustPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <div className="relative mb-4">
                  <LifeImage
                    photo={point.photo}
                    className={cn(
                      "aspect-[5/4] rounded-xl",
                      point.graphic && "!bg-white",
                    )}
                    imgClassName={
                      point.graphic ? "object-contain p-5" : undefined
                    }
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {!point.graphic && (
                    <div className="absolute bottom-3 left-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 text-primary shadow-sm">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-base mb-2 tracking-tight">
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <ReviewsCarousel />
      </div>
    </section>
  );
}
