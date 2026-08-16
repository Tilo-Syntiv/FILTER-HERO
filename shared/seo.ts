import { BRAND_EMAIL, BRAND_NAME, BRAND_TAGLINE } from "./const";
import { FILTER_SIZES, MERV_TYPES, THICKNESSES, type FilterSize } from "./products";

/** Canonical production origin — override with VITE_SITE_URL / CLIENT_URL. */
export const DEFAULT_SITE_URL = "https://filterhero.net";

export const SITE_DEFAULTS = {
  brand: BRAND_NAME,
  tagline: BRAND_TAGLINE,
  email: BRAND_EMAIL,
  titleDefault: `${BRAND_NAME} | Exact-Fit HVAC & Furnace Air Filters`,
  descriptionDefault:
    "Find your exact HVAC filter size in seconds. Shop MERV 8, 11, 13, and carbon air filters by Width × Length × Depth with bulk pricing and a 30-day fit guarantee.",
  locale: "en_US",
  twitterHandle: "",
} as const;

export type FaqItem = {
  question: string;
  answer: string;
};

/** Answer-first FAQs for AEO / VEO / AIO citation. */
export const SITE_FAQS: FaqItem[] = [
  {
    question: "What size air filter do I need?",
    answer:
      "You need the exact Width × Length × Depth printed on your current filter or measured from the filter slot. Enter those three numbers in our size finder to shop the matching HVAC filter.",
  },
  {
    question: "How do I measure an air filter?",
    answer:
      "Measure Width (side to side), Length (top to bottom), and Depth (thickness) in inches. Use the nominal size on the frame label when present; otherwise measure the filter itself and round to the nearest standard size.",
  },
  {
    question: "How often should I change my HVAC filter?",
    answer:
      "Most homes should change filters every 30 to 90 days. Change closer to 30 days with pets, allergies, high dust, or continuous HVAC use; every 90 days may work for light use in a clean home.",
  },
  {
    question: "What MERV rating should I buy?",
    answer:
      "MERV 8 is standard everyday filtration. MERV 11 is better for pets and mild allergies. MERV 13 offers higher filtration for asthma and sensitivities. MERV 8 Carbon adds odor reduction. Confirm your HVAC system supports higher MERV before upgrading.",
  },
  {
    question: "What is the difference between nominal and actual filter size?",
    answer:
      `Nominal size is the labeled size (for example 20×25×1). Actual size is slightly smaller so the filter slides into the slot. ${BRAND_NAME} lists both on each size page so you can verify fit.`,
  },
  {
    question: "Do you offer free shipping?",
    answer:
      `Yes. ${BRAND_NAME} offers free shipping on orders over $50 within the contiguous United States, with a 30-day fit guarantee on standard catalog sizes.`,
  },
];

export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function homeSeo(siteUrl: string) {
  return {
    title: SITE_DEFAULTS.titleDefault,
    description: SITE_DEFAULTS.descriptionDefault,
    path: "/",
    canonical: absoluteUrl(siteUrl, "/"),
    type: "website" as const,
  };
}

export function allSizesSeo(siteUrl: string) {
  const path = "/sizes";
  return {
    title: `All HVAC Air Filter Sizes | ${BRAND_NAME}`,
    description:
      `Browse every ${BRAND_NAME} size by thickness (0.5\", 1\", 2\", 4\", 5\"). Pick Width × Length × Depth, then choose MERV quality and pack quantity.`,
    path,
    canonical: absoluteUrl(siteUrl, path),
    type: "website" as const,
  };
}

export function thicknessSeo(siteUrl: string, depth: number) {
  const path = `/filters/${depth}-inch`;
  return {
    title: `${depth}" Air Filters — Shop by Size | ${BRAND_NAME}`,
    description: `Shop ${depth}-inch thick HVAC and furnace air filters. Select your Width × Length, then choose MERV 8, 11, 13, or carbon with volume pricing.`,
    path,
    canonical: absoluteUrl(siteUrl, path),
    type: "website" as const,
  };
}

export function sizeSeo(siteUrl: string, size: FilterSize | string) {
  const slug = typeof size === "string" ? size : size.slug;
  const meta = typeof size === "string" ? undefined : size;
  const path = `/sizes/${encodeURIComponent(slug)}`;
  const actual = meta
    ? ` Actual size ${meta.actualWidth}×${meta.actualLength}×${meta.actualDepth} in.`
    : "";
  return {
    title: `${slug} Air Filter | HVAC & Furnace | ${BRAND_NAME}`,
    description: `Buy ${slug} air filters for HVAC and furnace systems. Choose MERV 8, 11, 13, or carbon.${actual} Bulk packs, fit guarantee, and fast checkout.`,
    path,
    canonical: absoluteUrl(siteUrl, path),
    type: "product" as const,
  };
}

export function buildOrganizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: absoluteUrl(siteUrl, "/"),
    email: BRAND_EMAIL,
    description: SITE_DEFAULTS.descriptionDefault,
    logo: absoluteUrl(siteUrl, "/logo.png"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: BRAND_EMAIL,
      availableLanguage: "English",
    },
  };
}

export function buildWebSiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: absoluteUrl(siteUrl, "/"),
    description: SITE_DEFAULTS.descriptionDefault,
    publisher: { "@type": "Organization", name: BRAND_NAME },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl(siteUrl, "/sizes/{search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildFaqSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function buildHowToMeasureSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to measure an HVAC air filter",
    description:
      "Measure Width, Length, and Depth to find your exact air filter size.",
    totalTime: "PT2M",
    url: absoluteUrl(siteUrl, "/#finder"),
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Measure Width",
        text: "Measure the filter from left to right in inches.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Measure Length",
        text: "Measure the filter from top to bottom in inches.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Measure Depth",
        text: "Measure the filter thickness (commonly 0.5, 1, 2, 4, or 5 inches).",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Find your filter",
        text: `Enter Width × Length × Depth in the ${BRAND_NAME} size finder and shop your match.`,
      },
    ],
  };
}

/** Speakable content for voice assistants (VEO). */
export function buildSpeakableSchema(siteUrl: string, cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: BRAND_NAME,
    url: absoluteUrl(siteUrl, "/"),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function buildBreadcrumbSchema(
  siteUrl: string,
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}

export function buildProductSchema(
  siteUrl: string,
  size: FilterSize,
  opts: { mervName: string; price: number; description: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${size.slug} ${opts.mervName} Air Filter`,
    description: opts.description,
    sku: `${size.slug}-${opts.mervName.replace(/\s+/g, "-").toLowerCase()}`,
    brand: { "@type": "Brand", name: BRAND_NAME },
    category: "HVAC Air Filters",
    url: absoluteUrl(siteUrl, `/sizes/${encodeURIComponent(size.slug)}`),
    image: absoluteUrl(siteUrl, "/logo.png"),
    material: "Pleated filter media",
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Nominal size",
        value: `${size.width}x${size.length}x${size.depth} in`,
      },
      {
        "@type": "PropertyValue",
        name: "Actual size",
        value: `${size.actualWidth}x${size.actualLength}x${size.actualDepth} in`,
      },
      {
        "@type": "PropertyValue",
        name: "MERV",
        value: opts.mervName,
      },
    ],
    offers: {
      "@type": "Offer",
      url: absoluteUrl(siteUrl, `/sizes/${encodeURIComponent(size.slug)}`),
      priceCurrency: "USD",
      price: opts.price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: BRAND_NAME },
    },
  };
}

export function buildItemListSchema(
  siteUrl: string,
  name: string,
  path: string,
  sizes: FilterSize[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(siteUrl, path),
    numberOfItems: sizes.length,
    itemListElement: sizes.slice(0, 50).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(siteUrl, `/sizes/${encodeURIComponent(s.slug)}`),
      name: `${s.slug} air filter`,
    })),
  };
}

export function sitemapPaths(): { path: string; changefreq: string; priority: string }[] {
  const paths: { path: string; changefreq: string; priority: string }[] = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/sizes", changefreq: "weekly", priority: "0.9" },
  ];
  for (const d of THICKNESSES) {
    paths.push({
      path: `/filters/${d}-inch`,
      changefreq: "weekly",
      priority: "0.8",
    });
  }
  for (const s of FILTER_SIZES) {
    paths.push({
      path: `/sizes/${encodeURIComponent(s.slug)}`,
      changefreq: "weekly",
      priority: "0.7",
    });
  }
  return paths;
}

export function buildLlmsTxt(siteUrl: string): string {
  const sizeList = FILTER_SIZES.map((s) => s.slug).join(", ");
  const mervList = MERV_TYPES.map((m) => `${m.name} (${m.shortLabel})`).join(", ");
  return `# ${BRAND_NAME}

> ${SITE_DEFAULTS.descriptionDefault}

## About
- Brand: ${BRAND_NAME}
- Tagline: ${BRAND_TAGLINE}
- Contact: ${BRAND_EMAIL}
- Site: ${absoluteUrl(siteUrl, "/")}
- Products: Residential HVAC / furnace pleated air filters
- Sizing model: Width × Length × Depth (nominal + actual listed)
- MERV options: ${mervList}
- Thicknesses: ${THICKNESSES.map((d) => `${d}"`).join(", ")}

## Key pages
- Home / size finder: ${absoluteUrl(siteUrl, "/")}
- All sizes: ${absoluteUrl(siteUrl, "/sizes")}
${THICKNESSES.map((d) => `- ${d}" hub: ${absoluteUrl(siteUrl, `/filters/${d}-inch`)}`).join("\n")}

## Catalog sizes
${sizeList}

## Facts for assistants
${SITE_FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

## Optional
- Sitemap: ${absoluteUrl(siteUrl, "/sitemap.xml")}
- Robots: ${absoluteUrl(siteUrl, "/robots.txt")}
`;
}

export { MERV_TYPES, FILTER_SIZES, THICKNESSES };
