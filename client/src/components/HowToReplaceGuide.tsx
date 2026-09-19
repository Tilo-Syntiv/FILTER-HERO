import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { BRAND_NAME } from "@/const";
import { CHANGE_GUIDE_PATH } from "@shared/seo";
import LifeImage from "@/components/LifeImage";
import { LIFE, type LifePhoto } from "@/data/life-photos";

const SHOTS: { photo: LifePhoto; caption: string }[] = [
  {
    photo: LIFE.howToInstall,
    caption: "Ceiling return — 3 steps",
  },
  {
    photo: LIFE.installWall,
    caption: "Wall return",
  },
  {
    photo: LIFE.installCeiling,
    caption: "Seat it flush",
  },
];

export default function HowToReplaceGuide() {
  const [hero, ...rest] = SHOTS;

  return (
    <div id="how-to-replace" className="scroll-mt-40 space-y-6 md:scroll-mt-32">
      <div className="relative overflow-hidden rounded-3xl surface-panel">
        <div className="relative bg-[linear-gradient(125deg,#141e30_0%,#203868_55%,#3a66a3_120%)] px-4 py-7 md:px-10 md:py-10 text-white overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(500px 280px at 90% -10%, rgba(142,176,216,0.45), transparent 60%)",
            }}
          />
          <p className="relative text-xs font-bold tracking-[0.2em] uppercase text-ice mb-3">
            How to
          </p>
          <h3 className="relative text-2xl md:text-3xl font-bold tracking-tight mb-3 max-w-xl">
            Replace your air filter
          </h3>
          <p className="relative text-sm md:text-base text-white/75 max-w-2xl leading-relaxed">
            Kill power, pull the old filter, and seat the new one with the arrow
            toward the system. Five minutes, no tools — {BRAND_NAME} drops into
            the same slot you just emptied.
          </p>
          <Link
            href={CHANGE_GUIDE_PATH}
            className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-ice hover:text-white transition-colors"
          >
            Full change guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative space-y-4 px-4 pb-6 pt-6 md:px-8 md:pb-8">
          <figure className="overflow-hidden rounded-2xl border border-border/80 bg-white">
            <LifeImage
              photo={hero.photo}
              className="w-full bg-white"
              imgClassName="!h-auto w-full object-contain"
              sizes="(max-width: 768px) 100vw, 720px"
            />
            <figcaption className="border-t border-border/60 px-4 py-2.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-navy">
              {hero.caption}
            </figcaption>
          </figure>

          <div className="grid gap-3 sm:grid-cols-2">
            {rest.map((shot) => (
              <figure
                key={shot.caption}
                className="overflow-hidden rounded-2xl border border-border/80 bg-muted"
              >
                <LifeImage
                  photo={shot.photo}
                  className="h-40 sm:h-44"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                <figcaption className="bg-white px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-navy">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
