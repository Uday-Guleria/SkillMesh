import { Router } from "express";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const me = req.user;
  const [potentialMatches, teams, unreadMessages, unreadNotifications, topSkills] = await Promise.all([
    User.countDocuments({ _id: { $ne: me._id } }),
    Team.countDocuments({ members: me._id }),
    Message.countDocuments({ to: me._id, readAt: null }),
    Notification.countDocuments({ user: me._id, read: false }),
    // Trending skills across all users: unwind the array, group by skill, count, sort, top 5.
    User.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: { $toLower: "$skills" }, name: { $first: "$skills" }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: 1, count: 1 } },
    ]),
  ]);
  res.json({
    potentialMatches, teams, skills: me.skills.length,
    reputation: Math.min(100, 70 + teams * 5),
    unreadMessages, unreadNotifications, topSkills,
  });
});

export default router;
