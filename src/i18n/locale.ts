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

export const AVAILABLE_LOCALES: ReadonlyArray<{ code: Locale; label: string }> = [
  { code: "es", label: "Español (AR)" },
  { code: "en", label: "English" },
];
