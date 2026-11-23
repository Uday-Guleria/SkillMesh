import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { io as connectSocket } from "socket.io-client";

process.env.NODE_ENV = "test";
process.env.DEMO_BOT_DELAY_MS = "40";
process.env.JWT_SECRET = "test-secret";

const { connectDB, disconnectDB } = await import("../src/config/db.js");
const mongoose = (await import("mongoose")).default;
const { createApp } = await import("../src/app.js");
const { initSocket, closeSocket } = await import("../src/socket.js");
const { seedDemoUsers } = await import("../src/seed.js");

let server, base;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
}
async function waitFor(fn, ms = 3000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { const v = await fn(); if (v) return v; await sleep(50); }
  throw new Error("timed out");
}

before(async () => {
  await connectDB(process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/skillmesh_test");
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init())); // build indexes
  await seedDemoUsers();
  server = http.createServer(createApp());
  initSocket(server);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  closeSocket();
  server.close();
  await mongoose.connection.dropDatabase();
  await disconnectDB();
});

const state = {};

test("register, duplicate email, login, me", async () => {
  let r = await api("/api/auth/register", { method: "POST", body: { name: "Nandini", email: "N@Test.com", password: "secret1" } });
  assert.equal(r.status, 201);
  assert.ok(r.data.token);
  assert.equal(r.data.user.email, "n@test.com");
  assert.equal(r.data.user.passwordHash, undefined);
  state.token = r.data.token; state.me = r.data.user;

  r = await api("/api/auth/register", { method: "POST", body: { name: "Again", email: "n@test.com", password: "secret1" } });
  assert.equal(r.status, 409);
  r = await api("/api/auth/register", { method: "POST", body: { name: "X", email: "bad", password: "1" } });
  assert.equal(r.status, 400);
  r = await api("/api/auth/login", { method: "POST", body: { email: "n@test.com", password: "wrong" } });
  assert.equal(r.status, 401);
  r = await api("/api/auth/login", { method: "POST", body: { email: "n@test.com", password: "secret1" } });
  assert.equal(r.status, 200);
  r = await api("/api/auth/me", { token: state.token });
  assert.equal(r.data.user.name, "Nandini");
  assert.equal((await api("/api/auth/me")).status, 401);
});

test("profile update + validation", async () => {
  let r = await api("/api/users/me", { method: "PUT", token: state.token, body: { skills: ["React", "Node.js"], interests: ["AI/ML"], role: "Student", availability: { hours: "Weekends", days: ["Saturday"] } } });
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.user.skills, ["React", "Node.js"]);
  assert.equal(r.data.user.availability.hours, "Weekends");
  r = await api("/api/users/me", { method: "PUT", token: state.token, body: { github: "not-a-url" } });
  assert.equal(r.status, 400);
});

test("discover: list, search, filters, meta", async () => {
  let r = await api("/api/users", { token: state.token });
  assert.equal(r.data.users.length, 8);
  assert.ok(r.data.users.every((u) => u.connectionStatus === "none" && !u.email));
  r = await api("/api/users?q=react", { token: state.token });
  assert.deepEqual(r.data.users.map((u) => u.name).sort(), ["Aarav Mehta", "Ananya Rao"]);
  r = await api("/api/users?interest=Fintech", { token: state.token });
  assert.equal(r.data.users.length, 3);
  r = await api("/api/users?role=" + encodeURIComponent("UI/UX Designer"), { token: state.token });
  assert.equal(r.data.users.length, 1);
  r = await api("/api/users/meta", { token: state.token });
  assert.ok(r.data.roles.includes("Data Analyst") && r.data.interests.includes("Fintech"));
  state.aarav = (await api("/api/users?q=aarav", { token: state.token })).data.users[0];
});

test("matches are ranked with a breakdown", async () => {
  const r = await api("/api/matches", { token: state.token });
  const m = r.data.matches;
  assert.equal(m.length, 8);
  for (let i = 1; i < m.length; i++) assert.ok(m[i - 1].score >= m[i].score);
  assert.ok(m[0].breakdown && "similarity" in m[0].breakdown);
  assert.equal(m[0].name, "Aarav Mehta"); // React + Node + AI/ML + Weekends: best fit
});

test("connect to a demo user: pending -> auto-accepted, notification created", async () => {
  let r = await api("/api/connections", { method: "POST", token: state.token, body: { to: state.aarav.id } });
  assert.equal(r.status, 201);
  assert.equal((await api("/api/connections", { method: "POST", token: state.token, body: { to: state.aarav.id } })).status, 409);
  assert.equal((await api("/api/connections", { method: "POST", token: state.token, body: { to: state.me.id } })).status, 400);
  const u = await api(`/api/users/${state.aarav.id}`, { token: state.token });
  assert.equal(u.data.user.connectionStatus, "pending_sent");
  await waitFor(async () => (await api(`/api/users/${state.aarav.id}`, { token: state.token })).data.user.connectionStatus === "connected");
  const n = await api("/api/notifications", { token: state.token });
  assert.ok(n.data.notifications.some((x) => x.title.includes("accepted your request")));
  assert.ok(n.data.unread >= 2);
  await api("/api/notifications/read", { method: "PATCH", token: state.token });
  assert.equal((await api("/api/notifications", { token: state.token })).data.unread, 0);
});

test("messages: need a connection, realtime push, demo reply, unread aggregation", async () => {
  const meetera = (await api("/api/users?q=meera", { token: state.token })).data.users[0];
  let r = await api(`/api/messages/${meetera.id}`, { method: "POST", token: state.token, body: { text: "hi" } });
  assert.equal(r.status, 403);

  const socket = connectSocket(base, { auth: { token: state.token }, transports: ["websocket"] });
  const pushed = [];
  socket.on("message:new", (m) => pushed.push(m));
  await new Promise((res, rej) => { socket.on("connect", res); socket.on("connect_error", rej); });

  r = await api(`/api/messages/${state.aarav.id}`, { method: "POST", token: state.token, body: { text: "Want to team up?" } });
  assert.equal(r.status, 201);
  await waitFor(() => pushed.length >= 2); // my own echo + the demo user's reply
  assert.ok(pushed.some((m) => m.from === state.aarav.id));

  r = await api("/api/messages/conversations", { token: state.token });
  const chat = r.data.conversations.find((c) => c.user.id === state.aarav.id);
  assert.equal(chat.unread, 1);
  assert.ok(chat.last.text.length > 0);
  assert.equal((await api("/api/stats", { token: state.token })).data.unreadMessages, 1);

  r = await api(`/api/messages/${state.aarav.id}`, { token: state.token });
  assert.equal(r.data.messages.length, 2);
  assert.equal(r.data.messages[0].text, "Want to team up?"); // oldest first
  assert.equal((await api("/api/stats", { token: state.token })).data.unreadMessages, 0);
  socket.close();
});

test("teams: create, owner-only add, leave/remove", async () => {
  const sim = (await api("/api/users?q=simran", { token: state.token })).data.users[0];
  let r = await api("/api/teams", { method: "POST", token: state.token, body: { name: "Project Orbit", goal: "Build SkillMesh", memberId: state.aarav.id } });
  assert.equal(r.status, 201);
  assert.equal(r.data.team.members.length, 2);
  const id = r.data.team.id;

  r = await api(`/api/teams/${id}/members`, { method: "POST", token: state.token, body: { userId: sim.id } });
  assert.equal(r.data.team.members.length, 3);
  r = await api(`/api/teams/${id}/members`, { method: "POST", token: state.token, body: { userId: sim.id } });
  assert.equal(r.data.team.members.length, 3); // $addToSet: no duplicates

  const other = await api("/api/auth/register", { method: "POST", body: { name: "Outsider", email: "o@test.com", password: "secret1" } });
  assert.equal((await api(`/api/teams/${id}`, { token: other.data.token })).status, 404);
  assert.equal((await api(`/api/teams/${id}/members`, { method: "POST", token: other.data.token, body: { userId: other.data.user.id } })).status, 403);

  r = await api(`/api/teams/${id}/members/${sim.id}`, { method: "DELETE", token: state.token });
  assert.equal(r.data.team.members.length, 2);
  assert.equal((await api("/api/teams", { token: state.token })).data.teams.length, 1);
});

test("stats: aggregation + counters; presence follows sockets", async () => {
  const r = await api("/api/stats", { token: state.token });
  assert.equal(r.data.teams, 1);
  assert.equal(r.data.reputation, 75);
  assert.ok(r.data.topSkills.length > 0 && r.data.topSkills[0].count >= r.data.topSkills.at(-1).count);

  const other = (await api("/api/auth/login", { method: "POST", body: { email: "o@test.com", password: "secret1" } })).data;
  const s = connectSocket(base, { auth: { token: other.token }, transports: ["websocket"] });
  await new Promise((res) => s.on("connect", res));
  const online = await waitFor(async () => (await api(`/api/users/${other.user.id}`, { token: state.token })).data.user.online);
  assert.equal(online, true);
  s.close();
  await waitFor(async () => !(await api(`/api/users/${other.user.id}`, { token: state.token })).data.user.online);

  const bad = connectSocket(base, { auth: { token: "nope" }, transports: ["websocket"] });
  const err = await new Promise((res) => bad.on("connect_error", res));
  assert.equal(err.message, "unauthorized");
  bad.close();
});
