# Phase 3 — Connect Node to MongoDB, models, register/login

**Goal:** `POST /api/auth/register` and `/login` working with hashed passwords and a unique email.

## Concepts

- **Mongoose** = a schema + validation layer on top of the official driver. A *Schema* describes fields; a *Model* gives you `find/create/update`.
- `required`, `minlength`, `enum`, `default`, `trim`, `lowercase` are validators/setters.
- A **unique index** (`unique: true`) is enforced by MongoDB itself: two simultaneous registrations cannot both win. A duplicate throws error code **11000**.
- `select: false` hides a field unless you ask `.select("+passwordHash")`.

## Build

1. `npm init -y`, set `"type": "module"`, install `express mongoose bcryptjs jsonwebtoken dotenv cors helmet zod`.
2. **`src/config/db.js`**
   ```js
   import mongoose from "mongoose";
   export const connectDB = (uri) => mongoose.connect(uri);
   ```
3. **`src/models/User.js`** — start small, grow later (compare: `server/src/models/User.js`)
   ```js
   const userSchema = new mongoose.Schema({
     name:  { type: String, required: true, trim: true, minlength: 2 },
     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
     passwordHash: { type: String, required: true, select: false },
     skills: { type: [String], default: [] },
   }, { timestamps: true });          // adds createdAt / updatedAt
   export default mongoose.model("User", userSchema);
   ```
4. **`routes/auth.js`** — register: validate → check duplicate → `bcrypt.hash(password, 10)` → `User.create` → `jwt.sign({ sub: user._id }, secret, { expiresIn: "7d" })`.
   login: `User.findOne({ email }).select("+passwordHash")` → `bcrypt.compare` → token. **Same error message** for "no such user" and "wrong password".
5. **`middleware/auth.js`** — read `Authorization: Bearer <token>`, `jwt.verify`, `User.findById(sub)`, put it on `req.user`.

## Look at what MongoDB stored

```js
// mongosh
use skillmesh
db.users.findOne({ email: "n@test.com" })      // passwordHash is a bcrypt string, never the password
db.users.getIndexes()                          // see email_1 with unique: true
```

## Check

```bash
curl -s -X POST localhost:5000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Nandini","email":"n@test.com","password":"secret1"}'
# run it twice: second time → 409
```

## Challenge

Add `lastLoginAt` and update it with `User.updateOne({ _id }, { $set: { lastLoginAt: new Date() } })` on every login. Why `updateOne` and not `findById` + `save()`? (One round trip, atomic, no race.)

## Viva questions

- Where does the duplicate-email protection really live — in your JS check or in MongoDB? (Both; the index is the guarantee.)
- Why bcrypt and not SHA-256? (slow on purpose + built-in salt)
- What is inside a JWT, and why can't a user edit it? (signed payload; changes break the signature)
