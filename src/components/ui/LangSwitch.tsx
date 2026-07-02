import type { Locale } from "@/i18n/locale.ts";
import { AVAILABLE_LOCALES } from "@/i18n/locale.ts";

/**
 * ES | EN selector for the prerendered marketing pages. Plain anchors —
 * each language is its own static URL, so switching is a full-page nav.
 * The destination landing page persists the choice on mount.
 */
export function LangSwitch({
  current,
  hrefs,
}: {
  current: Locale;
  hrefs: Record<Locale, string>;
}) {
  return (
    <nav
      aria-label="Language"
      className="flex gap-3 text-label uppercase tracking-[0.4px]"
    >
      {AVAILABLE_LOCALES.map(({ code }) => (
        <a
          key={code}
          href={hrefs[code]}
          aria-current={code === current ? "page" : undefined}
          className={
            code === current
              ? "text-ink"
              : "text-ink-mute hover:text-ink transition-colors duration-300"
          }
        >
          {code}
        </a>
      ))}
    </nav>
  );
}
