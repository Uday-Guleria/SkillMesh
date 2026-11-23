import { api } from "../api";
import { useApp } from "../store";
import { useAsync } from "../useAsync";
import Avatar from "../components/Avatar";
import Status from "../components/Status";
import { timeAgo } from "../utils/helpers";

export default function Dashboard() {
  const { stats, notifications, setPage, setModal, version } = useApp();
  const matches = useAsync(() => api.get("/matches"), [version]);
  const top = (matches.data?.matches || []).slice(0, 4);
  const s = stats || {};
  const cards = [
    ["Potential matches", "✳", s.potentialMatches ?? "–", "profiles in your network"],
    ["Active teams", "◇", s.teams ?? "–", "projects you're part of"],
    ["Your skills", "◎", s.skills ?? "–", "keep your profile updated"],
    ["Reputation", "☆", s.reputation ?? "–", "builder score"],
  ];
  const maxSkill = Math.max(1, ...(s.topSkills || []).map((x) => x.count));

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">THE FUTURE IS COLLABORATIVE</div>
          <h1>Find your people.<br /><em>Build something great.</em></h1>
          <p>Meet the people who complement your skills, share your ambition, and help turn your next big idea into reality.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => setPage("matches")}>Find my team <span>↗</span></button>
            <button className="btn btn-outline" onClick={() => setPage("discover")}>Explore talent</button>
          </div>
        </div>
        <div className="hero-art">
          <div className="orbit">
            <span className="orbit-core">✳</span>
            <span className="orbit-person p1">AM</span><span className="orbit-person p2">IK</span>
            <span className="orbit-person p3">KS</span><span className="orbit-person p4">N</span>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        {cards.map(([label, icon, value, note]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">{label} <span className="stat-icon">{icon}</span></div>
            <div className="stat-value">{value}</div>
            <div className="stat-note">↑ <span>{note}</span></div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div><h3>People you should meet</h3><p>Matched to your skills and interests</p></div>
            <button className="text-link" onClick={() => setPage("matches")}>View all ↗</button>
          </div>
          <Status loading={matches.loading} error={matches.error}>
            {top.map((x) => <MatchRow key={x.id} p={x} />)}
          </Status>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><h3>Recent activity</h3><p>Your community at a glance</p></div>
            <span className="tiny-pill">LIVE FEED</span>
          </div>
          {notifications.slice(0, 4).map((a) => (
            <div className="activity-item" key={a.id}>
              <span className="activity-icon">{a.icon}</span>
              <div><strong>{a.title}</strong><p>{a.detail}</p><time>{timeAgo(a.createdAt)}</time></div>
            </div>
          ))}
          {!notifications.length && <div className="empty-state">Nothing yet — connect with someone!</div>}
        </section>
      </div>

      {s.topSkills?.length > 0 && (
        <section className="panel" style={{ marginTop: 22 }}>
          <div className="panel-head">
            <div><h3>Trending skills</h3><p>Most common skills across SkillMesh members</p></div>
            <span className="tiny-pill">TOP {s.topSkills.length}</span>
          </div>
          {s.topSkills.map((k, i) => (
            <div className="skill-row" key={k.name}>
              <div className="skill-row-head"><strong>{k.name}</strong><span>{k.count} {k.count === 1 ? "member" : "members"}</span></div>
              <div className={`progress ${i % 3 === 1 ? "red" : ""}`}><span style={{ width: `${(k.count / maxSkill) * 100}%` }}></span></div>
            </div>
          ))}
        </section>
      )}

      <div className="section-row">
        <h2>Make something happen</h2>
        <button className="text-link" onClick={() => setPage("profile")}>Complete profile ↗</button>
      </div>
      <div className="quick-actions">
        <button className="quick-card" onClick={() => setPage("discover")}><span className="quick-icon">⌕</span><strong>Meet new talent</strong><p>Discover people with skills that complement yours.</p></button>
        <button className="quick-card" onClick={() => setModal({ type: "create-team" })}><span className="quick-icon">◇</span><strong>Start a project team</strong><p>Give your idea a name and invite your first teammates.</p></button>
        <button className="quick-card" onClick={() => setPage("portfolio")}><span className="quick-icon">↗</span><strong>Build your portfolio</strong><p>Turn your profile into a shareable builder story.</p></button>
      </div>
    </>
  );
}

function MatchRow({ p }) {
  // Reuse PersonCard's connect logic in compact form
  return (
    <div className="match-row">
      <Avatar p={p} />
      <div className="person-meta"><strong>{p.name}</strong><small>{p.role}</small></div>
      <div className="match-score">{p.score}%<small>match</small></div>
      <ConnectButton p={p} />
    </div>
  );
}

import { useState } from "react";
function ConnectButton({ p }) {
  const { toast, setPage, setChatWith } = useApp();
  const [status, setStatus] = useState(p.connectionStatus);
  const label = { none: "Connect", pending_sent: "Requested", pending_received: "Respond", connected: "Message" }[status];
  const click = async () => {
    try {
      if (status === "connected") { setChatWith(p.id); setPage("messages"); }
      else if (status === "pending_received") setPage("matches");
      else if (status === "none") { await api.post("/connections", { to: p.id }); setStatus("pending_sent"); toast(`Connection request sent to ${p.name}`); }
    } catch (e) { toast(e.message); }
  };
  return <button className="btn btn-soft" onClick={click} disabled={status === "pending_sent"}>{label}</button>;
}
