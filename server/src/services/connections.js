import Connection from "../models/Connection.js";

/** Adds connectionStatus + connectionId to serialized users, in ONE query for all of them. */
export async function withConnectionStatus(meId, users) {
  const ids = users.map((u) => u.id);
  const docs = await Connection.find({
    $or: [{ from: meId, to: { $in: ids } }, { to: meId, from: { $in: ids } }],
  }).lean();

  const byOther = new Map();
  for (const c of docs) {
    const iSent = String(c.from) === String(meId);
    byOther.set(String(iSent ? c.to : c.from), { c, iSent });
  }
  return users.map((u) => {
    const hit = byOther.get(u.id);
    if (!hit || hit.c.status === "declined") return { ...u, connectionStatus: "none" };
    const status = hit.c.status === "accepted" ? "connected" : hit.iSent ? "pending_sent" : "pending_received";
    return { ...u, connectionStatus: status, connectionId: String(hit.c._id) };
  });
}
