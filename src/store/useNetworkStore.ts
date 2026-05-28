import { create } from "zustand";
import type { CortaSocket } from "@/lib/network";
import { connect } from "@/lib/network";

/**
 * Holds the socket handle plus the live wire status. The game store
 * subscribes to this — it doesn't own the connection.
 */
export type WireStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";

interface NetworkState {
  socket: CortaSocket | null;
  status: WireStatus;
  connect: () => CortaSocket;
  disconnect: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  socket: null,
  status: "idle",

  connect: () => {
    const existing = get().socket;
    if (existing) return existing;

    set({ status: "connecting" });
    const socket = connect();

    socket.onConnect(() => set({ status: "open" }));
    socket.onDisconnect((reason) => {
      set({ status: reason === "io client disconnect" ? "closed" : "reconnecting" });
    });

    set({ socket });
    return socket;
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null, status: "closed" });
  },
}));
