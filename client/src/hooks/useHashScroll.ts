import { useEffect } from "react";

export function scrollToHashTarget(id: string) {
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Scroll to a section after arriving with a hash like /#finder or #custom-quote. */
export function useHashScroll() {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const run = () => scrollToHashTarget(id);
    const raf = window.requestAnimationFrame(run);
    const timer = window.setTimeout(run, 120);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);
}
