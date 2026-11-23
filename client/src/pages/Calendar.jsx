import { useState } from "react";
import { useApp } from "../store";
import Heading from "../components/Heading";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = ["Flexible", "Mornings", "Evenings", "Weekends"];

export default function Calendar() {
  const { me, updateMe, toast } = useApp();
  const [days, setDays] = useState(me.availability.days);
  const [hours, setHours] = useState(me.availability.hours);
  const toggle = (d) => setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  const save = () => updateMe({ availability: { days, hours } }, "Availability saved").catch((e) => toast(e.message));

  const d = new Date();
  const year = d.getFullYear(), month = d.getMonth();
  const first = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const prev = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    if (i < first) return { n: prev - first + i + 1, dim: true };
    if (i >= first + count) return { n: i - first - count + 1, dim: true };
    return { n: i - first + 1, dim: false };
  });

  return (
    <>
      <Heading title="Make time for great work." desc="Set your availability so your next team knows when to build with you." />
      <div className="skill-layout">
        <section className="panel">
          <div className="panel-head">
            <div><h3>{d.toLocaleString("en", { month: "long" })} {year}</h3><p>Sample calendar · event dots are illustrative</p></div>
            <span className="tiny-pill">THIS MONTH</span>
          </div>
          <div className="calendar-grid">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((x) => <div className="cal-day-name" key={x}>{x}</div>)}
            {cells.map((c, i) => (
              <div key={i} className={`cal-day ${c.dim ? "dim" : ""} ${!c.dim && c.n === d.getDate() ? "today" : ""}`}>
                {c.n}{!c.dim && [4, 12, 19, 26].includes(c.n) && <><br /><span className="event-dot"></span></>}
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head"><div><h3>Your build schedule</h3><p>Choose the times that work for you</p></div></div>
          <p style={{ fontSize: 10, color: "var(--muted)" }}>Available days</p>
          <div className="availability-list">
            {DAYS.map((day) => (
              <button key={day} className={`availability-chip ${days.includes(day) ? "active" : ""}`} onClick={() => toggle(day)}>
                {days.includes(day) ? "✓ " : ""}{day}
              </button>
            ))}
          </div>
          <div className="form-field" style={{ marginTop: 22 }}>
            <label>Preferred time</label>
            <select className="field" value={hours} onChange={(e) => setHours(e.target.value)}>
              {HOURS.map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={save}>Save availability</button>
        </section>
      </div>
    </>
  );
}
