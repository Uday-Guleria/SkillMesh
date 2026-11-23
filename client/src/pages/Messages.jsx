import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useApp } from "../store";
import { useAsync } from "../useAsync";
import Heading from "../components/Heading";
import Avatar from "../components/Avatar";
import { clockTime } from "../utils/helpers";

export default function Messages() {
  const { socket, chatWith, setChatWith, refreshStats, toast, setPage } = useApp();
  const convs = useAsync(() => api.get("/messages/conversations"), []);
  const list = convs.data?.conversations || [];
  const activeId = chatWith || list[0]?.user.id;
  const active = list.find((c) => c.user.id === activeId)?.user;

  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const box = useRef(null);

  // Load the thread (the server also marks incoming messages as read).
  const loadThread = (id) =>
    api.get(`/messages/${id}`).then((d) => { setMsgs(d.messages); refreshStats(); });

  useEffect(() => {
    if (!activeId) return;
    loadThread(activeId).then(() => convs.reload());
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live updates over the websocket.
  useEffect(() => {
    if (!socket) return;
    const onMessage = (m) => {
      if (m.from === activeId || m.to === activeId) {
        setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        if (m.from === activeId) loadThread(activeId); // mark as read
      }
      convs.reload();
    };
    socket.on("message:new", onMessage);
    return () => socket.off("message:new", onMessage);
  }, [socket, activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [msgs.length]);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    try {
      const d = await api.post(`/messages/${activeId}`, { text: t });
      setMsgs((prev) => (prev.some((x) => x.id === d.message.id) ? prev : [...prev, d.message]));
    } catch (err) { toast(err.message); setText(t); }
  };

  return (
    <>
      <Heading title="Conversations that move ideas forward." desc="Chat in real time with the people you're connected to." />
      {!list.length && !convs.loading ? (
        <div className="empty-state">
          <strong>No conversations yet</strong>
          Connect with someone first, then message them here.
          <div style={{ marginTop: 14 }}><button className="btn btn-primary" onClick={() => setPage("discover")}>Discover talent ↗</button></div>
        </div>
      ) : (
        <div className="chat-layout">
          <aside className="chat-list">
            <h3>MESSAGES <span className="tiny-pill">{list.length}</span></h3>
            {list.map((c) => (
              <button key={c.user.id} className={`chat-person ${activeId === c.user.id ? "selected" : ""}`} onClick={() => setChatWith(c.user.id)}>
                <Avatar p={c.user} />
                <span>
                  <strong>{c.user.name}</strong>
                  <small>{(c.last?.text || c.user.role).slice(0, 35)}</small>
                </span>
                {c.unread > 0 && <b className="nav-count">{c.unread}</b>}
              </button>
            ))}
          </aside>
          <section className="chat-window">
            {active && (
              <div className="chat-header">
                <Avatar p={active} />
                <div><strong>{active.name}</strong><small>{active.online ? "● Online" : "○ Offline"} · {active.role}</small></div>
              </div>
            )}
            <div className="chat-messages" ref={box}>
              {msgs.map((m) => (
                <div key={m.id} className={`message ${m.from !== activeId ? "mine" : ""}`}><p>{m.text}</p><time>{clockTime(m.createdAt)}</time></div>
              ))}
              {!msgs.length && <div className="empty-state">Say hello and start a conversation.</div>}
            </div>
            <form className="chat-compose" onSubmit={send}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" autoComplete="off" required maxLength={500} />
              <button className="btn btn-primary">Send ↗</button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
