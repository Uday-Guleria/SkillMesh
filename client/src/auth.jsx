import { useState } from "react";
import { useApp } from "./store";
import "./auth.css";

export default function Auth() {
  const { login, register } = useApp();
  const [signup, setSignup] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const switchMode = (v) => { setSignup(v); setMsg(""); };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (signup && form.password !== form.confirm) return setMsg("Passwords do not match.");
    setBusy(true);
    try {
      if (signup) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
    } catch (err) { setMsg(err.message); setBusy(false); }
  };

  return (
    <div className="auth-page">
      <main className="auth-card">
        <span className="auth-brand">✳ SkillMesh</span>
        <p className="auth-eyebrow">BUILD BETTER TOGETHER</p>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p>{signup ? "Join SkillMesh and find your next collaborator." : "Sign in to continue to your SkillMesh space."}</p>
        <div className="auth-tabs">
          <button type="button" className={!signup ? "active" : ""} onClick={() => switchMode(false)}>Sign In</button>
          <button type="button" className={signup ? "active" : ""} onClick={() => switchMode(true)}>Sign Up</button>
        </div>
        <p className="auth-message" role="status" style={{ color: "#b62f25" }}>{msg}</p>
        <form onSubmit={submit}>
          {signup && <label>Full name<input value={form.name} onChange={set("name")} autoComplete="name" required /></label>}
          <label>Email address<input type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
          <label>Password<input type="password" value={form.password} onChange={set("password")} required minLength={6} autoComplete={signup ? "new-password" : "current-password"} /></label>
          {signup && <label>Confirm password<input type="password" value={form.confirm} onChange={set("confirm")} required minLength={6} autoComplete="new-password" /></label>}
          <button className="auth-submit" type="submit" disabled={busy}>{signup ? "Create Account ↗" : "Sign In ↗"}</button>
        </form>
        <p className="auth-switch">
          {signup ? "Already have an account? " : "New to SkillMesh? "}
          <button type="button" onClick={() => switchMode(!signup)}>{signup ? "Sign in" : "Create an account"}</button>
        </p>
        <p className="auth-note">Passwords are hashed with bcrypt on the server. Try a demo account: aarav@demo.skillmesh.dev / demo12345</p>
      </main>
    </div>
  );
}
