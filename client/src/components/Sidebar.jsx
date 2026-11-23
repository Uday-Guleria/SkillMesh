import { useApp } from "../store";

const workspace = [
  ["dashboard", "⌂", "Overview"], ["discover", "⌕", "Discover talent"], ["matches", "✳", "Team matches"],
  ["teams", "◇", "My teams"], ["messages", "☏", "Messages"],
];
const growth = [["skills", "◎", "Skill graph"], ["calendar", "▦", "Availability"], ["portfolio", "↗", "Portfolio studio"]];

export default function Sidebar() {
  const { me, stats, page, setPage, sidebarOpen, logout } = useApp();
  const Item = ([id, icon, label]) => (
    <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
      <span>{icon}</span> {label}
      {id === "matches" && stats && <b className="nav-count">{stats.potentialMatches}</b>}
      {id === "messages" && stats?.unreadMessages > 0 && <b className="nav-count muted-count">{stats.unreadMessages}</b>}
    </button>
  );
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setPage("dashboard"); }}>
        <span className="brand-mark"><i></i><i></i><i></i></span>
        <span>skill<span className="brand-light">mesh</span><small>BUILD BETTER TOGETHER</small></span>
      </a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">{workspace.map(Item)}</nav>
      <div className="workspace-label space-top">YOUR GROWTH</div>
      <nav className="nav-list">{growth.map(Item)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <span className="help-spark">✳</span>
          <strong>Make your next move.</strong>
          <p>Your next great project could start with one connection.</p>
          <button onClick={() => setPage("matches")}>Find my people ↗</button>
        </div>
        <a href="#" className="auth-nav-link" onClick={(e) => { e.preventDefault(); logout(); }}>
          <span>↗</span><span>Sign out</span>
        </a>
        <button className="profile-mini" onClick={() => setPage("profile")}>
          <span className="avatar avatar-you">{me.name[0]?.toUpperCase()}</span>
          <span><strong>{me.name}</strong><small>Member profile</small></span>
          <span className="dots">•••</span>
        </button>
      </div>
    </aside>
  );
}
