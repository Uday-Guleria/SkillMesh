import { api } from "../api";
import { useApp } from "../store";
import { useAsync } from "../useAsync";
import Heading from "../components/Heading";
import Avatar from "../components/Avatar";
import Status from "../components/Status";

export default function Teams() {
  const { setModal, version } = useApp();
  const teams = useAsync(() => api.get("/teams"), [version]);
  const create = () => setModal({ type: "create-team" });
  const list = teams.data?.teams || [];
  return (
    <>
      <Heading
        title="Build something real."
        desc="Bring your people together around a shared goal."
        action={<button className="btn btn-primary" onClick={create}>＋ New team</button>}
      />
      <div className="people-grid">
        <Status loading={teams.loading && !teams.data} error={teams.error}>
          {list.length ? list.map((t) => (
            <article className="team-card" key={t.id}>
              <div className="team-card-head">
                <div><div className="eyebrow">{t.status}</div><h3>{t.name}</h3></div>
                <span className="tiny-pill">{t.members.length} members</span>
              </div>
              <p>{t.goal}</p>
              <div className="team-members">{t.members.map((m) => <Avatar key={m.id} p={m} />)}</div>
              <div className="team-bottom">
                <span>Created {new Date(t.createdAt).toLocaleDateString()}</span>
                <button className="text-link" onClick={() => setModal({ type: "team-detail", id: t.id })}>Open workspace ↗</button>
              </div>
            </article>
          )) : <div className="empty-state"><strong>No teams yet</strong>Create a team and invite people to your next project.</div>}
          <button className="quick-card" onClick={create}>
            <span className="quick-icon">＋</span><strong>Create another team</strong><p>Start with a name and a clear goal.</p>
          </button>
        </Status>
      </div>
    </>
  );
}
