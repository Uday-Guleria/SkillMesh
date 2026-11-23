import { api } from "../api";
import { useApp } from "../store";
import { useAsync } from "../useAsync";
import Heading from "../components/Heading";
import PersonCard from "../components/PersonCard";
import Status from "../components/Status";

const WEIGHTS = [
  ["Skill overlap", 30, "Your skills compared with theirs"],
  ["Shared interests", 25, "Topics and goals in common"],
  ["Availability", 15, "Time you can build together"],
  ["Role complement", 10, "Different strengths for a balanced team"],
  ["Profile similarity", 20, "TF-IDF + cosine similarity of skills, interests and bio"],
];

export default function Matches() {
  const { setModal, toast, version } = useApp();
  const matches = useAsync(() => api.get("/matches"), [version]);

  const recalc = async () => { await matches.reload(); toast("Matches recalculated from your profile"); };

  return (
    <>
      <Heading
        title="Your next great team starts here."
        desc="We score compatibility using skill overlap, shared interests, availability, role balance and text similarity."
        action={<button className="btn btn-primary" onClick={recalc}>↻ Recalculate matches</button>}
      />
      <div className="match-layout">
        <section>
          <div className="match-hero">
            <div className="eyebrow">SKILLMESH MATCH ENGINE</div>
            <h2>Better together.</h2>
            <p>Your best team isn't a group of identical people. It's a mix of complementary skills, shared interests, and time to build together.</p>
            <button className="btn btn-primary" onClick={() => setModal({ type: "create-team" })}>＋ Create a team</button>
          </div>
          <div className="people-grid">
            <Status loading={matches.loading && !matches.data} error={matches.error}>
              {(matches.data?.matches || []).map((p) => <PersonCard key={p.id} p={p} score />)}
            </Status>
          </div>
        </section>
        <aside className="panel">
          <div className="panel-head">
            <div><h3>How matching works</h3><p>Transparent compatibility scoring</p></div>
            <span className="tiny-pill">V2.0</span>
          </div>
          {WEIGHTS.map(([label, n, desc], i) => (
            <div className="skill-row" key={label}>
              <div className="skill-row-head"><strong>{label}</strong><span>{n}% weight</span></div>
              <div className={`progress ${i === 1 ? "red" : ""}`}><span style={{ width: `${n * 2.3}%` }}></span></div>
              <p style={{ fontSize: 9, color: "var(--muted)", margin: "6px 0 0" }}>{desc}</p>
            </div>
          ))}
          <p style={{ fontSize: 9, lineHeight: 1.6, color: "var(--muted)", marginTop: 25 }}>
            Scores are computed on the server from everyone's saved profile. Edit your profile and recalculate to see them change.
          </p>
        </aside>
      </div>
    </>
  );
}
