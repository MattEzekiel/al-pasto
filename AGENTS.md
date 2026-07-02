# AGENTS.md — Al pasto

This file is the contract for AI coding agents touching this repo. It is intentionally narrower than `CLAUDE.md` and stricter than a README.

## Non-negotiables

1. **No database, ever.** If you find yourself reaching for Redis, Postgres, Supabase, KV, or any persistent server-side store: stop. The architecture is host-as-server. Re-read `CLAUDE.md` § "Architecture" before continuing.
2. **No tokens get inlined.** Hex colors, pixel radii, custom font-sizes — they all live in the `@theme` block in `src/index.css` (Tailwind v4; there is no `tailwind.config.ts`). A PR with `bg-[#494fdf]` or `text-[14px]` is invalid.
3. **No shadow utilities on cards.** The design system has zero shadow vocabulary. `shadow-md`, `drop-shadow-*`, custom box-shadow — none of them. Depth is color-blocking + hairline borders.
4. **Cobalt-violet is sacred.** `bg-brand` is allowed only on: the winning card (`RevealView`), the active-judge marker, the final WinnerView. **Never** as a primary button color.
5. **Touch targets ≥ 48px.** PillButton `md` is the default. Do not introduce 32px buttons.
6. **Anonymity is a wire invariant.** When you touch the broadcast path, run anything peer-visible through `sanitizeState` and anything judge-visible through `anonymizeSubmissions`. Do not bypass.

## Operating rules

- Read `CLAUDE.md` first. It contains the architecture you need to understand the consequences of changes.
- Read `DESIGN.md` second. Every visual decision is documented there.
- When in doubt about whether a behavior belongs on the host or the peer, **put it on the host**. Peers are pure receivers.
- All host-side game logic goes in `src/lib/host.ts` as a pure `(GameState) => GameState` function. Wire it into the store via `commitHost`.
- All ephemeral UI state (drag offsets, flipped cards, transient toasts) belongs in `useUIStore`, not in `useGameStore`.

## Things you should add proactively

When you finish a task, look for these and add them if they apply:

- A new `Submission` field? Update `AnonymousSubmission` deliberately — leave out anything that could deanonymize.
- A new `Player` field? Decide if it goes in `SanitizedPlayer`. If you forget, the new field stops at the host. That's often the right answer.
- A new `GameState` field? Make sure it serializes cleanly (no `Date` objects, no closures) — IndexedDB is the failover path.
- A new screen? Add it to the `Screen` union in `App.tsx` and to `pickScreen()`. Phases without a screen go to `lobby`.

## Things you should never do

- Add server-side game logic. The server is a passthrough; if you can't express a behavior in the host reducer, the architecture is being violated.
- Add a "loading" or "skeleton" wireframe. The brand is editorial: empty states are real type with real content (see HomeView for the voice).
- Switch the app to light mode. Al pasto is dark-mode native. The only "light" surface is the white PillButton CTA.
- Use Inter at weight 500. The system has 400 (body), 600 (UI), and 700 (display). 500 is forbidden — see `DESIGN.md`.
- Introduce an animation library other than Framer Motion.

## How to verify before declaring done

1. `pnpm build` — full type-check + production build must pass.
2. `pnpm lint` — no new warnings.
3. Manual: open `pnpm dev` in three tabs. Host in tab 1, join from tab 2 + 3. Start the game. Run one full round (submission → judging → reveal). Verify the judge sees anonymous cards in shuffled order. Verify the host's drag-and-drop, the judge's flip animation, and the timer's rose-warning state.
4. Failover smoke test: refresh the host tab mid-game. The server should promote a peer and the game should resume from IndexedDB. If it doesn't, you broke a load-bearing invariant.

## Out of scope

- Authentication. There are no accounts.
- Telemetry. Al pasto is the off-the-record game; do not add analytics.
- New locales beyond Spanish/English. i18n exists: UI strings live in `src/i18n` (`es.ts` / `en.ts`) and the decks in `src/data/<locale>`. Keep decks factored as a separate concern from the UI strings — they have different translation budgets.
