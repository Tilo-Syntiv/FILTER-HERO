import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Circle,
  X,
  Flame,
  HeartPulse,
  Home,
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
import MervBadge from "@/components/MervBadge";

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
    accent: "#e45a5f",
    icon: PawPrint,
    bestFor: "Pets & mild allergies",
    catches: ["Pet dander", "Mold spores", "Auto emissions"],
    efficiency: "85%+ of 3–10 μm · 65%+ of 1–3 μm",
    strength: 3,
    note: "The usual upgrade when fur, spring pollen, or city air is in the mix.",
  },
  "13": {
    accent: "#ee9e10",
    icon: HeartPulse,
    bestFor: "Asthma & sensitivities",
    catches: ["Smoke & smog", "Bacteria-sized particles", "Fine droplets"],
    efficiency: "90%+ of 3–10 μm · 50%+ of 0.3–1 μm",
    strength: 5,
    note: "Hospital-adjacent capture for home HVAC — confirm the system can take the extra resistance.",
  },
  carbon: {
    accent: "#d8d8d8",
    icon: Flame,
    bestFor: "Cooking, pets & odors",
    catches: ["Cooking smells", "Pet odors", "VOCs & smoke smell"],
    efficiency: "MERV 8 capture + odor adsorption",
    strength: 2,
    note: "Activated carbon grabs gases that a pleat alone will not. Particle rating stays MERV 8.",
  },
};

const HOME_PICKS: {
  key: PreferredMerv;
  title: string;
  blurb: string;
}[] = [
  { key: "8", title: "Everyday dust", blurb: "Pollen, lint, household dust" },
  { key: "11", title: "Pets", blurb: "Fur, dander, extra dust" },
  { key: "13", title: "Allergies", blurb: "Smoke, fine particles, asthma" },
  { key: "carbon", title: "Cooking smells", blurb: "Odors and smoke smell" },
];

function PickIcon({
  pickKey,
  accent,
  selected,
}: {
  pickKey: PreferredMerv;
  accent: string;
  selected: boolean;
}) {
  const Icon = GUIDE[pickKey].icon;
  return (
    <span
      className="flex h-11 w-11 items-center justify-center rounded-xl"
      style={{
        backgroundColor: selected ? `${accent}38` : `${accent}18`,
        color: accent,
      }}
    >
      <Icon className="h-5 w-5" strokeWidth={2.1} />
    </span>
  );
}

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

function LevelMark({
  level,
  color,
  legend,
}: {
  level: CaptureLevel;
  color: string;
  legend?: boolean;
}) {
  const mark =
    level === "yes" ? (
      <Check
        className={legend ? "h-3.5 w-3.5" : "h-4 w-4"}
        style={{ color }}
        strokeWidth={2.75}
      />
    ) : level === "some" ? (
      <Circle
        className="h-2.5 w-2.5"
        color={color}
        fill={color}
        strokeWidth={0}
      />
    ) : (
      <X
        className="h-3.5 w-3.5"
        style={{ color, opacity: legend ? 0.7 : 0.5 }}
        strokeWidth={2.5}
      />
    );

  return (
    <span
      className={legend ? "inline-flex items-center" : "mx-auto inline-flex"}
      aria-label={
        level === "yes"
          ? "Stops it well"
          : level === "some"
            ? "Catches some"
            : "Doesn't stop this"
      }
    >
      {mark}
    </span>
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
        "merv-tile flex h-full flex-col p-5 md:p-6",
        selected && "merv-tile-active",
      )}
      style={{ "--merv-wash": type.badgeColor } as CSSProperties}
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

        <MervBadge type={type} className="mb-4 max-w-[11rem]" />

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
        <div className="mb-8 flex flex-col gap-5 lg:mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-label">What it catches</span>
              <h2
                id="merv-heading"
                className="text-3xl font-bold tracking-tight text-white md:text-4xl"
              >
                What should your filter catch?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
                Think of the filter as a screen. A tighter screen catches smaller
                stuff. Pick the one that matches your house — the MERV number on
                the box is just the rating name.
              </p>
            </div>
            <Link href="/how-often-to-change-air-filter" className="section-link">
              When to change it <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
            role="tablist"
            aria-label="What your filter should catch"
          >
            {HOME_PICKS.map((pick) => {
              const on = pick.key === selected;
              const type = MERV_TYPES.find((t) => t.key === pick.key)!;
              const accent = GUIDE[pick.key].accent;
              return (
                <button
                  key={pick.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setSelected(pick.key)}
                  className={cn(
                    "rounded-2xl border px-3 py-3.5 text-left transition-colors sm:px-4 sm:py-4",
                    on ? "text-white" : "bg-white/5 text-white/70 hover:text-white",
                  )}
                  style={{
                    borderColor: on ? accent : "rgba(255,255,255,0.12)",
                    backgroundColor: on ? `${accent}24` : undefined,
                    boxShadow: on ? `0 0 0 1px ${accent}` : undefined,
                  }}
                >
                  <PickIcon
                    pickKey={pick.key}
                    accent={accent}
                    selected={on}
                  />
                  <p className="mt-3 text-sm font-bold leading-tight sm:text-base">
                    {pick.title}
                  </p>
                  <p className="mt-1 text-[0.72rem] leading-snug text-white/55 sm:text-xs">
                    {pick.blurb}
                  </p>
                  <p
                    className="mt-2 text-[0.62rem] font-extrabold uppercase tracking-[0.12em]"
                    style={{ color: on ? accent : "rgba(255,255,255,0.4)" }}
                  >
                    {type.name}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs leading-relaxed text-white/45 md:text-sm">
            Older furnaces usually do better with Everyday dust or Pets — the
            tightest screen can make it harder for air to move.
          </p>
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
          <div
            className="merv-tile p-6 md:p-7"
            style={{ "--merv-wash": selectedType.badgeColor } as CSSProperties}
          >
            <MervBadge type={selectedType} className="mb-4 max-w-[10rem]" />
            <p
              className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: selectedGuide.accent }}
            >
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
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: selectedType.badgeColor }}
            >
              Find your size
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Size first. Your chosen rating will be waiting on the product page.
            </p>
          </div>

          <div
            className="merv-tile overflow-x-auto p-5 md:p-6"
            style={{ "--merv-wash": selectedType.badgeColor } as CSSProperties}
          >
            <p className="mb-3 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-white/45">
              What it stops
            </p>
            <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.72rem] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <LevelMark level="yes" color="#8eb0d8" legend />
                Stops it well
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LevelMark level="some" color="#8eb0d8" legend />
                Catches some
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LevelMark level="no" color="#8eb0d8" legend />
                Doesn't stop this
              </span>
            </p>
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="pb-3 pr-3 text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-white/40">
                    Particle
                  </th>
                  {MERV_TYPES.map((type) => (
                    <th key={type.key} className="pb-3 text-center">
                      <span
                        className="inline-flex min-w-[3.4rem] items-center justify-center rounded px-1.5 py-1 text-[0.62rem] font-extrabold italic leading-none text-white"
                        style={{ backgroundColor: type.badgeColor }}
                      >
                        {type.key === "carbon"
                          ? "8 Carbon"
                          : type.name.replace("MERV ", "")}
                      </span>
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
                        className="py-2.5 text-center"
                        style={
                          type.key === selected
                            ? { backgroundColor: `${GUIDE[type.key].accent}22` }
                            : undefined
                        }
                      >
                        <LevelMark
                          level={row.levels[type.key]}
                          color={GUIDE[type.key].accent}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              If the furnace is older, start with Everyday dust or Pets unless
              the manual says a tighter filter is OK.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
