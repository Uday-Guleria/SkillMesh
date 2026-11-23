import { useApp } from "../store";
import Heading from "../components/Heading";
import Avatar from "../components/Avatar";
import { splitList } from "../utils/helpers";

export default function Profile() {
  const { me, updateMe, toast } = useApp();

  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      await updateMe({
        name: f.get("name"), role: f.get("role"), bio: f.get("bio"),
        skills: splitList(f.get("skills")), interests: splitList(f.get("interests")),
        availability: { hours: f.get("availability") },
        github: f.get("github"), portfolio: f.get("portfolio"),
      });
    } catch (err) { toast(err.message); }
  };

  return (
    <>
      <Heading title="Make your profile memorable." desc="Good profiles lead to better matches. Tell people what you're building." />
      <div className="profile-layout">
        <aside className="profile-banner">
          <Avatar p={{ ...me, color: "#ffd9d5" }} />
          <div className="eyebrow">SKILLMESH MEMBER</div>
          <h2>{me.name}</h2><p>{me.role}</p><p>{me.bio}</p>
          <div className="skill-tags">{me.skills.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
        </aside>
        <section className="panel">
          <div className="panel-head">
            <div><h3>Profile details</h3><p>Saved to your account</p></div>
            <span className="tiny-pill">EDIT PROFILE</span>
          </div>
          <form className="form-grid" onSubmit={submit}>
            <div className="form-field"><label>Your name</label><input name="name" defaultValue={me.name} required maxLength={60} /></div>
            <div className="form-field"><label>Role / headline</label><input name="role" defaultValue={me.role} required maxLength={100} /></div>
            <div className="form-field full"><label>About you</label><textarea name="bio" defaultValue={me.bio} maxLength={500} /></div>
            <div className="form-field full"><label>Skills (comma separated)</label><input name="skills" defaultValue={me.skills.join(", ")} placeholder="JavaScript, UI Design, Python" /></div>
            <div className="form-field full"><label>Interests (comma separated)</label><input name="interests" defaultValue={me.interests.join(", ")} placeholder="AI/ML, Startups, Design" /></div>
            <div className="form-field">
              <label>Availability</label>
              <select name="availability" defaultValue={me.availability.hours}>
                {["Flexible", "Weekends", "Evenings", "Mornings"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="form-field"><label>GitHub URL (optional)</label><input name="github" type="url" defaultValue={me.github} placeholder="https://github.com/you" /></div>
            <div className="form-field full"><label>Portfolio URL (optional)</label><input name="portfolio" type="url" defaultValue={me.portfolio} placeholder="https://yourportfolio.com" /></div>
            <div className="form-field full"><button className="btn btn-primary">Save profile ↗</button></div>
          </form>
        </section>
      </div>
    </>
  );
}
