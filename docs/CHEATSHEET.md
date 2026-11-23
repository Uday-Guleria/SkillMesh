# Cheat sheet — SQL ↔ MongoDB ↔ Mongoose

| Idea | SQL | mongosh | Mongoose |
|---|---|---|---|
| Table / row | table, row | collection, document | Model, doc |
| Insert | `INSERT` | `insertOne / insertMany` | `Model.create()` |
| Select | `SELECT * WHERE` | `find(filter)` | `Model.find(filter)` |
| One row | `LIMIT 1` | `findOne` | `findOne / findById` |
| Columns | `SELECT a,b` | `find({}, {a:1,b:1})` | `.select("a b")` |
| Order / page | `ORDER BY … LIMIT` | `.sort().skip().limit()` | same |
| Count | `COUNT(*)` | `countDocuments` | `countDocuments` |
| Update | `UPDATE SET` | `updateOne(f, {$set})` | `updateOne / findOneAndUpdate` |
| Delete | `DELETE` | `deleteOne / deleteMany` | `deleteOne / deleteMany` |
| AND | `a AND b` | `{ a: 1, b: 2 }` | same |
| OR | `a OR b` | `{ $or: [{a:1},{b:2}] }` | same |
| IN | `IN (…)` | `{ a: { $in: [...] } }` | same |
| LIKE | `LIKE '%x%'` | `{ a: /x/i }` | same |
| Distinct | `DISTINCT` | `distinct("a")` | `Model.distinct("a")` |
| GROUP BY | `GROUP BY … HAVING` | `aggregate([{$group}, {$match}])` | `Model.aggregate([...])` |
| JOIN | `JOIN` | `$lookup` | `populate()` |
| Foreign key | `REFERENCES` | store `_id` (not enforced) | `ref: "User"` |
| Unique | `UNIQUE` | `createIndex(..., {unique:true})` | `unique: true` |
| Index | `CREATE INDEX` | `createIndex` | `schema.index()` |
| Explain | `EXPLAIN` | `.explain("executionStats")` | `.explain()` |
| Transaction | `BEGIN…COMMIT` | `session.withTransaction` | same |

## Operators you'll use daily

`$set  $unset  $inc  $push  $addToSet  $pull` · `$eq $ne $gt $gte $lt $lte $in $nin $exists` · `$and $or $not` · `$all $size $elemMatch` · `$match $group $sort $limit $unwind $lookup $project $addFields $count`

## Gotchas

- Ids are `ObjectId`, not strings: `"507f…" !== ObjectId("507f…")` (Mongoose casts in `find`, **not** in `aggregate`).
- Update without operators replaces the document (use `$set`).
- `runValidators: true` is needed for validation on updates.
- A missing field is not `null` in aggregation `$eq`.
- No foreign-key enforcement: *you* delete dangling references.
- Unanchored regex can't use an index.
