import { create } from "zustand";
import type { Locale } from "@/i18n/locale";
import { DEFAULT_LOCALE } from "@/i18n/locale";

/**
 * Ephemeral UI state — nothing here survives a refresh. Drag-and-drop
 * proxies, toasts, modal visibility, the currently-tapped judge card,
 * and the active UI locale all live here so the game store stays
 * semantic and broadcastable.
 *
 * Locale is intentionally a UI concern. The host-side decks live in
 * `GameSettings.locale` so all peers see the same content even if their
 * UI is set to something else.
 */

export type Toast = {
  id: string;
  kind: "info" | "warn" | "danger" | "success";
  text: string;
  expiresAt: number;
};

interface UIState {
  /** Active UI locale. Default = `DEFAULT_LOCALE` (es). */
  locale: Locale;
  /** Card id currently being dragged in the hand carousel. */
  draggingCardId: string | null;
  /** Cards the player has staged into the play zone but not yet submitted. */
  stagedCardIds: string[];
  /**
   * Card ids the player actually submitted this round. Purely local — it
   * never crosses the wire. Lets "everybody votes" mode recognise the
   * player's own submission so they can't vote for it.
   */
  submittedCardIds: string[];
  /** Submission id the judge has flipped (for the 3D reveal). */
  flippedSubmissionId: string | null;
  /** Blank-mode typed answers for the current round, indexed by prompt slot. */
  blankAnswers: string[];

  toasts: Toast[];

  setLocale: (locale: Locale) => void;
  setDragging: (id: string | null) => void;
  stage: (id: string) => void;
  unstage: (id: string) => void;
  clearStaged: () => void;
  setSubmittedCards: (ids: string[]) => void;
  setBlankAnswers: (answers: string[]) => void;
  flip: (id: string | null) => void;
  toast: (t: Omit<Toast, "id" | "expiresAt"> & { ttlMs?: number }) => void;
  dismiss: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  locale: DEFAULT_LOCALE,
  draggingCardId: null,
  stagedCardIds: [],
  submittedCardIds: [],
  flippedSubmissionId: null,
  blankAnswers: [],
  toasts: [],

  setLocale: (locale) => set({ locale }),

  setDragging: (id) => set({ draggingCardId: id }),

  stage: (id) =>
    set((s) =>
      s.stagedCardIds.includes(id) ? s : { stagedCardIds: [...s.stagedCardIds, id] },
    ),

  unstage: (id) =>
    set((s) => ({ stagedCardIds: s.stagedCardIds.filter((x) => x !== id) })),

  clearStaged: () => set({ stagedCardIds: [], draggingCardId: null }),

  setSubmittedCards: (ids) => set({ submittedCardIds: ids }),

  setBlankAnswers: (answers) => set({ blankAnswers: answers }),

  flip: (id) => set({ flippedSubmissionId: id }),

  toast: ({ kind, text, ttlMs }) => {
    const id = Math.random().toString(36).slice(2);
    const expiresAt = Date.now() + (ttlMs ?? 3000);
    set((s) => ({ toasts: [...s.toasts, { id, kind, text, expiresAt }] }));
    window.setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      ttlMs ?? 3000,
    );
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
