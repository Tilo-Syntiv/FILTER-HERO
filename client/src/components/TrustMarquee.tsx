import { Truck, ShieldCheck, Crosshair, MessageCircle, Sparkles } from "lucide-react";

const FEATURED = {
  icon: Truck,
  label: "Free shipping over $50",
  hint: "Contiguous US",
};

const ITEMS = [
  { icon: ShieldCheck, label: "30-day fit guarantee" },
  { icon: Crosshair, label: "Exact Width × Length × Depth" },
  { icon: Sparkles, label: "MERV 8 · 11 · 13 · Carbon" },
  { icon: MessageCircle, label: "Real HVAC support" },
];

function ShipChip() {
  const Icon = FEATURED.icon;
  return (
    <span className="trust-ship-chip">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/18">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
      <span className="flex flex-col leading-none">
        <span>{FEATURED.label}</span>
        <span className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/75">
          {FEATURED.hint}
        </span>
      </span>
    </span>
  );
}

function TrustChip({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <span className="trust-chip">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ice/20 text-ice">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
      {label}
    </span>
  );
}

function MarqueeSequence() {
  return (
    <>
      <ShipChip />
      {ITEMS.slice(0, 2).map((item) => (
        <TrustChip key={item.label} {...item} />
      ))}
      <ShipChip />
      {ITEMS.slice(2).map((item) => (
        <TrustChip key={item.label} {...item} />
      ))}
    </>
  );
}

export default function TrustMarquee() {
  return (
    <div className="trust-marquee" aria-label="Trust highlights">
      <p className="sr-only">
        {FEATURED.label} in the {FEATURED.hint}. {ITEMS.map((item) => item.label).join(". ")}.
      </p>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#1b3258] to-transparent md:w-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#23406a] to-transparent md:w-16"
        aria-hidden
      />

      <div className="marquee-track trust-marquee-track flex w-max items-center py-3 md:py-3.5">
        <div className="flex items-center gap-3 pr-3 md:gap-4 md:pr-4" aria-hidden>
          <MarqueeSequence />
        </div>
        <div className="marquee-dup flex items-center gap-3 pr-3 md:gap-4 md:pr-4" aria-hidden>
          <MarqueeSequence />
        </div>
      </div>
    </div>
  );
}
