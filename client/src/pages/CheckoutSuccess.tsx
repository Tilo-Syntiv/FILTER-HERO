import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_NAME } from "@/const";
import { useCart } from "@/contexts/CartContext";
import { useSeo } from "@/hooks/useSeo";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [, setLocation] = useLocation();

  useSeo({
    title: `Order confirmed | ${BRAND_NAME}`,
    description: `Your ${BRAND_NAME} payment was successful.`,
    path: "/checkout/success",
    noindex: true,
  });

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-14 w-14 text-primary" />
        </div>
        <img
          src="/logo.png"
          alt={BRAND_NAME}
          className="h-12 w-auto mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold mb-3">Payment successful</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for your order. A confirmation email will arrive from Stripe
          shortly. We'll get your filters on the way.
        </p>
        <Button size="lg" onClick={() => setLocation("/")}>
          Back to store
        </Button>
      </div>
    </div>
  );
}
