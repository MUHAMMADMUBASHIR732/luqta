import { useCallback } from "react";
import { api } from "../lib/api.js";
import { usePolling } from "./usePolling.js";
import { buildReportCards } from "../lib/status.js";

const SECOND = 1000;

/** One report, refreshed until `until(item)` is true. */
export function useItem(id, { interval = 5 * SECOND, until, enabled = true } = {}) {
  return usePolling(() => api.getItem(id), { interval, until, enabled: Boolean(id) && enabled, deps: [id] });
}

/** All of my reports as display cards, plus the claims that need my attention. */
export function useMyReports(myId) {
  const fetcher = useCallback(async () => {
    const [items, matches, claims] = await Promise.all([
      api.listMyItems(),
      api.listAllMatchesForFinder().catch(() => []),
      api.listMyClaims().catch(() => []),
    ]);
    return { cards: buildReportCards(items, matches, claims, myId), claims, matches };
  }, [myId]);
  return usePolling(fetcher, { interval: 10 * SECOND, enabled: Boolean(myId), deps: [myId] });
}

/** Top 5 matches for one found item plus the claims made on them. */
export function useMatches(foundItemId, enabled = true) {
  const fetcher = useCallback(async () => {
    const [matches, claims] = await Promise.all([
      api.listMatchesForFinder(foundItemId),
      api.listMyClaims().catch(() => []),
    ]);
    return { matches, claims };
  }, [foundItemId]);
  return usePolling(fetcher, { interval: 8 * SECOND, enabled: Boolean(foundItemId) && enabled, deps: [foundItemId] });
}

/** One claim, refreshed every few seconds. */
export function useClaim(claimId, { interval = 5 * SECOND, until } = {}) {
  return usePolling(() => api.getClaim(claimId), { interval, until, enabled: Boolean(claimId), deps: [claimId] });
}

/** All my notifications, newest first. */
export function useNotifications(enabled) {
  return usePolling(() => api.listNotifications(), { interval: 15 * SECOND, enabled, deps: [] });
}
