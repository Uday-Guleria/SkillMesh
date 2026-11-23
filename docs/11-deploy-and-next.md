# Phase 11 — Deploy and what to learn next

## MongoDB Atlas (free tier)

1. Create a cluster, a database user, and allow your server's IP (Network Access).
2. Copy the connection string into `MONGO_URI` (`mongodb+srv://user:pass@cluster/skillmesh`). **Never commit it.**
3. Run `npm run seed` once against Atlas if you want demo users.
4. Look at **Atlas → Performance Advisor**: it suggests indexes from real slow queries — a nice demo of Phase 5.

## Server

Host the API on Render/Railway/Fly: set `NODE_ENV=production`, `JWT_SECRET` (long and random), `MONGO_URI`, `CLIENT_ORIGIN` (your UI's URL). Serve the client from Vercel/Netlify with `/api` rewrites to the API, or build the client and serve `client/dist` from Express.

## Hardening checklist

- [ ] `express-rate-limit` on `/api/auth/*`
- [ ] Remove demo bots (`services/demoBots.js`) or keep only when `isDemo`
- [ ] Atlas backups on; least-privilege DB user
- [ ] HTTPS only; consider httpOnly cookies for the token
- [ ] Email verification / password reset

## Next MongoDB topics (in this order)

1. **Transactions** (multi-document, needs a replica set — Atlas has one) — e.g. creating a team + notifications atomically.
2. **Change streams** — push DB changes to clients instead of calling `emit` manually.
3. **TTL indexes** — auto-delete old notifications: `notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60*60*24*30 })`.
4. **Atlas Search / Vector Search** — real semantic matching with embeddings.
5. **Sharding & replication** — read the concepts; know why and when.

## Final viva rehearsal

Be ready to explain, with the project open: your collections and why each field is embedded or referenced; two indexes and the `explain` proof; one aggregation, stage by stage; one atomic update that replaces a race-prone read-then-write; and how a message travels from React → Express → MongoDB → Socket.io → the other browser.
