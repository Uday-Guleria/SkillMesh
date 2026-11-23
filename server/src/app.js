import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import auth from "./routes/auth.js";
import users from "./routes/users.js";
import matches from "./routes/matches.js";
import connections from "./routes/connections.js";
import teams from "./routes/teams.js";
import messages from "./routes/messages.js";
import notifications from "./routes/notifications.js";
import stats from "./routes/stats.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json({ limit: "100kb" }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/matches", matches);
  app.use("/api/connections", connections);
  app.use("/api/teams", teams);
  app.use("/api/messages", messages);
  app.use("/api/notifications", notifications);
  app.use("/api/stats", stats);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
