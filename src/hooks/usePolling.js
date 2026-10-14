// src/hooks/usePolling.js
// The backend has no documented realtime channel, so live screens poll. Pauses while the tab is hidden.
// usePolling(() => api.getItem(id), { interval: 2500, until: (item) => item?.analyzed, deps: [id] })
//   -> { data, loading, error, refresh }   `until` returning true stops polling.

import { useCallback, useEffect, useRef, useState } from "react";

export function usePolling(fetcher, { interval = 8000, enabled = true, until, deps = [] } = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetchRef = useRef(fetcher);
  const untilRef = useRef(until);
  const alive = useRef(true);
  const inFlight = useRef(false);
  const timer = useRef(null);
  fetchRef.current = fetcher;
  untilRef.current = until;

  const run = useCallback(async () => {
    try {
      const data = await fetchRef.current();
      if (!alive.current) return false;
      setState({ data, loading: false, error: null });
      return untilRef.current ? Boolean(untilRef.current(data)) : false;
    } catch (error) {
      if (alive.current) setState((s) => ({ data: s.data, loading: false, error }));
      return false;
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    if (!enabled) return undefined;
    let stopped = false;
    setState({ data: null, loading: true, error: null });

    const tick = async () => {
      if (stopped || inFlight.current) return;
      inFlight.current = true;
      let done = false;
      if (!document.hidden) done = await run();
      inFlight.current = false;
      if (!done && !stopped) timer.current = setTimeout(tick, interval);
    };
    const onVisible = () => {
      if (!document.hidden && !stopped) {
        clearTimeout(timer.current);
        tick();
      }
    };

    tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      alive.current = false;
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interval, run, ...deps]);

  return { ...state, refresh: run };
}
