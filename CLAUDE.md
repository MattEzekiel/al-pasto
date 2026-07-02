# CLAUDE.md — Al pasto

Off-the-record multiplayer card game. Zero database, peer-hosted, mobile-first PWA.

## Stack snapshot

- **Runtime:** React 19 + React Compiler, Vite, TypeScript strict.
- **State:** Zustand. Three slices: `useGameStore` (host source-of-truth + peer view), `useNetworkStore` (socket lifecycle), `useUIStore` (drag/flip/toasts).
- **Styling:** Tailwind v4 (CSS-first) via `@tailwindcss/vite`. Tokens live in the `@theme` block in `src/index.css` — there is no `tailwind.config.ts`. **Never inline hex** — every color/radius/typography ramp is a token.
- **Motion:** Framer Motion for card drag, card flip (judge view), and screen transitions.
- **Persistence:** `idb-keyval` mirrors the host state on every mutation (`src/lib/persist.ts`).
- **Networking:** `socket.io-client` over a passthrough WebSocket. The server is dumb on purpose — see `server/index.js`.

## Architecture you must internalize before changing anything

There is no database. The **host's Zustand store is the entire source of truth**. Mutations flow:

1. A peer (or the host) sends a `ClientToServer` packet over the wire.
2. The server forwards it to everyone in the room (except, when relevant, the sender).
3. The host receives the packet, runs it through a pure reducer in `src/lib/host.ts`, and the store calls `commitHost(next)`.
4. `commitHost` does three things atomically: (a) updates local state, (b) mirrors the full state to IndexedDB, (c) broadcasts the sanitized projection to peers + sends each peer their private hand.
5. Peers receive `state/broadcast` and `state/private` packets and update their local `view` and `privateHand`.

Failover lives at `useGameStore.promoteSelfToHost` — invoked when the server sends `host/promote` after the previous host drops. The new host reads the IndexedDB mirror, repairs its own socketId, and re-commits.

**Anonymity:** `Submission.playerId` lives only in host-side memory and IndexedDB. The judge sees `AnonymousSubmission[]` produced by `lib/anonymize.ts:anonymizeSubmissions`, which strips author ids and shuffles. Never broadcast a `Submission` — only an `AnonymousSubmission`.

## File layout

```
src/
  App.tsx                    phase-driven screen router
  main.tsx                   bootstrap
  entry-server.tsx           SSR entry for the prerendered marketing routes
  index.css                  Tailwind layers + base resets + the @theme token block
  types/game.ts              all domain types — start here
  i18n/
    en.ts / es.ts            UI strings per locale
    strings.ts               the Strings type
    locale.ts                locale detection + switching
  lib/
    host.ts                  pure game logic (deal, judge, score, tie-break, kick)
    anonymize.ts             sanitization for broadcast
    persist.ts               IndexedDB mirror
    network.ts               socket.io-client wrapper
    qr.ts                    invite QR rendering
  store/
    useGameStore.ts          THE store. Host-side state + peer view + actions
    useNetworkStore.ts       socket handle + wire status
    useUIStore.ts            ephemeral UI state (drag, flip, toasts)
  data/
    en/ + es/                per-locale decks:
      black_cards.json       prompt deck — { id, text, spaces: 1|2 }
      white_cards.json       response deck — { id, text }
  components/
    ErrorBoundary.tsx        top-level render crash guard
    ui/
      PillButton.tsx         the canonical button
      GameCard.tsx           GameCard + PromptText
      TimerBar.tsx           round timer with rose alert below 25%
      Avatar.tsx             initials-only, hairline ring
      ScoreChip.tsx          teal positive chip
      AppFrame.tsx           mobile-first frame with safe-area insets
      PillLink.tsx           pill-shaped anchor
      LangSwitch.tsx         es/en locale toggle
  pages/
    LandingPage.tsx          prerendered marketing landing
    RulesPage.tsx            prerendered how-to-play page
    meta.ts                  per-route meta tags
  views/
    HomeView.tsx
    LobbyView.tsx
    GameplayView.tsx
    JudgeView.tsx
    RevealView.tsx
    WinnerView.tsx
    AuthoringView.tsx
server/
  index.js                   passthrough signaling + host election
```

## Commands

```bash
pnpm install           # or npm i
pnpm dev               # vite dev server on :5173
pnpm server            # passthrough signaling server on :3001
pnpm build             # tsc -b && vite build
pnpm lint
```

To run a real local match: open `pnpm dev` in three browser windows (or one phone + two tabs) and have one host + two joiners. The signaling server **must** be running.

## Conventions

- **Tokens, not values.** No `#494fdf`, no `rounded-[16px]` — use `bg-brand`, `rounded-card`. The whole design system is the `@theme` block in `src/index.css` (Tailwind v4). If you need a color or radius that isn't there, add it there as a `--color-*` / `--radius-*` / `--text-*` token first. In CSS, reference tokens as `var(--color-…)`, not the v3 `theme()` function.
- **Display weight = 700, negative tracking.** Headings, card text, scoreboard numerals — Inter 700, `-1.5px`. Everything else is Inter 400 (body) or 600 (UI labels).
- **The white pill on black is the primary CTA.** Cobalt-violet (`bg-brand`) is reserved for: winning-card stamps (RevealView), the active-judge label, the final WinnerView background. Do **not** make brand the primary button color.
- **No drop shadows.** Depth is color-blocking only. `bg-canvas` → `bg-surface-card` (hairline) → `bg-surface-elevated` → `bg-brand`.
- **Touch targets ≥ 48px.** PillButton ships at 48px (`md`); inputs at 48px; bump small chips with padding when on mobile.
- **Host actions are pure.** Add new behavior as a `(state) => state` reducer in `src/lib/host.ts`. The store calls it inside `commitHost`. Never mutate state from a view.
- **Sanitize, then broadcast.** If you add a host-side mutation, make sure `commitHost` still produces a valid `SanitizedGameState`. Update `lib/anonymize.ts` if the public projection needs to expose more.
- **Failover is real.** Anything you add to `GameState` will be IndexedDB-mirrored automatically. If it can't be reconstructed from a mirror (e.g. a Date pointer to a setTimeout id), keep it out of the store and put it in `useUIStore`.

## What to leave alone unless you understand it

- The `commitHost → mirror → broadcast → fan-out-private-hands` sequence in `useGameStore`. If any step fails, the failover guarantee breaks.
- `anonymizeSubmissions` — the order of "shuffle then strip ids" matters; if you reverse it, position becomes a tell.
- `promoteOrTerminate` in `server/index.js` — the 3-player quorum is the only correctness invariant on the server side.

## Token-efficient working rules

Adapted from github.com/drona23/claude-token-efficient (universal + coding profile).

### Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes. Plain hyphens and straight quotes only.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

### Output
- Return code first. Explanation after, only if non-obvious.
- No inline prose. Comments only where logic is unclear.
- No boilerplate unless explicitly requested.

### Code
- Simplest working solution. No over-engineering.
- No abstractions for single-use operations. Three similar lines beats a premature abstraction.
- No speculative features or "you might also want...".
- Read the file before modifying it. Never edit blind.
- No docstrings or type annotations on code not being changed.
- No error handling for scenarios that cannot happen.

### Review / debugging
- State the bug. Show the fix. Stop. No suggestions beyond the review's scope, no compliments.
- Never speculate about a bug without reading the relevant code first. One pass: what you found, where, the fix.
- If the cause is unclear, say so. Do not guess.
- Validate before declaring done.
