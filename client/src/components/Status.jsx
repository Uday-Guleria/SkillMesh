// Small helper for loading / error states of useAsync results.
export default function Status({ loading, error, children }) {
  if (loading) return <div className="empty-state">Loading…</div>;
  if (error) return <div className="empty-state"><strong>Couldn't load this</strong>{error}</div>;
  return children;
}
