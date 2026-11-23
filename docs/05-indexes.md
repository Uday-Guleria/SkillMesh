# Phase 5 — Indexes and `explain()`

**Goal:** see, with numbers, why indexes matter, and choose the right ones.

## Concepts

- Without an index MongoDB does a **COLLSCAN**: reads every document. With one it does an **IXSCAN** and fetches only matches.
- An index is a sorted structure (B-tree) of field values → document locations. It speeds reads, **slows writes slightly** and uses memory — index what you query.
- **Multikey index**: an index on an array field has one entry per element (`interests`, `skills`).
- **Compound index** `{ a: 1, b: 1 }` serves queries on `a`, or `a` and `b` (left-to-right prefix) and sorts in that order.
- **Unique index** enforces a rule (`email`, and the pair `{ from, to }` for connections).

## See it (real output from this project's data)

```js
use skillmesh
db.users.getIndexes()          // _id_, email_1, role_1, interests_1, skills_1

db.users.find({ interests: "Fintech" }).explain("executionStats")
// winningPlan: FETCH → IXSCAN      totalDocsExamined: 3   nReturned: 3

db.users.find({ interests: "Fintech" }).hint({ $natural: 1 }).explain("executionStats")
// winningPlan: COLLSCAN            totalDocsExamined: 8   nReturned: 3
```

With 8 users the gap is 3 vs 8. With 1,000,000 users it is 3 vs 1,000,000. **Always compare `totalDocsExamined` to `nReturned`** — the closer, the better.

## Where this project uses indexes (and why)

| Index | Collection | Serves |
|---|---|---|
| `email` unique | users | login, duplicate prevention |
| `role`, `interests`, `skills` | users | Discover filters |
| `{ from, to }` unique | connections | "is there already a request?" + one doc per pair |
| `{ to, status }` | connections | incoming requests |
| `{ members, createdAt: -1 }` | teams | "my teams, newest first" |
| `{ conversation, createdAt: -1 }` | messages | load a chat thread newest-first |
| `{ to, readAt }` | messages | unread counters |
| `{ user, createdAt: -1 }` | notifications | notification list |

## Build

Add each `schema.index(...)` line in your models. Indexes are created when the app starts (`autoIndex`). In tests, wait for them with `await Model.init()`.

## Challenge

1. In mongosh, create an index `{ "availability.hours": 1 }`, run `explain` on a Weekends query, then drop it with `db.users.dropIndex("availability.hours_1")`.
2. Why is `{ conversation: 1, createdAt: -1 }` better than two separate indexes? (one index answers filter *and* sort — no in-memory sort)
3. Would an index on `bio` help the regex search `/react/i`? (No: an unanchored, case-insensitive regex can't use a normal index.)

## Viva questions

- What does `explain("executionStats")` tell you?
- Cost of too many indexes?
- Order of fields in a compound index — does it matter?
