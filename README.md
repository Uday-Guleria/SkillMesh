# SkillMesh — full-stack (React + Express + MongoDB)

An AI-assisted team-formation platform: discover people, get explainable match scores, connect, form teams and chat in real time.

```text
skillmesh-fullstack/
├── client/    React (Vite) UI — talks to the API through fetch + Socket.io
├── server/    Express + Mongoose + Socket.io API, seed data, tests
└── docs/      Step-by-step MongoDB learning guide (start with docs/00-START-HERE.md)
```

## Quick start

You need Node 20+ and a MongoDB (local Community Server, or a free Atlas cluster).

```bash
# 1. API
cd server
npm install
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
npm run seed                # 8 demo users, password: demo12345
npm run dev                 # http://localhost:5000

# 2. UI (second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Sign up, or log in as `aarav@demo.skillmesh.dev` / `demo12345`. Connect to a demo user: they auto-accept after ~2 s and reply to your messages, so you can try everything alone.

## What's implemented

| Area | Details |
|---|---|
| Auth | Register/login, bcrypt-hashed passwords, JWT (7 days), protected routes + sockets |
| Profiles | Skills, interests, availability, links; validated with zod |
| Discover | Server-side search (name/role/bio/skills/interests), role + interest filters |
| Matching | Explainable score: skills 30 + interests 25 + availability 15 + role complement 10 + TF-IDF/cosine text similarity 20 |
| Connections | Request / accept / decline, one document per pair (unique compound index) |
| Teams | Create, owner-only invites (`$addToSet`), leave/remove (`$pull`) |
| Chat | Real-time via Socket.io, unread counts, read receipts, cursor pagination |
| Notifications | Persisted + pushed live |
| Dashboard | Counters + "trending skills" aggregation |

## Tests

```bash
cd server && npm test      # 8 end-to-end tests against a real MongoDB (uses db skillmesh_test)
```

## API summary

`POST /api/auth/register|login` · `GET /api/auth/me` · `GET /api/users[?q&role&interest]` · `GET /api/users/meta` · `PUT /api/users/me` · `GET /api/matches` · `POST /api/connections` · `PATCH /api/connections/:id` · `GET|POST /api/teams` · `GET /api/teams/:id` · `POST /api/teams/:id/members` · `DELETE /api/teams/:id/members/:userId` · `GET /api/messages/conversations` · `GET|POST /api/messages/:userId` · `GET /api/notifications` · `PATCH /api/notifications/read` · `GET /api/stats`

## Limits of this demo (be honest in your viva)

- "AI" here is classical information retrieval (TF-IDF + cosine similarity), not a trained model.
- No rate limiting, email verification or password reset yet.
- Demo users are scripted bots (auto-accept + canned replies) so a single person can try the app.
