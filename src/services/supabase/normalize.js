// src/services/supabase/normalize.js
// The ONLY place that knows backend field names (snake_case). It accepts snake_case or camelCase,
// arrays or wrapped objects, so a small difference in the real responses cannot break the UI.
// If the real data looks different, fix it here and nowhere else.

const first = (...values) => values.find((v) => v !== undefined && v !== null);

const safeParse = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
};

const humanize = (k) => {
  const s = String(k).replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const rowsOf = (data) => {
  if (Array.isArray(data)) return data;
  if (data === undefined || data === null) return [];
  for (const key of ["data", "items", "matches", "claims", "notifications", "rows", "results"]) {
    if (Array.isArray(data[key])) return data[key];
  }
  return [data];
};

export const oneOf = (data) => rowsOf(data)[0] ?? null;

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// reasons / features can arrive as ["a"], [{text:"a"}], {color:"same"}, or "a"
export function toList(v) {
  if (v === undefined || v === null) return [];
  if (typeof v === "string") return v.trim() ? [v.trim()] : [];
  if (Array.isArray(v)) {
    return v
      .map((x) =>
        typeof x === "string"
          ? x.trim()
          : first(x?.text, x?.label, x?.reason, x?.message, x?.name)
      )
      .filter((x) => typeof x === "string" && x.length > 0);
  }
  if (typeof v === "object") {
    return Object.entries(v)
      .filter(([, x]) => x !== false && x !== null && x !== undefined && x !== "")
      .map(([k, x]) => (x === true ? humanize(k) : `${humanize(k)}: ${x}`));
  }
  return [];
}

export function normPreview(raw) {
  const p = typeof raw === "string" ? safeParse(raw) : raw || {};
  const a = p.attributes || {};
  return {
    imageUrl: first(p.imageUrl, p.image_url, p.image, p.photo) || null,
    category: first(p.category, a.category) ?? null,
    color: first(p.color, a.color) ?? null,
    brand: first(p.brand, a.brand) ?? null,
    features: toList(first(p.features, a.features)),
    // where/when the item was lost, shown on match cards when the backend includes it
    place: first(p.place, p.location_label, p.locationLabel, p.location?.label, a.place) || null,
    dateTime: toDate(first(p.dateTime, p.date_time, p.lostAt, p.lost_at)),
  };
}

export function normItem(raw) {
  if (!raw) return null;
  const attrs = (typeof raw.attributes === "string" ? safeParse(raw.attributes) : raw.attributes) || {};
  const loc = (typeof raw.location === "string" ? safeParse(raw.location) : raw.location) || {};
  return {
    id: raw.id,
    type: raw.type,
    userId: first(raw.user_id, raw.userId) ?? null,
    imageUrl: first(raw.image_url, raw.imageUrl) || null,
    attributes: attrs,
    category: attrs.category ?? null,
    color: attrs.color ?? null,
    brand: attrs.brand ?? null,
    location: { lat: Number(loc.lat) || 0, lng: Number(loc.lng) || 0, label: loc.label || "" },
    dateTime: toDate(first(raw.date_time, raw.dateTime)),
    description: raw.description || "",
    status: raw.status || "open",
    analyzed: Boolean(raw.analyzed),
    createdAt: toDate(first(raw.created_at, raw.createdAt)),
  };
}

export function normMatch(raw) {
  if (!raw) return null;
  const lostPreview = normPreview(first(raw.lost_preview, raw.lostPreview));
  let score = Number(raw.score) || 0;
  if (score > 0 && score <= 1 && !Number.isInteger(score)) score *= 100;
  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    id: raw.id,
    foundItemId: first(raw.found_item_id, raw.foundItemId) ?? null,
    lostItemId: first(raw.lost_item_id, raw.lostItemId) ?? null,
    finderId: first(raw.finder_id, raw.finderId) ?? null,
    ownerId: first(raw.owner_id, raw.ownerId) ?? null,
    score,
    basis: raw.basis || (lostPreview.imageUrl ? "photo" : "description"),
    reasons: toList(raw.reasons),
    breakdown: raw.breakdown ?? null,
    lostPreview,
    status: raw.status || "suggested",
    createdAt: toDate(first(raw.created_at, raw.createdAt)),
  };
}

export function normClaim(raw) {
  if (!raw) return null;
  const m = raw.match || raw.matches || {};
  const status = String(raw.status || "pending").toLowerCase();
  return {
    id: raw.id,
    matchId: first(raw.match_id, raw.matchId, m.id) ?? null,
    finderId: first(raw.finder_id, raw.finderId) ?? null,
    ownerId: first(raw.owner_id, raw.ownerId) ?? null,
    question: raw.question || "",
    answer: raw.answer || null,
    status: status === "pending_answer" ? "pending" : status,
    lostItemId: first(raw.lost_item_id, raw.lostItemId, m.lost_item_id, m.lostItemId) ?? null,
    foundItemId: first(raw.found_item_id, raw.foundItemId, m.found_item_id, m.foundItemId) ?? null,
    createdAt: toDate(first(raw.created_at, raw.createdAt)),
    updatedAt: toDate(first(raw.updated_at, raw.updatedAt)),
  };
}

export function normNotification(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    userId: first(raw.user_id, raw.userId) ?? null,
    text: raw.text || raw.message || "",
    claimId: first(raw.claim_id, raw.claimId) ?? null,
    read: Boolean(raw.read),
    createdAt: toDate(first(raw.created_at, raw.createdAt)),
  };
}

export function normProfile(raw) {
  if (!raw) return null;
  const c = raw.contact || raw.contacts || raw.user_contacts || {};
  const contact = Array.isArray(c) ? c[0] || {} : c;
  return {
    id: raw.id,
    name: raw.name || "",
    trustScore: Number(first(raw.trust_score, raw.trustScore, 100)),
    phone: first(raw.phone, contact.phone) || null,
    email: first(raw.email, contact.email) || null,
  };
}

export function normContact(raw) {
  if (!raw) return { phone: null, email: null };
  return { phone: raw.phone || null, email: raw.email || null };
}

// create_* RPCs may return a uuid string, a row, a one-row array, or { item: row }
export function extractId(data) {
  if (typeof data === "string") return data;
  const o = oneOf(data);
  if (typeof o === "string") return o;
  return first(o?.id, o?.item?.id, o?.item_id, o?.create_lost_item, o?.create_found_item) ?? null;
}
