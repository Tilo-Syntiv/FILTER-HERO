import { cn } from "@/lib/utils";

type CarouselDotsProps = {
  count: number;
  selected: number;
  onSelect: (index: number) => void;
  className?: string;
  /** Light dots for dark backgrounds */
  tone?: "dark" | "light";
};

export default function CarouselDots({
  count,
  selected,
  onSelect,
  className,
  tone = "dark",
}: CarouselDotsProps) {
  if (count <= 1) return null;

  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="tablist"
      aria-label="Carousel pagination"
    >
      {Array.from({ length: count }).map((_, i) => {
        const active = i === selected;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => onSelect(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              active ? "w-7" : "w-1.5 opacity-50 hover:opacity-80",
              tone === "light"
                ? active
                  ? "bg-ice"
                  : "bg-white"
                : active
                  ? "bg-hero"
                  : "bg-navy/40",
            )}
          />
        );
      })}
    </div>
  );
}
