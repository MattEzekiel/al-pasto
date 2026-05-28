# Contributing to Corta 🚀

First off, thank you for taking the time to contribute! Corta is built by developers who believe in high-performance, private, zero-dependency multiplayer experiences.

By contributing to Corta, you help build a completely serverless-state ecosystem that shifts the power of computing directly to client devices.

---

## 🗺️ Codebase Directory Structure

Before writing code, familiarize yourself with our architectural layout:

```text
src/
├── assets/          # Static icons, vector shapes
├── data/            # black_cards.json and white_cards.json seeds
├── components/      # UI components split by context
│   ├── ui/          # Low-level primitives (PillButton, CustomInput)
│   ├── game/        # Game domain UI (GameCard, TimerBar)
│   └── shared/      # Global layout chrome (Navbar, Footer)
├── store/           # Zustand stores
│   ├── useGameStore.ts      # Authoritative game machine logic
│   ├── useNetworkStore.ts   # Socket connection, heartbeats
│   └── useUIStore.ts        # Modals, drawer overlays
├── types/           # Strict TypeScript interfaces (.ts models)
├── utils/           # Anonymizers, deck shufflers, IndexedDB handlers
└── views/           # Structural layouts (LobbyView, GameplayView, JudgeView)
```

---

## 🛠️ Code Quality Standards

To maintain an clean, fast code ecosystem, we enforce the following rules:

### 1. Type Enforcement

* Never use `any`. Every object payload transiting across WebSockets or local state mutation must map onto an explicit interface or union type in `types/game.ts`.
* Explicitly type your hook returns and component properties.

### 2. Rendering Optimization & State

* Do not sprinkle `useMemo` or `useCallback` everywhere. Corta runs on **React 19 + React Compiler**. The compiler automatically handles component memoization by parsing the dependency graphs during the build phase.
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

Thank you for keeping Corta fast, private, and beautifully unfiltered!
