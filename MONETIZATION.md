# Monetization & Sustainability Strategy ☕💎

Al pasto is an open-source project licensed under GNU AGPLv3. Because its architecture is completely **database-less** and runs entirely via client-side browsers, running costs are virtually zero. This makes the project highly sustainable and uniquely positioned to leverage crowdsourced backing mechanisms like **Cafecito** (for Latin America) and **GitHub Sponsors** (internationally).

Our monetization engine focuses exclusively on aesthetic recognition, advanced local configurations, and tooling enhancements without gating the core game logic behind paywalls.

---

## 🚀 Monetizable Features (Built-In Hooks)

The application provides native local hooks to validate premium supporter capabilities via local token verification or simple local configurations:

### 1. Premium Custom Rooms
* **Standard Behavior:** The stateless signaling server automatically spins up arbitrary alphanumeric room identifiers (e.g., `ROOM: TR-8910`).
* **Supporter Upgrade:** Supporters who plug in a validated donation token or hash in their profile screen unlock local string parsing. This allows them to allocate static, human-readable semantic room names (e.g., `ROOM: JUNTADA-SABADO` or `ROOM: CODERS-NIGHT`). The signaling server registers this explicit namespace bypass directly inside the volatile memory registry.

### 2. In-App Custom Deck Builder & Injector
* Give supporters access to a premium, streamlined visual interface inside the web dashboard to compose custom cards.
* Users write questions (Black Cards with configurable slot counters) and answers (White Cards), compile them visually, and download them cleanly.
* This interface lets users store these custom card engines directly inside their browser's local storage profile (`IndexedDB`), allowing them to seed personalized expansions into any game where they act as Host.

### 3. The Structural Hall of Fame (Credits Chrome)
* Built directly into the core user interface footer and lobby templates is an editorial directory dedicated to financial backers.
* Names are pulled dynamically from an open data file or injected at compile time, rendering sponsors in massive, high-contrast typography (`font-weight: 700`, strict negative letter-spacing) following the design system rules.

---

## 💼 Self-Hosting Commercial Deployments

Because the codebase is open-source under the GNU AGPLv3, developers are permitted to fork the codebase and host independent deployments of Al pasto. However:
* If you charge fees or monetize a custom instance (via ads or subscriptions), your complete codebase modifications **must** be made public under the exact same AGPLv3 terms.
* Commercial networks can legally utilize this architecture to run high-speed localized interactive events inside corporate servers, festivals, or local Wi-Fi nodes due to its zero-maintenance database overhead.
