import { Router } from "express";
import { z } from "zod";
import User, { HOURS } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, escapeRegex, isObjectId } from "../utils/http.js";
import { serializeUser } from "../utils/serialize.js";
import { withConnectionStatus } from "../services/connections.js";

const router = Router();
router.use(requireAuth);

const list = z.array(z.string().trim().min(1).max(40)).max(30);
const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  role: z.string().trim().min(1).max(100),
  bio: z.string().trim().max(500),
  skills: list,
  interests: list,
  availability: z.object({ days: z.array(z.string()).max(7), hours: z.enum(HOURS) }).partial(),
  github: z.union([z.literal(""), z.string().trim().url()]),
  portfolio: z.union([z.literal(""), z.string().trim().url()]),
}).partial();

// Distinct values power the Discover dropdowns.
router.get("/meta", async (_req, res) => {
  const [roles, interests] = await Promise.all([User.distinct("role"), User.distinct("interests")]);
  res.json({ roles: roles.sort(), interests: interests.sort() });
});

router.get("/", async (req, res) => {
  const { q, role, interest } = req.query;
  const filter = { _id: { $ne: req.user._id } };
  if (role) filter.role = String(role);
  if (interest) filter.interests = String(interest); // matches if the array contains it
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).slice(0, 50)), "i");
    filter.$or = [{ name: rx }, { role: rx }, { bio: rx }, { skills: rx }, { interests: rx }];
  }
  const users = await User.find(filter).sort({ name: 1 }).limit(60).lean();
  res.json({ users: await withConnectionStatus(req.user._id, users.map((u) => serializeUser(u))) });
});

router.put("/me", async (req, res) => {
  const patch = profileSchema.parse(req.body);
  const $set = {};
  for (const [k, v] of Object.entries(patch)) {
    if (k === "availability") {
      if (v.days) $set["availability.days"] = v.days;
      if (v.hours) $set["availability.hours"] = v.hours;
    } else $set[k] = v;
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set }, { new: true, runValidators: true });
  res.json({ user: serializeUser(user, { withEmail: true }) });
});

router.get("/:id", async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(400, "Invalid id");
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new HttpError(404, "User not found");
  const [withStatus] = await withConnectionStatus(req.user._id, [serializeUser(user)]);
  res.json({ user: withStatus });
});

export default router;
