import { Router } from "express";
import { z } from "zod";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, isObjectId } from "../utils/http.js";
import { serializeUser } from "../utils/serialize.js";
import { notify } from "../services/notify.js";
import { scheduleDemoAccept } from "../services/demoBots.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  const { to } = z.object({ to: z.string() }).parse(req.body);
  if (!isObjectId(to)) throw new HttpError(400, "Invalid id");
  const me = req.user;
  if (String(me._id) === to) throw new HttpError(400, "You can't connect with yourself");
  const target = await User.findById(to).lean();
  if (!target) throw new HttpError(404, "User not found");

  const existing = await Connection.findOne({ $or: [{ from: me._id, to }, { from: to, to: me._id }] });
  let conn;
  if (!existing) {
    conn = await Connection.create({ from: me._id, to });
  } else if (existing.status === "accepted") {
    throw new HttpError(409, `You're already connected with ${target.name}`);
  } else if (existing.status === "pending" && String(existing.from) === String(me._id)) {
    throw new HttpError(409, "Request already sent");
  } else if (existing.status === "pending") {
    // They already asked us: connecting back just accepts it.
    existing.status = "accepted";
    conn = await existing.save();
    await notify(to, { type: "connection", icon: "↗", title: `${me.name} accepted your request`, detail: "You can message each other now." });
    return res.json({ connection: { id: String(conn._id), status: conn.status } });
  } else {
    existing.from = me._id; existing.to = to; existing.status = "pending"; // re-open a declined request
    conn = await existing.save();
  }

  await notify(to, { type: "connection", icon: "↗", title: `${me.name} wants to connect`, detail: "Open Team matches to respond." });
  if (target.isDemo) scheduleDemoAccept(conn._id);
  res.status(201).json({ connection: { id: String(conn._id), status: conn.status } });
});

// Everyone I'm linked to, with the other person's profile.
router.get("/", async (req, res) => {
  const me = req.user._id;
  const docs = await Connection.find({ $or: [{ from: me }, { to: me }] }).sort({ updatedAt: -1 }).populate("from to").lean();
  res.json({
    connections: docs.map((c) => {
      const iSent = String(c.from._id) === String(me);
      return { id: String(c._id), status: c.status, direction: iSent ? "sent" : "received", user: serializeUser(iSent ? c.to : c.from) };
    }),
  });
});

router.patch("/:id", async (req, res) => {
  const { status } = z.object({ status: z.enum(["accepted", "declined"]) }).parse(req.body);
  if (!isObjectId(req.params.id)) throw new HttpError(400, "Invalid id");
  // Only the recipient can answer, and only while pending: both rules live in the filter.
  const conn = await Connection.findOneAndUpdate(
    { _id: req.params.id, to: req.user._id, status: "pending" }, { $set: { status } }, { new: true }
  );
  if (!conn) throw new HttpError(404, "No pending request found");
  if (status === "accepted") {
    await notify(conn.from, { type: "connection", icon: "↗", title: `${req.user.name} accepted your request`, detail: "You can message each other now." });
  }
  res.json({ connection: { id: String(conn._id), status: conn.status } });
});

export default router;
