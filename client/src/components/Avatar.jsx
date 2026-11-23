import { initials } from "../utils/helpers";

export default function Avatar({ p, extra = "" }) {
  return (
    <span className={`avatar ${extra}`} style={{ background: p.color || "#ffd9d5", color: "#172b75" }}>
      {p.initials || initials(p.name)}
    </span>
  );
}
