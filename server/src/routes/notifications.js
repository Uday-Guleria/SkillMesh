import { Router } from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeNotification } from "../utils/serialize.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const [items, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ notifications: items.map(serializeNotification), unread });
});

router.patch("/read", async (req, res) => {
  const r = await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ updated: r.modifiedCount });
});

export default router;
