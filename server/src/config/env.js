import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillmesh",
  JWT_SECRET: process.env.JWT_SECRET || "dev-only-secret-change-me",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  DEMO_BOT_DELAY_MS: Number(process.env.DEMO_BOT_DELAY_MS ?? 1800),
  isProd: process.env.NODE_ENV === "production",
};

if (env.isProd && env.JWT_SECRET === "dev-only-secret-change-me") {
  throw new Error("Set JWT_SECRET in production");
}
