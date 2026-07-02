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
    /** Shown while a room/create or room/join request is in flight. */
    connecting: string;
  };
  /** Pre-lobby game-mode picker. */
  mode: {
    title: string;
    classic: string;
    classicDesc: string;
    custom: string;
    customDesc: string;
    /** The three custom presets. */
    presetTitle: string;
    blank: string;
    blankDesc: string;
    customBlack: string;
    customBlackDesc: string;
    mix: string;
    mixDesc: string;
    /** Who writes the prompts. */
    authoringTitle: string;
    authoringHost: string;
    authoringPlayers: string;
    deckSize: string;
    /** Country filter. Country names come from `src/data/countries.json`. */
    countryTitle: string;
    countryAll: string;
    /** Checkbox that unlocks the country select. */
    countryChange: string;
    continue: string;
  };
  /** Pre-game prompt-writing phase (custom black, players authoring). */
  authoring: {
    header: string;
    hint: (quota: number) => string;
    placeholder: (n: number) => string;
    submit: string;
    waitingTitle: string;
    waiting: string;
    progress: (a: number, b: number) => string;
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
    /** Custom-mode lobby additions. */
    gameMode: string;
    modeClassic: string;
    modeCustom: string;
    prompts: string;
    promptPlaceholder: (n: number) => string;
    addPrompt: string;
    promptsNeeded: (n: number) => string;
    customNotice: string;
    /** Room-language mismatch prompt (joiner side). Label = room-locale display name. */
    localePrompt: (label: string) => string;
    localeSwitch: string;
    localeKeep: string;
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
    /** Blank (typed) white answers. */
    yourAnswer: string;
    answerPlaceholder: (n: number) => string;
    writeAnswer: (n: number) => string;
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
    kicked: string;
    serverUnreachable: string;
  };
  /** Prerendered marketing landing (/juego). SSR-pure — no runtime values. */
  landing: {
    metaTitle: string;
    metaDescription: string;
    kicker: string;
    heroTitle: string;
    heroSubtitle: string;
    /** Prompt text printed on the hero card. */
    heroCard: string;
    heroCardMeta: string;
    /** Answer printed on the overlapping white card. */
    heroAnswer: string;
    playCta: string;
    rulesCta: string;
    howTitle: string;
    steps: { title: string; body: string }[];
    featuresTitle: string;
    features: { title: string; body: string }[];
    footerRules: string;
    footerGithub: string;
  };
  /** Prerendered rules page (/como-jugar, /how-to-play). */
  rules: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    intro: string;
    sections: { title: string; body: string[] }[];
    faqTitle: string;
    faq: { q: string; a: string }[];
    playCta: string;
    landingLink: string;
    otherLang: string;
  };
}
