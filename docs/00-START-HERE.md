# SkillMesh × MongoDB — learning guide

You asked to learn MongoDB by building this project. The finished project is in `server/` and `client/`. This guide walks you through **rebuilding the backend yourself, one phase at a time**, with the finished code as your answer key.

## How to use it (the method that works)

For every phase:

1. **Read** the concepts (5 min).
2. **Try it in `mongosh`** — type the commands, don't paste. Predict the output first.
3. **Build it** in your own folder (`my-server/`) *without looking* at `server/`. Use the hints.
4. **Check** with the `curl` commands, then **compare** with the file in `server/` and note the differences.
5. Do the **challenge**, then answer the **viva questions** out loud.

## Phase map

| # | File | You learn | You build |
|---|---|---|---|
| 1 | `01-mongodb-basics.md` | documents, CRUD, operators (in mongosh only) | — |
| 2 | `02-schema-design.md` | embed vs reference, designing collections | paper design |
| 3 | `03-connect-and-auth.md` | Mongoose, schemas, validation, unique index | register / login |
| 4 | `04-queries-and-discover.md` | filters, `$or`, regex, arrays, projection, sort, limit | profiles + Discover |
| 5 | `05-indexes.md` | indexes, `explain()`, compound/multikey | index your models |
| 6 | `06-connections-and-teams.md` | upsert-like flows, `$addToSet`, `$pull`, atomic updates, populate | connections + teams |
| 7 | `07-messages-and-aggregation.md` | aggregation pipeline, `$group`, `$lookup`, pagination | chat + stats |
| 8 | `08-matching.md` | computing in app code vs database | match scores |
| 9 | `09-realtime.md` | Socket.io + change of state in DB | live chat, presence |
| 10 | `10-connect-react.md` | the API contract | wire the UI |
| 11 | `11-deploy-and-next.md` | Atlas, backups, security | go live |
| — | `CHEATSHEET.md` | SQL ↔ MongoDB ↔ Mongoose | quick lookup |

Since you already study DBMS, `CHEATSHEET.md` maps every idea to its SQL twin. Skim it first.

## Setup (once)

1. **MongoDB Community Server** (local) from mongodb.com/try/download/community — or a free **Atlas** cluster (cloud). Either works; the code only needs a connection string.
2. **mongosh** (the shell) and **MongoDB Compass** (GUI to see your documents). Compass is the fastest way to *look* at data while you learn.
3. Check it works:
   ```bash
   mongosh            # connects to mongodb://127.0.0.1:27017
   > db.runCommand({ ping: 1 })     // { ok: 1 }
   ```
4. Load practice data:
   ```bash
   mongosh
   > load("server/scripts/playground.js")
   ```

## Rebuild-from-scratch checklist

```text
my-server/
├── package.json          (type: module)   deps: express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv zod socket.io
├── .env                  MONGO_URI, JWT_SECRET, PORT
└── src/
    ├── index.js          connect DB, start HTTP
    ├── app.js            express app + routes
    ├── models/           User, Connection, Team, Message, Notification
    ├── routes/           auth, users, matches, connections, teams, messages, notifications, stats
    ├── middleware/       auth.js (JWT), error.js
    ├── services/         matching.js, notify.js
    └── socket.js
```

Tick a box only when the `curl` check for that phase passes.

- [ ] Phase 3 register/login works, duplicate email → 409
- [ ] Phase 4 `/api/users?q=react` returns 2 people (after `npm run seed` from `server/`, or your own seed)
- [ ] Phase 5 `explain()` shows `IXSCAN`
- [ ] Phase 6 connect → accept; team create/add/remove
- [ ] Phase 7 conversations list + `/api/stats` top skills
- [ ] Phase 8 `/api/matches` sorted by score
- [ ] Phase 9 two browser tabs chat live
- [ ] Phase 10 UI works against your server
