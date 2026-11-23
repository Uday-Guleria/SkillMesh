# Phase 1 — MongoDB basics (mongosh only)

**Goal:** be comfortable creating, reading, changing and deleting documents before any Node code.

## Concepts

- A **database** holds **collections**; a collection holds **documents** (BSON, like JSON with more types).
- Every document has an `_id` (an **ObjectId** unless you set one). It is unique per collection.
- Collections are **schema-less**: two documents can have different fields. (We add structure back later with Mongoose.)
- Arrays and nested objects are first-class: `skills: ["React", "Node.js"]`, `availability: { hours: "Weekends", days: [...] }`.

## Setup

```js
load("server/scripts/playground.js")
use skillmesh_playground
db.people.countDocuments()          // 8
db.people.findOne()                 // look at one whole document
```

## Create

```js
db.people.insertOne({ name: "Test User", role: "Tester", skills: ["QA"], interests: [] })
db.people.insertMany([{ name: "A" }, { name: "B" }])   // note: no schema stops you
```

## Read — answer these yourself first

```js
db.people.find({ role: "Data Analyst" })                       // equality
db.people.find({ interests: "Fintech" })                       // array contains
db.people.find({ "availability.hours": "Weekends" })           // dot notation = nested field
db.people.find({ skills: { $in: ["React", "Python"] } })       // any of
db.people.find({ $or: [{ role: /design/i }, { bio: /data/i }] }) // OR + regex
db.people.find({ interests: { $all: ["AI/ML", "Hackathons"] } }) // contains ALL
db.people.find({ name: /^a/i }, { name: 1, role: 1, _id: 0 })  // projection: choose fields
db.people.find().sort({ name: 1 }).skip(2).limit(3)            // sort + paging
db.people.countDocuments({ interests: "Fintech" })             // 3
db.people.distinct("role")                                     // unique values
```

**Check yourself** (after `insertOne/insertMany` above, delete the extras with `db.people.deleteMany({ role: { $exists: false } })` and `db.people.deleteOne({ name: "Test User" })`):

| Query | Expected |
|---|---|
| `interests: "Fintech"` | 3 people (Meera, Rohan, Dev) |
| `interests: "Hackathons"` | 5 people |
| `skills: "React"` | Aarav, Ananya |
| `"availability.hours": "Weekends"` | 3 people |

## Update

```js
db.people.updateOne({ name: "Aarav Mehta" }, { $set: { role: "Senior Full-stack Developer" } })
db.people.updateOne({ name: "Aarav Mehta" }, { $push: { skills: "MongoDB" } })        // append (duplicates allowed)
db.people.updateOne({ name: "Aarav Mehta" }, { $addToSet: { skills: "MongoDB" } })   // append only if missing
db.people.updateOne({ name: "Aarav Mehta" }, { $pull: { skills: "MongoDB" } })       // remove from array
db.people.updateMany({}, { $set: { reputation: 70 } })
db.people.updateOne({ name: "Aarav Mehta" }, { $inc: { reputation: 5 } })            // atomic +5
db.people.updateOne({ name: "Nobody" }, { $set: { role: "X" } }, { upsert: true })  // insert if not found
```

> **Why operators like `$set`?** A plain `{ role: "X" }` as the update would *replace the whole document*. Operators change only what you name, atomically.

## Delete

```js
db.people.deleteOne({ name: "Nobody" })
db.people.deleteMany({ reputation: { $exists: true } })
```

## Challenge

1. Find everyone whose skills include `Python` **and** who is available `Evenings` or `Flexible`.
2. Add the skill `"Teamwork"` to *every* person without creating duplicates.
3. List only names of people with 4 skills, sorted Z→A.

## Viva questions

- What is the difference between `$push` and `$addToSet`?
- Why is `find({ interests: "Fintech" })` valid when `interests` is an array?
- What happens if you run `updateOne(filter, { role: "X" })` without `$set`? (Mongosh rejects it, but older drivers replaced the document.)
- What is an ObjectId made of? (timestamp + random + counter, 12 bytes)
