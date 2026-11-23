import { useCallback, useEffect, useState } from "react";

/** Runs an async loader on mount / when deps change. Returns { data, loading, error, reload }. */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const run = useCallback(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    loader()
      .then((data) => live && setState({ data, loading: false, error: "" }))
      .catch((e) => live && setState({ data: null, loading: false, error: e.message }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  return { ...state, reload: run };
}
