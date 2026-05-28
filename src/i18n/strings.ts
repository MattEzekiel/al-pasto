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
    /** Pool of sample names; the placeholder is picked at random from it. */
    namePool: string[];
    roomCode: string;
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
    judgeTimer: string;
    timerOff: string;
    noTime: string;
    judgeMode: string;
    judgeRotate: string;
    judgeEverybody: string;
    secondsSuffix: (n: number) => string;
    minutesSuffix: (n: number) => string;
    /** mm:ss style for non-whole-minute durations. */
    clockSuffix: (m: number, s: number) => string;
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
    tapToPlay: (n: number) => string;
    submit: string;
    submitProgress: (a: number, b: number) => string;
    yourHand: string;
    cardCount: (n: number) => string;
    /** Wait screen shown after you submit / when you're the judge. */
    waitingTitle: string;
    submittedWaiting: string;
    playersProgress: (a: number, b: number) => string;
    cardsProgress: (a: number, b: number) => string;
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
    /** Everybody-judge mode. */
    voteHeader: string;
    tapToVote: string;
    tapACardToVote: string;
    votedWaiting: string;
    votesProgress: (a: number, b: number) => string;
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
