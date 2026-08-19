import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Flame,
  HeartPulse,
  Home,
  Minus,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MERV_TYPES, type MervTypeInfo } from "@shared/products";
import { scrollToHashTarget } from "@/hooks/useHashScroll";
import {
  setPreferredMerv,
  type PreferredMerv,
} from "@/lib/merv-pref";
import { cn } from "@/lib/utils";

type CaptureLevel = "yes" | "some" | "no";

type MervGuide = {
  accent: string;
  icon: LucideIcon;
  bestFor: string;
  catches: string[];
  efficiency: string;
  strength: number;
  note: string;
};

const GUIDE: Record<PreferredMerv, MervGuide> = {
  "8": {
    accent: "#8eb0d8",
    icon: Home,
    bestFor: "Typical homes",
    catches: ["Household dust & lint", "Pollen", "Carpet fibers"],
    efficiency: "70%+ of 3–10 μm particles",
    strength: 2,
    note: "The workhorse rating. Everyday dust without extra strain on most systems.",
  },
  "11": {
    accent: "#6aa0e0",
    icon: PawPrint,
    bestFor: "Pets & mild allergies",
    catches: ["Pet dander", "Mold spores", "Auto emissions"],
    efficiency: "85%+ of 3–10 μm · 65%+ of 1–3 μm",
    strength: 3,
    note: "The usual upgrade when fur, spring pollen, or city air is in the mix.",
  },
  "13": {
    accent: "#c45c62",
    icon: HeartPulse,
    bestFor: "Asthma & sensitivities",
    catches: ["Smoke & smog", "Bacteria-sized particles", "Fine droplets"],
    efficiency: "90%+ of 3–10 μm · 50%+ of 0.3–1 μm",
    strength: 5,
    note: "Hospital-adjacent capture for home HVAC — confirm the system can take the extra resistance.",
  },
  carbon: {
    accent: "#c9a36a",
    icon: Flame,
    bestFor: "Cooking, pets & odors",
    catches: ["Cooking smells", "Pet odors", "VOCs & smoke smell"],
    efficiency: "MERV 8 capture + odor adsorption",
    strength: 2,
    note: "Activated carbon grabs gases that a pleat alone will not. Particle rating stays MERV 8.",
  },
};

const MATCHES: { key: PreferredMerv; label: string; hint: string }[] = [
  { key: "8", label: "Typical home", hint: "Dust & pollen" },
  { key: "11", label: "Pets", hint: "Dander & fur" },
  { key: "13", label: "Allergies", hint: "Asthma & smoke" },
  { key: "carbon", label: "Odors", hint: "Kitchen & VOCs" },
];

const COMPARE: { label: string; levels: Record<PreferredMerv, CaptureLevel> }[] =
  [
    {
      label: "Dust & lint",
      levels: { "8": "yes", "11": "yes", "13": "yes", carbon: "yes" },
    },
    {
      label: "Pollen",
      levels: { "8": "yes", "11": "yes", "13": "yes", carbon: "yes" },
    },
    {
      label: "Pet dander",
      levels: { "8": "some", "11": "yes", "13": "yes", carbon: "some" },
    },
    {
      label: "Mold spores",
      levels: { "8": "some", "11": "yes", "13": "yes", carbon: "some" },
    },
    {
      label: "Smoke & fine particles",
      levels: { "8": "no", "11": "some", "13": "yes", carbon: "no" },
    },
    {
      label: "Odors & VOCs",
      levels: { "8": "no", "11": "no", "13": "no", carbon: "yes" },
    },
  ];

function shopThisRating(key: PreferredMerv) {
  setPreferredMerv(key);
  const onHome =
    window.location.pathname === "/" || window.location.pathname === "";
  if (onHome) {
    window.history.replaceState(null, "", "/#finder");
    scrollToHashTarget("finder");
    return;
  }
  window.location.assign("/#finder");
}

function CaptureDots({ filled, accent }: { filled: number; accent: string }) {
  return (
    <div className="flex items-end gap-1.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < filled;
        const size = 7 + i * 3;
        return (
          <span
            key={i}
            className="rounded-full"
            style={{
              width: size,
              height: size,
              background: on ? accent : "transparent",
              border: `1.5px solid ${accent}`,
              opacity: on ? 1 : 0.28,
            }}
          />
        );
      })}
    </div>
  );
}

function LevelMark({ level }: { level: CaptureLevel }) {
  if (level === "yes") {
    return (
      <Check
        className="mx-auto h-4 w-4 text-ice"
        strokeWidth={2.75}
        aria-label="Captures well"
      />
    );
  }
  if (level === "some") {
    return (
      <span
        className="mx-auto block h-2 w-2 rounded-full bg-white/45"
        title="Partial capture"
        aria-label="Partial capture"
      />
    );
  }
  return (
    <Minus
      className="mx-auto h-3.5 w-3.5 text-white/25"
      strokeWidth={2}
      aria-label="Not the target"
    />
  );
}

function MervCard({
  type,
  selected,
  onSelect,
}: {
  type: MervTypeInfo;
  selected: boolean;
  onSelect: () => void;
}) {
  const guide = GUIDE[type.key];
  const Icon = guide.icon;

  return (
    <article
      className={cn(
        "glass-tile flex h-full flex-col p-5 md:p-6",
        selected && "glass-tile-active ring-1 ring-ice/40",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 flex-col text-left"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: `${guide.accent}22`, color: guide.accent }}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-white/50">
              {type.shortLabel}
            </p>
            <p className="mt-1 text-xs font-semibold text-ice">
              from ${type.fromPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          className="mb-4 h-1 w-12 rounded-full"
          style={{ background: guide.accent }}
        />

        <h3 className="text-2xl font-bold tracking-tight text-white">
          {type.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-white/70">{guide.bestFor}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          {type.description}
        </p>

        <div className="mt-5">
          <p className="mb-2 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-white/40">
            Capture
          </p>
          <CaptureDots filled={guide.strength} accent={guide.accent} />
          <p className="mt-2 text-xs leading-relaxed text-white/50">
            {guide.efficiency}
          </p>
        </div>

        <ul className="mt-5 space-y-1.5">
          {guide.catches.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-white/80"
            >
              <Check
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                style={{ color: guide.accent }}
                strokeWidth={2.75}
              />
              {item}
            </li>
          ))}
        </ul>
      </button>

      <button
        type="button"
        onClick={() => shopThisRating(type.key)}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-ice transition-colors hover:text-white"
      >
        Shop this rating
        <ArrowRight className="h-4 w-4" />
      </button>
    </article>
  );
}

export default function MervCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState<PreferredMerv>("11");
  const selectedType = MERV_TYPES.find((t) => t.key === selected)!;
  const selectedGuide = GUIDE[selected];

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const type = MERV_TYPES[api.selectedScrollSnap()];
      if (type) setSelected(type.key);
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const index = MERV_TYPES.findIndex((t) => t.key === selected);
    if (index >= 0 && api.selectedScrollSnap() !== index) api.scrollTo(index);
  }, [api, selected]);

  return (
    <section
      id="merv"
      className="brand-band scroll-mt-28 py-16 md:py-24"
      aria-labelledby="merv-heading"
    >
      <div className="container">
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="section-label">Defense level</span>
            <h2
              id="merv-heading"
              className="text-3xl font-bold tracking-tight text-white md:text-4xl"
            >
              Choose your MERV
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/65">
              MERV is a 1–16 score for how small a particle a filter can catch.
              Higher is finer — not automatically better if your system is older.
              Match the rating to the home, then pick your size.
            </p>
          </div>
          <Link href="/how-often-to-change-air-filter" className="section-link">
            When to change it <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Match MERV to your home"
        >
          {MATCHES.map((match) => {
            const on = match.key === selected;
            return (
              <button
                key={match.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setSelected(match.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-left transition-colors",
                  on
                    ? "border-ice/70 bg-white/15 text-white"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white",
                )}
              >
                <span className="block text-sm font-bold leading-none">
                  {match.label}
                </span>
                <span className="mt-1 block text-[0.68rem] text-white/50">
                  {match.hint}
                </span>
              </button>
            );
          })}
        </div>

        <div className="lg:hidden">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: false }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {MERV_TYPES.map((type) => (
                <CarouselItem
                  key={type.key}
                  className="pl-4 basis-[88%] sm:basis-[48%]"
                >
                  <MervCard
                    type={type}
                    selected={type.key === selected}
                    onSelect={() => setSelected(type.key)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="band-arrow -left-3 hidden sm:flex disabled:opacity-30" />
            <CarouselNext className="band-arrow -right-3 hidden sm:flex disabled:opacity-30" />
          </Carousel>
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-4">
          {MERV_TYPES.map((type, i) => (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <MervCard
                type={type}
                selected={type.key === selected}
                onSelect={() => setSelected(type.key)}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-stretch">
          <div className="glass-tile p-6 md:p-7">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-ice">
              Why {selectedType.name}
            </p>
            <p className="mt-3 text-lg font-bold tracking-tight text-white">
              {selectedGuide.bestFor}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {selectedGuide.note}
            </p>
            <button
              type="button"
              onClick={() => shopThisRating(selected)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#141e30] transition-colors hover:bg-ice"
            >
              Find your size
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Size first. Your chosen rating will be waiting on the product page.
            </p>
          </div>

          <div className="glass-tile overflow-x-auto p-5 md:p-6">
            <p className="mb-4 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-white/45">
              What it stops
            </p>
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-white/40">
                  <th className="pb-3 pr-3 font-extrabold">Particle</th>
                  {MERV_TYPES.map((type) => (
                    <th
                      key={type.key}
                      className={cn(
                        "pb-3 text-center font-extrabold",
                        type.key === selected && "text-ice",
                      )}
                    >
                      {type.key === "carbon" ? "Carbon" : type.name.replace("MERV ", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <td className="py-2.5 pr-3 text-white/75">{row.label}</td>
                    {MERV_TYPES.map((type) => (
                      <td
                        key={type.key}
                        className={cn(
                          "py-2.5 text-center",
                          type.key === selected && "bg-white/[0.04]",
                        )}
                      >
                        <LevelMark level={row.levels[type.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              Capture bands follow ASHRAE 52.2. MERV 13 adds resistance — if the
              system is older or the slot is 1 inch, start at 8 or 11 unless the
              manual allows the upgrade.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
