import { useState } from "react";
import { useApp } from "../store";
import Heading from "../components/Heading";
import { splitList } from "../utils/helpers";

export default function Portfolio() {
  const { me, toast } = useApp();
  const [form, setForm] = useState({ name: me.name, role: me.role, bio: me.bio, skills: me.skills.join(", ") });
  const [preview, setPreview] = useState({ name: me.name, role: me.role, bio: me.bio, skills: me.skills });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const update = () => {
    const next = {
      name: form.name.trim() || me.name, role: form.role.trim() || me.role,
      bio: form.bio.trim() || me.bio, skills: splitList(form.skills),
    };
    setPreview(next);
    toast("Portfolio preview updated");
    return `${next.name}\n${next.role}\n\n${next.bio}\n\nSkills: ${next.skills.join(", ")}`;
  };
  const copy = () => {
    const text = update();
    navigator.clipboard?.writeText(text).then(() => toast("Portfolio text copied")).catch(() => toast("Select and copy your portfolio text"));
  };

  return (
    <>
      <Heading title="Your story, beautifully told." desc="Generate a portfolio introduction from your SkillMesh profile."
        action={<button className="btn btn-primary" onClick={copy}>Copy portfolio text ↗</button>} />
      <div className="skill-layout">
        <section className="panel">
          <div className="panel-head"><div><h3>Portfolio details</h3><p>Preview only — save changes from My profile</p></div></div>
          <div className="form-grid">
            <div className="form-field full"><label>Display name</label><input className="field" value={form.name} onChange={set("name")} /></div>
            <div className="form-field full"><label>Headline</label><input className="field" value={form.role} onChange={set("role")} /></div>
            <div className="form-field full"><label>About you</label><textarea value={form.bio} onChange={set("bio")} /></div>
            <div className="form-field full"><label>Skills (comma separated)</label><input className="field" value={form.skills} onChange={set("skills")} /></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 15 }} onClick={update}>Update preview</button>
        </section>
        <section className="portfolio-preview">
          <div className="eyebrow">BUILDER · THINKER · TEAMMATE</div>
          <h2>{preview.name}</h2><strong>{preview.role}</strong><p>{preview.bio}</p>
          <div className="skill-tags">{preview.skills.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
        </section>
      </div>
    </>
  );
}
