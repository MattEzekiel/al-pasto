import type {
  AnonymousSubmission,
  GameState,
  SanitizedGameState,
  SanitizedPlayer,
  Submission,
} from "@/types/game";

/**
 * Strip everything that could deanonymize a submission, then shuffle in
 * place. The judge sees only `AnonymousSubmission[]` — author id-stripped
 * and order-randomized so position can't be used as a tell.
 */
export function anonymizeSubmissions(
  subs: readonly Submission[],
): AnonymousSubmission[] {
  const anon: AnonymousSubmission[] = subs.map((s) => ({
    id: s.id,
    cards: s.cards,
  }));
  // Fisher–Yates
  for (let i = anon.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [anon[i], anon[j]] = [anon[j], anon[i]];
  }
  return anon;
}

export function sanitizePlayer(p: GameState["players"][number]): SanitizedPlayer {
  return {
    id: p.id,
    name: p.name,
    score: p.score,
    isHost: p.isHost,
    isJudge: p.isJudge,
    connected: p.connected,
    handSize: p.hand.length,
  };
}

/**
 * Produce the wire-safe projection of the host state. This is what every
 * peer ever sees of the game.
 */
export function sanitizeState(state: GameState): SanitizedGameState {
  const winnerSub =
    state.round.winnerSubmissionId
      ? state.round.submissions.find((s) => s.id === state.round.winnerSubmissionId)
      : null;

  return {
    roomId: state.roomId,
    version: state.version,
    phase: state.phase,
    settings: state.settings,
    players: state.players.map(sanitizePlayer),
    round: {
      index: state.round.index,
      judgeId: state.round.judgeId,
      blackCard: state.round.blackCard,
      anonymous: state.round.anonymous,
      winnerSubmissionId: state.round.winnerSubmissionId,
      deadline: state.round.deadline,
      // Once the round is "reveal" or later, surface the author.
      winnerPlayerId:
        state.phase === "reveal" ||
        state.phase === "round-end" ||
        state.phase === "game-over"
          ? winnerSub?.playerId
          : undefined,
    },
    winnerId: state.winnerId,
    blackRemaining: state.blackDeck.length,
    whiteRemaining: state.whiteDeck.length,
  };
}
