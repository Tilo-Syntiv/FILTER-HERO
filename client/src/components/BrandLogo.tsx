import { brandLogoSrc } from "@shared/hvac-brands";

export default function BrandLogo({
  slug,
  name,
  className = "h-10 w-full max-w-[8.5rem]",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  return (
    <img
      src={brandLogoSrc(slug)}
      alt={`${name} logo`}
      className={`object-contain object-center ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}