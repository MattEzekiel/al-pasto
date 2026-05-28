# corta.

The off-the-record card game. Multiplayer, peer-hosted, zero database, mobile-first PWA.

```
React 19 + Compiler  ·  Vite  ·  TypeScript strict
Zustand              ·  Framer Motion  ·  Tailwind v3
socket.io passthrough (no game state on the server)
idb-keyval failover mirror
```

## Run

```bash
pnpm install
pnpm server   # passthrough signaling on :3001
pnpm dev      # PWA on :5173
```

Open three browser windows. Host in one; join from the other two with the room code or QR. The signaling server **must** be running — but it never sees game state. The host's tab IS the server.

If the host's tab dies mid-game, the signaling server randomly promotes a surviving peer; the new host hydrates the last broadcast from its own IndexedDB mirror and the round resumes. If fewer than three players remain, the room terminates.

## Reading order

1. **`CLAUDE.md`** — architecture, file layout, conventions.
2. **`AGENTS.md`** — non-negotiables for anyone (human or AI) editing this repo.
3. **`DESIGN.md`** — the full Sin Filtro design system: tokens, components, motion, do's and don'ts.

## Where things live

```
src/types/game.ts          domain types — the wire contract
src/lib/host.ts            pure reducers: deal/judge/score/tie-break/kick
src/lib/anonymize.ts       sanitize for broadcast; shuffle for judging
src/lib/persist.ts         IndexedDB mirror (failover)
src/store/useGameStore.ts  the host source-of-truth + peer view
src/views/                 HomeView, LobbyView, PlayerView, JudgeView, RevealView, WinnerView
server/index.js            passthrough + host election
tailwind.config.ts         every color / radius / font is a token
```

## Env

```
VITE_SIGNAL_URL=http://localhost:3001    # frontend → signaling server
PORT=3001                                 # signaling server
CORS_ORIGIN=*                             # signaling server
```
