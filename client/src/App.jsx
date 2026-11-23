import { AppProvider, useApp } from "./store";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Modals from "./components/Modals";
import Auth from "./auth";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import Messages from "./pages/Messages";
import Skills from "./pages/Skills";
import Calendar from "./pages/Calendar";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";

const pages = { dashboard: Dashboard, discover: Discover, matches: Matches, teams: Teams, messages: Messages, skills: Skills, calendar: Calendar, portfolio: Portfolio, profile: Profile };

function Shell() {
  const { me, booting, page, toastMsg, toastShow } = useApp();
  if (booting) return <div className="empty-state" style={{ marginTop: 80 }}>Loading SkillMesh…</div>;
  if (!me) return <Auth />;
  const Page = pages[page] || Dashboard;
  return (
    <>
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <Topbar />
          <div className="page-content"><Page /></div>
          <footer>SKILLMESH © 2026 <span>MADE FOR PEOPLE WHO BUILD.</span></footer>
        </main>
      </div>
      <div className={`toast ${toastShow ? "show" : ""}`} role="status">{toastMsg}</div>
      <Modals />
    </>
  );
}

export default function App() {
  return <AppProvider><Shell /></AppProvider>;
}
