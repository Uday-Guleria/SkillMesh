// One place that decides what the API exposes. Works for lean objects and documents.
export const initialsOf = (name = "") =>
  name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();

export function serializeUser(u, { withEmail = false } = {}) {
  const o = typeof u.toObject === "function" ? u.toObject() : u;
  return {
    id: String(o._id),
    name: o.name,
    ...(withEmail ? { email: o.email } : {}),
    role: o.role,
    bio: o.bio,
    skills: o.skills || [],
    interests: o.interests || [],
    availability: { days: o.availability?.days || [], hours: o.availability?.hours || "Flexible" },
    github: o.github || "",
    portfolio: o.portfolio || "",
    color: o.color,
    initials: initialsOf(o.name),
    online: !!o.online,
  };
}

export const serializeNotification = (n) => ({
  id: String(n._id), type: n.type, icon: n.icon, title: n.title, detail: n.detail,
  read: n.read, createdAt: n.createdAt,
});

export const serializeMessage = (m) => ({
  id: String(m._id), from: String(m.from), to: String(m.to), text: m.text,
  readAt: m.readAt, createdAt: m.createdAt,
});

export const serializeTeam = (t) => ({
  id: String(t._id), name: t.name, goal: t.goal, status: t.status,
  owner: String(t.owner?._id || t.owner), createdAt: t.createdAt,
  members: (t.members || []).map((m) => (m.name ? serializeUser(m) : { id: String(m) })),
});
