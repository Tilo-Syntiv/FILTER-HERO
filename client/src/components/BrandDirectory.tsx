import { useMemo, useState } from "react";
import { Link } from "wouter";
import { featuredBrandFamilies, otherBrandFamilies, searchBrandCodes } from "@shared/hvac-brands";
import { BRAND_NAME } from "@/const";

export default function BrandDirectory({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const featuredFamilies = featuredBrandFamilies();
  const otherFamilies = otherBrandFamilies();
  const hits = useMemo(() => searchBrandCodes(query), [query]);

  return (
    <section aria-label="Shop by HVAC brand">
      {!compact && (
        <div className="mb-8">
          <span className="section-label">System match</span>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Shop by HVAC brand</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {BRAND_NAME} replacement filters fit the same slots as OEM media for
            Carrier, Trane, Honeywell, Lennox, and more. Pick your system brand,
            then shop by size, model number, or OEM part number.
          </p>
        </div>
      )}

      <label className="block mb-8">
        <span className="text-sm font-semibold">Search model or OEM part number</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. FC100A1029, TWE036C, X6670"
          className="mt-2 w-full max-w-xl rounded-xl border border-border bg-white px-4 py-3 text-sm"
        />
      </label>

      {hits.length > 0 && (
        <div className="mb-10 rounded-xl border border-border bg-white/80 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Matches
          </p>
          <ul className="space-y-2 text-sm">
            {hits.map((h) => (
              <li key={`${h.brand.slug}-${h.kind}-${h.code}`}>
                <Link
                  href={`/sizes/${encodeURIComponent(h.size)}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {h.code}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  · {h.kind === "oem" ? "OEM part" : "model"} · {h.brand.name} · {h.size}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="section-label">Popular brands</p>
      <div className="grid gap-6 mb-10">
        {featuredFamilies.map((family) => (
          <div key={family.id}>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted-foreground mb-2">
              {family.label}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {family.brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="size-chip !py-4 text-center"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="section-label">All HVAC brands</p>
      <div className="grid gap-6">
        {otherFamilies.map((family) => (
          <div key={family.id}>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-muted-foreground mb-2">
              {family.label}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {family.brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="size-chip !py-3 text-center text-sm"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
