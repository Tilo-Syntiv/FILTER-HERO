import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@shared/products";

export type CartItem = {
  productId: number;
  size: string;
  merv: number;
  price: number;
  name: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, qty?: number, unitPrice?: number) => void;
  setQty: (productId: number, qty: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  cartSummaryText: () => string;
};

const STORAGE_KEY = "fpf-cart-v1";

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.productId === "number" && i.qty > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, qty = 1, unitPrice?: number) => {
    const price = unitPrice ?? product.price;
    const label = product.isCarbon
      ? `${product.name} (Carbon)`
      : `${product.name} · MERV ${product.merv}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id && i.price === price);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id && i.price === price
            ? { ...i, qty: Math.min(50, i.qty + qty) }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          size: product.size,
          merv: product.merv,
          price,
          name: label,
          qty,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((productId: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, qty: Math.min(50, qty) } : i,
      );
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartSummaryText = useCallback(() => {
    if (items.length === 0) return "";
    return items
      .map((i) => `${i.qty}× ${i.size} MERV ${i.merv} ($${i.price.toFixed(2)})`)
      .join("; ");
  }, [items]);

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((n, i) => n + i.price * i.qty, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    toggleCart: () => setIsOpen((o) => !o),
    addItem,
    setQty,
    removeItem,
    clearCart,
    cartSummaryText,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
