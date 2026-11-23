import { Router } from "express";
import { z } from "zod";
import Message, { conversationKey } from "../models/Message.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, isObjectId } from "../utils/http.js";
import { serializeMessage, serializeUser } from "../utils/serialize.js";
import { emitToUser } from "../socket.js";
import { scheduleDemoReply } from "../services/demoBots.js";

const router = Router();
router.use(requireAuth);

const areConnected = (a, b) =>
  Connection.exists({ status: "accepted", $or: [{ from: a, to: b }, { from: b, to: a }] });

// Chat list: latest message per conversation + unread count (aggregation pipeline).
router.get("/conversations", async (req, res) => {
  const me = req.user._id;
  const convs = await Message.aggregate([
    { $match: { $or: [{ from: me }, { to: me }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversation",
        last: { $first: "$$ROOT" },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ["$to", me] }, { $eq: ["$readAt", null] }] }, 1, 0] } },
      },
    },
    { $sort: { "last.createdAt": -1 } },
    { $addFields: { otherId: { $cond: [{ $eq: ["$last.from", me] }, "$last.to", "$last.from"] } } },
    { $lookup: { from: "users", localField: "otherId", foreignField: "_id", as: "other" } },
    { $unwind: "$other" },
  ]);

  const chats = convs.map((c) => ({
    user: serializeUser(c.other),
    last: serializeMessage(c.last),
    unread: c.unread,
  }));

  // Accepted connections you haven't written to yet also appear in the list.
  const seen = new Set(chats.map((c) => c.user.id));
  const links = await Connection.find({ status: "accepted", $or: [{ from: me }, { to: me }] }).populate("from to").lean();
  for (const l of links) {
    const other = String(l.from._id) === String(me) ? l.to : l.from;
    if (!seen.has(String(other._id))) chats.push({ user: serializeUser(other), last: null, unread: 0 });
  }
  res.json({ conversations: chats });
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isObjectId(userId)) throw new HttpError(400, "Invalid id");
  const me = req.user._id;
  const conversation = conversationKey(me, userId);
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const filter = { conversation };
  if (req.query.before) filter.createdAt = { $lt: new Date(String(req.query.before)) }; // cursor pagination

  const page = await Message.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  await Message.updateMany({ conversation, to: me, readAt: null }, { $set: { readAt: new Date() } });
  res.json({ messages: page.reverse().map(serializeMessage) });
});

router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { text } = z.object({ text: z.string().trim().min(1).max(500) }).parse(req.body);
  if (!isObjectId(userId)) throw new HttpError(400, "Invalid id");
  const other = await User.findById(userId).lean();
  if (!other) throw new HttpError(404, "User not found");
  if (!(await areConnected(req.user._id, userId))) throw new HttpError(403, "Connect with this person before messaging");

  const msg = await Message.create({ conversation: conversationKey(req.user._id, userId), from: req.user._id, to: userId, text });
  const payload = serializeMessage(msg);
  emitToUser(userId, "message:new", payload);
  emitToUser(req.user._id, "message:new", payload); // keeps your other tabs in sync
  if (other.isDemo) scheduleDemoReply(other._id, req.user._id);
  res.status(201).json({ message: payload });
});

export default router;
