# Phase 10 — Connect the React client

**Goal:** the UI uses your API instead of local state.

## Concepts

- The **API contract**: URLs, methods, JSON shapes, status codes. The UI only knows this.
- **Dev proxy**: Vite forwards `/api` and `/socket.io` to port 5000, so the browser sees a single origin (no CORS pain).
- Token lives in `localStorage` and is sent as `Authorization: Bearer …`; a `401` logs the user out.

## Walk-through (read these files in order)

1. `client/vite.config.js` — the proxy.
2. `client/src/api.js` — one `fetch` wrapper (adds token, throws readable errors).
3. `client/src/store.jsx` — session (`login/register/logout`), counters (`/stats`), notifications, socket.
4. `client/src/useAsync.js` — tiny data-loading hook (`data/loading/error/reload`).
5. Pages: `Discover.jsx` (debounced search → query string), `Messages.jsx` (REST for history + socket for live), `Teams.jsx` + `Modals.jsx`.

## Build

Rebuild `api.js` and `useAsync.js` yourself first (they're ~25 lines each), then convert **one** page, e.g. Discover:

```jsx
const users = useAsync(() => api.get(`/users?${params}`), [debouncedQ, role, interest]);
```

## Check

Register in the UI, then in mongosh: `db.users.find({ email: "<yours>" })` — your profile edits appear there after **Save profile**.

## Challenge

Add a "Requests" panel: `GET /api/connections`, show `direction: "received"` + `status: "pending"` rows with Accept / Decline buttons (`PATCH /api/connections/:id`).

## Viva questions

- Where is the JWT stored, and what is the XSS risk? (httpOnly cookie is safer; trade-offs with CSRF)
- Why debounce the search box?
- What does the Vite proxy replace in production? (a reverse proxy, or serving the built client from Express)
