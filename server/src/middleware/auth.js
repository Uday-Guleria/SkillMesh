import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { HttpError } from "../utils/http.js";

export const signToken = (userId) => jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET).sub;

export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Please sign in");
  let id;
  try { id = verifyToken(token); } catch { throw new HttpError(401, "Session expired, please sign in again"); }
  const user = await User.findById(id);
  if (!user) throw new HttpError(401, "Account no longer exists");
  req.user = user;
  next();
}
