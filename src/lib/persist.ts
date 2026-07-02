import { del, get, set } from "idb-keyval";
import type { GameState } from "@/types/game";

/**
 * IndexedDB mirror of the host-side GameState.
 *
 * The failover contract: when a peer is promoted to host, it reads from
 * this key to recover the last known full state and re-broadcasts it. So
 * the only thing that matters here is that the write completed BEFORE the
 * host died. We therefore mirror on every mutation, fire-and-forget.
 */

const KEY = (roomId: string) => `corta:state:${roomId}`;

export async function mirrorState(state: GameState): Promise<void> {
  try {
    await set(KEY(state.roomId), state);
  } catch (err) {
    console.warn("[persist] mirror failed", err);
  }
}

export async function readMirror(roomId: string): Promise<GameState | null> {
  try {
    const v = await get<GameState>(KEY(roomId));
    return v ?? null;
  } catch (err) {
    console.warn("[persist] read failed", err);
    return null;
  }
}

export async function clearMirror(roomId: string): Promise<void> {
  try {
    await del(KEY(roomId));
  } catch {
    // Non-fatal; the next start_url just bypasses recovery.
  }
}
