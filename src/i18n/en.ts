import type { Strings } from "./strings";

const en: Strings = {
  app: {
    name: "corta.",
    tagline: "The off-the-record card game",
  },
  home: {
    intro:
      "Multiplayer. No accounts. Nothing leaves the room. Host runs the game from their own device — kill the tab, kill the game.",
    name: "Your name",
    namePlaceholder: "Mati",
    roomCode: "Room code",
    roomPlaceholder: "4F2K",
    join: "Join",
    host: "Host",
    createCta: "Create room",
    joinCta: "Join room",
    back: "Back",
  },
  lobby: {
    room: "Room",
    shareToInvite: "Share to invite",
    settings: "Settings",
    scoreToWin: "Score to win",
    roundTimer: "Round timer",
    timerOff: "Off",
    secondsSuffix: (n) => `${n}s`,
    players: (n) => `Players (${n})`,
    needMore: (n) => (n === 1 ? "Need 1 more" : `Need ${n} more`),
    hostBadge: "host",
    youBadge: "you",
    reconnecting: "reconnecting…",
    kick: "Kick",
    start: "Start the game",
    waiting: "Waiting for host…",
  },
  player: {
    judgeBanner: "You are the judge",
    judgeWait: "Wait for the room to play their cards.",
    round: (n) => `Round ${n}`,
    picks: (n) => (n === 1 ? "1 pick" : `${n} picks`),
    playZone: "Play zone",
    dragHere: (n) =>
      n === 1 ? "Drag a card here." : `Drag ${n} cards here.`,
    submit: "Submit",
    submitProgress: (a, b) => `${a}/${b}`,
    yourHand: "Your hand",
    cardCount: (n) => (n === 1 ? "1 card" : `${n} cards`),
  },
  judge: {
    youAreJudge: "You are the judge",
    judgingHeader: "Judging",
    waiting: "The judge is picking. Hold tight.",
    round: (n) => `Round ${n}`,
    cardOrdinal: (n) => `Card ${n}`,
    tapToPick: "TAP TO PICK",
    tapAgainToConfirm: "Tap the flipped card again to confirm",
    tapACardToReveal: "Tap a card to reveal",
  },
  reveal: {
    badge: "Round won",
    takesRound: (name) => `${name} takes the round.`,
    winnerTag: "WINNER",
    pointPlus: "+1 point",
    nextRound: "Next round",
    waitingHost: "Waiting for host…",
  },
  winner: {
    gameOver: "Game over",
    wins: (name) => `${name} wins.`,
    back: "Back to lobby",
  },
  errors: {
    roomNotFound: "The room does not exist.",
    handlerFailed: (m) => `Handler failed: ${m}`,
    terminatedQuorum: "Dropped below three players. The game ended.",
    terminatedHostGone: "Host left and could not be reassigned. Back to start.",
  },
};

export default en;
