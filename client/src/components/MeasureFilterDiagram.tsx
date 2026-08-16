import { useEffect, useState, type CSSProperties } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type DimKey = "width" | "length" | "depth";

const DIMS: {
  key: DimKey;
  label: string;
  hint: string;
}[] = [
  { key: "width", label: "Width", hint: "Side to side" },
  { key: "length", label: "Length", hint: "Top to bottom" },
  { key: "depth", label: "Depth", hint: "Front to back" },
];

const CYCLE_MS = 3200;

function DimensionLine({
  active,
  reduceMotion,
}: {
  active: DimKey;
  reduceMotion: boolean | null;
}) {
  const ease = [0.22, 1, 0.36, 1] as const;
  const draw = reduceMotion
    ? { pathLength: 1, opacity: 1 }
    : { pathLength: [0, 1], opacity: [0.2, 1] };

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id="iceStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8eb0d8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#8eb0d8" stopOpacity="1" />
          <stop offset="100%" stopColor="#8eb0d8" stopOpacity="0.2" />
        </linearGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g opacity={active === "width" ? 1 : 0.22} style={{ transition: "opacity 0.4s ease" }}>
        <line x1="18" y1="14" x2="18" y2="22" stroke="#8eb0d8" strokeWidth="0.35" strokeDasharray="0.8 1.1" />
        <line x1="82" y1="14" x2="82" y2="20" stroke="#8eb0d8" strokeWidth="0.35" strokeDasharray="0.8 1.1" />
        <motion.line
          key={`w-${active === "width"}`}
          x1="18"
          y1="14"
          x2="82"
          y2="14"
          stroke="url(#iceStroke)"
          strokeWidth="0.7"
          strokeLinecap="round"
          filter="url(#softGlow)"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
          animate={active === "width" ? draw : { pathLength: 1, opacity: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease }}
        />
        {!reduceMotion && active === "width" && (
          <motion.circle
            r="1.1"
            fill="#8eb0d8"
            initial={{ cx: 18, cy: 14, opacity: 0 }}
            animate={{ cx: [18, 82], cy: 14, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
          />
        )}
      </g>

      <g opacity={active === "length" ? 1 : 0.22} style={{ transition: "opacity 0.4s ease" }}>
        <line x1="82" y1="20" x2="90" y2="20" stroke="#8eb0d8" strokeWidth="0.35" strokeDasharray="0.8 1.1" />
        <line x1="78" y1="88" x2="90" y2="88" stroke="#8eb0d8" strokeWidth="0.35" strokeDasharray="0.8 1.1" />
        <motion.line
          key={`l-${active === "length"}`}
          x1="90"
          y1="20"
          x2="90"
          y2="88"
          stroke="url(#iceStroke)"
          strokeWidth="0.7"
          strokeLinecap="round"
          filter="url(#softGlow)"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
          animate={active === "length" ? draw : { pathLength: 1, opacity: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease }}
        />
        {!reduceMotion && active === "length" && (
          <motion.circle
            r="1.1"
            fill="#8eb0d8"
            initial={{ cx: 90, cy: 20, opacity: 0 }}
            animate={{ cx: 90, cy: [20, 88], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
          />
        )}
      </g>

      <g opacity={active === "depth" ? 1 : 0.22} style={{ transition: "opacity 0.4s ease" }}>
        <motion.line
          key={`d-${active === "depth"}`}
          x1="12"
          y1="42"
          x2="17.5"
          y2="58"
          stroke="#8eb0d8"
          strokeWidth="0.75"
          strokeLinecap="round"
          filter="url(#softGlow)"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
          animate={active === "depth" ? draw : { pathLength: 1, opacity: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease }}
        />
        <line
          x1="14.5"
          y1="49.5"
          x2="6"
          y2="49.5"
          stroke="#8eb0d8"
          strokeWidth="0.45"
          opacity={active === "depth" ? 0.9 : 0.35}
        />
        {!reduceMotion && active === "depth" && (
          <motion.circle
            cx="14.5"
            cy="49.5"
            r="1.3"
            fill="#8eb0d8"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </g>
    </svg>
  );
}

function DimLabel({
  dim,
  active,
  style,
}: {
  dim: (typeof DIMS)[number];
  active: boolean;
  style: CSSProperties;
}) {
  return (
    <motion.div
      className="absolute z-10 pointer-events-none"
      style={style}
      animate={{
        opacity: active ? 1 : 0.35,
        scale: active ? 1 : 0.94,
        y: active ? 0 : 4,
      }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <div
        className={[
          "rounded-full border px-3 py-1.5 shadow-lg backdrop-blur-md",
          active
            ? "border-ice/60 bg-deep/90 text-white shadow-ice/20"
            : "border-white/40 bg-white/70 text-deep/70",
        ].join(" ")}
      >
        <p className="text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase leading-none">
          {dim.label}
        </p>
        <AnimatePresence mode="wait">
          {active && (
            <motion.p
              key={dim.key}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[10px] text-ice/90 mt-1 font-medium tracking-wide"
            >
              {dim.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface MeasureFilterDiagramProps {
  active?: DimKey;
  onActiveChange?: (key: DimKey) => void;
  autoplay?: boolean;
}

export default function MeasureFilterDiagram({
  active: controlled,
  onActiveChange,
  autoplay = true,
}: MeasureFilterDiagramProps) {
  const reduceMotion = useReducedMotion();
  const [internal, setInternal] = useState<DimKey>("width");
  const active = controlled ?? internal;

  const setActive = (key: DimKey) => {
    setInternal(key);
    onActiveChange?.(key);
  };

  useEffect(() => {
    if (!autoplay || reduceMotion) return;
    const id = window.setInterval(() => {
      setInternal((prev) => {
        const current = controlled ?? prev;
        const i = DIMS.findIndex((d) => d.key === current);
        const next = DIMS[(i + 1) % DIMS.length].key;
        onActiveChange?.(next);
        return next;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [autoplay, reduceMotion, controlled, onActiveChange]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#e8edf4_70%,#d0d8e4_100%)]">
        <div
          className="pointer-events-none absolute bottom-[8%] left-1/2 h-6 w-[55%] -translate-x-1/2 rounded-[100%] bg-deep/10 blur-md"
          aria-hidden
        />

        <motion.img
          src="/filter-measure.png"
          alt="Sample HVAC air filter showing Width, Length, and Depth"
          className="absolute inset-[6%] h-[88%] w-[88%] object-contain"
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        <AnimatePresence mode="wait">
          {!reduceMotion && (
            <motion.div
              key={active}
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background:
                  active === "width"
                    ? "linear-gradient(180deg, rgba(142,176,216,0.18) 0%, transparent 28%)"
                    : active === "length"
                      ? "linear-gradient(270deg, rgba(142,176,216,0.16) 0%, transparent 32%)"
                      : "linear-gradient(90deg, rgba(142,176,216,0.16) 0%, transparent 30%)",
              }}
            />
          )}
        </AnimatePresence>

        <DimensionLine active={active} reduceMotion={reduceMotion} />

        <DimLabel
          dim={DIMS[0]}
          active={active === "width"}
          style={{ top: "3%", left: "50%", transform: "translateX(-50%)" }}
        />
        <DimLabel
          dim={DIMS[1]}
          active={active === "length"}
          style={{ right: "1%", top: "48%", transform: "translateY(-50%)" }}
        />
        <DimLabel
          dim={DIMS[2]}
          active={active === "depth"}
          style={{ left: "1%", top: "48%", transform: "translateY(-50%)" }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {DIMS.map((dim) => {
          const isOn = active === dim.key;
          return (
            <button
              key={dim.key}
              type="button"
              onClick={() => setActive(dim.key)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all",
                isOn
                  ? "bg-deep text-ice shadow-md"
                  : "bg-white/80 text-muted-foreground border border-border hover:border-ice/60 hover:text-foreground",
              ].join(" ")}
              aria-pressed={isOn}
            >
              {dim.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { DimKey };
export { DIMS };
