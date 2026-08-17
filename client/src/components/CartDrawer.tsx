import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCart } from "@/contexts/CartContext";
import { stashQuoteHandoff } from "@/lib/quote-handoff";

type CartDrawerProps = {
  onRequestQuote: () => void;
};

export default function CartDrawer({ onRequestQuote }: CartDrawerProps) {
  const { items, isOpen, closeCart, setQty, removeItem, subtotal, itemCount, cartSummaryText } =
    useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.qty,
          })),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setCheckingOut(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <DrawerContent className="max-h-[min(92dvh,40rem)]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your cart ({itemCount})
          </DrawerTitle>
          <DrawerDescription>
            Review items, then checkout securely with Stripe or request a quote.
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-2 space-y-4 max-h-[50vh]">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Your cart is empty. Find your size and add a filter to get started.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground break-words">
                    {item.size}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => setQty(item.productId, item.qty - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold">
                    {item.qty}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-11 w-11"
                    onClick={() => setQty(item.productId, item.qty + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-destructive"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DrawerFooter className="border-t border-border pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
          </div>
          <Button
            size="lg"
            className="hero-shop-btn w-full text-white"
            disabled={items.length === 0 || checkingOut}
            onClick={handleCheckout}
          >
            {checkingOut ? "Redirecting…" : "Checkout with Stripe"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            disabled={items.length === 0}
            onClick={() => {
              stashQuoteHandoff({ cart: cartSummaryText() });
              closeCart();
              onRequestQuote();
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Request a quote
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">Continue shopping</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
