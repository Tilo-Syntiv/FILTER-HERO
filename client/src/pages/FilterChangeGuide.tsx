import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Calendar,
  Eye,
  Fan,
  Lightbulb,
  Package,
  Power,
  Wind,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import CadenceCalculator from "@/components/CadenceCalculator";
import FaqSection from "@/components/FaqSection";
import { getSiteUrl, useSeo } from "@/hooks/useSeo";
import { useHashScroll } from "@/hooks/useHashScroll";
import { takeQuoteHandoff } from "@/lib/quote-handoff";
import { formatDepth } from "@/lib/filter-cadence";
import { BRAND_NAME } from "@/const";
import {
  CHANGE_GUIDE_FAQS,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHowToChangeFilterSchema,
  buildSpeakableSchema,
  filterChangeGuideSeo,
} from "@shared/seo";

const TOC = [
  { href: "#cadence", label: "Your clock" },
  { href: "#why", label: "Why it matters" },
  { href: "#thickness", label: "By thickness" },
  { href: "#signs", label: "Signs" },
  { href: "#light-test", label: "Light test" },
  { href: "#how-to", label: "How to swap" },
  { href: "#wait", label: "If you wait" },
  { href: "#faq", label: "FAQ" },
];

const THICKNESS_LIFE = [
  {
    depth: 0.5,
    range: "Every month",
    days: 30,
    note: "Shallow slot. Almost no extra media. Treat it like a monthly chore.",
  },
  {
    depth: 1,
    range: "30–90 days",
    days: 90,
    note: "The standard American filter. Pets and pollen pull you toward 30.",
  },
  {
    depth: 2,
    range: "90–120 days",
    days: 120,
    note: "More pleats, more breathing room. A sweet spot for busy homes.",
  },
  {
    depth: 4,
    range: "6–9 months",
    days: 240,
    note: "Media-cabinet territory. Still inspect monthly — don’t trust the calendar alone.",
  },
  {
    depth: 5,
    range: "9–12 months",
    days: 330,
    note: "High-capacity racks. One filter can cover a heating season and a cooling season.",
  },
];

const PILLARS = [
  {
    k: "01",
    title: "The air you actually breathe",
    body: "Americans spend about 90% of their time indoors. A loaded filter stops capturing dust, dander, pollen, and smoke — and starts letting that mix recirculate.",
    source: "EPA indoor air guidance",
  },
  {
    k: "02",
    title: "The system that moves it",
    body: "A clogged filter starves the blower. The motor, coils, and heat exchanger work harder, run hotter, and fail sooner. A $18 filter is cheaper than a service call.",
    source: "HVAC maintenance reality",
  },
  {
    k: "03",
    title: "The bill on the fridge",
    body: "The U.S. Department of Energy notes a dirty filter can lift cooling costs 5–15%. The system runs longer to hit the same setpoint. You pay for air that never arrives.",
    source: "energy.gov",
  },
];

const SIGNS = [
  {
    title: "The media went gray",
    body: "White when new. Storm-cloud when done. If you can’t see the original color, swap it.",
  },
  {
    title: "No light through the pleats",
    body: "Hold it to a lamp. If the glow dies, the filter is a wall, not a sieve.",
  },
  {
    title: "Vents feel weak",
    body: "Rooms that used to throw cold air now whisper. Restricted return air is a classic clog.",
  },
  {
    title: "Rooms don’t match",
    body: "Upstairs sauna, downstairs cave. Uneven temps often start at a packed filter.",
  },
  {
    title: "Short cycling",
    body: "The system slams on and off. It’s fighting for airflow it no longer has.",
  },
  {
    title: "A whistle at the slot",
    body: "Air screaming through a blocked media sounds like a kettle. Time’s up.",
  },
  {
    title: "Dust on everything",
    body: "Furniture films over in a week. The filter isn’t catching — or air is bypassing it.",
  },
  {
    title: "Allergies flare at home",
    body: "Symptoms that ease outdoors and spike indoors are a filter problem until proven otherwise.",
  },
  {
    title: "The bill jumped",
    body: "No new thermostat habits, same weather, higher kWh. Check the filter before you blame the utility.",
  },
  {
    title: "The house smells stale",
    body: "Musty return air means saturated media. Carbon helps odors — but only while the carbon is fresh.",
  },
];

const STEPS: { num: string; title: string; body: string; icon: ReactNode }[] = [
  {
    num: "01",
    title: "Kill the system",
    body: "Set the thermostat to off. You’re about to open the lungs of the house — don’t let the blower pull while the slot is empty.",
    icon: <Power className="h-5 w-5" />,
  },
  {
    num: "02",
    title: "Find the slot",
    body: "Wall or ceiling return grille, or a rack on the furnace / air handler. Big homes often have more than one. Change every filter, not just the obvious one.",
    icon: <Eye className="h-5 w-5" />,
  },
  {
    num: "03",
    title: "Read the frame",
    body: "Size is printed as Width × Length × Depth. Photograph it. Note the airflow arrow — it points toward the equipment, not toward the room.",
    icon: <Package className="h-5 w-5" />,
  },
  {
    num: "04",
    title: "Light-test the old one",
    body: "Slide it out. Hold it to a lamp. Gray, torn, wet, or opaque? It does not go back in.",
    icon: <Lightbulb className="h-5 w-5" />,
  },
  {
    num: "05",
    title: "Seat the new one",
    body: "Arrow toward the furnace. Snug in the rack, no bent cardboard, no gaps at the edges. Restore power. Feel a vent — the house should exhale again.",
    icon: <Fan className="h-5 w-5" />,
  },
];

const WAIT_STAGES = [
  {
    when: "1–2 months late",
    what: "Dust wins. Energy creeps 5–15%. You probably haven’t noticed yet — that’s the trap.",
    cost: "Quiet money leak",
  },
  {
    when: "3–6 months late",
    what: "Weak airflow, uneven rooms, a film on the TV. The blower is already working overtime.",
    cost: "Comfort + wear",
  },
  {
    when: "6–12 months late",
    what: "Iced evaporator coils in summer. Overheated furnace in winter. Service techs see this every week.",
    cost: "$150–$500 repairs",
  },
  {
    when: "A year or more",
    what: "Heat exchanger stress, compressor strain, the kind of failure that becomes a replacement quote.",
    cost: "$1,000–$5,000+",
  },
];

function LightTest() {
  const [load, setLoad] = useState(28);
  const verdict =
    load < 35
      ? { title: "Still breathing", body: "Light still punches through. Keep it — and check again next month." }
      : load < 70
        ? { title: "Swap this week", body: "The glow is fading. Order now so you’re not hunting a size on a hot Saturday." }
        : { title: "Change tonight", body: "That’s a wall. The system is lifting weights it was never meant to lift." };

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
      <div className="relative overflow-hidden rounded-3xl bg-deep lg:col-span-7">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 18%, rgba(255,244,214,${0.55 - load / 220}) 0%, transparent 42%)`,
          }}
        />
        <div className="relative px-6 py-10 sm:px-10 sm:py-12">
          <p className="mb-6 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-ice">
            Hold it to the light
          </p>
          <div className="mx-auto max-w-md">
            <div className="light-test-frame relative mx-auto aspect-[16/10] overflow-hidden rounded-md border border-white/20 bg-[#f4f1ea]">
              <div className="absolute inset-0 light-test-pleats" />
              <div
                className="absolute inset-0 transition-[background] duration-200"
                style={{
                  background: `linear-gradient(180deg, rgba(45,40,32,${load / 135}), rgba(20,18,14,${load / 110}))`,
                }}
              />
              <div
                className="absolute inset-0 mix-blend-screen transition-opacity duration-200"
                style={{
                  opacity: Math.max(0, 0.55 - load / 160),
                  background:
                    "radial-gradient(ellipse at 50% 0%, rgba(255,236,180,0.9), transparent 55%)",
                }}
              />
            </div>
          </div>
          <label className="mt-8 block">
            <span className="mb-2 block text-center text-xs font-bold uppercase tracking-[0.14em] text-white/70">
              Drag the dirt
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={load}
              onChange={(e) => setLoad(Number(e.target.value))}
              className="light-test-slider w-full"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={load}
              aria-label="Filter dirt level"
            />
          </label>
        </div>
      </div>
      <div className="lg:col-span-5">
        <span className="section-label">The 10-second test</span>
        <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
          If light can’t get through, air can’t either.
        </h2>
        <p className="mb-6 max-w-md text-muted-foreground leading-relaxed">
          Pull the filter. Stand under a lamp. A living filter still glows between
          the pleats. A dead one is a silhouette. No app required.
        </p>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-hero">
            Verdict
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight">{verdict.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {verdict.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FilterChangeGuidePage() {
  const siteUrl = getSiteUrl();
  const seo = filterChangeGuideSeo(siteUrl);
  const [activeDepth, setActiveDepth] = useState(1);
  useHashScroll();

  useSeo({
    ...seo,
    type: "article",
    jsonLd: [
      buildBreadcrumbSchema(siteUrl, [
        { name: "Home", path: "/" },
        { name: "When to change your filter", path: seo.path },
      ]),
      buildArticleSchema(siteUrl, seo),
      buildHowToChangeFilterSchema(siteUrl),
      buildFaqSchema(CHANGE_GUIDE_FAQS),
      buildSpeakableSchema(siteUrl, [
        ".seo-answer",
        ".seo-speakable-q",
        ".seo-speakable-a",
      ]),
    ],
  });

  const activeLife =
    THICKNESS_LIFE.find((t) => t.depth === activeDepth) ?? THICKNESS_LIFE[1];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-[linear-gradient(125deg,#141e30_0%,#203868_55%,#3a66a3_120%)] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(560px 320px at 88% -8%, rgba(142,176,216,0.5), transparent 60%)",
            }}
          />
          <div className="container relative py-12 md:py-16">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
              <Link href="/" className="hover:text-white">
                Home
              </Link>{" "}
              / When to change
            </nav>
            <span className="section-label !text-ice">Filter Clock</span>
            <h1 className="mb-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your filter has a clock.
            </h1>
            <p className="seo-answer mb-8 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Most homes should change a 1-inch HVAC filter every 30 to 90 days.
              Pets, allergies, dust, and a system that runs hard pull you toward
              30. A 2-inch filter often lasts 90–120 days; 4-inch and 5-inch
              media can go 6–12 months. Inspect monthly either way — the calendar
              is a guess, the filter is the evidence.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#cadence" className="hero-shop-btn inline-flex h-12 items-center justify-center px-7 text-white">
                Get your number
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/#finder"
                className="inline-flex h-12 items-center justify-center rounded-none border border-white/25 px-6 text-sm font-extrabold uppercase italic tracking-[0.04em] text-white hover:bg-white/10"
              >
                Shop your size
              </Link>
            </div>
            <nav
              aria-label="On this page"
              className="mt-10 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TOC.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-white/20 bg-white/8 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-ice hover:border-ice hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section id="cadence" className="scroll-mt-28 py-12 md:py-16">
          <div className="container">
            <div className="mb-8 max-w-2xl">
              <span className="section-label">Tap your home</span>
              <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
                Stop guessing 90 days.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Thickness sets the baseline. Pets, people, pollen, and how hard
                the fan runs move the hand. The clock on the left updates as you
                tap — that’s your change date, not a brochure average.
              </p>
            </div>
            <CadenceCalculator />
          </div>
        </section>

        <section id="why" className="scroll-mt-28 py-16 md:py-24">
          <div className="container">
            <span className="section-label">Three jobs, one rectangle</span>
            <h2 className="mb-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              A dirty filter doesn’t just look bad. It taxes the whole house.
            </h2>
            <p className="mb-10 max-w-2xl text-muted-foreground leading-relaxed">
              Replacement isn’t a personality trait. It’s indoor air, equipment
              life, and the power bill — in that order.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {PILLARS.map((p) => (
                <article
                  key={p.k}
                  className="relative overflow-hidden rounded-2xl bg-deep p-6 text-white"
                >
                  <span className="absolute right-4 top-3 text-4xl font-extrabold text-white/10">
                    {p.k}
                  </span>
                  <h3 className="relative mb-3 text-xl font-bold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="relative text-sm leading-relaxed text-white/80">
                    {p.body}
                  </p>
                  <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ice">
                    {p.source}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="thickness" className="scroll-mt-28 py-16 md:py-24">
          <div className="container">
            <span className="section-label">Media depth</span>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Thicker filters live longer. That’s physics, not marketing.
            </h2>
            <p className="mb-10 max-w-2xl text-muted-foreground leading-relaxed">
              Extra inches mean extra pleat area. Particles have more places to
              land before the filter becomes a dam. Tap a thickness — the bar is
              lifespan, not price.
            </p>
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-7">
                {THICKNESS_LIFE.map((t) => {
                  const on = t.depth === activeDepth;
                  return (
                    <button
                      key={t.depth}
                      type="button"
                      onClick={() => setActiveDepth(t.depth)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        on
                          ? "border-ice bg-white shadow-md ring-2 ring-ice/40"
                          : "border-border/80 bg-white/80 hover:border-ice/50"
                      }`}
                    >
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <span className="text-lg font-extrabold tracking-tight">
                          {formatDepth(t.depth)}
                        </span>
                        <span className="text-sm font-bold text-primary">{t.range}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#203868,#8eb0d8)] transition-all duration-500"
                          style={{ width: `${(t.days / 365) * 100}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              <aside className="rounded-3xl bg-[linear-gradient(135deg,#203868_0%,#8eb0d8_140%)] p-6 text-white lg:col-span-5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                  {formatDepth(activeLife.depth)} baseline
                </p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">
                  {activeLife.range}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                  {activeLife.note}
                </p>
                <Link
                  href={`/filters/${activeLife.depth}-inch`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-white hover:underline"
                >
                  Shop {formatDepth(activeLife.depth)} filters
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </aside>
            </div>
          </div>
        </section>

        <section id="signs" className="scroll-mt-28 py-16 md:py-24">
          <div className="container">
            <span className="section-label">The house will tell you</span>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Ten signs the clock already ran out.
            </h2>
            <p className="mb-10 max-w-2xl text-muted-foreground leading-relaxed">
              Ignore the calendar if the house is already complaining. Any one of
              these is enough to pull the filter today.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {SIGNS.map((sign, i) => (
                <article
                  key={sign.title}
                  className="rounded-2xl border border-border/80 bg-white/85 p-4 transition-shadow hover:shadow-md"
                >
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-hero">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-2 text-base font-bold tracking-tight">{sign.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {sign.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="light-test" className="scroll-mt-28 py-16 md:py-24">
          <div className="container">
            <LightTest />
          </div>
        </section>

        <section id="how-to" className="scroll-mt-28 py-16 md:py-24">
          <div className="container">
            <span className="section-label">The swap</span>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Five minutes. No tools. Arrow toward the unit.
            </h2>
            <p className="mb-10 max-w-2xl text-muted-foreground leading-relaxed">
              Changing a filter is the cheapest HVAC skill you can learn. Do it
              once the right way and you’ll never install one backwards again.
            </p>
            <div className="grid gap-3 md:grid-cols-5">
              {STEPS.map((step) => (
                <article
                  key={step.num}
                  className="relative rounded-2xl border border-border/80 bg-white/85 p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-deep text-ice">
                    {step.icon}
                  </div>
                  <span className="absolute right-4 top-4 text-3xl font-extrabold leading-none text-muted/80">
                    {step.num}
                  </span>
                  <h3 className="mb-2 text-base font-bold tracking-tight">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="wait" className="scroll-mt-28 py-16 md:py-24">
          <div className="container">
            <span className="section-label">The overdue curve</span>
            <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
              Waiting doesn’t save money. It relocates the invoice.
            </h2>
            <p className="mb-10 max-w-2xl text-muted-foreground leading-relaxed">
              A late filter is quiet at first. Then it’s the energy bill. Then
              it’s a technician. Repair ranges below are typical residential
              ballparks — your house may be kinder, or meaner.
            </p>
            <div className="grid gap-3 md:grid-cols-4">
              {WAIT_STAGES.map((stage, i) => (
                <article
                  key={stage.when}
                  className={`rounded-2xl p-5 text-white ${
                    i === 3
                      ? "bg-hero"
                      : i === 2
                        ? "bg-navy"
                        : "bg-deep"
                  }`}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">
                    {stage.when}
                  </p>
                  <p className="mt-2 text-lg font-extrabold tracking-tight">{stage.cost}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">{stage.what}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <span className="section-label">Stay on it</span>
            <h2 className="mb-10 text-3xl font-bold tracking-tight md:text-4xl">
              Make the next change inevitable.
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-border/80 bg-white/85 p-6">
                <Calendar className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-bold tracking-tight">First-of-month peek</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  One recurring phone alert. You don’t have to change it every
                  time — you only have to look. The light test decides.
                </p>
              </article>
              <article className="rounded-2xl border border-border/80 bg-white/85 p-6">
                <Package className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-bold tracking-tight">Keep a spare in the house</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Bulk packs exist so the next filter is already in the closet
                  when the current one dies. {BRAND_NAME} prices drop as the
                  quantity goes up.
                </p>
              </article>
              <article className="rounded-2xl border border-border/80 bg-white/85 p-6">
                <Wind className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-bold tracking-tight">Go thicker if you can</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  If the rack allows 2" or 4", you buy back months of life.
                  Don’t force a thick filter into a 1" slot — measure, then shop.
                </p>
              </article>
            </div>
          </div>
        </section>

        <FaqSection
          faqs={CHANGE_GUIDE_FAQS}
          title="Filter-change questions"
          subtitle="Straight answers on timing, MERV, pets, and what happens if you wait."
        />

        <section className="brand-band py-20 md:py-28 relative overflow-hidden">
          <div className="container relative text-center">
            <span className="section-label">Know the date. Know the size.</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Find the filter that fits the clock.
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
              Exact Width × Length × Depth. MERV 8, 11, 13, or carbon. A spare in
              the closet beats a clogged filter on a 95° day.
            </p>
            <Link
              href="/#finder"
              className="hero-shop-btn inline-flex h-12 items-center justify-center px-8 text-white"
            >
              Find your size
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer pt-8 mt-4">
        <div className="container flex flex-col gap-4 text-sm sm:flex-row sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {BRAND_NAME}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="section-link !text-ice hover:!text-white">
              Home
            </Link>
            <Link href="/sizes" className="section-link !text-ice hover:!text-white">
              All sizes
            </Link>
          </div>
        </div>
      </footer>
      <CartDrawer
        onRequestQuote={() => {
          takeQuoteHandoff();
          window.location.href = "/#contact";
        }}
      />
    </div>
  );
}
