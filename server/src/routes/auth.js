import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { HttpError } from "../utils/http.js";
import { serializeUser } from "../utils/serialize.js";
import { notify } from "../services/notify.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});
const loginSchema = z.object({ email: z.string().trim().toLowerCase(), password: z.string().min(1) });

const COLORS = ["#dce4ff", "#ffe2dd", "#e6dcff", "#d7f3e7", "#fff0ca", "#d6edff", "#f6ddeb"];
const colorFor = (email) => COLORS[[...email].reduce((n, c) => n + c.charCodeAt(0), 0) % COLORS.length];

const session = (user) => ({ token: signToken(user._id), user: serializeUser(user, { withEmail: true }) });

router.post("/register", async (req, res) => {
  const { name, email, password } = registerSchema.parse(req.body);
  if (await User.exists({ email })) throw new HttpError(409, "This email already has an account. Please sign in.");
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), color: colorFor(email) });
  await notify(user._id, { title: "Your SkillMesh space is ready", detail: "Complete your profile to get better matches." });
  res.status(201).json(session(user));
});

router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select("+passwordHash"); // opt in to the hidden field
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, "Incorrect email or password.");
  res.json(session(user));
});

router.get("/me", requireAuth, (req, res) => res.json({ user: serializeUser(req.user, { withEmail: true }) }));

export default router;
