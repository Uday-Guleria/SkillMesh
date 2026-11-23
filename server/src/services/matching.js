// Explainable match score = weighted rules (80 pts) + TF-IDF text similarity (20 pts).
export const WEIGHTS = { skills: 30, interests: 25, availability: 15, role: 10, similarity: 20 };

const STOP = new Set("a an and the of to in for on with is are i my me we our you your it that this as at by be from or loves love always building builds".split(" "));

const tokenize = (text) =>
  text.toLowerCase().split(/[^a-z0-9+#]+/).filter((t) => t.length > 1 && !STOP.has(t));

// Skills and interests are repeated so they matter more than free-text bio words.
const documentOf = (u) =>
  [...(u.skills || []).flatMap((s) => [s, s, s]), ...(u.interests || []).flatMap((s) => [s, s]), u.role || "", u.bio || ""].join(" ");

function buildVectors(docs) {
  const tokenized = docs.map(tokenize);
  const df = new Map();
  tokenized.forEach((tokens) => new Set(tokens).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  return tokenized.map((tokens) => {
    const tf = new Map();
    tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    const vec = new Map();
    tf.forEach((count, t) => vec.set(t, (count / tokens.length) * (Math.log((N + 1) / (df.get(t) + 1)) + 1)));
    return vec;
  });
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  a.forEach((v, k) => { na += v * v; if (b.has(k)) dot += v * b.get(k); });
  b.forEach((v) => { nb += v * v; });
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

const lower = (arr = []) => arr.map((x) => x.toLowerCase());
const overlapRatio = (a, b) => {
  const setB = new Set(lower(b));
  const shared = lower(a).filter((x) => setB.has(x)).length;
  return shared / Math.max(1, Math.min(a.length, b.length));
};

/** me: lean user, others: lean users -> Map(userId -> { score, breakdown }) */
export function scoreMatches(me, others) {
  const vectors = buildVectors([documentOf(me), ...others.map(documentOf)]);
  const result = new Map();
  others.forEach((o, i) => {
    const sim = Math.min(1, cosine(vectors[0], vectors[i + 1]) / 0.5); // 0.5 cosine ≈ "very similar"
    const flexible = me.availability?.hours === "Flexible" || o.availability?.hours === "Flexible";
    const parts = {
      skills: WEIGHTS.skills * Math.min(1, overlapRatio(me.skills, o.skills)),
      interests: WEIGHTS.interests * Math.min(1, overlapRatio(me.interests, o.interests)),
      availability: WEIGHTS.availability * (flexible || me.availability?.hours === o.availability?.hours ? 1 : 0),
      role: WEIGHTS.role * (me.role !== o.role ? 1 : 0), // different roles = complementary
      similarity: WEIGHTS.similarity * sim,
    };
    const total = Object.values(parts).reduce((s, n) => s + n, 0);
    result.set(String(o._id), {
      score: Math.max(1, Math.min(99, Math.round(total))),
      breakdown: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Math.round(v)])),
    });
  });
  return result;
}
