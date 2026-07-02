# Contributing to Al pasto 🚀

First off, thank you for taking the time to contribute! Al pasto is built by developers who believe in high-performance, private, zero-dependency multiplayer experiences.

By contributing to Al pasto, you help build a completely serverless-state ecosystem that shifts the power of computing directly to client devices.

---

## 🗺️ Codebase Directory Structure

Before writing code, familiarize yourself with our architectural layout:

```text
src/
├── assets/          # Static images, vector shapes
├── data/            # Card deck seeds per locale (en/ and es/, each with black_cards.json + white_cards.json)
├── i18n/            # UI strings (en.ts / es.ts) and locale detection
├── components/      # UI components
│   └── ui/          # Low-level primitives (PillButton, GameCard, TimerBar, Avatar, ScoreChip, AppFrame, PillLink, LangSwitch)
├── lib/             # Pure logic: host reducer, anonymizers, IndexedDB persistence, socket wrapper, QR
├── pages/           # Prerendered marketing routes (LandingPage, RulesPage, meta)
├── store/           # Zustand stores
│   ├── useGameStore.ts      # Authoritative game machine logic
│   ├── useNetworkStore.ts   # Socket connection, heartbeats
│   └── useUIStore.ts        # Ephemeral UI state (drag, flip, toasts)
├── types/           # Strict TypeScript interfaces (.ts models)
└── views/           # Game screens (HomeView, LobbyView, GameplayView, JudgeView, RevealView, WinnerView, AuthoringView)
```

---

## 🛠️ Code Quality Standards

To maintain an clean, fast code ecosystem, we enforce the following rules:

### 1. Type Enforcement

* Never use `any`. Every object payload transiting across WebSockets or local state mutation must map onto an explicit interface or union type in `types/game.ts`.
* Explicitly type your hook returns and component properties.

### 2. Rendering Optimization & State

* Do not sprinkle `useMemo` or `useCallback` everywhere. Al pasto runs on **React 19 + React Compiler**. The compiler automatically handles component memoization by parsing the dependency graphs during the build phase.
* Keep your local component state minimal. If a variable impacts multiplayer state replication or host failover, place it inside `useGameStore.ts`.

### 3. Motion & Animation Principles

* Every touch gesture must prioritize immediate interactive feedback.
* Use Framer Motion layout animations (`layoutId`) when transferring elements (e.g., dragging a white response card from a player's hand array into the global submission drop-zone).
* Maintain a standard animation duration of `0.2s` or `0.3s` using crisp easing springs (`easeOut` or custom spring metrics for tactile drag).

---

## 📥 Git Workflow & Pull Requests

We operate a strict branching model to preserve master branch production readiness:

1. **Fork & Branch:** Create a feature branch off of `main`:

   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/bug-description
   ```

2. **Lint & Build Verification:** Ensure your code complies with TypeScript definitions and builds cleanly without warnings:

   ```bash
   npm run lint
   npm run build
   ```

3. **Commit Guidelines:** Use concise, semantic commit messages (e.g., `feat(game): implement automated tie-breaker grace ticker`, `fix(network): resolve indexeddb storage locking during host swap`).
4. **Submit PR:** Detail the exact mechanics introduced, attach screenshot artifacts if you modified visual tokens, and link relevant tracking issues.

Thank you for keeping Al pasto fast, private, and beautifully unfiltered!
