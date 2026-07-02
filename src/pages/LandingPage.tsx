import { useEffect } from "react";
import type { Locale } from "@/i18n/locale";
import { writeStoredLocale } from "@/i18n/locale";
import es from "@/i18n/es";
import en from "@/i18n/en";
import { PromptText } from "@/components/ui/GameCard";
import { PillLink } from "@/components/ui/PillLink";
import { LangSwitch } from "@/components/ui/LangSwitch";
import { GITHUB_URL } from "./meta";

/**
 * SEO landing — /juego (es) and /game (en). Prerendered to static HTML at
 * build time (scripts/prerender.mjs) — keep it SSR-pure: no stores, no
 * sockets, no browser APIs outside effects.
 */

const LANDING_HREFS: Record<Locale, string> = { es: "/juego", en: "/game" };
const RULES_HREFS: Record<Locale, string> = { es: "/como-jugar", en: "/how-to-play" };

// ponytail: static card markup instead of GameCard — same tokens, no
// framer-motion layout animation needed on a marketing page.
function HeroCards({ locale }: { locale: Locale }) {
  const t = (locale === "en" ? en : es).landing;
  return (
    <div className="relative mx-auto mt-14 h-85 w-75" aria-hidden>
      <div className="absolute left-0 top-0 flex aspect-3/4 w-57.5 -rotate-6 flex-col justify-between rounded-card bg-surface-card p-5 hairline">
        <PromptText text={t.heroCard} />
        <div className="flex items-end justify-between">
          <span className="display text-[18px] tracking-[-0.5px]">al pasto.</span>
          <span className="text-[11px] uppercase tracking-[0.4px] text-ink-mute">
            {t.heroCardMeta}
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 flex aspect-3/4 w-47.5 rotate-6 flex-col justify-between rounded-card bg-ink p-5 text-canvas">
        <p className="display text-card-md leading-[1.2]">{t.heroAnswer}</p>
        <span className="display text-[16px] tracking-[-0.5px]">al pasto.</span>
      </div>
    </div>
  );
}

export default function LandingPage({ locale }: { locale: Locale }) {
  const t = (locale === "en" ? en : es).landing;
  const rulesHref = RULES_HREFS[locale];

  // Arriving at a language's landing IS the language choice — the game (and
  // rooms created from it) boot with this locale via useUIStore.
  useEffect(() => {
    writeStoredLocale(locale);
  }, [locale]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-20 pt-12 sm:pt-20">
      <div className="flex items-center justify-between">
        <p className="text-label uppercase tracking-[1.5px] text-ink-mute">{t.kicker}</p>
        <LangSwitch current={locale} hrefs={LANDING_HREFS} />
      </div>
      <h1 className="display mt-4 text-display-xl">
        al pasto.
        <br />
        <span className="text-ink-mute">{t.heroTitle}</span>
      </h1>
      <p className="mt-6 max-w-prose text-body text-ink-mute">{t.heroSubtitle}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <PillLink href="/">{t.playCta}</PillLink>
        <PillLink href={rulesHref} variant="ghost">
          {t.rulesCta}
        </PillLink>
      </div>

      <HeroCards locale={locale} />

      <section className="mt-20">
        <h2 className="display text-display-md">{t.howTitle}</h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <li key={step.title}>
              <span className="display text-display-sm text-ink-faint">0{i + 1}</span>
              <h3 className="mt-2 text-body font-semibold">{step.title}</h3>
              <p className="mt-1 text-body-sm text-ink-mute">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <h2 className="display text-display-md">{t.featuresTitle}</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {t.features.map((f) => (
            <div key={f.title} className="rounded-card bg-surface-card p-5 hairline">
              <h3 className="text-body font-semibold">{f.title}</h3>
              <p className="mt-1 text-body-sm text-ink-mute">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-20 text-center">
        <PillLink href="/" className="h-14 px-8 text-[16px]">
          {t.playCta}
        </PillLink>
      </div>

      <footer className="mt-20 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6 text-body-sm text-ink-mute">
        <a href={rulesHref} className="hover:text-ink transition-colors duration-300">
          {t.footerRules}
        </a>
        <a target={"_blank"} href={GITHUB_URL} referrerPolicy={"no-referrer"} rel="noopener" className="hover:text-ink transition-colors duration-300">
          {t.footerGithub}
        </a>
      </footer>
    </main>
  );
}
