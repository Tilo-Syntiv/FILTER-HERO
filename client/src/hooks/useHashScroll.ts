import { useEffect } from "react";

export function scrollToHashTarget(
  id: string,
  behavior: ScrollBehavior = "smooth",
) {
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;

  if (behavior === "auto") {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    el.scrollIntoView({ behavior: "auto", block: "start" });
    html.style.scrollBehavior = previous;
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return true;
}

function nearHashTarget(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top;
  return top >= 0 && top < 200;
}

/** Scroll to a section after arriving with a hash like /#finder or #custom-quote. */
export function useHashScroll() {
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const clearTimers = () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.length = 0;
    };

    const schedule = () => {
      const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      if (!id) return;
      clearTimers();
      const run = () => {
        if (cancelled) return;
        if (!nearHashTarget(id)) scrollToHashTarget(id, "auto");
      };
      run();
      for (const ms of [80, 200, 450, 800, 1400]) {
        timers.push(setTimeout(run, ms));
      }
    };

    schedule();
    window.addEventListener("hashchange", schedule);
    return () => {
      cancelled = true;
      clearTimers();
      window.removeEventListener("hashchange", schedule);
    };
  }, []);
}
