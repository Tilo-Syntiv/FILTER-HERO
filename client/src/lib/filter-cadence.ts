export type Thickness = 0.5 | 1 | 2 | 4 | 5;
export type MervKey = "8" | "11" | "13" | "carbon";
export type Pets = "none" | "one" | "pack";
export type Occupants = "quiet" | "family" | "full";

export type CadenceInput = {
  depth: Thickness;
  merv: MervKey;
  pets: Pets;
  occupants: Occupants;
  allergies: boolean;
  smoking: boolean;
  fanOn: boolean;
  dusty: boolean;
  smokeSeason: boolean;
  renovation: boolean;
};

export type CadenceHit = {
  label: string;
  detail: string;
};

export type CadenceResult = {
  days: number;
  label: string;
  nextDate: string;
  recommendedMerv: MervKey;
  recommendedMervName: string;
  inspectDays: number;
  hits: CadenceHit[];
  loadHint: string;
};

const BASE_DAYS: Record<Thickness, number> = {
  0.5: 30,
  1: 90,
  2: 120,
  4: 270,
  5: 330,
};

const MERV_NAME: Record<MervKey, string> = {
  "8": "MERV 8",
  "11": "MERV 11",
  "13": "MERV 13",
  carbon: "MERV 8 Carbon",
};

export const DEFAULT_CADENCE: CadenceInput = {
  depth: 1,
  merv: "8",
  pets: "none",
  occupants: "quiet",
  allergies: false,
  smoking: false,
  fanOn: false,
  dusty: false,
  smokeSeason: false,
  renovation: false,
};

function roundCadence(days: number, depth: Thickness): number {
  const min = depth === 0.5 ? 21 : 30;
  const max = BASE_DAYS[depth];
  const clamped = Math.min(max, Math.max(min, days));
  const step = clamped < 50 ? 7 : 15;
  return Math.round(clamped / step) * step;
}

export function cadenceLabel(days: number): string {
  if (days <= 30) return "Every 30 days";
  if (days <= 45) return "Every 6 weeks";
  if (days <= 60) return "Every 2 months";
  if (days <= 90) return "Every 3 months";
  if (days <= 120) return "Every 4 months";
  if (days <= 180) return "Every 6 months";
  if (days <= 270) return "Every 9 months";
  return "Once a year";
}

export function recommendMerv(input: CadenceInput): MervKey {
  if (input.smoking) return "carbon";
  if (input.allergies || input.smokeSeason) return "13";
  if (input.pets !== "none" || input.dusty || input.renovation) return "11";
  return "8";
}

function mervLoad(input: CadenceInput): number {
  const thick = input.depth >= 4;
  if (input.merv === "13") return thick ? 0.94 : 0.85;
  if (input.merv === "11") return thick ? 0.97 : 0.92;
  if (input.merv === "carbon") return 0.9;
  return 1;
}

export function computeCadence(input: CadenceInput, from = new Date()): CadenceResult {
  const hits: CadenceHit[] = [
    {
      label: `${formatDepth(input.depth)} media`,
      detail: `${BASE_DAYS[input.depth]}-day quiet-home baseline`,
    },
  ];

  let life = BASE_DAYS[input.depth];

  const apply = (multiplier: number, label: string, detail: string) => {
    if (multiplier >= 0.99) return;
    life *= multiplier;
    hits.push({
      label,
      detail,
    });
  };

  if (input.pets === "one") apply(0.75, "One pet", "Hair and dander load the pleats faster");
  if (input.pets === "pack") apply(0.55, "Multiple pets", "Pack shedding cuts life almost in half");
  if (input.occupants === "family") apply(0.85, "Family of 3–4", "More bodies, more indoor dust");
  if (input.occupants === "full") apply(0.7, "Busy house", "Five or more people accelerate soiling");
  if (input.allergies) apply(0.75, "Allergies / asthma", "Swap earlier so capture stays high");
  if (input.smoking) apply(0.65, "Indoor smoke", "Fine particles and odors saturate media");
  if (input.fanOn) apply(0.8, "Fan always on", "Air hits the filter around the clock");
  if (input.dusty) apply(0.7, "Dusty or dry climate", "Outdoor grit rides in on every cycle");
  if (input.smokeSeason) apply(0.6, "Smoke / wildfire season", "Inspect weekly until the air clears");
  if (input.renovation) apply(0.55, "Construction dust", "Drywall and sawdust clog a filter fast");

  const mervFactor = mervLoad(input);
  if (mervFactor < 0.99) {
    apply(
      mervFactor,
      MERV_NAME[input.merv],
      input.depth >= 4
        ? "Higher MERV on thick media still lasts"
        : "Tighter pleats load a little sooner",
    );
  }

  const days = roundCadence(life, input.depth);
  const next = new Date(from);
  next.setDate(next.getDate() + days);

  const rec = recommendMerv(input);
  const loadHint =
    days <= 45
      ? "This home runs hot. Keep a spare in the closet."
      : days <= 90
        ? "A typical cadence. Inspect on the first of each month."
        : "Thick media is doing the work. Still peek at it monthly.";

  return {
    days,
    label: cadenceLabel(days),
    nextDate: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(next),
    recommendedMerv: rec,
    recommendedMervName: MERV_NAME[rec],
    inspectDays: days <= 45 ? 14 : 30,
    hits,
    loadHint,
  };
}

export function formatDepth(depth: number): string {
  return depth === 0.5 ? '½"' : `${depth}"`;
}

export function urgencyTone(days: number): "hot" | "mid" | "calm" {
  if (days <= 45) return "hot";
  if (days <= 90) return "mid";
  return "calm";
}
