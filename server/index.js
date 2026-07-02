/**
 * Corta — passthrough signaling server.
 *
 * The contract is intentionally tiny:
 *   - room/create        → reply with room/created (host marker on the new room)
 *   - room/join          → reply with room/joined and broadcast peer/joined to the room
 *   - state/broadcast    → re-broadcast to everyone except the sender
 *   - state/private      → route to a single target by playerId
 *   - host/kick          → forcibly disconnect the target socket
 *   - <disconnect>       → if it was the host and >= 3 peers remain, promote a random peer
 *                          to host. Otherwise, terminate the room.
 *
 * There is NO game state on the server. We store *only* (roomId → {host, players[]})
 * to know who to promote and who is in the room. Everything else lives on the host.
 */

import http from "node:http";
import { Server } from "socket.io";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const httpServer = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ["GET", "POST"] },
});

/**
 * Room metadata. Players are keyed by their public playerId so we can
 * route private packets without exposing socket internals to the host.
 *
 *   rooms.get(roomId) = {
 *     hostPlayerId,
 *     players: Map<playerId, { socketId, name }>
 *   }
 */
const rooms = new Map();
// playerId → { roomId, socketId } reverse index
const players = new Map();

const MIN_PLAYERS = 3;

// 8-char codes from an unambiguous alphabet (no 0/O, 1/I). Retried until
// unique so two live rooms can never collide.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function newRoomCode() {
  let code;
  do {
    code = "";
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
  } while (rooms.has(code));
  return code;
}

function newPlayerId() {
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

function joinSocketToRoom(socket, roomId) {
  socket.join(roomId);
  socket.data.roomId = roomId;
}

function broadcastTo(roomId, msg, except) {
  if (except) {
    except.to(roomId).emit("msg", msg);
  } else {
    io.to(roomId).emit("msg", msg);
  }
}

function sendToPlayer(playerId, msg) {
  const ref = players.get(playerId);
  if (!ref) return;
  io.to(ref.socketId).emit("msg", msg);
}

function promoteOrTerminate(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  const remaining = [...room.players.entries()];
  if (remaining.length < MIN_PLAYERS) {
    broadcastTo(roomId, { t: "room/terminated", reason: "below-quorum" });
    rooms.delete(roomId);
    return;
  }
  // Pick a random surviving peer.
  const [newHostId] = remaining[Math.floor(Math.random() * remaining.length)];
  room.hostPlayerId = newHostId;
  sendToPlayer(newHostId, { t: "host/promote", roomId });
}

io.on("connection", (socket) => {
  socket.data.playerId = null;

  socket.on("msg", (msg) => {
    try {
      handle(socket, msg);
    } catch (err) {
      console.error("[server] handler error", err);
      socket.emit("msg", {
        t: "error",
        code: "handler-failed",
        message: String(err?.message ?? err),
      });
    }
  });

  socket.on("disconnect", () => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const ref = players.get(playerId);
    if (!ref) return;
    const room = rooms.get(ref.roomId);
    if (!room) {
      players.delete(playerId);
      return;
    }
    room.players.delete(playerId);
    players.delete(playerId);

    broadcastTo(ref.roomId, { t: "peer/left", playerId });

    if (room.hostPlayerId === playerId) {
      promoteOrTerminate(ref.roomId);
    } else if (room.players.size < MIN_PLAYERS) {
      broadcastTo(ref.roomId, { t: "room/terminated", reason: "below-quorum" });
      rooms.delete(ref.roomId);
    }
  });
});

function handle(socket, msg) {
  switch (msg.t) {
    case "room/create": {
      const roomId = newRoomCode();
      const playerId = newPlayerId();
      rooms.set(roomId, {
        hostPlayerId: playerId,
        players: new Map([[playerId, { socketId: socket.id, name: msg.name }]]),
      });
      players.set(playerId, { roomId, socketId: socket.id });
      socket.data.playerId = playerId;
      joinSocketToRoom(socket, roomId);
      socket.emit("msg", { t: "room/created", roomId, selfId: playerId });
      return;
    }

    case "room/join": {
      const room = rooms.get(msg.roomId);
      if (!room) {
        socket.emit("msg", {
          t: "error",
          code: "no-such-room",
          message: `Room ${msg.roomId} does not exist`,
        });
        return;
      }
      const playerId = newPlayerId();
      room.players.set(playerId, { socketId: socket.id, name: msg.name });
      players.set(playerId, { roomId: msg.roomId, socketId: socket.id });
      socket.data.playerId = playerId;
      joinSocketToRoom(socket, msg.roomId);

      socket.emit("msg", {
        t: "room/joined",
        roomId: msg.roomId,
        selfId: playerId,
        host: room.hostPlayerId,
      });
      // Tell the host (and everyone) about the newcomer; host responds with state/broadcast.
      broadcastTo(msg.roomId, {
        t: "peer/joined",
        playerId,
        name: msg.name,
        socketId: socket.id,
      });
      return;
    }

    case "state/broadcast":
    case "action/submit":
    case "action/pick":
    case "action/vote":
    case "ping": {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      broadcastTo(roomId, msg, socket);
      return;
    }

    case "state/private": {
      // Routed only to the target peer.
      sendToPlayer(msg.target, { t: "state/private", payload: msg.payload });
      return;
    }

    case "host/kick": {
      const ref = players.get(msg.playerId);
      if (!ref) return;
      const room = rooms.get(ref.roomId);
      room?.players.delete(msg.playerId);
      players.delete(msg.playerId);
      broadcastTo(ref.roomId, { t: "peer/left", playerId: msg.playerId });
      const target = io.sockets.sockets.get(ref.socketId);
      // Tell the kicked client why, then cut the wire. With the players-map
      // entry already gone, the target's disconnect handler early-returns,
      // so a deliberate kick never trips below-quorum termination.
      target?.emit("msg", { t: "room/terminated", reason: "kicked" });
      target?.disconnect(true);
      return;
    }

    default:
      // Unknown messages get broadcast as a courtesy — protocol is
      // intentionally forward-permissive.
      if (socket.data.roomId) broadcastTo(socket.data.roomId, msg, socket);
  }
}

httpServer.listen(PORT, () => {
  console.log(`[corta] passthrough listening on :${PORT}`);
});
