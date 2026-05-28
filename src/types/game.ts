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

export type GamePhase =
  | "lobby"
  | "dealing"
  | "submission"
  | "judging"
  | "reveal"
  | "round-end"
  | "game-over";

export interface RoundState {
  index: number;
  /** Player id of the current judge. */
  judgeId: PlayerId | null;
  blackCard: BlackCard | null;
  /** Submissions in arrival order (Host-side). */
  submissions: Submission[];
  /** Submissions shuffled and stripped, for the judge. */
  anonymous: AnonymousSubmission[];
  /** The winning submission's id once the judge picks. */
  winnerSubmissionId: SubmissionId | null;
  /** Wall-clock deadline if `timeLimitSec` is configured. */
  deadline: number | null;
}

export type WinCondition =
  | { kind: "score"; target: number }
  | { kind: "time"; minutes: number }
  | { kind: "deck" };

export interface GameSettings {
  /** Maximum cards in hand. Defaults to 5. */
  handSize: number;
  /** Per-round timer in seconds. 0 disables. */
  timeLimitSec: number;
  win: WinCondition;
  /** Deck locale — set by the host. All peers play with the same deck. */
  locale: "es" | "en";
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
    winnerSubmissionId: SubmissionId | null;
    deadline: number | null;
    /** Once revealed, the winning submission's author. */
    winnerPlayerId?: PlayerId;
  };
  winnerId: PlayerId | null;
  blackRemaining: number;
  whiteRemaining: number;
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
  /** Judge: pick a submission. */
  | { t: "action/pick"; submissionId: SubmissionId }
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
