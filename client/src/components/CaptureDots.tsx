import type { PreferredMerv } from "@/lib/merv-pref";
import { MERV_GUIDE } from "@/lib/merv-guide";

const DOT_SPEC: Record<
  PreferredMerv,
  { grow: boolean; size: number; accent?: string }
> = {
  "8": { grow: false, size: 8 },
  carbon: { grow: false, size: 8, accent: "#f7f8fb" },
  "11": { grow: false, size: 10 },
  "13": { grow: true, size: 7 },
};

export default function CaptureDots({
  merv,
  compact = false,
}: {
  merv: PreferredMerv;
  compact?: boolean;
}) {
  const spec = DOT_SPEC[merv];
  const filled = MERV_GUIDE[merv].strength;
  const accent = spec.accent ?? MERV_GUIDE[merv].accent;
  const scale = compact ? 0.82 : 1;

  return (
    <div className="flex items-end justify-center gap-1.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const on = i < filled;
        const size = (spec.grow ? spec.size + i * 3 : spec.size) * scale;
        return (
          <span
            key={i}
            className="rounded-full"
            style={{
              width: size,
              height: size,
              background: on ? accent : "transparent",
              border: `${1.5 * scale}px solid ${accent}`,
              opacity: on ? 1 : 0.28,
            }}
          />
        );
      })}
    </div>
  );
}
