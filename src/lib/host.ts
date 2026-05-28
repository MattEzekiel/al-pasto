import esBlack from "@/data/es/black_cards.json";
import esWhite from "@/data/es/white_cards.json";
import enBlack from "@/data/en/black_cards.json";
import enWhite from "@/data/en/white_cards.json";
import type { Locale } from "@/i18n/locale";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import type {
  BlackCard,
  GameSettings,
  GameState,
  Player,
  Submission,
  WhiteCard,
} from "@/types/game";

/**
 * Pure, host-side game logic. Every mutation is a function `(state) => state'`
 * so the Zustand store can call them inside its `set(produce(...))`-style
 * updates and broadcast atomically.
 *
 * Nothing in here touches sockets or IndexedDB — that's the store's job.
 *
 * Decks are statically imported per locale and selected by
 * `GameSettings.locale`. Add a new locale by extending `DECKS` and
 * adding the matching JSON files under `src/data/<locale>/`.
 */

const DECKS: Record<Locale, { black: BlackCard[]; white: WhiteCard[] }> = {
  es: { black: esBlack as BlackCard[], white: esWhite as WhiteCard[] },
  en: { black: enBlack as BlackCard[], white: enWhite as WhiteCard[] },
};

function deckFor(locale: Locale) {
  return DECKS[locale] ?? DECKS[DEFAULT_LOCALE];
}

const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ------------------------------------------------------------------ */
/* Initial state                                                       */
/* ------------------------------------------------------------------ */

export function defaultSettings(locale: Locale = DEFAULT_LOCALE): GameSettings {
  return {
    handSize: 5,
    timeLimitSec: 60,
    win: { kind: "score", target: 7 },
    locale,
  };
}

export function createInitialState(args: {
  roomId: string;
  host: Pick<Player, "id" | "name" | "socketId">;
  settings?: GameSettings;
}): GameState {
  const settings = args.settings ?? defaultSettings();
  const { black, white } = deckFor(settings.locale);
  return {
    roomId: args.roomId,
    version: 1,
    phase: "lobby",
    settings,
    players: [
      {
        ...args.host,
        hand: [],
        score: 0,
        isHost: true,
        isJudge: false,
        connected: true,
        lastSeen: Date.now(),
      },
    ],
    banned: [],
    blackDeck: shuffle(black),
    whiteDeck: shuffle(white),
    round: emptyRound(),
    winnerId: null,
  };
}

function emptyRound(): GameState["round"] {
  return {
    index: 0,
    judgeId: null,
    blackCard: null,
    submissions: [],
    anonymous: [],
    winnerSubmissionId: null,
    deadline: null,
  };
}

/* ------------------------------------------------------------------ */
/* Lobby                                                               */
/* ------------------------------------------------------------------ */

export function addPlayer(
  state: GameState,
  player: Pick<Player, "id" | "name" | "socketId">,
): GameState {
  if (state.players.some((p) => p.id === player.id)) return state;
  return {
    ...state,
    version: state.version + 1,
    players: [
      ...state.players,
      {
        ...player,
        hand: [],
        score: 0,
        isHost: false,
        isJudge: false,
        connected: true,
        lastSeen: Date.now(),
      },
    ],
  };
}

export function removePlayer(state: GameState, playerId: string): GameState {
  return {
    ...state,
    version: state.version + 1,
    players: state.players.filter((p) => p.id !== playerId),
    round: {
      ...state.round,
      submissions: state.round.submissions.filter((s) => s.playerId !== playerId),
      anonymous: state.round.anonymous.filter(
        (s) =>
          !state.round.submissions.find(
            (raw) => raw.id === s.id && raw.playerId === playerId,
          ),
      ),
    },
  };
}

export function markConnection(
  state: GameState,
  playerId: string,
  connected: boolean,
): GameState {
  return {
    ...state,
    version: state.version + 1,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, connected, lastSeen: Date.now() } : p,
    ),
  };
}

export function updateSettings(state: GameState, patch: Partial<GameSettings>): GameState {
  return {
    ...state,
    version: state.version + 1,
    settings: { ...state.settings, ...patch },
  };
}

/* ------------------------------------------------------------------ */
/* Round lifecycle                                                     */
/* ------------------------------------------------------------------ */

export function startGame(state: GameState): GameState {
  if (state.players.length < 3) return state;
  return startNextRound(dealEveryone(state, state.settings.handSize), {
    firstRound: true,
  });
}

function dealEveryone(state: GameState, target: number): GameState {
  let deck = [...state.whiteDeck];
  const players = state.players.map((p) => {
    if (!p.connected) return p;
    const need = Math.max(0, target - p.hand.length);
    const drawn = deck.slice(-need);
    deck = deck.slice(0, deck.length - need);
    return { ...p, hand: [...p.hand, ...drawn] };
  });
  return { ...state, version: state.version + 1, players, whiteDeck: deck };
}

export function startNextRound(
  state: GameState,
  opts: { firstRound?: boolean } = {},
): GameState {
  // Deck depletion is a global win condition.
  if (state.blackDeck.length === 0 || state.whiteDeck.length === 0) {
    return endGameByHighScore(state);
  }

  const eligible = state.players.filter((p) => p.connected);
  if (eligible.length < 3) {
    return { ...state, phase: "game-over", version: state.version + 1 };
  }

  // Rotate judge: pick the next eligible player after the current judge.
  const prevJudgeIdx = eligible.findIndex((p) => p.id === state.round.judgeId);
  const nextJudge = opts.firstRound
    ? eligible[Math.floor(Math.random() * eligible.length)]
    : eligible[(prevJudgeIdx + 1) % eligible.length];

  const black = state.blackDeck[state.blackDeck.length - 1];
  const blackDeck = state.blackDeck.slice(0, -1);

  const players = state.players.map((p) => ({
    ...p,
    isJudge: p.id === nextJudge.id,
  }));

  const deadline =
    state.settings.timeLimitSec > 0
      ? Date.now() + state.settings.timeLimitSec * 1000
      : null;

  return {
    ...state,
    version: state.version + 1,
    phase: "submission",
    players,
    blackDeck,
    round: {
      index: state.round.index + 1,
      judgeId: nextJudge.id,
      blackCard: black,
      submissions: [],
      anonymous: [],
      winnerSubmissionId: null,
      deadline,
    },
  };
}

/**
 * Apply a submission. Cards are immediately burned from the player's hand
 * — "instant burn" is part of the UX contract. The anonymous projection
 * is regenerated every time so the judge sees a fresh shuffle when the
 * final submission arrives.
 */
export function submit(
  state: GameState,
  args: { playerId: string; cards: WhiteCard[] },
): GameState {
  if (state.phase !== "submission") return state;
  if (args.playerId === state.round.judgeId) return state;
  if (state.round.submissions.some((s) => s.playerId === args.playerId)) return state;

  const sub: Submission = {
    id: newId("sub"),
    playerId: args.playerId,
    cards: args.cards,
  };

  const burnedIds = new Set(args.cards.map((c) => c.id));
  const players = state.players.map((p) =>
    p.id === args.playerId
      ? { ...p, hand: p.hand.filter((c) => !burnedIds.has(c.id)) }
      : p,
  );

  const submissions = [...state.round.submissions, sub];

  // Auto-advance to judging when everyone non-judge has submitted.
  const expecting = state.players.filter(
    (p) => p.connected && p.id !== state.round.judgeId,
  ).length;
  const phase: GameState["phase"] = submissions.length >= expecting ? "judging" : "submission";

  return {
    ...state,
    version: state.version + 1,
    phase,
    players,
    round: {
      ...state.round,
      submissions,
      anonymous:
        phase === "judging"
          ? shuffle(submissions).map((s) => ({ id: s.id, cards: s.cards }))
          : state.round.anonymous,
    },
  };
}

/**
 * Judge picks a submission. Award +1, reveal author, hold in "reveal" for
 * a moment before round-end. The store can call `endRound` to move on.
 */
export function judgePick(state: GameState, submissionId: string): GameState {
  if (state.phase !== "judging") return state;
  const sub = state.round.submissions.find((s) => s.id === submissionId);
  if (!sub) return state;

  const players = state.players.map((p) =>
    p.id === sub.playerId ? { ...p, score: p.score + 1 } : p,
  );

  return {
    ...state,
    version: state.version + 1,
    phase: "reveal",
    players,
    round: { ...state.round, winnerSubmissionId: submissionId },
  };
}

/**
 * Tie-breaker: invoked after the judging deadline if no pick was made.
 * Per spec — random algorithm prevents deadlocks.
 */
export function resolveTieBreaker(state: GameState): GameState {
  if (state.phase !== "judging" || state.round.submissions.length === 0) return state;
  const idx = Math.floor(Math.random() * state.round.submissions.length);
  return judgePick(state, state.round.submissions[idx].id);
}

export function endRound(state: GameState): GameState {
  if (state.phase !== "reveal") return state;

  // Replenish hands back up to settings.handSize.
  const refilled = dealEveryone(state, state.settings.handSize);

  // Win-by-score?
  const win = refilled.settings.win;
  if (win.kind === "score") {
    const winner = refilled.players.find((p) => p.score >= win.target);
    if (winner) {
      return {
        ...refilled,
        version: refilled.version + 1,
        phase: "game-over",
        winnerId: winner.id,
      };
    }
  }

  return startNextRound(refilled);
}

function endGameByHighScore(state: GameState): GameState {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  return {
    ...state,
    version: state.version + 1,
    phase: "game-over",
    winnerId: sorted[0]?.id ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Moderation                                                          */
/* ------------------------------------------------------------------ */

export function kick(state: GameState, playerId: string): GameState {
  const next = removePlayer(state, playerId);
  const remaining = next.players.filter((p) => p.connected).length;
  if (remaining < 3 && next.phase !== "lobby") {
    return { ...next, phase: "game-over", winnerId: null, version: next.version + 1 };
  }
  return { ...next, banned: [...next.banned, playerId] };
}
