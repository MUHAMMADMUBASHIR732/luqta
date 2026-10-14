// Single source of truth for report states and the plain-language sentences shown to people.

export const STATE = {
  OPEN: "open",
  PENDING: "pending",
  ANSWERED: "answered",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  RETURNED: "returned",
};

// How each state should feel in a badge: neutral, attention, info, success, muted
export const STATE_TONE = {
  open: "neutral",
  pending: "attention",
  answered: "info",
  accepted: "success",
  rejected: "muted",
  returned: "success",
};

export const STATE_LABEL = {
  open: "Open",
  pending: "Question sent",
  answered: "Answered",
  accepted: "Confirmed",
  rejected: "Declined",
  returned: "Returned",
};

const OWNER_COPY = {
  open: "Looking for your item…",
  pending: "Possible match found. Answer the question",
  answered: "Answer sent. Waiting for the finder",
  accepted: "Confirmed! Get the contact details",
  rejected: "Still looking for your item",
  returned: "Returned. Report closed",
};

const FINDER_COPY = {
  pending: "Waiting for the owner's answer",
  answered: "Review the owner's answer",
  accepted: "Arrange the handover",
  rejected: "Declined. Pick another match",
  returned: "Returned. Report closed",
};

export function statusSentence(role, state, info = {}) {
  if (role === "owner") return OWNER_COPY[state] || OWNER_COPY.open;
  if (state === STATE.OPEN) {
    if (!info.analyzed) return "Analyzing…";
    const n = info.matchCount || 0;
    return n === 0 ? "No matches yet" : `${n} ${n === 1 ? "match" : "matches"} ready`;
  }
  return FINDER_COPY[state] || "Analyzing…";
}

const RANK = { accepted: 5, answered: 4, pending: 3, rejected: 2 };
const stamp = (c) => new Date(c.updatedAt || c.createdAt || 0).getTime();

/** The claim that best describes where a report stands. */
export function pickClaim(claims) {
  return [...claims].sort((a, b) => (RANK[b.status] || 0) - (RANK[a.status] || 0) || stamp(b) - stamp(a))[0] || null;
}

export function deriveState(item, claim) {
  if (item.status === "returned") return STATE.RETURNED;
  if (!claim) return STATE.OPEN;
  return STATE[String(claim.status).toUpperCase()] || STATE.OPEN;
}

function actionFor(role, state, { item, claim, matchCount }) {
  if (role === "owner") {
    if (state === STATE.PENDING) return { label: "Answer the question", to: `/claim/${claim.id}` };
    if (state === STATE.ACCEPTED) return { label: "Get the contact details", to: `/handover/${claim.id}` };
    return null;
  }
  if (state === STATE.ANSWERED) return { label: "Review the answer", to: `/claim/${claim.id}/review` };
  if (state === STATE.ACCEPTED) return { label: "Arrange the handover", to: `/handover/${claim.id}` };
  if (state === STATE.RETURNED) return null;
  if (item.analyzed && (matchCount > 0 || state === STATE.REJECTED || state === STATE.PENDING)) {
    return { label: state === STATE.OPEN ? "Review matches" : "View matches", to: `/found/${item.id}/matches` };
  }
  if (!item.analyzed) return { label: "See progress", to: `/analyzing/${item.id}` };
  return null;
}

/**
 * Turns raw items, matches and claims into display cards.
 * Owner claims are linked to lost reports through claim.lostItemId; finder claims through the match or foundItemId.
 */
export function buildReportCards(items, matches, claims, myId) {
  return items
    .map((item) => {
      const role = item.type === "lost" ? "owner" : "finder";
      let itemClaims;
      let matchCount = 0;
      if (role === "owner") {
        itemClaims = claims.filter((c) => c.ownerId === myId && c.lostItemId === item.id);
      } else {
        const itemMatches = matches.filter((m) => m.foundItemId === item.id);
        matchCount = Math.min(5, itemMatches.length);
        const matchIds = new Set(itemMatches.map((m) => m.id));
        itemClaims = claims.filter((c) => c.finderId === myId && (matchIds.has(c.matchId) || c.foundItemId === item.id));
      }
      const claim = pickClaim(itemClaims);
      const state = deriveState(item, claim);
      return {
        item,
        role,
        claim,
        state,
        matchCount,
        sentence: statusSentence(role, state, { analyzed: item.analyzed, matchCount }),
        action: actionFor(role, state, { item, claim, matchCount }),
      };
    })
    .sort((a, b) => new Date(b.item.createdAt || 0) - new Date(a.item.createdAt || 0));
}

/** Questions the owner still has to answer, independent of any report linking. */
export const claimsWaitingForOwner = (claims, myId) =>
  claims.filter((c) => c.ownerId === myId && c.status === "pending");

/** Where a notification about a claim should send this person. */
export function routeForClaim(claim, myId) {
  if (!claim) return "/my-reports";
  if (claim.status === "accepted") return `/handover/${claim.id}`;
  if (claim.ownerId === myId && claim.status === "pending") return `/claim/${claim.id}`;
  if (claim.finderId === myId && claim.status === "answered") return `/claim/${claim.id}/review`;
  return "/my-reports";
}
