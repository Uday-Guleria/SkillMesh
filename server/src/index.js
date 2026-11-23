import http from "node:http";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { initSocket } from "./socket.js";
import User from "./models/User.js";

await connectDB();
if (!(await User.exists({ isDemo: true }))) {
  console.log("Tip: run `npm run seed` to add demo users to discover and chat with.");
}
const server = http.createServer(createApp());
initSocket(server);
server.listen(env.PORT, () => console.log(`API listening on http://localhost:${env.PORT}`));
