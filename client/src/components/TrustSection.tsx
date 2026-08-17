import { motion } from "framer-motion";
import { Truck, ShieldCheck, Crosshair, MessageCircle } from "lucide-react";
import ReviewsCarousel from "@/components/ReviewsCarousel";

export default function TrustSection() {
  const trustPoints = [
    {
      icon: Truck,
      title: "Free shipping over $50",
      description: "Contiguous US orders — clean air shouldn't wait",
    },
    {
      icon: ShieldCheck,
      title: "30-day guarantee",
      description: "Wrong fit? Full refund within 30 days",
    },
    {
      icon: Crosshair,
      title: "Precision matching",
      description: "Size finder built for exact HVAC dimensions",
    },
    {
      icon: MessageCircle,
      title: "Real support",
      description: "People who know filters — ask anytime",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="section-label">Why Filter Hero</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for an exact-fit buy
          </h2>
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
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
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
