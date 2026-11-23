// Demo users are seeded accounts; these helpers make them feel alive in a single-user demo.
import { env } from "../config/env.js";
import Connection from "../models/Connection.js";
import Message, { conversationKey } from "../models/Message.js";
import User from "../models/User.js";
import { notify } from "./notify.js";
import { emitToUser } from "../socket.js";
import { serializeMessage } from "../utils/serialize.js";

const REPLIES = [
  "Sounds great! Tell me more about what you're building.",
  "Love that idea. What's the timeline looking like?",
  "I'd be happy to help. When are you free to chat?",
  "Nice! Let's sketch the first milestone together.",
];

export function scheduleDemoAccept(connectionId) {
  setTimeout(async () => {
    const c = await Connection.findOneAndUpdate(
      { _id: connectionId, status: "pending" }, { $set: { status: "accepted" } }, { new: true }
    );
    if (!c) return;
    const demo = await User.findById(c.to).lean();
    await notify(c.from, { type: "connection", icon: "↗", title: `${demo.name} accepted your request`, detail: "You can message each other now." });
  }, env.DEMO_BOT_DELAY_MS);
}

export function scheduleDemoReply(demoId, userId) {
  setTimeout(async () => {
    const msg = await Message.create({
      conversation: conversationKey(demoId, userId), from: demoId, to: userId,
      text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
    });
    emitToUser(userId, "message:new", serializeMessage(msg));
  }, env.DEMO_BOT_DELAY_MS + 400);
}
