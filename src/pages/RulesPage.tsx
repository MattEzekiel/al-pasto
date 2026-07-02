import { LangSwitch } from "@/components/ui/LangSwitch";
import { PillLink } from "@/components/ui/PillLink";
import type { Strings } from "@/i18n";
import en from "@/i18n/en";
import es from "@/i18n/es";
import type { Locale } from "@/i18n/locale";
import { GITHUB_URL } from "./meta";

const RULES_HREFS: Record<Locale, string> = {
  es: "/como-jugar",
  en: "/how-to-play",
};
const LANDING_HREFS: Record<Locale, string> = { es: "/juego", en: "/game" };

type langRules = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  sections: { title: string; body: string[] }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  playCta: string;
  landingLink: string;
  otherLang: string;
};

/**
 * Rules page — /como-jugar (es) and /how-to-play (en). Prerendered to static
 * HTML at build time; keep it SSR-pure (no stores, no browser APIs). The FAQ
 * below is also the source of the FAQPage JSON-LD in `meta.ts`.
 */
export default function RulesPage({ locale }: { locale: Locale }) {
  const dict: Strings = locale === "en" ? en : es;
  const t: langRules = dict.rules;
  const landingHref: string = LANDING_HREFS[locale];
  const otherHref: string = locale === "en" ? "/como-jugar" : "/how-to-play";

  return (
    <main className="mx-auto w-full max-w-2xl px-6 pb-20 pt-10">
      <header className="flex items-center justify-between gap-4">
        <a href={landingHref} className="display text-display-sm">
          al pasto.
        </a>
        <div className="flex items-center gap-4">
          <LangSwitch current={locale} hrefs={RULES_HREFS} />
          <PillLink href="/" variant="ghost" className="h-9 px-4 text-[13px]">
            {t.playCta}
          </PillLink>
        </div>
      </header>

      <h1 className="display mt-12 text-display-lg">{t.title}</h1>
      <p className="mt-4 max-w-prose text-body text-ink-mute">{t.intro}</p>

      {t.sections.map((section) => (
        <section key={section.title} className="mt-12">
          <h2 className="display text-display-sm">{section.title}</h2>
          <div className="mt-3 max-w-prose space-y-3">
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-body text-ink-mute">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-16">
        <h2 className="display text-display-md">{t.faqTitle}</h2>
        <div className="mt-6 space-y-6">
          {t.faq.map(({ q, a }: { q: string; a: string }) => (
            <div key={q} className="max-w-prose">
              <h3 className="text-body font-semibold">{q}</h3>
              <p className="mt-1 text-body text-ink-mute">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 text-center">
        <PillLink href="/" className="h-14 px-8 text-[16px]">
          {t.playCta}
        </PillLink>
      </div>

      <footer className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline pt-6 text-body-sm text-ink-mute">
        <a
          href={landingHref}
          className="hover:text-ink transition-colors duration-300"
        >
          {t.landingLink}
        </a>
        <a
          href={otherHref}
          className="hover:text-ink transition-colors duration-300"
        >
          {t.otherLang}
        </a>
        <a
          target="_blank"
          referrerPolicy="no-referrer"
          href={GITHUB_URL}
          rel="noopener"
          className="hover:text-ink transition-colors duration-300"
        >
          {dict.landing.footerGithub}
        </a>
      </footer>
    </main>
  );
}
