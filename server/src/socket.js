import { Server } from "socket.io";
import { env } from "./config/env.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";

let io;
const connections = new Map(); // userId -> number of open tabs

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: env.CLIENT_ORIGIN } });

  io.use((socket, next) => {
    try {
      socket.userId = verifyToken(socket.handshake.auth?.token || "");
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const id = socket.userId;
    socket.join(`user:${id}`); // a private room per user: emit to it to reach all their tabs
    const count = (connections.get(id) || 0) + 1;
    connections.set(id, count);
    if (count === 1) await setPresence(id, true);

    socket.on("disconnect", async () => {
      const left = (connections.get(id) || 1) - 1;
      if (left <= 0) {
        connections.delete(id);
        await setPresence(id, false);
      } else connections.set(id, left);
    });
  });
  return io;
}

async function setPresence(id, online) {
  // Demo users keep their seeded presence; only real accounts follow sockets.
  const res = await User.updateOne(
    { _id: id, isDemo: false },
    { $set: { online, ...(online ? {} : { lastSeenAt: new Date() }) } }
  );
  if (res.modifiedCount) io?.emit("presence", { userId: id, online });
}

export const emitToUser = (userId, event, payload) => io?.to(`user:${userId}`).emit(event, payload);
export const closeSocket = () => io?.close();
