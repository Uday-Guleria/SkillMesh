import { useApp } from "../store";
import Heading from "../components/Heading";

const LEVELS = [85, 72, 64, 58, 48, 42];

export default function Skills() {
  const { me, setPage } = useApp();
  const list = [...me.skills, ...["Teamwork", "Communication"].filter((s) => !me.skills.includes(s))];
  return (
    <>
      <Heading title="Your skills tell a story." desc="Keep your strengths up to date and show teammates what you bring." />
      <div className="skill-layout">
        <section className="panel">
          <div className="panel-head">
            <div><h3>Your skill map</h3><p>A snapshot of your current strengths</p></div>
            <span className="tiny-pill">{list.length} SKILLS</span>
          </div>
          <div className="skill-orbit">
            <div className="skill-circle">
              <span className="skill-center">{me.initials}</span>
              <span className="skill-node n1">{list[0] || "Skills"}</span>
              <span className="skill-node n2">{list[1] || "Teamwork"}</span>
              <span className="skill-node n3">{list[2] || "Learning"}</span>
              <span className="skill-node n4">{list[3] || "Ideas"}</span>
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-head"><div><h3>Skill strengths</h3><p>Self-reported snapshot — edit your profile to update</p></div></div>
          {list.map((s, i) => (
            <div className="skill-row" key={s}>
              <div className="skill-row-head"><strong>{s}</strong><span>{LEVELS[i % 6]} / 100</span></div>
              <div className={`progress ${i % 3 === 1 ? "red" : ""}`}><span style={{ width: `${LEVELS[i % 6]}%` }}></span></div>
            </div>
          ))}
          <button className="btn btn-outline" onClick={() => setPage("profile")}>Edit my skills ↗</button>
        </section>
      </div>
    </>
  );
}
