# Phase 8 — Matching: what belongs in the database, what in code

**Goal:** `GET /api/matches` returns everyone ranked with an explainable score.

## Concepts

- A database is great at *filtering and aggregating*. Scoring that mixes several rules and text math is easier to write, test and explain **in application code** — so we fetch candidates with one query and compute in Node.
- **TF-IDF**: a word is important in a document if it appears often there (TF) but in few other documents (IDF). Each profile becomes a vector of weighted words.
- **Cosine similarity**: the angle between two vectors → 0 (nothing shared) … 1 (identical direction).

## The score (`server/src/services/matching.js`)

| Part | Points | How |
|---|---|---|
| Skill overlap | 30 | shared skills ÷ min(my skills, their skills) |
| Shared interests | 25 | same idea on interests |
| Availability | 15 | same hours, or either is *Flexible* |
| Role complement | 10 | different role → good team balance |
| Profile similarity | 20 | cosine of TF-IDF vectors (skills ×3, interests ×2, role, bio) |

Total is clamped to 1–99 and the **breakdown** is returned, so the UI (and your viva) can *explain* every number.

## Build it in three steps

1. **Rule score** — implement `overlapRatio(a, b)`; unit-test with tiny arrays.
2. **TF-IDF** — tokenise (lowercase, split on non-letters, drop stop-words), count term frequency per profile, compute `idf = ln((N+1)/(df+1)) + 1`.
3. **Cosine** — `dot(a,b) / (|a|·|b|)`.

The route is then only:

```js
const me = await User.findById(req.user._id).lean();
const others = await User.find({ _id: { $ne: me._id } }).lean();   // ONE query
const scores = scoreMatches(me, others);                            // pure function, no DB
```

Because `scoreMatches` is a pure function you can test it without MongoDB.

## Check

```bash
curl -s localhost:5000/api/matches -H "Authorization: Bearer $TOKEN" | head -c 600
# each match has: score, breakdown { skills, interests, availability, role, similarity }
```

## Challenge

1. Penalise a candidate you are already connected to (use `connectionStatus`) — or hide them.
2. Add a `weights` query param so users can prefer "skills" over "availability".
3. Scale-up thought: with 1M users you can't load everyone. Pre-filter with `{ interests: { $in: myInterests } }` (uses the multikey index) and score only the top few thousand.

## Viva questions

- Is this "AI"? (It is information retrieval / content-based filtering — be precise, don't oversell.)
- Why compute in Node rather than in an aggregation? Trade-offs?
- Cold start: what does a brand-new user with empty skills get?
