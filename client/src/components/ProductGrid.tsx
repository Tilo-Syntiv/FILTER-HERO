import { ShoppingCart, Check } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Product } from "@shared/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductGridProps {
  products: Product[];
  highlightedSize?: string | null;
  onAddToCart?: (product: Product) => void;
}

export default function ProductGrid({
  products,
  highlightedSize,
  onAddToCart,
}: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => {
        const isMatch =
          highlightedSize &&
          product.size.toLowerCase() === highlightedSize.toLowerCase();
        const mervLabel = product.isCarbon
          ? "Carbon"
          : `MERV ${product.merv}`;

        return (
          <motion.article
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.3,
              delay: Math.min(index * 0.05, 0.25),
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-lg ${
              isMatch
                ? "border-ice ring-2 ring-ice/40 shadow-md"
                : "border-border"
            }`}
          >
            <Link href={`/sizes/${encodeURIComponent(product.size)}`}>
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-deep via-navy to-mesh">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-ice/90 mb-2">
                    Filter Hero
                  </p>
                  <p className="text-2xl font-bold">{product.size}</p>
                  <p className="text-sm text-white/80 mt-1">{mervLabel}</p>
                </div>
              </div>
            </Link>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div>
                  <Link href={`/sizes/${encodeURIComponent(product.size)}`}>
                    <h3 className="text-lg font-bold text-foreground leading-tight hover:text-primary">
                      {product.size}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground">{product.name}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {mervLabel}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {product.description}
              </p>

              <div className="mb-4">
                <p className="text-2xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Volume discounts on size page
                </p>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Guaranteed fit</span>
                </div>
              </div>

              <Button
                onClick={() => onAddToCart?.(product)}
                disabled={!product.inStock}
                className="w-full"
                variant={product.inStock ? "default" : "outline"}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Notify Me"}
              </Button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
