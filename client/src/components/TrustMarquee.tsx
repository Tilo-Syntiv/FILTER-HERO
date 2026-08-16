import { Truck, ShieldCheck, Crosshair, MessageCircle, Sparkles } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Fast shipping nationwide" },
  { icon: ShieldCheck, label: "30-day fit guarantee" },
  { icon: Crosshair, label: "Exact Width × Length × Depth" },
  { icon: Sparkles, label: "MERV 8 · 11 · 13 · Carbon" },
  { icon: MessageCircle, label: "Real HVAC support" },
];

export default function TrustMarquee() {
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative border-y border-border/70 bg-white/50 backdrop-blur-sm overflow-hidden"
      aria-label="Trust highlights"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 z-10 bg-gradient-to-l from-background to-transparent" />
      <div className="marquee-track flex w-max items-center gap-10 md:gap-14 py-3.5">
        {loop.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.label}-${i}`}
              className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80 whitespace-nowrap"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              {item.label}
              <span className="text-hero/40 ml-6 md:ml-10 select-none" aria-hidden>
                ●
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
