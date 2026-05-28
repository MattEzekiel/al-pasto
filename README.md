# Corta: The Off-The-Record Card Game 🃏🤫

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Framework: React 19](https://img.shields.io/badge/Framework-React_19-61dafb.svg)](https://react.dev/)
[![Compiler: Enabled](https://img.shields.io/badge/React_Compiler-Active-green.svg)](https://react.dev/learn/react-compiler)
[![Database: None](https://img.shields.io/badge/Database-Zero_DB-ff69b4.svg)]()

**Corta** is an open-source, mobile-first, politically incorrect multiplayer card game inspired by *Cards Against Humanity* and *HDP*. It is architected to be completely **database-less**, running entirely via local browser memory, P2P-style state replication, and client-side browser storage (`IndexedDB`).

The name comes from the Argentine slang *"Corta"* (straight to the point, unfiltered) and reflects the game's structural speed: no signups, no data tracking, and instantaneous local play.

---

## ⚡ Key Characteristics & Architecture

### 1. Zero-Database Infrastructure
Corta does not use any centralized database (No PostgreSQL, No Redis, No MongoDB). A lightweight Node.js signaling server handles initial peer-shaking and acts as a stateless "passthrough" router for WebSockets (`socket.io`).
* **The Host is the Server:** The player who spins up a room acts as the authoritative source of truth. The game loop, active decks, scores, and turn matrices reside entirely in the Host's browser memory via a synchronized `Zustand` global store.
* **State Broadcasts:** On every card submission, vote, or setting change, the Host cryptographically anonymizes the data and broadcasts a sanitized state payload to all connected peers.

### 2. Peer-to-Peer Resiliency & Host Failover
Because the entire match state lives in a browser, typical web drops could ruin a session. Corta eliminates this via a custom **Host Migration Protocol**:
1. All peers continuously echo game updates to their local browser `IndexedDB`.
2. The stateless signaling server constantly tracks network heartbeats.
3. If the Host drops out or refreshes, the signaling server immediately promotes the next active peer in the connection array to Host.
4. The newly promoted Host reads the latest synchronized game snapshot from its local `IndexedDB`, hydrates its local `Zustand` engine, flips its flag to `isHost: true`, and broadcasts a recovery packet. Gameplay resumes seamlessly without losing score or turn history.
5. If the total player count falls below 3, the session self-terminates to protect integrity.

### 3. Design System: "High-Contrast / Sin Filtro"
Blending the rigid technical voice of ClickHouse with the clean editorial aesthetics of Revolut, Corta uses an ultra-clean, strict dark atmosphere.
* **Canvas Dark:** `#000000` (True black floor).
* **Surface Card:** `#121212` (Prompts, deck elements, hairline borders `#2A2A2A`).
* **Brand Accent:** `#494fdf` (Cobalt Violet, used sparingly for victories or selection indicators).
* **Primary Triggers:** Pure white pills (`#ffffff`) with black text (`#000000`). No gradients, no soft shadows.

---

## 🛠️ Tech Stack

* **Core:** React 19 (leveraging the native React Compiler for automated rendering tree optimizations)
* **Build Tool:** Vite + TypeScript 5.x
* **State Management:** Zustand (Slices-based architecture for game loop, ui, and networking)
* **Gestures & Movement:** Framer Motion (Mobile-first drag-to-play mechanics, 3D flip card card reveals)
* **Storage Layer:** Local IndexedDB wrapper (`idb` / `localforage`)
* **Real-time Engine:** Socket.io-client

---

## 🚀 Quick Start

### Prerequisites
* Node.js v18.x or higher
* npm / yarn / pnpm

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/corta.git
   cd corta
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Boot the local development environment:

   ```bash
   npm run dev
   ```

---

## 🎨 Visual System Guide

When coding or adding UI templates, strictly match the following Tailwind tokens:

* Backgrounds: `bg-[#000000]` (canvas), `bg-[#121212]` (cards), `bg-[#1C1C1E]` (elevated interactives).
* Typography: `font-sans` tracking tightly (`tracking-[-1.5px]`) at `font-bold` for prompt cards; standard positive tracking (`tracking-[0.2px]`) for metrics and configurations.
* Components: Buttons must feature `rounded-full`. Playing cards must feature `rounded-2xl`.

---

## 💜 Contributing & Support

Corta is intentionally cheap to operate — zero database, zero infrastructure, host-as-server. The trade is that the project lives on contributions and goodwill. If it gave your *previa* a chaotic moment, the easiest ways to keep it alive are:

[![Sponsor on GitHub](https://img.shields.io/badge/GitHub_Sponsors-@mattezekiel-ea4aaa.svg?logo=github&logoColor=white)](https://github.com/sponsors/mattezekiel)
[![Invitame un café en Cafecito](https://img.shields.io/badge/Cafecito-@mattezekiel-FFDD00.svg?logo=buy-me-a-coffee&logoColor=black)](https://cafecito.app/mattezekiel)

Sponsorship is recognition-based and unlocks the in-app supporter features (custom human-readable room codes, Hall of Fame credit, optional custom deck packaging). It does **not** gate gameplay — Corta is and stays free under AGPLv3.

### Pull requests

PRs are welcome. The contribution workflow, code style, and supporter-perk wiring live in [`CONTRIBUTING.md`](./CONTRIBUTING.md). Before submitting, please:

- Read [`AGENTS.md`](./AGENTS.md) — the non-negotiables (no database, no shadow utilities, no inlined tokens, anonymity invariant).
- Read [`DESIGN.md`](./DESIGN.md) — every color, radius, and type ramp is a token. Don't introduce raw hex.
- Run `pnpm build` and `pnpm lint` before opening the PR.

---

## ⚖️ License

Corta is open-source software licensed under the **GNU AGPLv3**. Under this copyleft license, if you modify this web application and host it publicly on a server, you are legally bound to make your complete modified source code publicly available under the same AGPL license.
