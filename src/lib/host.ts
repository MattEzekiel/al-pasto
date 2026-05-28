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

/** Build the judge's anonymous (shuffled, author-stripped) view of a set. */
function anonymize(submissions: Submission[]) {
  return shuffle(submissions).map((s) => ({ id: s.id, cards: s.cards }));
}

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
    timeLimitSec: 120,
    judgeTimeLimitSec: 60,
    win: { kind: "score", target: 7 },
    judgeMode: "rotate",
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
    votes: [],
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
    // NB: `slice(-0)` is `slice(0)` — the WHOLE array. Guard need === 0 or a
    // player who needs nothing (e.g. the judge) would be dealt the entire deck.
    if (need === 0) return p;
    const drawn = deck.slice(deck.length - need);
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

  const everybodyJudges = state.settings.judgeMode === "everybody";

  // Rotate judge: pick the next eligible player after the current judge.
  // In "everybody" mode there is no fixed judge — everyone plays and votes.
  const prevJudgeIdx = eligible.findIndex((p) => p.id === state.round.judgeId);
  const nextJudge = everybodyJudges
    ? null
    : opts.firstRound
      ? eligible[Math.floor(Math.random() * eligible.length)]
      : eligible[(prevJudgeIdx + 1) % eligible.length];

  const black = state.blackDeck[state.blackDeck.length - 1];
  const blackDeck = state.blackDeck.slice(0, -1);

  const players = state.players.map((p) => ({
    ...p,
    isJudge: nextJudge ? p.id === nextJudge.id : false,
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
      judgeId: nextJudge?.id ?? null,
      blackCard: black,
      submissions: [],
      anonymous: [],
      votes: [],
      winnerSubmissionId: null,
      deadline,
    },
  };
}

/** Players expected to submit this round (everyone connected but the judge). */
function expectedSubmitters(state: GameState): number {
  return state.players.filter(
    (p) => p.connected && p.id !== state.round.judgeId,
  ).length;
}

/** Wall-clock deadline for the judging phase, or null when no time limit. */
function judgingDeadline(state: GameState): number | null {
  return state.settings.judgeTimeLimitSec > 0
    ? Date.now() + state.settings.judgeTimeLimitSec * 1000
    : null;
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

  // Auto-advance to judging when everyone expected has submitted.
  const phase: GameState["phase"] =
    submissions.length >= expectedSubmitters(state) ? "judging" : "submission";

  const next: GameState = {
    ...state,
    version: state.version + 1,
    phase,
    players,
    round: {
      ...state.round,
      submissions,
      anonymous: phase === "judging" ? anonymize(submissions) : state.round.anonymous,
      // Switch to the judging clock the moment judging begins.
      deadline: phase === "judging" ? judgingDeadline(state) : state.round.deadline,
    },
  };

  // Everybody-votes with a single submission can't be voted on — award it.
  if (phase === "judging" && next.settings.judgeMode === "everybody" && submissions.length <= 1) {
    return resolveVotes(next);
  }
  return next;
}

/**
 * Submission deadline expired. Force the round into judging with whatever
 * was submitted — players who didn't play simply forfeit the round (no
 * submission, no chance to win). If nobody played, skip to the next round.
 */
export function expireSubmissions(state: GameState): GameState {
  if (state.phase !== "submission") return state;
  const submissions = state.round.submissions;
  if (submissions.length === 0) return startNextRound(state);

  const next: GameState = {
    ...state,
    version: state.version + 1,
    phase: "judging",
    round: {
      ...state.round,
      anonymous: anonymize(submissions),
      deadline: judgingDeadline(state),
    },
  };

  // Everybody-votes with a single submission can't be voted on — award it.
  if (next.settings.judgeMode === "everybody" && submissions.length <= 1) {
    return resolveVotes(next);
  }
  return next;
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
 * "Everybody" judge mode — a player votes for one submission. Cannot vote
 * for their own, one vote per player. When every player who played has
 * voted, the votes resolve into a winner.
 */
export function castVote(
  state: GameState,
  args: { voterId: string; submissionId: string },
): GameState {
  if (state.phase !== "judging") return state;
  if (state.settings.judgeMode !== "everybody") return state;

  const sub = state.round.submissions.find((s) => s.id === args.submissionId);
  if (!sub) return state;
  if (sub.playerId === args.voterId) return state; // no self-vote
  if (state.round.votes.some((v) => v.voterId === args.voterId)) return state; // one vote

  const voter = state.players.find((p) => p.id === args.voterId);
  if (!voter || !voter.connected) return state;
  // Only players who actually played get a vote.
  if (!state.round.submissions.some((s) => s.playerId === args.voterId)) return state;

  const votes = [...state.round.votes, { voterId: args.voterId, submissionId: args.submissionId }];
  const withVote: GameState = {
    ...state,
    version: state.version + 1,
    round: { ...state.round, votes },
  };

  // Everyone who played gets a vote. Resolve once they're all in.
  if (votes.length >= state.round.submissions.length) return resolveVotes(withVote);
  return withVote;
}

/**
 * Tally votes and award the round. Highest vote count wins; ties are
 * broken at random so a round can never deadlock.
 */
export function resolveVotes(state: GameState): GameState {
  if (state.phase !== "judging") return state;

  const tally = new Map<string, number>();
  for (const v of state.round.votes) {
    tally.set(v.submissionId, (tally.get(v.submissionId) ?? 0) + 1);
  }

  let best: string[] = [];
  let max = -1;
  for (const sub of state.round.submissions) {
    const count = tally.get(sub.id) ?? 0;
    if (count > max) {
      max = count;
      best = [sub.id];
    } else if (count === max) {
      best.push(sub.id);
    }
  }
  if (best.length === 0) return state;

  const winnerId = best[Math.floor(Math.random() * best.length)];
  return judgePick(state, winnerId);
}

/**
 * Tie-breaker: invoked after the judging deadline if no pick was made.
 * Per spec — random algorithm prevents deadlocks. In "everybody" mode we
 * resolve whatever votes are in; only fall back to random if nobody voted.
 */
export function resolveTieBreaker(state: GameState): GameState {
  if (state.phase !== "judging" || state.round.submissions.length === 0) return state;
  if (state.settings.judgeMode === "everybody" && state.round.votes.length > 0) {
    return resolveVotes(state);
  }
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
