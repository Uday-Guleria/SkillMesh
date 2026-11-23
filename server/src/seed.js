import bcrypt from "bcryptjs";
import { pathToFileURL } from "node:url";
import { connectDB, disconnectDB } from "./config/db.js";
import User from "./models/User.js";
import { DEMO_PASSWORD, demoEmail, demoUsers } from "./data/demoUsers.js";

export async function seedDemoUsers() {
  await User.deleteMany({ isDemo: true });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const docs = demoUsers.map(({ hours, days, ...u }) => ({
    ...u, email: demoEmail(u.name), passwordHash, isDemo: true, availability: { hours, days },
  }));
  await User.insertMany(docs);
  return docs.length;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await connectDB();
  console.log(`Seeded ${await seedDemoUsers()} demo users (password: ${DEMO_PASSWORD})`);
  await disconnectDB();
}
