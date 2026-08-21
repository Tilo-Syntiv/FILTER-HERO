import { useEffect } from "react";

export function scrollToHashTarget(id: string) {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/** Scroll to a section after arriving with a hash like /#finder or #custom-quote. */
export function useHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id) return;

    let done = false;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (cancelled || done) return;
      if (scrollToHashTarget(id)) done = true;
    };

    run();
    for (const ms of [80, 200, 450]) {
      timers.push(setTimeout(run, ms));
    }

    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);
}
