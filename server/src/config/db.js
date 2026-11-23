import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(uri = env.MONGO_URI) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export const disconnectDB = () => mongoose.disconnect();
