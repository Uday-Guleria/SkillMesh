import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeUser } from "../utils/serialize.js";
import { scoreMatches } from "../services/matching.js";
import { withConnectionStatus } from "../services/connections.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const me = await User.findById(req.user._id).lean();
  const others = await User.find({ _id: { $ne: me._id } }).lean();
  const scores = scoreMatches(me, others);
  const ranked = others
    .map((u) => ({ ...serializeUser(u), ...scores.get(String(u._id)) }))
    .sort((a, b) => b.score - a.score);
  res.json({ matches: await withConnectionStatus(me._id, ranked) });
});

export default router;
