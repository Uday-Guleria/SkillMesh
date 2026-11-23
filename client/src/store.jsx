import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, getToken, setToken } from "./api";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const pageLabels = {
  dashboard: "Overview", discover: "Discover talent", matches: "Team matches",
  teams: "My teams", messages: "Messages", skills: "Skill graph",
  calendar: "Availability", portfolio: "Portfolio studio", profile: "My profile",
};

export function AppProvider({ children }) {
  const [me, setMe] = useState(null);
  const [booting, setBooting] = useState(!!getToken());
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [page, setPageRaw] = useState("dashboard");
  const [chatWith, setChatWith] = useState(null);
  const [version, setVersion] = useState(0); // pages list this in their deps to refetch
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }, []);

  const setPage = useCallback((p) => {
    setPageRaw(p);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const refreshStats = useCallback(() => api.get("/stats").then(setStats).catch(() => {}), []);
  const refreshNotifications = useCallback(
    () => api.get("/notifications").then((d) => setNotifications(d.notifications)).catch(() => {}), []
  );

  const logout = useCallback(() => {
    setToken(null);
    setMe(null); setStats(null); setNotifications([]); setPageRaw("dashboard");
  }, []);

  const startSession = useCallback(({ token, user }) => {
    setToken(token);
    setMe(user);
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    if (!getToken()) return;
    api.get("/auth/me").then((d) => setMe(d.user)).catch(logout).finally(() => setBooting(false));
  }, [logout]);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener("skillmesh:unauthorized", onUnauthorized);
    return () => window.removeEventListener("skillmesh:unauthorized", onUnauthorized);
  }, [logout]);

  // While signed in: open a websocket, load counters, react to pushes.
  useEffect(() => {
    if (!me) return;
    refreshStats();
    refreshNotifications();
    const s = io({ auth: { token: getToken() } });
    s.on("notification:new", (n) => {
      setNotifications((list) => [n, ...list].slice(0, 20));
      toast(n.title);
      refreshStats();
      bump();
    });
    s.on("message:new", () => refreshStats());
    setSocket(s);
    return () => { s.close(); setSocket(null); };
  }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => startSession(await api.post("/auth/login", { email, password }));
  const register = async (name, email, password) => startSession(await api.post("/auth/register", { name, email, password }));

  const updateMe = async (patch, message = "Your profile has been saved") => {
    const d = await api.put("/users/me", patch);
    setMe(d.user);
    refreshStats();
    toast(message);
  };

  const markNotificationsRead = async () => {
    await api.patch("/notifications/read");
    setNotifications((l) => l.map((n) => ({ ...n, read: true })));
    refreshStats();
  };

  const value = {
    me, booting, login, register, logout, updateMe,
    stats, refreshStats, notifications, markNotificationsRead,
    version, bump, socket, page, setPage, pageLabel: pageLabels[page] || "Overview",
    chatWith, setChatWith, sidebarOpen, setSidebarOpen,
    modal, setModal, closeModal: () => setModal(null),
    toast, toastMsg, toastShow,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
