import { createPortal } from "react-dom";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * App toasts. Vite uses ThemeContext, not next-themes. Sonner also has to
 * portal onto document.body — otherwise the cart drawer marks #root inert
 * and checkout errors never appear.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const node = (
    <Sonner
      theme={theme}
      className="toaster group"
      position="top-center"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          zIndex: 70,
        } as React.CSSProperties
      }
      {...props}
    />
  );
  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
};

export { Toaster };
