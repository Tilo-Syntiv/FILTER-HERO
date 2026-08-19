import type { ReactNode } from "react";
import { Link } from "wouter";

type Crumb = { href: string; label: string };

export default function PageHero({
  label,
  title,
  children,
  crumbs,
  actions,
  mark,
}: {
  label: string;
  title: string;
  children?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  mark?: ReactNode;
}) {
  return (
    <section className="brand-band">
      <div className="container py-10 md:py-14">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-white/55">
            {crumbs.map((crumb, i) => (
              <span key={`${crumb.href}-${crumb.label}`}>
                {i > 0 && " / "}
                <Link href={crumb.href} className="hover:text-white">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-start gap-4">
          {mark}
          <div className="min-w-0">
            <span className="section-label">{label}</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {children ? (
              <div className="seo-answer mt-3 max-w-2xl text-base leading-relaxed text-white/70">
                {children}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? <div className="mt-8">{actions}</div> : null}
      </div>
    </section>
  );
}
