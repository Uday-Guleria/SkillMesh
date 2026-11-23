# Phase 4 — Profiles and the Discover page (queries)

**Goal:** `GET /api/users?q=react&role=…&interest=…` and `PUT /api/users/me`.

## Concepts

- Build a **filter object** step by step; MongoDB treats multiple keys as AND.
- `$ne` (not equal), `$in`, `$or`, regex, array membership.
- `.sort()`, `.limit()`, `.lean()` (plain JS objects: faster, no document methods).
- `distinct()` for dropdown values.
- **Never put raw user input into a regex.** Escape it, or a user can send `.*` / catastrophic patterns.

## Try in mongosh first

```js
use skillmesh_playground
const filter = { name: { $ne: "Aarav Mehta" }, interests: "Hackathons" }          // exclude myself + filter
db.people.find({ ...filter, $or: [{ name: /rea/i }, { skills: /rea/i }] })          // search = OR of regexes
db.people.distinct("role")                                                          // roles dropdown
```

Predict first, then run it: which two people match `skills: /rea/i`? (Hint: it's a substring of one well-known framework.)

## Build

`routes/users.js` (answer key: `server/src/routes/users.js`)

```js
router.get("/", async (req, res) => {
  const { q, role, interest } = req.query;
  const filter = { _id: { $ne: req.user._id } };            // never list myself
  if (role) filter.role = String(role);
  if (interest) filter.interests = String(interest);        // "array contains"
  if (q) {
    const rx = new RegExp(escapeRegex(String(q).slice(0, 50)), "i");
    filter.$or = [{ name: rx }, { role: rx }, { bio: rx }, { skills: rx }, { interests: rx }];
  }
  const users = await User.find(filter).sort({ name: 1 }).limit(60).lean();
  res.json({ users: users.map(serializeUser) });
});
```

Updating the profile — **only `$set` what the client sent**, and make Mongoose validate:

```js
const user = await User.findByIdAndUpdate(req.user._id, { $set }, { new: true, runValidators: true });
```

`new: true` returns the *updated* document; `runValidators` is **off by default** for update operations, which surprises everyone once.

Nested fields in `$set` use dot paths: `{ "availability.hours": "Weekends" }`.

## Check

```bash
TOKEN=...   # from login
curl -s "localhost:5000/api/users?q=react"            -H "Authorization: Bearer $TOKEN"   # Aarav, Ananya
curl -s "localhost:5000/api/users?interest=Fintech"   -H "Authorization: Bearer $TOKEN"   # 3 people
```

## Challenge

Replace the regex search with a **text index**: `userSchema.index({ name: "text", bio: "text", skills: "text" })` and query `{ $text: { $search: "react" } }` sorted by `{ score: { $meta: "textScore" } }`. What do you lose? (partial-word matching: "rea" no longer finds "React".) When would you still choose it? (large data, ranked results, language stemming)

## Viva questions

- Why `lean()`? Why `limit(60)`?
- What is the difference between `$or` at the top level and two keys in the same filter?
- Why `runValidators: true` on updates?
