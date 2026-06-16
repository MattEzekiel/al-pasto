/**
 * Corta — domain types.
 *
 * The shape here is the contract between Host, Peers, and the wire. The
 * Host's Zustand store IS the source of truth; everything that crosses
 * the socket must conform to NetworkPayload.
 *
 * NOTE: `socketId` lives only in Host-side `Player` records. The wire-safe
 * `SanitizedPlayer` strips it before broadcast — anonymity enforcement
 * during submission relies on this distinction.
 */

export type PlayerId = string;
export type CardId = string;
export type RoomId = string;
export type SubmissionId = string;

export interface BlackCard {
  id: CardId;
  text: string;
  /** Number of `_` slots in the prompt. 1 or 2. */
  spaces: 1 | 2;
}

export interface WhiteCard {
  id: CardId;
  text: string;
}

/** Host-side player record. Includes the socket id — never broadcast. */
export interface Player {
  id: PlayerId;
  name: string;
  socketId: string;
  hand: WhiteCard[];
  score: number;
  isHost: boolean;
  /** Set on the rotating judge each round. */
  isJudge: boolean;
  /** UI hint — peers can render a "reconnecting" pill. */
  connected: boolean;
  /** Timestamp the player last echoed activity. Used for AFK kicks. */
  lastSeen: number;
}

/** Wire-safe player projection. */
export interface SanitizedPlayer {
  id: PlayerId;
  name: string;
  score: number;
  isHost: boolean;
  isJudge: boolean;
  connected: boolean;
  /** Count only — never the actual hand. */
  handSize: number;
}

/**
 * A submission is an ordered set of white cards from a single player for
 * the current round. `playerId` is stripped before going to the judge.
 */
export interface Submission {
  id: SubmissionId;
  playerId: PlayerId; // Host-only
  cards: WhiteCard[];
}

/** Judge-visible submission — author hidden. */
export interface AnonymousSubmission {
  id: SubmissionId;
  cards: WhiteCard[];
}

/**
 * A vote in "everybody" judge mode. Host-only — `voterId` never crosses
 * the wire (only an aggregate count does), so a voter can't be linked to
 * a submission.
 */
export interface Vote {
  voterId: PlayerId;
  submissionId: SubmissionId;
}

export type GamePhase =
  | "lobby"
  /** Custom mode, player-authored prompts: everyone writes their share. */
  | "authoring"
  | "dealing"
  | "submission"
  | "judging"
  | "reveal"
  | "round-end"
  | "game-over";

export interface RoundState {
  index: number;
  /** Player id of the current judge. `null` in "everybody" judge mode. */
  judgeId: PlayerId | null;
  blackCard: BlackCard | null;
  /** Submissions in arrival order (Host-side). */
  submissions: Submission[];
  /** Submissions shuffled and stripped, for the judge. */
  anonymous: AnonymousSubmission[];
  /** Votes cast in "everybody" judge mode (Host-side only). */
  votes: Vote[];
  /** The winning submission's id once the judge picks / votes resolve. */
  winnerSubmissionId: SubmissionId | null;
  /** Wall-clock deadline if `timeLimitSec` is configured. */
  deadline: number | null;
}

export type WinCondition =
  | { kind: "score"; target: number }
  | { kind: "time"; minutes: number }
  | { kind: "deck" };

/**
 * How the winning submission is chosen each round.
 *   - "rotate"    — a single judge rotates each round and picks (classic).
 *   - "everybody" — no fixed judge; every player who submitted votes, and
 *                   the submission with the most votes wins.
 */
export type JudgeMode = "rotate" | "everybody";

/**
 * Game mode, chosen before the lobby.
 *   - "classic" — built-in decks, white cards dealt to hands (the original).
 *   - "custom"  — players type free-text white answers; black prompts come
 *                 from `blackCards` (built-in / authored / mixed).
 */
export type GameMode = "classic" | "custom";

/** Where white answers come from. "blank" = typed free-text each round. */
export type WhiteCardSource = "deck" | "blank";

/**
 * Where black prompts come from in custom mode.
 *   - "deck"   — built-in prompts only.
 *   - "custom" — player/host-authored prompts only (padded with built-ins
 *                when an even split leaves a remainder).
 *   - "mix"    — authored prompts shuffled together with the built-in deck.
 */
export type BlackCardSource = "deck" | "custom" | "mix";

/** Who writes the authored prompts when `blackCards` is custom/mix. */
export type BlackAuthoring = "host" | "players";

export interface GameSettings {
  /** Maximum cards in hand. Defaults to 5. */
  handSize: number;
  /** Submission (card-picking) timer in seconds. 0 = no limit (forever). */
  timeLimitSec: number;
  /** Judging/voting timer in seconds. 0 = no limit (forever). */
  judgeTimeLimitSec: number;
  win: WinCondition;
  /** Who judges each round. Defaults to "rotate". */
  judgeMode: JudgeMode;
  /** Deck locale — set by the host. All peers play with the same deck. */
  locale: "es" | "en";
  /** Classic or custom. Chosen before the lobby. Defaults to "classic". */
  mode: GameMode;
  /** White answer source. "blank" only in custom mode. */
  whiteCards: WhiteCardSource;
  /** Black prompt source (custom mode). */
  blackCards: BlackCardSource;
  /** Who authors prompts when `blackCards` is custom/mix. */
  blackAuthoring: BlackAuthoring;
  /** Target authored black-deck size (custom/mix). */
  blackTotal: number;
}

export interface GameState {
  roomId: RoomId;
  /** Monotonic state version — peers ignore stale broadcasts. */
  version: number;
  phase: GamePhase;
  settings: GameSettings;
  /** Host-side: full player records. Peers see the sanitized projection. */
  players: Player[];
  /** Ids of players to be kicked at next phase boundary. */
  banned: PlayerId[];
  /** Decks consumed in order; pull from the tail. */
  blackDeck: BlackCard[];
  whiteDeck: WhiteCard[];
  /**
   * Host-side accumulator for player/host-authored prompts (custom mode).
   * Host-authoring stores everything under the host's id. Prompt text never
   * crosses the wire until a prompt is dealt as the round's `blackCard`.
   */
  authoredPrompts: { playerId: PlayerId; text: string }[];
  /** Ids of players who have submitted their prompts (authoring phase). */
  authoredBy: PlayerId[];
  /** Per-player prompt quota during the "authoring" phase. */
  authoringQuota: number;
  round: RoundState;
  /** Set once a win condition fires. */
  winnerId: PlayerId | null;
}

/** Projection broadcast to all peers. */
export interface SanitizedGameState {
  roomId: RoomId;
  version: number;
  phase: GamePhase;
  settings: GameSettings;
  players: SanitizedPlayer[];
  round: {
    index: number;
    judgeId: PlayerId | null;
    blackCard: BlackCard | null;
    anonymous: AnonymousSubmission[];
    /** How many players have submitted so far. Count only — no authors. */
    submissionCount: number;
    /** How many votes are in (everybody mode). Count only — no voters. */
    voteCount: number;
    winnerSubmissionId: SubmissionId | null;
    deadline: number | null;
    /** Once revealed, the winning submission's author. */
    winnerPlayerId?: PlayerId;
  };
  winnerId: PlayerId | null;
  blackRemaining: number;
  whiteRemaining: number;
  /** Authoring phase: per-player prompt quota. Count-only — no prompt text. */
  authoringQuota: number;
  /** Authoring phase: how many players have submitted their prompts. */
  authoredCount: number;
}

/** Private packet — only sent to a single peer (their own hand). */
export interface PrivateHandPayload {
  playerId: PlayerId;
  hand: WhiteCard[];
}

/* ------------------------------------------------------------------ */
/* Network — passthrough protocol                                      */
/* ------------------------------------------------------------------ */

export type ClientToServer =
  /** Create a room. The creator becomes host. */
  | { t: "room/create"; name: string; settings: GameSettings }
  /** Join an existing room. */
  | { t: "room/join"; roomId: RoomId; name: string }
  /** Host: broadcast new sanitized state to peers. */
  | { t: "state/broadcast"; state: SanitizedGameState }
  /** Host: send a private hand packet to a specific peer. */
  | { t: "state/private"; target: PlayerId; payload: PrivateHandPayload }
  /** Peer: submit cards for the current round. */
  | { t: "action/submit"; submission: Omit<Submission, "id"> }
  /** Peer: submit authored black prompts during the authoring phase. */
  | { t: "action/author-black"; playerId: PlayerId; prompts: string[] }
  /** Judge: pick a submission (rotate mode). */
  | { t: "action/pick"; submissionId: SubmissionId }
  /** Player: cast a vote for a submission (everybody mode). */
  | { t: "action/vote"; voterId: PlayerId; submissionId: SubmissionId }
  /** Host: forcibly remove a peer. */
  | { t: "host/kick"; playerId: PlayerId }
  /** Heartbeat from any peer so AFK timers can advance. */
  | { t: "ping"; playerId: PlayerId };

export type ServerToClient =
  /** Issued to the requester after `room/create`. */
  | { t: "room/created"; roomId: RoomId; selfId: PlayerId }
  /** Issued to the requester after `room/join`. */
  | { t: "room/joined"; roomId: RoomId; selfId: PlayerId; host: PlayerId }
  /** A new peer arrived. Host should reply with a state/broadcast. */
  | { t: "peer/joined"; playerId: PlayerId; name: string; socketId: string }
  /** A peer disconnected. Host should mark them offline. */
  | { t: "peer/left"; playerId: PlayerId }
  /** Host went down. This peer is now host. Mount IndexedDB → rebroadcast. */
  | { t: "host/promote"; roomId: RoomId }
  /** Pure passthrough of the latest sanitized state. */
  | { t: "state/broadcast"; state: SanitizedGameState }
  /** Private packet routed to only this peer. */
  | { t: "state/private"; payload: PrivateHandPayload }
  /** Server-side termination — fewer than 3 players remain. */
  | { t: "room/terminated"; reason: "below-quorum" | "host-gone" }
  /** Wire-level error. */
  | { t: "error"; code: string; message: string };

export type NetworkPayload = ClientToServer | ServerToClient;
