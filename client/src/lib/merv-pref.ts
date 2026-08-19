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
