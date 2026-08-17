import { useEffect } from "react";

export function scrollToHashTarget(id: string) {
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Scroll to a homepage section after arriving with a hash like /#finder. */
export function useHashScroll() {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const timer = window.setTimeout(() => scrollToHashTarget(id), 80);
    return () => window.clearTimeout(timer);
  }, []);
}
