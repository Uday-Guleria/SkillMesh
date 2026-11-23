# Phase 6 — Connections and teams (atomic updates, references)

**Goal:** connection requests with a clean state machine, and teams with member arrays.

## Concepts

- **Atomic single-document updates**: `findOneAndUpdate(filter, update)` checks and changes in one step. Put your business rules in the **filter** and two users can't race.
- Array operators: `$addToSet` (add if absent), `$pull` (remove), `$push`.
- **References + `populate()`**: store ids, then ask Mongoose to fetch the referenced documents (it runs a second query and stitches the result).
- A **compound unique index** `{ from: 1, to: 1 }` guarantees one request per direction.

## Connection flow (state machine)

```text
none ──POST──▶ pending ──PATCH accepted──▶ accepted
                  └─────PATCH declined──▶ declined ──(connect again)──▶ pending
```

Accept as the *recipient only*, and only while pending — encoded in the filter:

```js
const conn = await Connection.findOneAndUpdate(
  { _id: req.params.id, to: req.user._id, status: "pending" },
  { $set: { status } },
  { new: true }
);
if (!conn) throw new HttpError(404, "No pending request found");
```

If the filter doesn't match (wrong person, already answered) nothing changes. No separate "check then update" code that could race.

## Look at the data

```js
use skillmesh
db.connections.find().pretty()
db.connections.getIndexes()
db.connections.insertOne({ from: ObjectId("…same…"), to: ObjectId("…same…") })   // → E11000 duplicate key
```

## Teams

```js
// my teams: "members contains my id"  (uses the { members, createdAt } index)
Team.find({ members: me }).sort({ createdAt: -1 }).populate("members", "name role color")

// owner adds a member — ownership check + dedupe in ONE update
Team.findOneAndUpdate({ _id, owner: me }, { $addToSet: { members: userId } }, { new: true })

// leave / remove
Team.updateOne({ _id }, { $pull: { members: userId } })
```

`populate("members", "name role color")` = "replace each id by that user, selecting only those fields" (projection again).

## Try the raw versions in mongosh

```js
db.teams.find({ members: ObjectId("<an id>") })
db.teams.updateOne({ name: "Project Orbit" }, { $addToSet: { members: ObjectId("<id>") } })   // run twice: no duplicate
db.teams.updateOne({ name: "Project Orbit" }, { $pull: { members: ObjectId("<id>") } })
db.teams.aggregate([{ $lookup: { from: "users", localField: "members", foreignField: "_id", as: "people" } }])   // join, previewed
```

## Check

```bash
curl -s -X POST localhost:5000/api/teams -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Orbit","goal":"Build it"}'
```

## Challenge

Add `PATCH /api/teams/:id` (owner only) to rename the team or change `status`. Use `findOneAndUpdate` with `{ _id, owner: me }` in the filter, so non-owners get a 403/404 without extra code.

## Viva questions

- Why put `to: req.user._id` in the filter instead of loading the document and `if`-checking?
- What does `populate` really do under the hood? Is it a JOIN?
- `$addToSet` vs `$push` for members?
