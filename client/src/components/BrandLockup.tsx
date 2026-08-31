import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Link } from "wouter";
import { BRAND_NAME } from "@/const";

type LockupTone = "header" | "footer";

const LOGO_SRC = "/logo.png?v=fh086";

let knockoutCache: string | null = null;
let knockoutPromise: Promise<string> | null = null;

function knockOutWhite(src: string): Promise<string> {
  if (knockoutCache) return Promise.resolve(knockoutCache);
  if (knockoutPromise) return knockoutPromise;

  knockoutPromise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        if (r > 242 && g > 242 && b > 242) {
          pixels[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      knockoutCache = canvas.toDataURL("image/png");
      resolve(knockoutCache);
    };
    img.onerror = () => reject(new Error("Logo failed to load"));
    img.src = src;
  });

  return knockoutPromise;
}

function useKnockoutLogo(src: string) {
  const [url, setUrl] = useState<string | null>(knockoutCache);

  useEffect(() => {
    let cancelled = false;
    knockOutWhite(src)
      .then((next) => {
        if (!cancelled) setUrl(next);
      })
      .catch(() => {
        if (!cancelled) setUrl(src);
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return url ?? src;
}

function Wordmark({ tone: _tone }: { tone: LockupTone }) {
  return (
    <span className="flex items-baseline gap-[0.28em] font-extrabold not-italic tracking-[-0.04em] leading-none [font-family:'Plus_Jakarta_Sans',sans-serif]">
      <span className="text-white drop-shadow-[0_1px_1px_rgba(16,24,40,0.35)]">
        Filter
      </span>
      <span className="brand-wordmark-hero">Hero</span>
    </span>
  );
}

const sizes: Record<
  LockupTone,
  { mark: string; type: string; gap: string }
> = {
  header: {
    mark: "h-8 w-[3rem] sm:h-9 sm:w-[3.4rem] md:h-12 md:w-[4.6rem]",
    type: "text-base sm:text-lg md:text-[1.35rem]",
    gap: "gap-1.5 sm:gap-2 md:gap-2.5",
  },
  footer: {
    mark: "h-10 w-[3.8rem] sm:h-12 sm:w-[4.6rem]",
    type: "text-lg sm:text-xl",
    gap: "gap-2 sm:gap-3",
  },
};

function goHome(event: ReactMouseEvent<HTMLAnchorElement>) {
  const atHome = window.location.pathname === "/";
  window.scrollTo({ top: 0, left: 0, behavior: atHome ? "smooth" : "auto" });
  if (!atHome) return;
  event.preventDefault();
  if (window.location.hash || window.location.search) {
    history.replaceState(null, "", "/");
  }
}

export default function BrandLockup({
  tone,
  className = "",
  onClick,
}: {
  tone: LockupTone;
  className?: string;
  onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  const src = useKnockoutLogo(LOGO_SRC);
  const size = sizes[tone];

  return (
    <Link
      href="/"
      aria-label={`${BRAND_NAME} home`}
      className={`relative z-[2] inline-flex items-center ${size.gap} ${className} cursor-pointer rounded-md select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ice`}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) goHome(event);
      }}
    >
      <span
        className={`brand-emblem relative shrink-0 overflow-hidden ${size.mark}`}
        aria-hidden
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="relative z-[1] h-[168%] w-full max-w-none object-contain object-[center_8%]"
        />
      </span>
      <span className={`min-w-0 ${size.type}`} aria-hidden>
        <Wordmark tone={tone} />
      </span>
    </Link>
  );
}
