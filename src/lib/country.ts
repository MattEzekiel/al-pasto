import type { CountryCode } from "@/types/game";

/**
 * Country preference — leaf module, no store/React dependencies (mirrors
 * `src/i18n/locale.ts`). The room-creation picker boots from the stored
 * preference, falls back to the browser's region, and persists whatever
 * the host ends up with.
 */

/** Same `al-pasto:` namespace as the locale preference and the IndexedDB mirror. */
const STORAGE_KEY = "al-pasto:country";

/**
 * Stored country preference. Window-guarded so the prerendered marketing
 * pages can share this module; missing/denied storage yields `null`.
 */
export function readStoredCountry(): CountryCode | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredCountry(code: CountryCode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private mode / storage denied — preference just won't survive reloads.
  }
}

/**
 * The browser's region as a lowercase ISO 3166-1 alpha-2 code, e.g.
 * "es-AR" → "ar". Numeric UN M49 regions ("es-419") are skipped —
 * they never match a registry entry.
 */
export function detectCountry(): CountryCode | null {
  if (typeof navigator === "undefined") return null;
  const tags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const tag of tags) {
    const region = tag?.split("-")[1];
    if (region && /^[a-z]{2}$/i.test(region)) return region.toLowerCase();
  }
  return null;
}
