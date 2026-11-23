import { useApp } from "../store";

export default function Topbar() {
  const { me, pageLabel, setSidebarOpen, setPage, notifications, markNotificationsRead, toast } = useApp();
  const unread = notifications.filter((n) => !n.read).length;
  const bell = async () => {
    if (!unread) return toast("You're all caught up");
    toast(notifications[0].title);
    await markNotificationsRead();
  };
  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu" onClick={() => setSidebarOpen((o) => !o)}>☰</button>
      <div className="crumb">Workspace <span>/</span> <strong>{pageLabel}</strong></div>
      <div className="top-actions">
        <span className="live-dot"></span>
        <span className="online-label">You’re online</span>
        <button className="icon-button" title="Notifications" onClick={bell}>♧{unread > 0 && <i></i>}</button>
        <button className="top-avatar" onClick={() => setPage("profile")}>{me.name[0]?.toUpperCase()}</button>
      </div>
    </header>
  );
}
