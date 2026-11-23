import { useState } from "react";
import { api } from "../api";
import { useApp } from "../store";
import { useAsync } from "../useAsync";
import Avatar from "./Avatar";
import Status from "./Status";

function CreateTeam() {
  const { closeModal, setPage, toast, bump, refreshStats } = useApp();
  const people = useAsync(() => api.get("/users"), []);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setBusy(true);
    try {
      await api.post("/teams", { name: f.get("name"), goal: f.get("goal"), memberId: f.get("member") || null });
      closeModal(); setPage("teams"); bump(); refreshStats(); toast("Your team has been created");
    } catch (err) { toast(err.message); setBusy(false); }
  };

  return (
    <>
      <button className="modal-close" onClick={closeModal}>✕</button>
      <div className="eyebrow">START SOMETHING</div>
      <h2>Create a new team</h2>
      <p>Start with a clear goal. You can add teammates as you go.</p>
      <form className="form-grid" onSubmit={submit}>
        <div className="form-field full"><label>Team name</label><input name="name" placeholder="e.g. Project Orbit" required maxLength={70} /></div>
        <div className="form-field full"><label>What are you building?</label><textarea name="goal" placeholder="Describe the problem, idea, or project…" required maxLength={400} /></div>
        <div className="form-field full">
          <label>Invite first teammate</label>
          <select name="member" defaultValue="">
            <option value="">I'll invite people later</option>
            {(people.data?.users || []).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
          </select>
        </div>
        <div className="form-field full"><button className="btn btn-primary" disabled={busy}>Create team ↗</button></div>
      </form>
    </>
  );
}

function TeamDetail({ id }) {
  const { me, closeModal, toast, bump } = useApp();
  const team = useAsync(() => api.get(`/teams/${id}`), [id]);
  const people = useAsync(() => api.get("/users"), []);
  const [pick, setPick] = useState("");
  const t = team.data?.team;

  const add = async () => {
    if (!pick) return toast("Choose a teammate first");
    try {
      await api.post(`/teams/${id}/members`, { userId: pick });
      setPick(""); team.reload(); bump(); toast("Teammate added");
    } catch (e) { toast(e.message); }
  };

  return (
    <>
      <button className="modal-close" onClick={closeModal}>✕</button>
      <Status loading={team.loading} error={team.error}>
        {t && (
          <>
            <div className="eyebrow">TEAM WORKSPACE</div>
            <h2>{t.name}</h2>
            <p>{t.goal}</p>
            <div className="section-row"><h2>Team members</h2><span className="tiny-pill">{t.members.length}</span></div>
            {t.members.map((p) => (
              <div className="match-row" key={p.id}>
                <Avatar p={p} />
                <div className="person-meta"><strong>{p.name}</strong><small>{p.role}</small></div>
              </div>
            ))}
            {t.owner === me.id && (
              <div className="form-field" style={{ marginTop: 17 }}>
                <label>Add a teammate</label>
                <select className="field" value={pick} onChange={(e) => setPick(e.target.value)}>
                  <option value="">Choose a person…</option>
                  {(people.data?.users || []).filter((p) => !t.members.some((m) => m.id === p.id)).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
              {t.owner === me.id && <button className="btn btn-primary" onClick={add}>Add member</button>}
            </div>
          </>
        )}
      </Status>
    </>
  );
}

export default function Modals() {
  const { modal, closeModal } = useApp();
  return (
    <div className={`modal-backdrop ${modal ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <section className="modal" role="dialog" aria-modal="true">
        {modal?.type === "create-team" && <CreateTeam />}
        {modal?.type === "team-detail" && <TeamDetail id={modal.id} />}
      </section>
    </div>
  );
}
