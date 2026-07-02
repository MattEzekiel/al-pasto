import { useUIStore } from "@/store/useUIStore";
import en from "./en";
import es from "./es";
import { DEFAULT_LOCALE, type Locale } from "./locale";
import type { Strings } from "./strings";

/**
 * In-house i18n. Re-exports locale constants from `./locale` and adds the
 * dictionary lookup + React hook.
 *
 * The locale constants live in `./locale` (a leaf module) so the UI store
 * can import them without creating a circular dep through `useT()`.
 *
 * To add a locale:
 *   1. Extend `Locale` in `./locale.ts` and register it in `AVAILABLE_LOCALES`.
 *   2. Create `src/i18n/<code>.ts` exporting a `Strings`-shaped object.
 *   3. Create `src/data/<code>/{black_cards,white_cards}.json`.
 *   4. Register both in `DICT` below and in `lib/host.ts:DECKS`.
 */

export type { Locale } from "./locale";
export { AVAILABLE_LOCALES, DEFAULT_LOCALE } from "./locale";
export type { Strings };

const DICT: Record<Locale, Strings> = { es, en };

export function getStrings(locale: Locale): Strings {
  return DICT[locale] ?? DICT[DEFAULT_LOCALE];
}

/**
 * Hook for views. Re-renders when the locale changes.
 */
export function useT(): Strings {
  const locale = useUIStore((s) => s.locale);
  return DICT[locale] ?? DICT[DEFAULT_LOCALE];
}
