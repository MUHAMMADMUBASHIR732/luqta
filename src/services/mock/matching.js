import { categoryLabel } from "../../lib/schemas.js";

const OWNER_DEMO_ID = "u-owner";

export const uuid = () =>
  globalThis.crypto?.randomUUID?.() ??
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 3) | 8).toString(16);
  });

const hash = (text) => {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
};

const words = (text = "") =>
  new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

function km(a, b) {
  if (!a || !b || (!a.lat && !a.lng) || (!b.lat && !b.lng)) return Infinity;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const lc = (v) => String(v || "").trim().toLowerCase();

function scoreOne(found, lost) {
  const hasPhoto = Boolean(lost.imageUrl);
  const seed = hash(found.id + lost.id);
  let score = 28 + (seed % 24);
  const reasons = [];

  if (found.category && lost.category === found.category) {
    score += 24;
    reasons.push(`Same category: ${categoryLabel(lost.category)}`);
  }
  if (found.color && lc(found.color) === lc(lost.color)) {
    score += 12;
    reasons.push(`Same color: ${lc(lost.color)}`);
  }
  if (found.brand && lc(found.brand) === lc(lost.brand)) {
    score += 10;
    reasons.push(`Same brand: ${lost.brand}`);
  }
  const shared = [...words(found.description)].filter((w) => words(lost.description).has(w));
  if (shared.length) {
    score += Math.min(8, shared.length * 3);
    reasons.push("Similar details in the description");
  }
  if (km(found.location, lost.location) < 4) {
    score += 4;
    reasons.push("Lost close to where it was found");
  }

  if (!hasPhoto) score = Math.min(score, 78) - 8;

  // The demo owner's reports always surface, so the whole flow can be walked through.
  if (lost.userId === OWNER_DEMO_ID) {
    score = Math.max(score, hasPhoto ? 90 - (seed % 6) : 78 - (seed % 4));
    if (reasons.length === 0) reasons.push("Looks like the same item");
  }

  return {
    lost,
    score: Math.max(5, Math.min(98, Math.round(score))),
    reasons,
    basis: hasPhoto ? "photo" : "description",
  };
}

/** Top 5 candidates for a found item, as stored match rows. */
export function generateMatches(state, found) {
  const candidates = state.items.filter(
    (i) => i.type === "lost" && i.status === "open" && i.userId !== found.userId
  );
  const scored = candidates.map((lost) => scoreOne(found, lost)).sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 5);

  // Make sure the demo owner's reports are in the list.
  const owners = scored.filter((s) => s.lost.userId === OWNER_DEMO_ID && !top.includes(s));
  owners.forEach((s, k) => {
    top[4 - k] = s;
  });
  top.sort((a, b) => b.score - a.score);

  const now = new Date().toISOString();
  return top.map(({ lost, score, reasons, basis }) => ({
    id: uuid(),
    foundItemId: found.id,
    lostItemId: lost.id,
    finderId: found.userId,
    ownerId: lost.userId,
    score,
    basis,
    reasons,
    breakdown: { score },
    lostPreview: {
      imageUrl: lost.imageUrl,
      category: lost.category,
      color: lost.color,
      brand: lost.brand || null,
      features: lost.attributes?.features || [],
      place: lost.location?.label || null,
      dateTime: lost.dateTime,
    },
    status: "suggested",
    createdAt: now,
  }));
}
