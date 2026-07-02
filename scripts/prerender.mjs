/**
 * Post-build prerender. Renders the marketing routes from the SSR bundle
 * into static HTML under dist/, injects per-route head metadata, and emits
 * sitemap.xml + llms.txt. Runs after `vite build` (client) and
 * `vite build --ssr` (see the build script in package.json).
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const ssrEntry = pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href;
const { render, ROUTE_META, SITE_URL, GITHUB_URL } = await import(ssrEntry);

if (!SITE_URL) {
  throw new Error("VITE_SITE_URL is not set. Add it to .env (see .env.example).");
}

const template = readFileSync(path.join(dist, "index.html"), "utf8");
const href = (p) => SITE_URL + (p === "/" ? "/" : p);

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const setMeta = (html, attr, key, value) =>
  html.replace(
    new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`),
    (_, open, close) => open + esc(value) + close,
  );

function headFor(meta) {
  const lines = [`<link rel="canonical" href="${href(meta.path)}" />`];
  for (const alt of meta.alternates) {
    lines.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${href(alt.path)}" />`);
  }
  lines.push(`<meta property="og:url" content="${href(meta.path)}" />`);
  for (const ld of meta.jsonLd) {
    lines.push(
      `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
    );
  }
  return lines.join("\n    ");
}

for (const meta of ROUTE_META) {
  let html = template;
  if (meta.title) {
    html = html
      .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(meta.title)}</title>`)
      .replace('lang="es-AR"', `lang="${meta.lang}"`);
    html = setMeta(html, "name", "description", meta.description);
    html = setMeta(html, "property", "og:title", meta.title);
    html = setMeta(html, "property", "og:description", meta.description);
    html = setMeta(html, "name", "twitter:title", meta.title);
    html = setMeta(html, "name", "twitter:description", meta.description);
  }
  html = html
    .replace(/content="\/og-image\.png"/g, `content="${SITE_URL}/og-image.png"`)
    .replace("<!--app-head-->", headFor(meta))
    .replace("<!--app-html-->", () => render(meta.path));

  const outDir = meta.path === "/" ? dist : path.join(dist, meta.path.slice(1));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`prerendered ${meta.path}`);
}

const urls = ROUTE_META.map((m) => `  <url><loc>${href(m.path)}</loc></url>`).join("\n");
writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

const robots = path.join(dist, "robots.txt");
if (existsSync(robots)) {
  appendFileSync(robots, `\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

writeFileSync(
  path.join(dist, "llms.txt"),
  `# Al pasto

> Juego de cartas multijugador gratuito inspirado en Cards Against Humanity, en español rioplatense e inglés. Sin cuentas y sin base de datos: la partida corre en el celular del anfitrión. / Free multiplayer party card game inspired by Cards Against Humanity, in Rioplatense Spanish and English. No accounts, no database: the game runs on the host's phone.

## Páginas / Pages

- [Jugar / Play](${href("/")}): la aplicación - the game itself
- [Sobre el juego](${href("/juego")}): qué es Al pasto y por qué es distinto
- [About the game](${href("/game")}): the English landing page
- [Cómo se juega](${href("/como-jugar")}): reglas en español
- [How to play](${href("/how-to-play")}): rules in English

## Código / Source

- [GitHub](${GITHUB_URL}): código abierto bajo AGPL - open source under AGPL
`,
);

console.log("wrote sitemap.xml, llms.txt, robots.txt sitemap line");
