import { useEffect, useState } from "react";
import { api } from "../api";
import { useApp } from "../store";
import { useAsync } from "../useAsync";
import Heading from "../components/Heading";
import PersonCard from "../components/PersonCard";
import Status from "../components/Status";

export default function Discover() {
  const { version } = useApp();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [interest, setInterest] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300); // wait for the user to stop typing
    return () => clearTimeout(t);
  }, [q]);

  const meta = useAsync(() => api.get("/users/meta"), []);
  const users = useAsync(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (role) params.set("role", role);
    if (interest) params.set("interest", interest);
    return api.get(`/users?${params}`);
  }, [debouncedQ, role, interest, version]);

  return (
    <>
      <Heading title="Talent, meet opportunity." desc="Find collaborators by name, skill, role, or interest." />
      <div className="toolbar">
        <div className="search-box">
          <span>⌕</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search skills, people, roles…" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {(meta.data?.roles || []).map((r) => <option key={r}>{r}</option>)}
        </select>
        <select value={interest} onChange={(e) => setInterest(e.target.value)}>
          <option value="">All interests</option>
          {(meta.data?.interests || []).map((i) => <option key={i}>{i}</option>)}
        </select>
      </div>
      <div className="people-grid">
        <Status loading={users.loading && !users.data} error={users.error}>
          {users.data?.users.length
            ? users.data.users.map((p) => <PersonCard key={p.id} p={p} />)
            : <div className="empty-state"><strong>No people found</strong>Try a different skill or interest.</div>}
        </Status>
      </div>
    </>
  );
}
