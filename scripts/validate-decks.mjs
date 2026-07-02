/**
 * Deck-data validation — run with `pnpm validate:decks`.
 *
 * Guards the card JSON under `src/data/<locale>/` against the two silent
 * failure modes of the country-tag system:
 *   1. `available` codes not registered in `src/data/countries.json` for the
 *      deck's locale (a typo would make the card vanish in country rooms).
 *   2. Duplicate card ids within a deck file.
 *
 * Exits non-zero with a per-problem message so CI and pre-flight checks
 * fail fast. Adding a country or tagging a card stays data-only.
 */
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dataDir = fileURLToPath(new URL("../src/data", import.meta.url));

const countries = JSON.parse(
  await readFile(path.join(dataDir, "countries.json"), "utf8"),
);

const errors = [];

const entries = await readdir(dataDir, { withFileTypes: true });
const locales = entries.filter((e) => e.isDirectory()).map((e) => e.name);

for (const locale of locales) {
  const registered = new Set((countries[locale] ?? []).map((c) => c.code));
  if (!(locale in countries)) {
    errors.push(`countries.json: locale "${locale}" has no entry (add "${locale}": []).`);
  }

  for (const file of ["white_cards.json", "black_cards.json"]) {
    const deckPath = path.join(dataDir, locale, file);
    let cards;
    try {
      cards = JSON.parse(await readFile(deckPath, "utf8"));
    } catch (err) {
      errors.push(`${locale}/${file}: unreadable or invalid JSON (${err.message}).`);
      continue;
    }

    const seen = new Set();
    for (const card of cards) {
      if (seen.has(card.id)) {
        errors.push(`${locale}/${file}: duplicate card id "${card.id}".`);
      }
      seen.add(card.id);

      if (card.available === undefined) continue;
      if (!Array.isArray(card.available) || card.available.length === 0) {
        errors.push(
          `${locale}/${file}: card "${card.id}" — "available" must be a non-empty array of country codes (or be omitted).`,
        );
        continue;
      }
      for (const code of card.available) {
        if (code === "*") continue;
        if (!registered.has(code)) {
          errors.push(
            `${locale}/${file}: card "${card.id}" — unknown country code "${code}" (not in countries.json for "${locale}").`,
          );
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Deck validation failed (${errors.length} problem${errors.length === 1 ? "" : "s"}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Deck validation passed (${locales.length} locale${locales.length === 1 ? "" : "s"}: ${locales.join(", ")}).`);
