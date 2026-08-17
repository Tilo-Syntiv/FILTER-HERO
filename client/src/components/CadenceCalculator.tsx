import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CADENCE,
  computeCadence,
  formatDepth,
  urgencyTone,
  type CadenceInput,
  type MervKey,
  type Occupants,
  type Pets,
  type Thickness,
} from "@/lib/filter-cadence";
import { MERV_TYPES, THICKNESSES } from "@shared/products";

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all",
        selected
          ? "border-navy bg-navy text-white shadow-sm"
          : "border-border bg-white text-foreground hover:border-ice",
      )}
    >
      {children}
    </button>
  );
}

function ToggleChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-2xl border px-3.5 py-2.5 text-left text-sm font-semibold transition-all",
        selected
          ? "border-hero/40 bg-hero text-white shadow-sm"
          : "border-border bg-white text-foreground hover:border-ice",
      )}
    >
      {children}
    </button>
  );
}

function FilterClockFace({ days, label }: { days: number; label: string }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const year = 365;
  const progress = Math.min(1, days / year);
  const tone = urgencyTone(days);
  const color =
    tone === "hot" ? "#7f2328" : tone === "mid" ? "#3a66a3" : "#8eb0d8";
  const dirt = Math.max(0.12, 1 - days / 330);

  return (
    <div className="relative mx-auto w-full max-w-[17.5rem]">
      <svg viewBox="0 0 200 200" className="h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id="clock-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#203868" />
          </linearGradient>
          <pattern id="pleats" width="8" height="80" patternUnits="userSpaceOnUse">
            <rect width="8" height="80" fill="#f4f1ea" />
            <path d="M0 0 L4 8 L8 0 L8 80 L4 72 L0 80 Z" fill="#e8e2d4" />
          </pattern>
        </defs>
        <circle cx="100" cy="100" r="92" fill="#141e30" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(142,176,216,0.18)"
          strokeWidth="10"
        />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="url(#clock-ring)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          transform="rotate(-90 100 100)"
          className="cadence-ring"
        />
        <rect x="78" y="36" width="44" height="28" rx="3" fill="url(#pleats)" />
        <rect
          x="78"
          y="36"
          width="44"
          height="28"
          rx="3"
          fill={`rgba(40,36,30,${dirt * 0.72})`}
        />
        <rect
          x="78"
          y="36"
          width="44"
          height="28"
          rx="3"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-7 text-center">
        <p className="text-[2.75rem] font-extrabold leading-none tracking-tight text-white">
          {days}
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ice">
          days
        </p>
        <p className="mt-1 max-w-[9rem] text-xs font-semibold text-white/70">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function CadenceCalculator() {
  const [input, setInput] = useState<CadenceInput>(DEFAULT_CADENCE);
  const result = useMemo(() => computeCadence(input), [input]);
  const set = <K extends keyof CadenceInput>(key: K, value: CadenceInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(165deg,#141e30_0%,#203868_58%,#1b3258_100%)] shadow-[0_24px_60px_rgba(16,24,40,0.28)]">
      <div className="grid lg:grid-cols-12">
        <div className="relative flex flex-col items-center justify-center px-6 py-8 text-white lg:col-span-5">
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ice">
            Your Filter Clock
          </p>
          <FilterClockFace days={result.days} label={result.label} />
          <p
            className="seo-answer mt-4 max-w-xs text-center text-sm leading-relaxed text-white/80"
            aria-live="polite"
          >
            Change on <strong className="text-white">{result.nextDate}</strong> if
            you swap today. Inspect every {result.inspectDays} days.
          </p>
          <p className="mt-2 max-w-xs text-center text-xs text-ice/90">
            {result.loadHint}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {result.hits.slice(1).map((hit) => (
              <span
                key={hit.label}
                className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ice"
                title={hit.detail}
              >
                {hit.label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-6 bg-[linear-gradient(180deg,#fafbfc_0%,#eef1f6_100%)] px-4 py-6 sm:px-7 sm:py-8 lg:col-span-7">
          <fieldset>
            <legend className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              Thickness
            </legend>
            <div className="flex flex-wrap gap-2">
              {THICKNESSES.map((d) => (
                <Chip
                  key={d}
                  selected={input.depth === d}
                  onClick={() => set("depth", d as Thickness)}
                >
                  {formatDepth(d)}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              MERV
            </legend>
            <div className="flex flex-wrap gap-2">
              {MERV_TYPES.map((m) => (
                <Chip
                  key={m.key}
                  selected={input.merv === m.key}
                  onClick={() => set("merv", m.key as MervKey)}
                >
                  {m.name}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              Pets
            </legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["none", "No pets"],
                  ["one", "One pet"],
                  ["pack", "A pack"],
                ] as [Pets, string][]
              ).map(([id, label]) => (
                <Chip
                  key={id}
                  selected={input.pets === id}
                  onClick={() => set("pets", id)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              Who lives here
            </legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["quiet", "1–2 people"],
                  ["family", "3–4 people"],
                  ["full", "5+ people"],
                ] as [Occupants, string][]
              ).map(([id, label]) => (
                <Chip
                  key={id}
                  selected={input.occupants === id}
                  onClick={() => set("occupants", id)}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
              Extra load
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <ToggleChip
                selected={input.allergies}
                onClick={() => set("allergies", !input.allergies)}
              >
                Allergies / asthma
              </ToggleChip>
              <ToggleChip
                selected={input.smoking}
                onClick={() => set("smoking", !input.smoking)}
              >
                Indoor smoke
              </ToggleChip>
              <ToggleChip
                selected={input.fanOn}
                onClick={() => set("fanOn", !input.fanOn)}
              >
                Fan always on
              </ToggleChip>
              <ToggleChip
                selected={input.dusty}
                onClick={() => set("dusty", !input.dusty)}
              >
                Dusty / dry air
              </ToggleChip>
              <ToggleChip
                selected={input.smokeSeason}
                onClick={() => set("smokeSeason", !input.smokeSeason)}
              >
                Wildfire smoke
              </ToggleChip>
              <ToggleChip
                selected={input.renovation}
                onClick={() => set("renovation", !input.renovation)}
              >
                Renovation dust
              </ToggleChip>
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 rounded-2xl border border-ice/40 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Suggested MERV
              </p>
              <p className="text-lg font-extrabold tracking-tight">
                {result.recommendedMervName}
              </p>
              <p className="text-sm text-muted-foreground">
                Matched to the load you just tapped.
              </p>
            </div>
            <Link
              href="/#finder"
              className="hero-shop-btn inline-flex h-12 items-center justify-center px-6 text-white"
            >
              Find your size
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
