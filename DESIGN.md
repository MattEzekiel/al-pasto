# DESIGN.md — Al pasto / Sin Filtro

## Overview

Al pasto's interface is **dark-mode native, high-contrast, editorial**. It blends ClickHouse's engineering precision (single-family Inter at weight 700, near-pure black canvas, no shadow vocabulary) with Revolut's editorial minimalism (full-bleed band rhythm, large display headlines at tight negative tracking, the white-pill primary CTA on dark canvas).

There is no light-mode counterpart. "Light" appears only as inverted primary actions — a white pill with black ink on the dark canvas. The system has one brand color, **cobalt violet** (`{colors.brand}` — `#494fdf`), and it is reserved for: the winning-card stamp, the active-judge marker, and the final WinnerView. Cobalt is **not** a primary-button color.

Display typography is **Inter (or Inter Display) at weight 700** with strict negative letter-spacing (`-1.5px` at card sizes, `-1.6px` at the flagship `display-xxl`). Body type stays at Inter 400 with positive tracking (`0.2px`) so UI labels feel slightly mechanical. There is no serif counter-voice. The hierarchy is built on size + weight, not on family contrast.

The brand voice is "off-the-record" — irreverent, unfiltered. The visual system carries that posture with confidence rather than warmth. Surfaces don't soften — they slam. The black canvas slams against the white CTA. The white card slams against the black prompt. Depth is achieved by **color-blocking and hairline borders only**, never by drop shadows.

**Key characteristics**

- True-black canvas (`{colors.canvas}` — `#000000`) — not near-black, not `#0a0a0a`.
- One brand color (`{colors.brand}` — `#494fdf`), used scarcely.
- Inter 700 + negative letter-spacing for every display surface; Inter 400/600 for body/UI.
- Surface ladder is exactly three steps: `{colors.canvas}` → `{colors.surface.card}` → `{colors.surface.elevated}`. Anything beyond that is `bg-brand`.
- All buttons are pill-shaped (`{rounded.pill}` — 9999px). All playing cards are `{rounded.card}` (16px).
- Hairline `{colors.hairline}` (#2A2A2A) replaces shadow for card edges.
- No animations longer than 400ms. The motion language is spring-stiff (Framer Motion `stiffness: 240–600`, `damping: 22–32`).

## Colors

### Brand

- **Cobalt Violet** (`{colors.brand}` — `#494fdf`) — the only brand stamp. Used on: the winning card surface in `RevealView`, the "you are the judge" label, and the full `WinnerView` background. Never a button surface in normal gameplay.
- **Cobalt Bright** (`{colors.brand.bright}` — `#4f55f1`) — reserved hover/highlight variant. Currently used on the `_` slot underline in `PromptText`.
- **Cobalt Deep** (`{colors.brand.deep}` — `#3a40c4`) — active/pressed state of cobalt elements.

### Surfaces

- **Canvas** (`{colors.canvas}` — `#000000`) — the universal page floor. True black.
- **Surface Card** (`{colors.surface.card}` — `#121212`) — dark panels (lobby roster, settings card, prompt card, input fields).
- **Surface Elevated** (`{colors.surface.elevated}` — `#1C1C1E`) — nested or "active" panels: avatars, dragged-card hint, banner pills.
- **Surface Deep** (`{colors.surface.deep}` — `#0a0a0a`) — reserved for nested chrome inside the dark canvas; rare.
- **Hairline** (`{colors.hairline}` — `#2A2A2A`) — 1px borders on dark cards; replaces shadow.
- **Hairline Strong** (`{colors.hairline.strong}` — `#3A3A3A`) — the dashed drop-zone border in `GameplayView`.

### Text

- **Ink** (`{colors.ink}` — `#ffffff`) — primary text on canvas.
- **Ink Mute** (`{colors.ink.mute}` — `#8E8E93`) — secondary text, captions, metadata.
- **Ink Faint** (`{colors.ink.faint}` — `#5c5e60`) — placeholder text in inputs only.

### Semantic accents

- **Teal** (`{colors.accent.teal}` — `#00a87e`) — positive only. Score chip, "round won" inline tag. Never a button surface.
- **Rose** (`{colors.accent.rose}` — `#e23b4a`) — destructive + warning. Kick button, low-time timer (< 25%). The only red in the system.
- **Amber** (`{colors.accent.amber}` — `#b09000`) — reserved for caution toasts.

## Typography

### Family

A single family — **Inter** (preferred: Inter Display variable). Loaded via `https://rsms.me/inter/inter.css`. The fallback stack walks `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`.

JetBrains Mono is declared but currently unused — reserved for any future debug/dev surface.

### Hierarchy

| Token | Size | Weight | Line Height | Tracking | Use |
|---|---|---|---|---|---|
| `text-display-xxl` | 80px | 700 | 1.0 | -1.6px | `HomeView` flagship `al pasto.`, `WinnerView` winner name. |
| `text-display-xl` | 56px | 700 | 1.05 | -1.5px | Reserved. |
| `text-display-lg` | 40px | 700 | 1.1 | -1.2px | Lobby room code, the judging waiting-state headline. |
| `text-display-md` | 32px | 700 | 1.15 | -1px | RevealView headline, the "tap to reveal" waiting state. |
| `text-display-sm` | 24px | 700 | 1.2 | -0.6px | Scoreboard numerals in WinnerView. |
| `text-card-lg` | 28px | 700 | 1.15 | -1.5px | White / black card body. |
| `text-card-md` | 22px | 700 | 1.2 | -1px | Reserved for narrower card variants. |
| `text-body` | 16px | 400 | 1.5 | 0.2px | Default running text. |
| `text-body-sm` | 14px | 400 | 1.45 | 0.2px | Captions. |
| `text-label` | 13px | 600 | 1.3 | 0.4px | UI labels, section headers (all uppercase). |
| `text-button` | 15px | 600 | 1.0 | 0.2px | Inside `PillButton`. |

### Principles

- Display sizes always run at weight 700 with negative tracking. Inter at 700 without negative tracking reads as too wide — the tightened tracking gives Al pasto its precise, engineered voice.
- Body and labels stay at 400 (body) and 600 (UI). **Weight 500 is forbidden** — the hierarchy depends on size + the 200-step weight gap.
- UI labels are uppercase, +0.4px tracked. The small spacing nudge makes them feel slightly mechanical — fintech-precision applied to a party game.
- Card prompts are display-700 with `_` slots rendered as cobalt-violet underlines, not as text. See `PromptText` in `src/components/ui/GameCard.tsx`.

## Layout

### Spacing

The base unit is 4px. The named spacing tokens we actually use:

- `touch` — 48px. The minimum tap target. `PillButton` `md` ships at exactly this height.
- `gutter` — 20px. The drag-zone internal padding.
- `rail` — 24px. Horizontal page padding (left + right of `AppFrame`).

Tailwind's own 4-step scale (`p-2`, `p-3`, `p-4`, `p-5`) handles the rest. The card internal padding is 20px (`p-5`).

### Container

The app is mobile-first and lives inside `AppFrame`:

- Max width `max-w-md` (28rem / 448px). On tablet+, the app remains 448px wide and centers in the canvas — there is no desktop-specific layout.
- Vertical padding respects `env(safe-area-inset-*)`.
- All views compose inside `AppFrame` so the rhythm is identical across screens.

### Whitespace

Sections breathe at 24px–48px vertical. Cards stay at 20px internal padding. The hand carousel deliberately bleeds left/right (`-mx-rail`) so the last card snaps to the safe-area edge — communicates "more to scroll" without a chevron.

## Elevation & depth

The system has **no traditional drop shadow**. Depth is communicated through three mechanisms:

1. **Canvas → Surface luminance shift.** Black canvas → `surface.card` (#121212) → `surface.elevated` (#1C1C1E). The contrast is subtle — engineering-grade, not lifestyle-soft.
2. **Hairline borders.** Every `surface.card` is bordered with `{colors.hairline}` (#2A2A2A). The 1px line is what gives the card an edge.
3. **Color-blocking inversions.** A white PillButton on the black canvas IS the elevation. A cobalt-violet winning card IS the elevation.

| Level | Treatment | Use |
|---|---|---|
| 0 — flat | No border | The canvas itself, the inside of the drop zone before drag. |
| 1 — hairline card | `surface.card` + hairline | Lobby roster, settings, prompt card, input fields. |
| 2 — elevated | `surface.elevated` | Avatars, scoreboard rows on WinnerView. |
| 3 — inversion CTA | `bg-ink` (white) | The primary button. The brightest pixel on the screen. |
| 4 — brand stamp | `bg-brand` (cobalt violet) | Winning card surface, full WinnerView background. |

## Shapes

| Token | Value | Use |
|---|---|---|
| `rounded-card` | 16px | Playing cards, surface cards, inputs. |
| `rounded-sheet` | 24px | Reserved for bottom-sheet variants. |
| `rounded-pill` / `rounded-chip` | 9999px | Every button, every chip, every avatar. |
| `rounded-none` | 0px | The canvas itself, full-bleed sections. |

**Playing-card geometry.** Cards are 244×326px (aspect 3:4 portrait). The corner radius is `rounded-card` (16px) — generous enough to read as card stock but tight enough to feel modern. The prompt sits top-left at `text-card-lg`; the `al pasto.` wordmark sits bottom-left at 18px / -0.5px tracking.

## Components

### PillButton — `src/components/ui/PillButton.tsx`

The single canonical button. Pill (`rounded-pill`), Inter 600 at 15px, +0.2px tracking. Default height 48px (`md`). The `whileTap={{ scale: 0.97 }}` press state is the only animation; **no hover state** is documented — the design system relies on color contrast for affordance.

Variants:

- **`primary`** — `bg-ink` (white) on canvas. The brand's loudest action. Used everywhere a definitive forward CTA appears.
- **`inverted`** — `bg-canvas` (black) on a light surface. Used inside `WinnerView` where the canvas is cobalt-violet.
- **`ghost`** — transparent + hairline. Used as the secondary CTA on `HomeView` (the "Join" button beside "Host").
- **`danger`** — `bg-accent-rose`. Reserved for the per-peer Kick action in the lobby. The only red button.

### GameCard — `src/components/ui/GameCard.tsx`

The card primitive used for prompts (`tone="black"`), responses (`tone="white"`), and the winning stamp (`tone="featured"`). 244×326px, `rounded-card`. The tone is the only mode that changes — typography stays identical across all three. Exported as `GameCard`.

`PromptText` is a small helper that splits a black-card prompt on `_` and renders the placeholders as cobalt-violet underscored slots. This is the only place `brand.bright` is used as an underline.

### TimerBar — `src/components/ui/TimerBar.tsx`

A 4px-tall progress rail beneath the prompt. Below 25% remaining, the rail and its counter flip to `accent-rose` — this is the system's "low-time warning" hook. The seconds counter is uppercase, +0.6px tracked.

### Avatar — `src/components/ui/Avatar.tsx`

Initials-only on `surface.elevated`. No photographs, no gradients, no hashed background colors — the brand voice is unfiltered, not playful. Ring variants: `hairline` (default), `host` (white ring), `judge` (cobalt-violet ring).

### ScoreChip — `src/components/ui/ScoreChip.tsx`

Inline teal chip — `accent-teal/15` background, `accent-teal` text, with a tiny solid dot. The only place teal appears in the UI. Used in `GameplayView` and inside the active player's row in the lobby.

## Motion

Framer Motion only. Three documented patterns:

1. **Card drag (hand carousel).** Drag axis `y`. While dragging: `rotate: -3deg, scale: 1.04`. On drop above the -80px threshold, the card stages into the play zone via shared `layoutId`. Cards visually fade out (`opacity: 0, scale: 0.92`) from the hand once staged.
2. **Card flip (judge view).** `[perspective:1000px]` on the wrapper; `rotateY: 0 → 180` on the inner. Spring (`stiffness: 240, damping: 24`). The faceDown face uses `[backface-visibility:hidden]`; the front face uses `[transform:rotateY(180deg)] [backface-visibility:hidden]`.
3. **Screen transitions.** `AnimatePresence mode="wait"` with `opacity` + 6px `y` slide, 200ms duration. No screen ever crossfades for longer than 250ms.

The press state on every PillButton is `whileTap: { scale: 0.97 }` with a 600-stiffness spring. The reveal card on `RevealView` pops in with a small `rotate: -2deg → 0`.

## Do's and Don'ts

### Do

- Reach for the white PillButton primary as the loudest action on every screen.
- Reserve `bg-brand` for the winning card and the final winner screen.
- Set every display headline in Inter 700 with negative letter-spacing.
- Add hairline borders to differentiate `surface.card` from the canvas.
- Use teal only for positive scoring; rose only for destructive + low-time warning; amber only for caution toasts.

### Don't

- Don't use accent colors (teal, rose, amber) as button surfaces. They live in chips and tiny indicators.
- Don't use `#0a0a0a` or "near-black" for the canvas. The brand is `#000000`.
- Don't add drop shadows to cards. Elevation is canvas + surface-luminance + hairline.
- Don't introduce a secondary brand color. Cobalt violet is the only stamp.
- Don't loosen Inter `lineHeight` past 1.0 on `display-xxl`. Tight stacking is structural.
- Don't bump body Inter to weight 500. Use 400 (default) or 600 (emphatic).
- Don't pair `surface.elevated` with another dark surface beyond the documented two-step ladder.
- Don't render the judge's submission grid in submission order. Always shuffle in `anonymizeSubmissions`.

## Responsive behavior

The app is mobile-first and intentionally **not** desktop-optimized. At any viewport ≥ 448px the app simply centers a 448px-wide column on the canvas — there is no widescreen layout.

- All grids are 1-up on mobile.
- The judging matrix is a 2-column grid; the cards remain at their native 244×326px (with `aspect-[3/4]` keeping them proportional inside the grid cell).
- The hand carousel is a horizontal scroll-rail; the cards never wrap.

### Touch targets

- `PillButton md` (default) is 48px tall — comfortably above WCAG AAA (44px).
- Inputs are 48px tall.
- The kick button (`PillButton sm`) is 36px — used only inside the lobby roster where horizontal real estate is tight.

## Iteration guide

1. Focus on ONE component at a time. Most surfaces share `bg-canvas` + `rounded-pill` for buttons and `rounded-card` for cards.
2. Reference token names directly (`bg-brand`, `text-display-xxl`, `rounded-card`) — do not paraphrase as raw values.
3. Keep cobalt-violet scarce. If more than one cobalt element appears in a viewport, ask whether one should drop to `surface.elevated` instead.
4. Default body type to `text-body`; reach for `font-semibold` only on genuine emphasis.
5. Add new variants as separate entries (`-pressed`, `-disabled`) — do not bury them in prose.

## Known gaps

- Pressed/active visual states are documented for `PillButton` only. Other components rely on the browser focus ring.
- The accent palette (`teal`, `rose`, `amber`) is sized for the current surfaces. If you add success/error semantics elsewhere, document the new use site.
- Animation timings for the failover transition (when a peer is promoted to host mid-game) are not designed yet. The current implementation simply re-mounts without an explicit visual.
- The wordmark `al pasto.` is currently typeset rather than illustrated. A custom logotype would replace it on cards and on `HomeView`.
