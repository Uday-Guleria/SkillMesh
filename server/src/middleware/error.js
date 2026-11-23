import { ZodError } from "zod";

export const notFound = (_req, res) => res.status(404).json({ error: "Not found" });

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message || "Invalid input", issues: err.issues });
  }
  if (err.name === "ValidationError") return res.status(400).json({ error: Object.values(err.errors)[0].message });
  if (err.name === "CastError") return res.status(400).json({ error: "Invalid id" });
  if (err.code === 11000) return res.status(409).json({ error: "That already exists" });
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
}
