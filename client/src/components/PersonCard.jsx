import { useEffect, useState } from "react";
import { api } from "../api";
import { useApp } from "../store";
import Avatar from "./Avatar";

const LABEL = { none: "Connect ↗", pending_sent: "Requested", pending_received: "Accept ↗", connected: "Message ↗" };

export default function PersonCard({ p, score = false }) {
  const { toast, setPage, setChatWith, bump, refreshStats } = useApp();
  const [status, setStatus] = useState(p.connectionStatus);
  useEffect(() => setStatus(p.connectionStatus), [p.connectionStatus]);

  const act = async () => {
    try {
      if (status === "connected") { setChatWith(p.id); setPage("messages"); }
      else if (status === "pending_received") {
        await api.patch(`/connections/${p.connectionId}`, { status: "accepted" });
        setStatus("connected"); toast(`You're now connected with ${p.name}`); bump(); refreshStats();
      } else if (status === "none") {
        await api.post("/connections", { to: p.id });
        setStatus("pending_sent"); toast(`Connection request sent to ${p.name}`);
      }
    } catch (e) { toast(e.message); }
  };

  return (
    <article className="person-card">
      <div className="person-top">
        <Avatar p={p} />
        <div><h3>{p.name}</h3><div className="role">{p.role}</div></div>
      </div>
      <p className="bio">{p.bio}</p>
      <div className="skill-tags">
        {p.skills.slice(0, 4).map((s, i) => <span key={s} className={`tag ${i === 0 ? "red" : ""}`}>{s}</span>)}
      </div>
      <div className="card-foot">
        <span className={p.online ? "online-status" : ""}>
          {p.online ? "● Online" : "○ Offline"} {score && <> · <b>{p.score}% fit</b></>}
        </span>
        <button className="btn btn-soft" onClick={act} disabled={status === "pending_sent"}>{LABEL[status] || LABEL.none}</button>
      </div>
    </article>
  );
}
