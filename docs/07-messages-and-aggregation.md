# Phase 7 — Messages, pagination and the aggregation pipeline

**Goal:** chat history, the conversation list with unread counts, and dashboard stats.

## Concepts

- **Aggregation pipeline** = a list of stages; each takes the previous stage's output: `$match → $sort → $group → $lookup → $unwind → $project`. It is MongoDB's GROUP BY / JOIN / HAVING.
- `$$ROOT` = the whole current document; `$first` after a sort = "the latest one".
- **Cursor pagination**: `createdAt < lastSeen` + `limit` is stable and index-friendly; `skip(n)` gets slower as `n` grows.
- In aggregation, **Mongoose does not cast ids for you** — pass real `ObjectId`s (our `req.user._id` already is one).

## Try in mongosh: count people per interest

```js
use skillmesh_playground
db.people.aggregate([
  { $unwind: "$interests" },                              // one doc per (person, interest)
  { $group: { _id: "$interests", people: { $sum: 1 } } }, // GROUP BY interest
  { $sort: { people: -1, _id: 1 } }
])
// Hackathons 5, Startups 5, AI/ML 4, Fintech 3, Social Impact 3, Design 2, Research 2
```

Run it stage by stage (comment out later stages) to *see* what each one outputs. That is the best way to learn pipelines.

## The conversation list (read it slowly — this is the hardest query in the project)

`server/src/routes/messages.js`

```js
Message.aggregate([
  { $match: { $or: [{ from: me }, { to: me }] } },                    // my messages only
  { $sort: { createdAt: -1 } },                                        // newest first
  { $group: {
      _id: "$conversation",                                            // one row per chat
      last: { $first: "$$ROOT" },                                      // the newest message
      unread: { $sum: { $cond: [{ $and: [{ $eq: ["$to", me] }, { $eq: ["$readAt", null] }] }, 1, 0] } },
  } },
  { $sort: { "last.createdAt": -1 } },                                 // most recent chat on top
  { $addFields: { otherId: { $cond: [{ $eq: ["$last.from", me] }, "$last.to", "$last.from"] } } },
  { $lookup: { from: "users", localField: "otherId", foreignField: "_id", as: "other" } },   // JOIN
  { $unwind: "$other" },
])
```

`unread` counts messages sent *to me* whose `readAt` is `null`. That works because the schema stores `readAt: null` explicitly — a missing field is **not** equal to `null` inside `$eq`.

## Thread + marking as read

```js
const page = await Message.find({ conversation, createdAt: { $lt: before } })
  .sort({ createdAt: -1 }).limit(50).lean();           // newest 50, uses the compound index
await Message.updateMany({ conversation, to: me, readAt: null }, { $set: { readAt: new Date() } });
res.json({ messages: page.reverse() });                // show oldest → newest
```

## Dashboard "trending skills" (`routes/stats.js`)

```js
User.aggregate([
  { $unwind: "$skills" },
  { $group: { _id: { $toLower: "$skills" }, name: { $first: "$skills" }, count: { $sum: 1 } } },
  { $sort: { count: -1, _id: 1 } },
  { $limit: 5 },
])
// Python 2, React 2, Research 2 …
```

`Promise.all([...])` runs the counters and the aggregation **in parallel**.

## Check

```bash
curl -s localhost:5000/api/messages/conversations -H "Authorization: Bearer $TOKEN"
curl -s localhost:5000/api/stats -H "Authorization: Bearer $TOKEN"
```

## Challenge

1. Add `GET /api/stats/teams` returning, per team, the number of members and the most common role among them (`$lookup` + `$unwind` + `$group` twice).
2. Return the unread total with a single aggregation instead of `countDocuments`. Which is clearer?

## Viva questions

- Difference between `$match` before vs after `$group`? (before = filters input and can use indexes)
- When would you embed messages instead? (tiny, bounded conversations)
- `$lookup` vs `populate` — which runs inside the database?
