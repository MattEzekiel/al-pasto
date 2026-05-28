/**
 * The full set of UI string keys. Every locale must implement this shape
 * exactly — the type system enforces parity. New keys go here first, then
 * into every locale file under `src/i18n/<locale>.ts`.
 *
 * Where a string takes runtime values (counts, names), it lives here as a
 * function. Keep these pure — no React, no JSX.
 */
export interface Strings {
  app: {
    name: string;
    tagline: string;
  };
  home: {
    intro: string;
    name: string;
    namePlaceholder: string;
    roomCode: string;
    roomPlaceholder: string;
    join: string;
    host: string;
    createCta: string;
    joinCta: string;
    back: string;
  };
  lobby: {
    room: string;
    shareToInvite: string;
    settings: string;
    scoreToWin: string;
    roundTimer: string;
    timerOff: string;
    secondsSuffix: (n: number) => string;
    players: (n: number) => string;
    needMore: (n: number) => string;
    hostBadge: string;
    youBadge: string;
    reconnecting: string;
    kick: string;
    start: string;
    waiting: string;
  };
  player: {
    judgeBanner: string;
    judgeWait: string;
    round: (n: number) => string;
    picks: (n: number) => string;
    playZone: string;
    dragHere: (n: number) => string;
    submit: string;
    submitProgress: (a: number, b: number) => string;
    yourHand: string;
    cardCount: (n: number) => string;
  };
  judge: {
    youAreJudge: string;
    judgingHeader: string;
    waiting: string;
    round: (n: number) => string;
    cardOrdinal: (n: number) => string;
    tapToPick: string;
    tapAgainToConfirm: string;
    tapACardToReveal: string;
  };
  reveal: {
    badge: string;
    takesRound: (name: string) => string;
    winnerTag: string;
    pointPlus: string;
    nextRound: string;
    waitingHost: string;
  };
  winner: {
    gameOver: string;
    wins: (name: string) => string;
    back: string;
  };
  errors: {
    roomNotFound: string;
    handlerFailed: (m: string) => string;
    terminatedQuorum: string;
    terminatedHostGone: string;
  };
}
