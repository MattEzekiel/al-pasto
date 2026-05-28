import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { ClientToServer, NetworkPayload } from "@/types/game";

/**
 * Thin typed wrapper around socket.io-client.
 *
 * The server is a passthrough: it knows about `room:create`, `room:join`,
 * `host:kick`, and host promotion — everything else is a forwarded
 * payload. The wire vocabulary uses a single `msg` channel carrying a
 * tagged-union `NetworkPayload`.
 */

const URL = import.meta.env.VITE_SIGNAL_URL ?? "http://localhost:3001";

export interface CortaSocket {
  send(msg: ClientToServer): void;
  /**
   * The server is a passthrough, so the host also receives the
   * `ClientToServer` action packets peers send — inbound is the full
   * `NetworkPayload` union, not just `ServerToClient`.
   */
  on(handler: (msg: NetworkPayload) => void): () => void;
  onConnect(handler: () => void): () => void;
  onDisconnect(handler: (reason: string) => void): () => void;
  disconnect(): void;
  readonly id: string | undefined;
}

export function connect(): CortaSocket {
  const socket: Socket = io(URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 800,
    reconnectionDelayMax: 4000,
  });

  return {
    get id() {
      return socket.id;
    },
    send(msg) {
      socket.emit("msg", msg);
    },
    on(handler) {
      const wrapped = (msg: NetworkPayload) => handler(msg);
      socket.on("msg", wrapped);
      return () => socket.off("msg", wrapped);
    },
    onConnect(handler) {
      socket.on("connect", handler);
      return () => socket.off("connect", handler);
    },
    onDisconnect(handler) {
      socket.on("disconnect", handler);
      return () => socket.off("disconnect", handler);
    },
    disconnect() {
      socket.disconnect();
    },
  };
}
