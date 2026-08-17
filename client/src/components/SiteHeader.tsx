import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { useCart } from "@/contexts/CartContext";
import { scrollToHashTarget } from "@/hooks/useHashScroll";
import { featuredHvacBrands } from "@shared/hvac-brands";
import {
  catalogLengths,
  catalogWidths,
  getFilterSize,
  popularSizeSlugs,
  THICKNESSES,
} from "@shared/products";

const WIDTHS = catalogWidths().map(String);
const LENGTHS = catalogLengths().map(String);
const DEPTHS = THICKNESSES.map(String);
const FEATURED_BRANDS = featuredHvacBrands().slice(0, 8);
const POPULAR = popularSizeSlugs(8);

function formatDepth(value: string | number) {
  const n = Number(value);
  return n === 0.5 ? '½"' : `${n}"`;
}

function HeaderFinder({ onFound }: { onFound?: () => void }) {
  const [, setLocation] = useLocation();
  const [width, setWidth] = useState("20");
  const [length, setLength] = useState("25");
  const [depth, setDepth] = useState("1");
  const formId = useId();

  const go = () => {
    const slug = `${width}x${length}x${depth}`;
    onFound?.();
    setLocation(
      getFilterSize(slug)
        ? `/sizes/${encodeURIComponent(slug)}`
        : "/custom-air-filters",
    );
  };

  return (
    <form
      className="header-finder"
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      <label className="sr-only" htmlFor={`${formId}-w`}>
        Width
      </label>
      <select
        id={`${formId}-w`}
        className="header-finder-select"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
      >
        {WIDTHS.map((w) => (
          <option key={w} value={w}>
            {w}"
          </option>
        ))}
      </select>
      <span className="text-ice/70 text-xs font-bold" aria-hidden>
        ×
      </span>
      <label className="sr-only" htmlFor={`${formId}-l`}>
        Length
      </label>
      <select
        id={`${formId}-l`}
        className="header-finder-select"
        value={length}
        onChange={(e) => setLength(e.target.value)}
      >
        {LENGTHS.map((l) => (
          <option key={l} value={l}>
            {l}"
          </option>
        ))}
      </select>
      <span className="text-ice/70 text-xs font-bold" aria-hidden>
        ×
      </span>
      <label className="sr-only" htmlFor={`${formId}-d`}>
        Depth
      </label>
      <select
        id={`${formId}-d`}
        className="header-finder-select"
        value={depth}
        onChange={(e) => setDepth(e.target.value)}
      >
        {DEPTHS.map((d) => (
          <option key={d} value={d}>
            {formatDepth(d)}
          </option>
        ))}
      </select>
      <button type="submit" className="header-find-btn">
        Find
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
}

export default function SiteHeader() {
  const { itemCount, openCart } = useCart();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const closeMenus = () => {
    setShopOpen(false);
    setMobileOpen(false);
  };

  const goHomeSection = (id: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeMenus();
    if (window.location.pathname === "/") {
      scrollToHashTarget(id);
      if (window.location.hash !== `#${id}`) {
        history.replaceState(null, "", `/#${id}`);
      }
      return;
    }
    setLocation(`/#${id}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    const onPointer = (e: globalThis.MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header ref={headerRef} className="site-header sticky top-0 z-50">
      <div className="site-header-bar">
      <div className="container flex items-center gap-3 py-2.5 md:py-3">
        <Link href="/" className="flex items-center min-w-0 shrink-0" onClick={closeMenus}>
          <BrandLockup tone="header" />
        </Link>

        <nav className="hidden lg:flex items-center ml-2" aria-label="Primary">
          <button
            type="button"
            className="header-nav-link"
            aria-expanded={shopOpen}
            aria-controls="shop-mega"
            onClick={() => {
              setShopOpen((v) => !v);
              setMobileOpen(false);
            }}
          >
            Shop
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${shopOpen ? "rotate-180" : ""}`}
            />
          </button>
          <Link href="/brands" className="header-nav-link" onClick={closeMenus}>
            Brands
          </Link>
          <Link href="/#contact" className="header-nav-link" onClick={goHomeSection("contact")}>
            Contact
          </Link>
        </nav>

        <div className="hidden xl:block flex-1 max-w-xl mx-4">
          <HeaderFinder onFound={closeMenus} />
        </div>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <Link
            href="/#finder"
            className="header-find-btn hidden md:inline-flex xl:hidden"
            onClick={goHomeSection("finder")}
          >
            Find size
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            className="lg:hidden header-nav-link min-h-11 min-w-11 items-center justify-center px-2.5"
            onClick={() => {
              setMobileOpen((v) => !v);
              setShopOpen(false);
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="header-cart"
            onClick={openCart}
            aria-label={itemCount ? `Open cart, ${itemCount} items` : "Open cart"}
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="cart-badge-pop absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-hero text-[0.65rem] font-extrabold text-white flex items-center justify-center shadow-[0_0_0_2px_#23406a]">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {shopOpen && (
        <div id="shop-mega" className="header-mega hidden lg:block">
          <div className="container grid grid-cols-12 gap-8 py-7">
            <div className="col-span-4">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                Thickness
              </p>
              <div className="grid grid-cols-2 gap-2">
                {THICKNESSES.map((d) => (
                  <Link
                    key={d}
                    href={`/filters/${d}-inch`}
                    className="header-mega-tile"
                    onClick={goHomeSection("finder")}
                  >
                    <span className="text-lg font-extrabold tracking-tight leading-none">
                      {formatDepth(d)}
                    </span>
                    <span className="text-xs text-ice/80 font-medium">Exact-fit filters</span>
                  </Link>
                ))}
                <Link
                  href="/custom-air-filters"
                  className="header-mega-tile"
                  onClick={goHomeSection("finder")}
                >
                  <span className="text-sm font-extrabold tracking-tight">Custom</span>
                  <span className="text-xs text-ice/80 font-medium">Odd size? We cut it.</span>
                </Link>
              </div>
            </div>

            <div className="col-span-4">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                Popular sizes
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((slug) => (
                  <Link
                    key={slug}
                    href={`/sizes/${slug}`}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:border-ice/60 hover:bg-white/10 transition-colors"
                    onClick={goHomeSection("finder")}
                  >
                    {slug.replaceAll("x", " × ")}
                  </Link>
                ))}
              </div>
              <Link
                href="/sizes"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-ice hover:text-white transition-colors"
                onClick={goHomeSection("finder")}
              >
                All sizes
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="col-span-4">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                Shop by brand
              </p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {FEATURED_BRANDS.map((brand) => (
                  <li key={brand.slug}>
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="text-sm font-semibold text-white/85 hover:text-white transition-colors"
                      onClick={goHomeSection("finder")}
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/brands"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-ice hover:text-white transition-colors"
                onClick={goHomeSection("finder")}
              >
                Every brand
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {mobileOpen && (
        <nav className="header-mobile lg:hidden border-t border-white/10 px-4 py-4 max-h-[min(78dvh,40rem)] overflow-y-auto space-y-5">
          <HeaderFinder onFound={closeMenus} />
          <Link
            href="/#finder"
            className="header-find-btn flex w-full h-12 text-sm justify-center"
            onClick={goHomeSection("finder")}
          >
            Find your size
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-2 px-1">
              Thickness
            </p>
            <div className="flex flex-wrap gap-2">
              {THICKNESSES.map((d) => (
                <Link
                  key={d}
                  href={`/filters/${d}-inch`}
                  className="inline-flex min-h-11 items-center rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white"
                  onClick={goHomeSection("finder")}
                >
                  {formatDepth(d)}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-1">
            <Link
              href="/sizes"
              className="flex min-h-11 items-center px-3 py-2.5 rounded-xl text-white font-semibold hover:bg-white/8"
              onClick={goHomeSection("finder")}
            >
              Shop sizes
            </Link>
            <Link
              href="/brands"
              className="flex min-h-11 items-center px-3 py-2.5 rounded-xl text-white font-semibold hover:bg-white/8"
              onClick={goHomeSection("finder")}
            >
              Shop by brand
            </Link>
            <Link
              href="/custom-air-filters"
              className="flex min-h-11 items-center px-3 py-2.5 rounded-xl text-white font-semibold hover:bg-white/8"
              onClick={goHomeSection("finder")}
            >
              Custom air filters
            </Link>
            <Link
              href="/#contact"
              className="flex min-h-11 items-center px-3 py-2.5 rounded-xl text-white font-semibold hover:bg-white/8"
              onClick={goHomeSection("finder")}
            >
              Contact
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
