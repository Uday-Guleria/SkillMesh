import Notification from "../models/Notification.js";
import { emitToUser } from "../socket.js";
import { serializeNotification } from "../utils/serialize.js";

export async function notify(userId, { type = "system", icon = "✳", title, detail = "" }) {
  const n = await Notification.create({ user: userId, type, icon, title, detail });
  emitToUser(userId, "notification:new", serializeNotification(n));
  return n;
}
