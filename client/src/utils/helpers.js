export const splitList = (s = "") => s.split(",").map((x) => x.trim()).filter(Boolean);

export function timeAgo(date) {
  const s = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export const clockTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const initials = (name = "") =>
  name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
