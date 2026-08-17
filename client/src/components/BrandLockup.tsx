import { useEffect, useState } from "react";
import { BRAND_NAME } from "@/const";

type LockupTone = "header" | "footer";

const LOGO_SRC = "/logo.png";

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
      const ctx = canvas.getContext("2d");
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

function Wordmark({ tone }: { tone: LockupTone }) {
  const filterClass = tone === "header" ? "text-navy" : "text-white";

  return (
    <span className="flex items-baseline gap-[0.28em] font-semibold not-italic tracking-[-0.035em] leading-none [font-family:'Plus_Jakarta_Sans',sans-serif]">
      <span className={filterClass}>Filter</span>
      <span className="text-hero">Hero</span>
    </span>
  );
}

const sizes: Record<
  LockupTone,
  { mark: string; type: string; gap: string }
> = {
  header: {
    mark: "h-11 w-[4.15rem] md:h-12 md:w-[4.6rem]",
    type: "text-lg md:text-xl",
    gap: "gap-2.5",
  },
  footer: {
    mark: "h-12 w-[4.6rem]",
    type: "text-xl",
    gap: "gap-3",
  },
};

export default function BrandLockup({
  tone,
  className = "",
}: {
  tone: LockupTone;
  className?: string;
}) {
  const src = useKnockoutLogo(LOGO_SRC);
  const size = sizes[tone];

  return (
    <span className={`inline-flex items-center ${size.gap} ${className}`}>
      <span
        className={`brand-emblem relative shrink-0 overflow-hidden ${size.mark}`}
        aria-hidden
      >
        <img
          src={src}
          alt=""
          className="relative z-[1] h-[168%] w-full max-w-none object-contain object-[center_8%] drop-shadow-[0_10px_18px_rgba(20,30,48,0.28)]"
        />
      </span>
      <span className={`min-w-0 ${size.type}`}>
        <Wordmark tone={tone} />
      </span>
      <span className="sr-only">{BRAND_NAME}</span>
    </span>
  );
}
