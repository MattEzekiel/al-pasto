import es from "@/i18n/es";
import en from "@/i18n/en";

/**
 * Per-route head metadata for the prerendered marketing pages. Consumed by
 * `scripts/prerender.mjs` (via the SSR bundle) at build time. Imports the
 * locale dictionaries directly — never the UI store — to stay SSR-pure.
 */

/** Both come from .env — scripts/prerender.mjs fails the build if SITE_URL is unset. */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL ?? "").replace(/\/+$/, "");
export const GITHUB_URL: string = import.meta.env.VITE_GITHUB_URL ?? "";

export interface RouteMeta {
  path: string;
  /** `<html lang>` for the prerendered document. */
  lang: string;
  /** When absent, the template's own title/description are kept (the app shell). */
  title?: string;
  description?: string;
  alternates: { hreflang: string; path: string }[];
  jsonLd: object[];
}

const videoGame = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: "Al pasto",
  url: `${SITE_URL}/`,
  description: es.landing.metaDescription,
  genre: ["Party game", "Card game"],
  playMode: "MultiPlayer",
  applicationCategory: "Game",
  operatingSystem: "Web",
  gamePlatform: "Web browser",
  inLanguage: ["es-AR", "en"],
  numberOfPlayers: { "@type": "QuantitativeValue", minValue: 3 },
  isAccessibleForFree: true,
};

const faqPage = (faq: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

const RULES_ALTERNATES = [
  { hreflang: "es-AR", path: "/como-jugar" },
  { hreflang: "en", path: "/how-to-play" },
  { hreflang: "x-default", path: "/como-jugar" },
];

const LANDING_ALTERNATES = [
  { hreflang: "es-AR", path: "/juego" },
  { hreflang: "en", path: "/game" },
  { hreflang: "x-default", path: "/juego" },
];

export const ROUTE_META: RouteMeta[] = [
  {
    path: "/",
    lang: "es-AR",
    alternates: [],
    jsonLd: [videoGame],
  },
  {
    path: "/juego",
    lang: "es-AR",
    title: es.landing.metaTitle,
    description: es.landing.metaDescription,
    alternates: LANDING_ALTERNATES,
    jsonLd: [videoGame],
  },
  {
    path: "/game",
    lang: "en",
    title: en.landing.metaTitle,
    description: en.landing.metaDescription,
    alternates: LANDING_ALTERNATES,
    jsonLd: [videoGame],
  },
  {
    path: "/como-jugar",
    lang: "es-AR",
    title: es.rules.metaTitle,
    description: es.rules.metaDescription,
    alternates: RULES_ALTERNATES,
    jsonLd: [faqPage(es.rules.faq)],
  },
  {
    path: "/how-to-play",
    lang: "en",
    title: en.rules.metaTitle,
    description: en.rules.metaDescription,
    alternates: RULES_ALTERNATES,
    jsonLd: [faqPage(en.rules.faq)],
  },
];
