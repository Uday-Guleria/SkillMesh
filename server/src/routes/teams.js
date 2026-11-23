import { Router } from "express";
import { z } from "zod";
import Team from "../models/Team.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError, isObjectId } from "../utils/http.js";
import { serializeTeam } from "../utils/serialize.js";
import { notify } from "../services/notify.js";

const router = Router();
router.use(requireAuth);

const MEMBER_FIELDS = "name role bio skills interests availability color online";
const populated = (id) => Team.findById(id).populate("members", MEMBER_FIELDS);

router.get("/", async (req, res) => {
  // `members: id` matches any team whose members array contains that id.
  const teams = await Team.find({ members: req.user._id }).sort({ createdAt: -1 }).populate("members", MEMBER_FIELDS);
  res.json({ teams: teams.map(serializeTeam) });
});

router.post("/", async (req, res) => {
  const body = z.object({
    name: z.string().trim().min(1, "Team name is required").max(70),
    goal: z.string().trim().min(1, "Describe what you're building").max(400),
    memberId: z.string().optional().nullable(),
  }).parse(req.body);

  const members = [req.user._id];
  if (body.memberId) {
    if (!isObjectId(body.memberId) || !(await User.exists({ _id: body.memberId }))) throw new HttpError(404, "Teammate not found");
    members.push(body.memberId);
  }
  const team = await Team.create({ name: body.name, goal: body.goal, owner: req.user._id, members });
  if (body.memberId) await notify(body.memberId, { type: "team", icon: "◇", title: `${req.user.name} added you to ${team.name}`, detail: team.goal });
  await notify(req.user._id, { type: "team", icon: "◇", title: `${team.name} created`, detail: team.goal });
  res.status(201).json({ team: serializeTeam(await populated(team._id)) });
});

router.get("/:id", async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(400, "Invalid id");
  const team = await populated(req.params.id);
  if (!team || !team.members.some((m) => String(m._id) === String(req.user._id))) throw new HttpError(404, "Team not found");
  res.json({ team: serializeTeam(team) });
});

router.post("/:id/members", async (req, res) => {
  const { userId } = z.object({ userId: z.string() }).parse(req.body);
  if (!isObjectId(req.params.id) || !isObjectId(userId)) throw new HttpError(400, "Invalid id");
  const newcomer = await User.findById(userId).lean();
  if (!newcomer) throw new HttpError(404, "User not found");
  // owner check + $addToSet (no duplicates) in a single atomic update
  const team = await Team.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id }, { $addToSet: { members: userId } }, { new: true }
  ).populate("members", MEMBER_FIELDS);
  if (!team) throw new HttpError(403, "Only the team owner can add members");
  await notify(userId, { type: "team", icon: "◇", title: `${req.user.name} added you to ${team.name}`, detail: team.goal });
  await notify(req.user._id, { type: "team", icon: "◇", title: `${newcomer.name} joined ${team.name}`, detail: "Your team is growing." });
  res.json({ team: serializeTeam(team) });
});

// Owner removes someone, or any member leaves ($pull removes the id from the array).
router.delete("/:id/members/:userId", async (req, res) => {
  const { id, userId } = req.params;
  if (!isObjectId(id) || !isObjectId(userId)) throw new HttpError(400, "Invalid id");
  const team = await Team.findById(id);
  if (!team) throw new HttpError(404, "Team not found");
  const isOwner = String(team.owner) === String(req.user._id);
  if (!isOwner && userId !== String(req.user._id)) throw new HttpError(403, "Not allowed");
  if (userId === String(team.owner)) throw new HttpError(400, "The owner can't leave their own team");
  await Team.updateOne({ _id: id }, { $pull: { members: userId } });
  res.json({ team: serializeTeam(await populated(id)) });
});

export default router;
