/**
 * Locale constants — leaf module. NO dependencies on stores, dictionaries,
 * or React. Anything that imports `useUIStore` must not also import from
 * `@/i18n/index.ts` or a cycle reappears.
 *
 * Add a new locale here AND register the matching dictionary in
 * `src/i18n/index.ts` AND the deck in `src/lib/host.ts`.
 */
export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";

export const AVAILABLE_LOCALES: ReadonlyArray<{ code: Locale; label: string }> =
  [
    { code: "es", label: "Español (AR)" },
    { code: "en", label: "English" },
  ];

/** Same `al-pasto:` namespace as the IndexedDB mirror in lib/persist.ts. */
const STORAGE_KEY = "al-pasto:locale";

/**
 * Stored language preference. Window-guarded so the prerendered marketing
 * pages can share this module; invalid/missing values fall back to the
 * default.
 */
export function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return AVAILABLE_LOCALES.some((l) => l.code === stored)
      ? (stored as Locale)
      : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Private mode / storage denied — preference just won't survive reloads.
  }
}
