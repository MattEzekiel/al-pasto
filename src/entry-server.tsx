/* eslint-disable react-refresh/only-export-components -- build-time SSR entry, never hot-reloaded */
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import LandingPage from "./pages/LandingPage";
import RulesPage from "./pages/RulesPage";

/**
 * SSR entry for `scripts/prerender.mjs`. Only the marketing pages — never
 * the game app (stores, sockets and idb are not SSR-safe and must not end
 * up in this bundle).
 */

export { GITHUB_URL, ROUTE_META, SITE_URL } from "./pages/meta";

const PAGES: Record<string, () => ReactElement> = {
  "/juego": () => <LandingPage locale="es" />,
  "/game": () => <LandingPage locale="en" />,
  "/como-jugar": () => <RulesPage locale="es" />,
  "/how-to-play": () => <RulesPage locale="en" />,
};

export function render(path: string): string {
  const page = PAGES[path];
  return page ? renderToString(page()) : "";
}
