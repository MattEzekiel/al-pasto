import { useUIStore } from "@/store/useUIStore";
import type { Strings } from "./strings";
import es from "./es";
import en from "./en";

/**
 * Tiny in-house i18n.
 *
 * The locale lives on `useUIStore` so views that depend on copy
 * re-render naturally. The decks live in `src/data/<locale>/` and are
 * resolved on the host side via `lib/host.ts:loadDecks(locale)`.
 *
 * To add a locale:
 *   1. Add the two-letter code to `Locale` below.
 *   2. Create `src/i18n/<code>.ts` exporting a `Strings`-shaped object.
 *   3. Create `src/data/<code>/{black_cards,white_cards}.json`.
 *   4. Register both in `DICT` and in `lib/host.ts:DECKS`.
 *
 * Default is `"es"` (rioplatense). Hardcoded at boot — no auto-detection
 * from `navigator.language` yet.
 */

export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";

export const AVAILABLE_LOCALES: ReadonlyArray<{ code: Locale; label: string }> = [
  { code: "es", label: "Español (AR)" },
  { code: "en", label: "English" },
];

const DICT: Record<Locale, Strings> = { es, en };

export function getStrings(locale: Locale): Strings {
  return DICT[locale];
}

/**
 * Hook for views. Re-renders when the locale changes.
 *
 * Example:
 *   const t = useT();
 *   t.lobby.players(playerCount)
 */
export function useT(): Strings {
  const locale = useUIStore((s) => s.locale);
  return DICT[locale] ?? DICT[DEFAULT_LOCALE];
}

export type { Strings };
