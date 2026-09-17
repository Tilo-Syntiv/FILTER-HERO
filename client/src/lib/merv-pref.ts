const STORAGE_KEY = "fh-preferred-merv";

export type PreferredMerv = "8" | "11" | "13" | "carbon";

export function isPreferredMerv(value: string | null | undefined): value is PreferredMerv {
  return value === "8" || value === "11" || value === "13" || value === "carbon";
}

export function setPreferredMerv(key: PreferredMerv) {
  try {
    sessionStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* private mode */
  }
}

export function getPreferredMerv(): PreferredMerv | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return isPreferredMerv(value) ? value : null;
  } catch {
    return null;
  }
}

/** URL `?merv=` wins over the session stash so size-page chips follow the address bar. */
export function resolvePreferredMerv(
  available: readonly string[],
  search: string,
  stored: PreferredMerv | null = null,
): PreferredMerv {
  const query = search.startsWith("?") ? search.slice(1) : search;
  const fromUrl = new URLSearchParams(query).get("merv");
  const preferred = isPreferredMerv(fromUrl) ? fromUrl : stored;
  if (preferred && available.includes(preferred)) return preferred;
  const first = available.find((key) => isPreferredMerv(key));
  return first ?? "8";
}

const PACK_KEY = "fh-power-pack";
const PACK_QTYS = new Set([1, 2, 4, 6, 12]);

export function setPowerPackQty(qty: number) {
  try {
    sessionStorage.setItem(PACK_KEY, String(qty));
  } catch {
    /* private mode */
  }
}

export function getPowerPackQty(): number | null {
  try {
    const n = Number(sessionStorage.getItem(PACK_KEY));
    return PACK_QTYS.has(n) ? n : null;
  } catch {
    return null;
  }
}
