import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  ClientToServer,
  GameSettings,
  GameState,
  NetworkPayload,
  PlayerId,
  RoomId,
  SanitizedGameState,
  Submission,
  WhiteCard,
} from "@/types/game";
import { sanitizeState } from "@/lib/anonymize";
import {
  addPlayer,
  castVote,
  createInitialState,
  endRound,
  expireSubmissions,
  judgePick,
  kick,
  markConnection,
  resolveTieBreaker,
  setHostPrompts,
  startGame,
  startNextRound,
  submit,
  submitAuthoredBlack,
  updateSettings,
} from "@/lib/host";
import { mirrorState, readMirror } from "@/lib/persist";
import { useNetworkStore } from "@/store/useNetworkStore";

/**
 * The single Zustand store that holds:
 *
 *   - Host-side `GameState` (only populated when `selfIsHost === true`)
 *   - Peer-side `SanitizedGameState` (the broadcasted projection)
 *   - The player's own hand (private packet, never broadcast)
 *
 * The host runs every mutation through `lib/host.ts`, mirrors to
 * IndexedDB, and broadcasts. Peers are pure receivers: they accept
 * `state/broadcast` and `state/private` and store the result.
 *
 * Failover: on `host/promote`, we read the IndexedDB mirror and re-mount
 * as the new host, then immediately broadcast the recovered state.
 */

type Role = "host" | "peer";

interface GameStoreShape {
  /** Local identity */
  selfId: PlayerId | null;
  selfName: string | null;
  role: Role;
  roomId: RoomId | null;

  /** Host-only — full source of truth. */
  hostState: GameState | null;

  /** Settings chosen at create time, consumed when `room/created` arrives. */
  pendingSettings: GameSettings | null;

  /** Peer-side projection — what everyone but the host actually reads. */
  view: SanitizedGameState | null;

  /** Private hand (peer-side). For the host, the hand lives inside hostState. */
  privateHand: WhiteCard[];

  /* lifecycle */
  bindSocket: () => void;
  createRoom: (name: string, settings: GameSettings) => void;
  joinRoom: (roomId: RoomId, name: string) => void;
  leave: () => void;

  /* host actions */
  setSettings: (patch: Partial<GameSettings>) => void;
  /** Host-only — write/replace the host's authored prompts in the lobby. */
  setPrompts: (prompts: string[]) => void;
  start: () => void;
  pick: (submissionId: string) => void;
  kickPlayer: (playerId: PlayerId) => void;
  advanceRound: () => void;
  forceTieBreak: () => void;
  /** Host-only — force the submission phase closed when the timer expires. */
  expireSubmission: () => void;

  /* peer actions */
  submitCards: (cards: WhiteCard[]) => void;
  /** Everybody-judge mode — cast a vote for a submission. */
  vote: (submissionId: string) => void;
  /** Authoring phase — submit this player's share of black prompts. */
  authorBlack: (prompts: string[]) => void;

  /** Test/devtools helper — never called in production. */
  __setHostState: (state: GameState) => void;
}

export const useGameStore = create<GameStoreShape>()(
  subscribeWithSelector((set, get) => {
    /* ---------------------------------------------------------- */
    /* helpers                                                    */
    /* ---------------------------------------------------------- */

    /** Persist + broadcast after every host-side mutation. */
    const commitHost = (next: GameState) => {
      set({ hostState: next, view: sanitizeState(next) });
      mirrorState(next);

      const socket = useNetworkStore.getState().socket;
      if (!socket) return;
      socket.send({ t: "state/broadcast", state: sanitizeState(next) });

      // Push private hands to each peer.
      for (const p of next.players) {
        if (!p.connected) continue;
        if (p.id === get().selfId) continue; // host reads its own hand directly
        socket.send({
          t: "state/private",
          target: p.id,
          payload: { playerId: p.id, hand: p.hand },
        });
      }
    };

    /** Host-side handler for inbound server messages. */
    const handleHostMessage = (msg: NetworkPayload) => {
      const state = get().hostState;
      if (!state) return;

      switch (msg.t) {
        case "peer/joined": {
          const next = addPlayer(state, {
            id: msg.playerId,
            name: msg.name,
            socketId: msg.socketId,
          });
          commitHost(next);
          return;
        }
        case "peer/left": {
          // Mark offline rather than remove — preserves their score until kicked.
          commitHost(markConnection(state, msg.playerId, false));
          return;
        }
        case "action/submit": {
          commitHost(submit(state, msg.submission));
          return;
        }
        case "action/author-black": {
          commitHost(
            submitAuthoredBlack(state, { playerId: msg.playerId, prompts: msg.prompts }),
          );
          return;
        }
        case "action/pick": {
          commitHost(judgePick(state, msg.submissionId));
          return;
        }
        case "action/vote": {
          commitHost(castVote(state, { voterId: msg.voterId, submissionId: msg.submissionId }));
          return;
        }
        default:
        // Host receives broadcast/private as well (the server fan-outs to
        // everyone in the room) — safe to ignore.
      }
    };

    /** Peer-side handler. */
    const handlePeerMessage = (msg: NetworkPayload) => {
      switch (msg.t) {
        case "state/broadcast": {
          const current = get().view;
          if (current && msg.state.version <= current.version) return;
          set({ view: msg.state });
          return;
        }
        case "state/private": {
          if (msg.payload.playerId !== get().selfId) return;
          set({ privateHand: msg.payload.hand });
          return;
        }
        case "host/promote": {
          void promoteSelfToHost(msg.roomId);
          return;
        }
        case "room/terminated": {
          // Everyone goes back to home. UI can show a toast based on reason.
          get().leave();
          return;
        }
        default:
      }
    };

    /** Failover: read mirror + remount as host. */
    const promoteSelfToHost = async (roomId: RoomId) => {
      const recovered = await readMirror(roomId);
      if (!recovered) {
        // Catastrophic — no local state. Best effort: hard-leave.
        get().leave();
        return;
      }
      const me = get().selfId;
      const socket = useNetworkStore.getState().socket;
      const promoted: GameState = {
        ...recovered,
        version: recovered.version + 1,
        players: recovered.players.map((p) => ({
          ...p,
          isHost: p.id === me,
          // socketId is stale on a recovered mirror — repair our own.
          socketId: p.id === me && socket?.id ? socket.id : p.socketId,
        })),
      };
      set({ role: "host", hostState: promoted });
      commitHost(promoted);
    };

    /* ---------------------------------------------------------- */
    /* public actions                                             */
    /* ---------------------------------------------------------- */

    return {
      selfId: null,
      selfName: null,
      role: "peer",
      roomId: null,
      hostState: null,
      pendingSettings: null,
      view: null,
      privateHand: [],

      bindSocket: () => {
        const socket = useNetworkStore.getState().connect();
        socket.on((msg) => {
          // route based on role at message-time
          if (get().role === "host") {
            handleHostMessage(msg);
          }
          handlePeerMessage(msg);

          // Bootstrap messages — handled regardless of role.
          if (msg.t === "room/created") {
            set({ roomId: msg.roomId, selfId: msg.selfId, role: "host" });
            const name = get().selfName ?? "Host";
            const hostState = createInitialState({
              roomId: msg.roomId,
              host: { id: msg.selfId, name, socketId: socket.id ?? "" },
              settings: get().pendingSettings ?? undefined,
            });
            commitHost(hostState);
          }
          if (msg.t === "room/joined") {
            set({
              roomId: msg.roomId,
              selfId: msg.selfId,
              role: msg.host === msg.selfId ? "host" : "peer",
            });
          }
        });
      },

      createRoom: (name, settings) => {
        set({ selfName: name, pendingSettings: settings });
        get().bindSocket();
        useNetworkStore
          .getState()
          .socket?.send({ t: "room/create", name, settings });
      },

      joinRoom: (roomId, name) => {
        set({ selfName: name });
        get().bindSocket();
        useNetworkStore.getState().socket?.send({ t: "room/join", roomId, name });
      },

      leave: () => {
        useNetworkStore.getState().disconnect();
        set({
          selfId: null,
          roomId: null,
          role: "peer",
          hostState: null,
          view: null,
          privateHand: [],
        });
      },

      setSettings: (patch) => {
        const state = get().hostState;
        if (!state) return;
        commitHost(updateSettings(state, patch));
      },

      setPrompts: (prompts) => {
        const state = get().hostState;
        const me = get().selfId;
        if (!state || !me) return;
        commitHost(setHostPrompts(state, me, prompts));
      },

      start: () => {
        const state = get().hostState;
        if (!state) return;
        commitHost(startGame(state));
      },

      pick: (submissionId) => {
        const state = get().hostState;
        if (!state) return;
        commitHost(judgePick(state, submissionId));
      },

      forceTieBreak: () => {
        const state = get().hostState;
        if (!state) return;
        commitHost(resolveTieBreaker(state));
      },

      expireSubmission: () => {
        const state = get().hostState;
        if (!state) return;
        commitHost(expireSubmissions(state));
      },

      advanceRound: () => {
        const state = get().hostState;
        if (!state) return;
        if (state.phase === "reveal") commitHost(endRound(state));
        else if (state.phase === "round-end") commitHost(startNextRound(state));
      },

      kickPlayer: (playerId) => {
        const state = get().hostState;
        if (!state) return;
        commitHost(kick(state, playerId));
        useNetworkStore.getState().socket?.send({ t: "host/kick", playerId });
      },

      submitCards: (cards) => {
        const me = get().selfId;
        if (!me) return;

        // Host short-circuits the wire — submit locally then broadcast.
        if (get().role === "host") {
          const state = get().hostState;
          if (!state) return;
          commitHost(submit(state, { playerId: me, cards }));
          return;
        }

        // Optimistic local hide of the cards from the private hand.
        set((s) => ({
          privateHand: s.privateHand.filter(
            (c) => !cards.some((picked) => picked.id === c.id),
          ),
        }));

        const wireSub: Omit<Submission, "id"> = { playerId: me, cards };
        useNetworkStore
          .getState()
          .socket?.send({ t: "action/submit", submission: wireSub } as ClientToServer);
      },

      vote: (submissionId) => {
        const me = get().selfId;
        if (!me) return;

        // Host short-circuits the wire — apply locally then broadcast.
        if (get().role === "host") {
          const state = get().hostState;
          if (!state) return;
          commitHost(castVote(state, { voterId: me, submissionId }));
          return;
        }

        useNetworkStore
          .getState()
          .socket?.send({ t: "action/vote", voterId: me, submissionId });
      },

      authorBlack: (prompts) => {
        const me = get().selfId;
        if (!me) return;

        if (get().role === "host") {
          const state = get().hostState;
          if (!state) return;
          commitHost(submitAuthoredBlack(state, { playerId: me, prompts }));
          return;
        }

        useNetworkStore
          .getState()
          .socket?.send({ t: "action/author-black", playerId: me, prompts });
      },

      __setHostState: (state) => set({ hostState: state, view: sanitizeState(state) }),
    };
  }),
);

/**
 * Convenience selector — returns the local player's name + score from
 * whichever projection we have (host or peer).
 */
export function useSelfPlayer() {
  return useGameStore((s) => {
    if (!s.view || !s.selfId) return null;
    return s.view.players.find((p) => p.id === s.selfId) ?? null;
  });
}

/** Hand selector — host reads from hostState; peer reads from privateHand. */
export function useSelfHand(): WhiteCard[] {
  return useGameStore((s) => {
    if (s.role === "host" && s.hostState && s.selfId) {
      return s.hostState.players.find((p) => p.id === s.selfId)?.hand ?? [];
    }
    return s.privateHand;
  });
}
