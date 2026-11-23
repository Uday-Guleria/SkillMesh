# Phase 2 — Schema design: embed or reference?

**Goal:** decide how SkillMesh's data is shaped *before* writing code. This is the most important MongoDB skill.

## The one rule

> **Embed** data that is read together and belongs to one parent. **Reference** (store an `_id`) data that is shared, large, or changes on its own.

| Question | Embed | Reference |
|---|---|---|
| Always shown with the parent? | ✅ | |
| Same data used by many parents? | | ✅ |
| Can grow without limit? (16 MB doc cap) | | ✅ |
| Updated independently? | | ✅ |

## SkillMesh's design

```text
users            ─ profile, skills[], interests[], availability{ days[], hours }  ← EMBEDDED arrays/objects
connections      ─ { from→users, to→users, status }                               ← one doc per pair
teams            ─ { name, goal, owner→users, members[→users] }                   ← members are REFERENCES
messages         ─ { conversation, from→users, to→users, text, readAt }           ← separate collection
notifications    ─ { user→users, title, detail, read }                            ← separate collection
```

**Why these choices** (you will be asked):

- `skills[]` and `availability{}` are **embedded** in `users`: they're part of the profile, always loaded with it, small, and not shared.
- `team.members` are **references**: a user's name/skills change independently, and one user belongs to many teams. Embedding profiles in teams would duplicate data and go stale. We fetch names with `populate()` (Phase 6).
- `messages` are **not** embedded in a conversation/team array: chats grow without bound and would hit the 16 MB limit and make every write rewrite a huge array.
- `connections` is its own collection (not `users.connections[]`) because a request has its own state (`pending/accepted/declined`) and both sides query it.

## Your task (paper, 20 min)

Draw the five collections as boxes with arrows for references. For each arrow write **1:1, 1:N or M:N**:

- user ↔ team → **M:N** (a team has many members, a user is in many teams) — solved by an array of ids on `teams`.
- user ↔ user (connection) → **M:N with data on the relationship** (`status`) — solved with a collection of pairs.

## Conversation key trick

Both sides of a chat must find the same messages. We store `conversation = "<smallerId>:<largerId>"`:

```js
const conversationKey = (a, b) => [String(a), String(b)].sort().join(":");
```

Then one indexed query loads a thread: `find({ conversation }).sort({ createdAt: -1 })`.

## Viva questions

- Give one case where embedding is wrong and one where referencing is wrong.
- MongoDB has no JOIN — how do you fetch a team's member names? (`populate` = a second query; or `$lookup` in an aggregation.)
- What is the maximum BSON document size? (16 MB)
- Why not store `password` plainly — and why `select: false` on the hash field?
