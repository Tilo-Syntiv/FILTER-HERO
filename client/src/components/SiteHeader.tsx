import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ChevronDown, Mail, MessageSquare, Ruler, ShoppingCart } from "lucide-react";
import BrandLockup from "@/components/BrandLockup";
import { useCart } from "@/contexts/CartContext";
import { BRAND_EMAIL } from "@/const";
import { scrollToHashTarget } from "@/hooks/useHashScroll";
import { allBrandFamilies } from "@shared/hvac-brands";
import { BrandFamilyGrid } from "@/components/BrandDirectory";
import {
  finderLengths,
  finderWidths,
  getFilterSize,
  popularSizeSlugs,
  THICKNESSES,
} from "@shared/products";
import { customQuotePath } from "@/lib/filter-size";
import { getPreferredMerv } from "@/lib/merv-pref";

const WIDTHS = finderWidths().map(String);
const LENGTHS = finderLengths().map(String);

const DEPTHS = THICKNESSES.map(String);
const ALL_BRAND_FAMILIES = allBrandFamilies();
const POPULAR = popularSizeSlugs(8);

type DesktopMenu = "shop" | "brands" | "contact" | null;

function formatDepth(value: string | number) {
  const n = Number(value);
  return n === 0.5 ? '½"' : `${n}"`;
}

function HeaderSizeField({
  id,
  short,
  value,
  onChange,
  children,
}: {
  id: string;
  short: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="header-finder-field">
      <span className="header-finder-field-label">{short}</span>
      <select
        id={id}
        className="header-finder-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function HeaderFinder({ onFound }: { onFound?: () => void }) {
  const [, setLocation] = useLocation();
  const [width, setWidth] = useState("20");
  const [length, setLength] = useState("25");
  const [depth, setDepth] = useState("1");
  const formId = useId();

  const go = () => {
    const slug = `${width}x${length}x${depth}`;
    const merv = getPreferredMerv();
    const mervQuery = merv ? `?merv=${merv}` : "";
    onFound?.();
    setLocation(
      getFilterSize(slug)
        ? `/sizes/${encodeURIComponent(slug)}${mervQuery}`
        : customQuotePath(slug),
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
      <p className="header-finder-prompt">Enter Your Filter Size</p>
      <div className="header-finder-dims" role="group" aria-label="Filter size">
        <HeaderSizeField
          id={`${formId}-w`}
          short="Width"
          value={width}
          onChange={setWidth}
        >
          {WIDTHS.map((w) => (
            <option key={w} value={w}>
              {w}"
            </option>
          ))}
        </HeaderSizeField>
        <span className="header-finder-times" aria-hidden>
          ×
        </span>
        <HeaderSizeField
          id={`${formId}-l`}
          short="Length"
          value={length}
          onChange={setLength}
        >
          {LENGTHS.map((l) => (
            <option key={l} value={l}>
              {l}"
            </option>
          ))}
        </HeaderSizeField>
        <span className="header-finder-times" aria-hidden>
          ×
        </span>
        <HeaderSizeField
          id={`${formId}-d`}
          short="Depth"
          value={depth}
          onChange={setDepth}
        >
          {DEPTHS.map((d) => (
            <option key={d} value={d}>
              {formatDepth(d)}
            </option>
          ))}
        </HeaderSizeField>
      </div>
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
  const [desktopMenu, setDesktopMenu] = useState<DesktopMenu>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const publishHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-h",
        `${header.offsetHeight}px`,
      );
    };

    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-h");
    };
  }, []);

  const clearCloseMenuTimer = () => {
    if (closeMenuTimer.current) {
      clearTimeout(closeMenuTimer.current);
      closeMenuTimer.current = null;
    }
  };

  const openDesktopMenu = (menu: DesktopMenu) => {
    clearCloseMenuTimer();
    setDesktopMenu(menu);
  };

  const scheduleCloseDesktopMenu = () => {
    clearCloseMenuTimer();
    closeMenuTimer.current = setTimeout(() => setDesktopMenu(null), 160);
  };

  const closeMenus = () => {
    clearCloseMenuTimer();
    setDesktopMenu(null);
  };

  const goHomeSection = (id: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeMenus();
    if (window.location.pathname === "/" || window.location.pathname === "") {
      scrollToHashTarget(id);
      if (window.location.hash !== `#${id}`) {
        history.replaceState(null, "", `/#${id}`);
      }
      return;
    }
    setLocation(`/#${id}`);
  };

  const goCustomQuote = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    closeMenus();
    const href = event.currentTarget.getAttribute("href") || customQuotePath();
    if (window.location.pathname === "/custom-air-filters") {
      scrollToHashTarget("custom-quote");
      return;
    }
    setLocation(href);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    const onPointer = (e: globalThis.MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        clearCloseMenuTimer();
        setDesktopMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      clearCloseMenuTimer();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="site-header sticky top-0 z-50"
      onPointerEnter={clearCloseMenuTimer}
      onPointerLeave={scheduleCloseDesktopMenu}
    >
      <div className="site-header-bar">
      <div className="container flex flex-wrap items-center gap-x-2 gap-y-2 py-2.5 xl:flex-nowrap md:py-3">
        <BrandLockup tone="header" className="shrink-0" onClick={closeMenus} />

        <nav
          className="order-last flex w-full flex-wrap items-center justify-center gap-x-0.5 gap-y-1 md:order-none xl:w-auto xl:flex-nowrap xl:justify-start xl:ml-1"
          aria-label="Primary"
        >
          {([
            ["shop", "Shop"],
            ["brands", "Brands"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className="header-nav-link"
              aria-expanded={desktopMenu === id}
              aria-controls={`${id}-mega`}
              onPointerEnter={() => openDesktopMenu(id)}
              onFocus={() => openDesktopMenu(id)}
              onClick={() => openDesktopMenu(id)}
            >
              {label}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${desktopMenu === id ? "rotate-180" : ""}`}
              />
            </button>
          ))}
          <Link
            href="/#clock"
            className="header-nav-link"
            onPointerEnter={() => {
              clearCloseMenuTimer();
              setDesktopMenu(null);
            }}
            onFocus={() => setDesktopMenu(null)}
            onClick={goHomeSection("clock")}
          >
            Filter Clock
          </Link>
          <button
            type="button"
            className="header-nav-link"
            aria-expanded={desktopMenu === "contact"}
            aria-controls="contact-mega"
            onPointerEnter={() => openDesktopMenu("contact")}
            onFocus={() => openDesktopMenu("contact")}
            onClick={() => openDesktopMenu("contact")}
          >
            Contact
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${desktopMenu === "contact" ? "rotate-180" : ""}`}
            />
          </button>
          <Link
            href="/#how-to-measure"
            className="header-measure-chip"
            aria-label="How to measure your filter"
            onPointerEnter={() => {
              clearCloseMenuTimer();
              setDesktopMenu(null);
            }}
            onFocus={() => setDesktopMenu(null)}
            onClick={goHomeSection("how-to-measure")}
          >
            <Ruler className="h-3 w-3" aria-hidden />
            How to measure
          </Link>
        </nav>

        <div className="order-last w-full min-w-0 xl:order-none xl:flex-1 xl:max-w-2xl xl:mx-2">
          <HeaderFinder onFound={closeMenus} />
        </div>

        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <Link
            href="/custom-air-filters#custom-quote"
            className="header-find-btn header-custom-btn inline-flex shrink-0"
            onClick={goCustomQuote}
          >
            Need a custom size
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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
      </div>

      {desktopMenu && (
        <div
          id={`${desktopMenu}-mega`}
          className="header-mega"
          onPointerEnter={() => openDesktopMenu(desktopMenu)}
          onPointerLeave={scheduleCloseDesktopMenu}
        >
          {desktopMenu === "shop" && (
            <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-5 md:py-7">
              <div className="md:col-span-6">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                  Thickness
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {THICKNESSES.map((d) => (
                    <Link
                      key={d}
                      href={`/filters/${d}-inch`}
                      className="header-mega-tile"
                      onClick={closeMenus}
                    >
                      <span className="text-lg font-extrabold tracking-tight leading-none">
                        {formatDepth(d)}
                      </span>
                      <span className="text-xs text-ice/80 font-medium">Exact-fit filters</span>
                    </Link>
                  ))}
                  <Link
                    href="/custom-air-filters#custom-quote"
                    className="header-mega-tile"
                    onClick={goCustomQuote}
                  >
                    <span className="text-sm font-extrabold tracking-tight">Custom</span>
                    <span className="text-xs text-ice/80 font-medium">Odd size? We cut it.</span>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-6">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                  Popular sizes
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((slug) => (
                    <Link
                      key={slug}
                      href={`/sizes/${slug}`}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white hover:border-ice/60 hover:bg-white/10 transition-colors"
                      onClick={closeMenus}
                    >
                      {slug.replaceAll("x", " × ")}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/sizes"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-ice hover:text-white transition-colors"
                  onClick={closeMenus}
                >
                  All sizes
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {desktopMenu === "brands" && (
            <div className="container py-5 md:py-6">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-4">
                HVAC brands
              </p>
              <BrandFamilyGrid
                families={ALL_BRAND_FAMILIES}
                onBrandClick={closeMenus}
              />
              <Link
                href="/brands"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-ice hover:text-white transition-colors"
                onClick={closeMenus}
              >
                Every brand
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {desktopMenu === "contact" && (
            <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-5 md:py-7">
              <div className="md:col-span-4">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                  Reach us
                </p>
                <a href={`mailto:${BRAND_EMAIL}`} className="header-mega-tile" onClick={closeMenus}>
                  <span className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight">
                    <Mail className="h-4 w-4" />
                    Email
                  </span>
                  <span className="text-xs text-ice/80 font-medium">{BRAND_EMAIL}</span>
                </a>
              </div>
              <div className="md:col-span-8">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ice/80 mb-3">
                  Support
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    href="/#clock"
                    className="header-mega-tile"
                    onClick={goHomeSection("clock")}
                  >
                    <span className="text-sm font-extrabold tracking-tight">Filter Clock</span>
                    <span className="text-xs text-ice/80 font-medium">Tell us about the house. We'll give you the date.</span>
                  </Link>
                  <Link
                    href="/how-often-to-change-air-filter"
                    className="header-mega-tile"
                    onClick={closeMenus}
                  >
                    <span className="text-sm font-extrabold tracking-tight">When to change</span>
                    <span className="text-xs text-ice/80 font-medium">The full change guide</span>
                  </Link>
                  <Link
                    href="/#contact"
                    className="header-mega-tile"
                    onClick={goHomeSection("contact")}
                  >
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight">
                      <MessageSquare className="h-4 w-4" />
                      Send a message
                    </span>
                    <span className="text-xs text-ice/80 font-medium">Size, MERV, or order help</span>
                  </Link>
                  <Link
                    href="/#faq"
                    className="header-mega-tile"
                    onClick={goHomeSection("faq")}
                  >
                    <span className="text-sm font-extrabold tracking-tight">FAQ</span>
                    <span className="text-xs text-ice/80 font-medium">Quick answers</span>
                  </Link>
                  <Link
                    href="/custom-air-filters#custom-quote"
                    className="header-mega-tile"
                    onClick={goCustomQuote}
                  >
                    <span className="text-sm font-extrabold tracking-tight">Custom quote</span>
                    <span className="text-xs text-ice/80 font-medium">Odd size? We cut it.</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
