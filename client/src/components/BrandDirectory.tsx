import { useMemo, useState } from "react";
import { Link } from "wouter";
import { HVAC_BRAND_LIST, featuredHvacBrands, searchBrandCodes } from "@shared/hvac-brands";
import { BRAND_NAME } from "@/const";

export default function BrandDirectory({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const featured = featuredHvacBrands();
  const rest = HVAC_BRAND_LIST.filter((b) => !b.featured);
  const hits = useMemo(() => searchBrandCodes(query), [query]);

  return (
    <section aria-label="Shop by HVAC brand">
      {!compact && (
        <div className="mb-8">
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

      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Popular brands
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-10">
        {featured.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="size-chip !py-4 text-center"
          >
            {b.name}
          </Link>
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        All HVAC brands
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {rest.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="size-chip !py-3 text-center text-sm"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
