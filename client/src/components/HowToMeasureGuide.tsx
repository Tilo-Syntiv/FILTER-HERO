import { useState, type ReactNode } from "react";
import { BRAND_NAME } from "@/const";
import MeasureFilterDiagram, {
  type DimKey,
} from "@/components/MeasureFilterDiagram";

const STEPS: {
  key: DimKey;
  num: string;
  title: string;
  body: string;
  tag: string;
  icon: ReactNode;
}[] = [
  {
    key: "width",
    num: "01",
    title: "Measure the Width",
    body: "Measure the shorter outer edge of the filter frame, side to side.",
    tag: "Edge-to-edge",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect x="2" y="8" width="20" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M6 8v3M10 8v4M14 8v3M18 8v4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "length",
    num: "02",
    title: "Measure the Length",
    body: "Measure the longer outer edge of the filter frame, top to bottom.",
    tag: "Edge-to-edge",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect x="8" y="2" width="8" height="20" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8 6h3M8 10h4M8 14h3M8 18h4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    key: "depth",
    num: "03",
    title: "Measure the Depth",
    body: 'Measure the thickness from front face to back face — usually 1", 2" or 4".',
    tag: "Front-to-back",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M12 3l9 5-9 5-9-5 9-5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M3 13l9 5 9-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const NOTES = [
  {
    label: "Nominal size",
    value: "20 × 25 × 1",
    desc: "The rounded size printed on the filter — use this when ordering.",
    tone: "bg-deep",
  },
  {
    label: "Actual size",
    value: "19½ × 24½ × ¾",
    desc: "The true dimensions when you put a tape measure to the filter itself.",
    tone: "bg-navy",
  },
  {
    label: "Depth note",
    value: '1" ≈ ¾" actual',
    desc: "Actual depth can vary by brand even when the nominal depth matches.",
    tone: "bg-[linear-gradient(135deg,#203868_0%,#8eb0d8_140%)]",
  },
];

export default function HowToMeasureGuide() {
  const [activeDim, setActiveDim] = useState<DimKey>("width");

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-3xl surface-panel">
        <div className="relative bg-[linear-gradient(125deg,#141e30_0%,#203868_55%,#3a66a3_120%)] px-6 py-8 md:px-10 md:py-10 text-white overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(500px 280px at 90% -10%, rgba(142,176,216,0.45), transparent 60%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "linear-gradient(180deg, black, transparent 85%)",
            }}
          />
          <p className="relative text-xs font-bold tracking-[0.2em] uppercase text-ice mb-3">
            Sizing guide
          </p>
          <h3 className="relative text-2xl md:text-3xl font-bold tracking-tight mb-3 max-w-xl">
            How to measure your air filter
          </h3>
          <p className="relative text-sm md:text-base text-white/75 max-w-xl leading-relaxed">
            Grab a tape measure and check your existing filter in three steps —
            Width, Length, then Depth — so {BRAND_NAME} can match you to the exact
            size every time.
          </p>
        </div>

        <div className="relative px-4 pb-6 pt-6 md:px-8 md:pb-8">
          <div className="relative rounded-2xl border border-border/80 bg-[linear-gradient(180deg,#fafbfc_0%,#eef1f6_100%)] p-4 md:p-6 overflow-hidden">
            <span className="absolute top-0 left-5 -translate-y-1/2 rounded-full bg-hero text-white text-[10px] md:text-xs font-bold tracking-[0.16em] uppercase px-3 py-1.5">
              Live example
            </span>
            <MeasureFilterDiagram
              active={activeDim}
              onActiveChange={setActiveDim}
              autoplay
            />
            <p className="mt-5 text-center text-xs md:text-sm font-semibold text-foreground">
              Always measure in this order{" "}
              <span className="text-primary">Width × Length × Depth</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg md:text-xl font-bold mb-1 tracking-tight">
          Three measurements, one perfect fit
        </h4>
        <p className="text-sm text-muted-foreground mb-5">
          Round to the nearest ¼ inch — that&apos;s all the precision you need.
          Tap a step or watch the diagram cycle.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
          {STEPS.map((step) => {
            const isActive = activeDim === step.key;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveDim(step.key)}
                className={[
                  "relative rounded-2xl border p-5 text-left transition-all",
                  isActive
                    ? "border-ice bg-white shadow-md ring-2 ring-ice/40"
                    : "border-border/80 bg-white/80 hover:border-ice/50",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-colors",
                    isActive ? "bg-deep text-ice" : "bg-deep/90 text-ice/80",
                  ].join(" ")}
                >
                  {step.icon}
                </div>
                <span className="absolute top-4 right-4 text-3xl font-extrabold text-muted/80 leading-none">
                  {step.num}
                </span>
                <h5 className="font-bold text-base mb-2 tracking-tight">{step.title}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
                <span className="inline-block mt-4 text-[10px] font-bold tracking-[0.14em] uppercase text-primary bg-secondary px-2.5 py-1 rounded-full">
                  {step.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
        {NOTES.map((note) => (
          <div
            key={note.label}
            className={`relative overflow-hidden rounded-2xl ${note.tone} text-white p-5`}
          >
            <div className="absolute -right-8 -bottom-8 h-28 w-28 rounded-full bg-white/10" />
            <p className="relative text-[10px] font-bold tracking-[0.18em] uppercase text-white/80 mb-2">
              {note.label}
            </p>
            <p className="relative text-xl md:text-2xl font-bold tracking-tight mb-2">
              {note.value}
            </p>
            <p className="relative text-sm text-white/85 leading-relaxed">{note.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
