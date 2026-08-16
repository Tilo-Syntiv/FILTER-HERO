import { Link } from "wouter";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { BRAND_NAME } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { THICKNESSES } from "@shared/products";

export default function SiteHeader() {
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-xl">
      <div className="container flex items-center justify-between py-3 gap-4">
        <Link href="/" className="flex items-center min-w-0">
          <img
            src="/logo.png"
            alt={BRAND_NAME}
            className="h-12 md:h-14 w-auto max-w-[280px] object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
          <Link
            href="/#finder"
            className="px-3 py-2 rounded-lg hover:text-foreground hover:bg-secondary transition-colors"
          >
            Find size
          </Link>
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:text-foreground hover:bg-secondary transition-colors"
            >
              Thickness
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full left-0 pt-2 z-50">
              <div className="bg-white border border-border rounded-xl p-1.5 min-w-[160px] shadow-lg">
                {THICKNESSES.map((d) => (
                  <Link
                    key={d}
                    href={`/filters/${d}-inch`}
                    className="block px-3 py-2.5 text-sm rounded-lg hover:bg-secondary text-foreground font-medium"
                  >
                    {d}" filters
                  </Link>
                ))}
                <div className="h-px bg-border my-1" />
                <Link
                  href="/sizes"
                  className="block px-3 py-2.5 text-sm rounded-lg hover:bg-secondary text-primary font-semibold"
                >
                  All sizes
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/sizes"
            className="px-3 py-2 rounded-lg hover:text-foreground hover:bg-secondary transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/#contact"
            className="px-3 py-2 rounded-lg hover:text-foreground hover:bg-secondary transition-colors"
          >
            Contact
          </Link>
        </nav>

        <Button
          variant="outline"
          size="sm"
          className="relative shrink-0"
          onClick={openCart}
          aria-label="Open cart"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Cart</span>
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-hero text-white border-0">
              {itemCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
