# Phase 9 — Real-time with Socket.io

**Goal:** messages and notifications appear instantly; online/offline status follows connections.

## Concepts

- HTTP is request/response. A **WebSocket** keeps one connection open so the *server* can push.
- **Rooms**: each user joins `user:<id>`. `io.to("user:123").emit(...)` reaches all of that user's tabs.
- **The database is still the source of truth.** Pattern: *write to MongoDB first, then emit.* If the user was offline they get it from the DB next time.
- Authenticate the socket with the same JWT (handshake `auth.token`).

## Build

1. `src/socket.js`: create `new Server(httpServer)`, add `io.use(...)` that verifies the token and sets `socket.userId`, then `socket.join("user:" + id)`.
2. Export `emitToUser(userId, event, payload)`.
3. In `POST /api/messages/:userId`, after `Message.create`: `emitToUser(recipient, "message:new", msg)` (and to yourself, so a second tab updates).
4. `services/notify.js`: `Notification.create(...)` then `emitToUser(user, "notification:new", n)`.

## Presence (online/offline) — a tiny MongoDB update

```js
// first tab opens → online;  last tab closes → offline
User.updateOne({ _id: id, isDemo: false }, { $set: { online: true } })
User.updateOne({ _id: id, isDemo: false }, { $set: { online: false, lastSeenAt: new Date() } })
```

A `Map<userId, openTabs>` counts tabs so closing one tab doesn't mark you offline.

## Try it

```bash
# terminal 1: API   terminal 2: UI
# open the app in two different browsers, log in as two users, connect, then chat.
```

In `mongosh`: `db.users.find({ online: true }, { name: 1 })` changes as you open/close tabs.

## Challenge

Add a "typing…" indicator: client emits `typing` with `{ to }`; server forwards `typing` to `user:<to>`; no database involved. Why not store it?

## Viva questions

- Why not rely on sockets alone and skip the database write?
- What happens to a message sent while the other user is offline?
- How would you scale to 2 servers? (Redis adapter so rooms span processes)
