// Demo backend. Same interface and normalized shapes as the Supabase service.
// Data lives in localStorage (shared by tabs). The signed-in user lives in sessionStorage (one per tab),
// so two windows can play the finder and the owner at the same time.

import { ServiceError } from "../supabase/errors.js";
import { fileToDataUrl } from "../../lib/image.js";
import { categoryLabel } from "../../lib/schemas.js";
import { buildSeed, DEMO_PASSWORD } from "./seed.js";
import { generateMatches, uuid } from "./matching.js";

const STORE_KEY = "luqta-store-v1";
const SESSION_KEY = "luqta-session";
const CHAOS_KEY = "luqta-chaos";

const FORBIDDEN = "You don't have access to that.";
const NOT_FOUND = "We couldn't find that.";
const OFFLINE = "Connection problem. Check your internet and try again.";

const DATE_KEYS = new Set(["dateTime", "createdAt", "updatedAt"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date().toISOString();

// ---------- query flags: ?reset=1 clears demo data, ?chaos=1 adds delay and random failures ----------
function readFlags() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  try {
    if (params.get("reset") === "1") {
      localStorage.removeItem(STORE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
    if (params.get("chaos") === "1") sessionStorage.setItem(CHAOS_KEY, "1");
    if (params.get("chaos") === "0") sessionStorage.removeItem(CHAOS_KEY);
  } catch {
    /* storage unavailable */
  }
  if (params.has("reset")) {
    params.delete("reset");
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : "") + window.location.hash);
  }
}
readFlags();

const chaos = () => {
  try {
    return sessionStorage.getItem(CHAOS_KEY) === "1";
  } catch {
    return false;
  }
};

// ---------- store ----------
let memory = null;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      memory = JSON.parse(raw);
      return memory;
    }
  } catch {
    /* fall through to memory or seed */
  }
  if (memory) return memory;
  memory = buildSeed();
  save(memory);
  return memory;
}

function save(state) {
  memory = state;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode: keep working from memory */
  }
}

function revive(value) {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = DATE_KEYS.has(key) && typeof v === "string" ? new Date(v) : revive(v);
    }
    return out;
  }
  return value;
}

const out = (value) => revive(structuredClone(value));

// ---------- session ----------
let sessionMemory = null;
const getSessionId = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) || sessionMemory;
  } catch {
    return sessionMemory;
  }
};
const setSessionId = (id) => {
  sessionMemory = id;
  try {
    if (id) sessionStorage.setItem(SESSION_KEY, id);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

const toUser = (u) => (u ? { id: u.id, email: u.email, name: u.name } : null);

function currentUserRow(state) {
  const id = getSessionId();
  return id ? state.users.find((u) => u.id === id) || null : null;
}

function requireUser(state) {
  const me = currentUserRow(state);
  if (!me) throw new ServiceError("Please sign in again.");
  return me;
}

function notify(state, userId, text, claimId = null) {
  state.notifications.unshift({ id: uuid(), userId, text, claimId, read: false, createdAt: now() });
}

// ---------- analysis simulator ----------
function analyze(itemId) {
  const state = load();
  const item = state.items.find((i) => i.id === itemId);
  if (!item || item.analyzed) return 0;
  item.analyzed = true;
  let created = 0;
  if (item.type === "found") {
    const matches = generateMatches(state, item);
    state.matches = state.matches.filter((m) => m.foundItemId !== item.id).concat(matches);
    created = matches.length;
  }
  save(state);
  return created;
}

const scheduleAnalysis = (item) => setTimeout(() => analyze(item.id), item.type === "found" ? 2500 : 1500);

function resumePending() {
  try {
    load().items.filter((i) => !i.analyzed).forEach((i) => setTimeout(() => analyze(i.id), 600));
  } catch {
    /* nothing to resume */
  }
}
resumePending();

// ---------- plumbing ----------
async function call(work) {
  await sleep(chaos() ? 200 + Math.random() * 400 : 70 + Math.random() * 80);
  if (chaos() && Math.random() < 0.1) throw new ServiceError(OFFLINE);
  const state = load();
  const result = await work(state);
  save(state);
  return result;
}

const claimsOfItem = (state, item) =>
  state.claims.filter((c) => (item.type === "lost" ? c.lostItemId === item.id : c.foundItemId === item.id));

const ACTIVE = new Set(["pending", "answered", "accepted"]);

function participantClaim(state, me, claimId) {
  const claim = state.claims.find((c) => c.id === claimId);
  if (!claim) throw new ServiceError(NOT_FOUND);
  if (claim.finderId !== me.id && claim.ownerId !== me.id) throw new ServiceError(FORBIDDEN);
  return claim;
}

export function createMockService() {
  const authListeners = new Set();
  const emitAuth = () => {
    const user = toUser(currentUserRow(load()));
    authListeners.forEach((cb) => cb(user));
  };

  return {
    // ---------- auth ----------
    onAuth(cb) {
      authListeners.add(cb);
      queueMicrotask(() => authListeners.has(cb) && cb(toUser(currentUserRow(load()))));
      return () => authListeners.delete(cb);
    },
    async currentUser() {
      return toUser(currentUserRow(load()));
    },
    async signIn(email, password) {
      return call(async (state) => {
        const found = state.users.find((u) => u.email === String(email).trim().toLowerCase());
        if (!found || found.password !== password) throw new ServiceError("Wrong email or password.");
        setSessionId(found.id);
        queueMicrotask(emitAuth);
        return toUser(found);
      });
    },
    async signUp(email, password, name) {
      return call(async (state) => {
        const clean = String(email).trim().toLowerCase();
        if (state.users.some((u) => u.email === clean)) {
          throw new ServiceError("That email already has an account. Try signing in.");
        }
        if (String(password).length < 6) throw new ServiceError("Choose a longer password (at least 6 characters).");
        const row = { id: uuid(), email: clean, password, name: name?.trim() || clean.split("@")[0], phone: null, trustScore: 100 };
        state.users.push(row);
        setSessionId(row.id);
        queueMicrotask(emitAuth);
        return { user: toUser(row), needsConfirmation: false };
      });
    },
    async signOut() {
      setSessionId(null);
      queueMicrotask(emitAuth);
    },

    // ---------- profile and contact ----------
    async getProfile() {
      return call(async (state) => {
        const me = requireUser(state);
        return out({ id: me.id, name: me.name, trustScore: me.trustScore, phone: me.phone, email: me.email });
      });
    },
    async updateProfile({ name } = {}) {
      return call(async (state) => {
        const me = requireUser(state);
        if (name && name.trim()) me.name = name.trim();
        queueMicrotask(emitAuth);
      });
    },
    async saveContact({ phone, email }) {
      return call(async (state) => {
        const me = requireUser(state);
        me.phone = phone?.trim() || null;
        if (email?.trim()) me.contactEmail = email.trim();
      });
    },

    // ---------- reports ----------
    async createReport({ type, file, declared = {}, location, dateTime, description }) {
      if (type === "found" && !file) throw new ServiceError("Add a photo of the item you found.");
      const imageUrl = file ? await fileToDataUrl(file, 480) : null;
      return call(async (state) => {
        const me = requireUser(state);
        const attrs = Object.fromEntries(Object.entries(declared).filter(([, v]) => v));
        const item = {
          id: uuid(),
          type,
          userId: me.id,
          imageUrl,
          attributes: attrs,
          category: attrs.category ?? null,
          color: attrs.color ?? null,
          brand: attrs.brand ?? null,
          location,
          dateTime: (dateTime instanceof Date ? dateTime : new Date(dateTime)).toISOString(),
          description,
          status: "open",
          analyzed: false,
          createdAt: now(),
        };
        state.items.unshift(item);
        queueMicrotask(() => scheduleAnalysis(item));
        return { id: item.id };
      });
    },
    async analyzeItem(itemId) {
      return call(async () => ({ matchesCreated: analyze(itemId) }));
    },
    getAnalysisError() {
      return null;
    },
    async getItem(itemId) {
      return call(async (state) => {
        const me = requireUser(state);
        const item = state.items.find((i) => i.id === itemId);
        if (!item) throw new ServiceError(NOT_FOUND);
        if (item.userId !== me.id) throw new ServiceError(FORBIDDEN);
        return out(item);
      });
    },
    async listMyItems(type) {
      return call(async (state) => {
        const me = requireUser(state);
        return out(state.items.filter((i) => i.userId === me.id && (!type || i.type === type)));
      });
    },
    async setItemStatus(itemId, status) {
      return call(async (state) => {
        const me = requireUser(state);
        const item = state.items.find((i) => i.id === itemId && i.userId === me.id);
        if (!item) throw new ServiceError(NOT_FOUND);
        item.status = status;
      });
    },
    async deleteReport(itemId) {
      return call(async (state) => {
        const me = requireUser(state);
        const item = state.items.find((i) => i.id === itemId && i.userId === me.id);
        if (!item) throw new ServiceError(NOT_FOUND);
        if (claimsOfItem(state, item).some((c) => ACTIVE.has(c.status))) {
          throw new ServiceError("This report has an open claim, so it can't be deleted yet.");
        }
        state.items = state.items.filter((i) => i.id !== itemId);
        state.matches = state.matches.filter((m) => m.foundItemId !== itemId && m.lostItemId !== itemId);
      });
    },

    // ---------- matches (finder only) ----------
    async listAllMatchesForFinder() {
      return call(async (state) => {
        const me = requireUser(state);
        return out(state.matches.filter((m) => m.finderId === me.id));
      });
    },
    async listMatchesForFinder(foundItemId) {
      return call(async (state) => {
        const me = requireUser(state);
        const rows = state.matches
          .filter((m) => m.finderId === me.id && m.foundItemId === foundItemId)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        return out(rows);
      });
    },

    // ---------- claims ----------
    async startClaim({ matchId, question }) {
      return call(async (state) => {
        const me = requireUser(state);
        const match = state.matches.find((m) => m.id === matchId);
        if (!match) throw new ServiceError(NOT_FOUND);
        if (match.finderId !== me.id) throw new ServiceError(FORBIDDEN);
        if (String(question || "").trim().length < 5) {
          throw new ServiceError("Write a question only the owner could answer.");
        }
        if (state.claims.some((c) => c.matchId === matchId)) {
          throw new ServiceError("You already asked about this match.");
        }
        const claim = {
          id: uuid(),
          matchId,
          finderId: me.id,
          ownerId: match.ownerId,
          question: question.trim(),
          answer: null,
          status: "pending",
          lostItemId: match.lostItemId,
          foundItemId: match.foundItemId,
          createdAt: now(),
          updatedAt: now(),
        };
        state.claims.push(claim);
        match.status = "claimed";
        notify(state, match.ownerId, "Someone found an item that may be yours. Answer their question.", claim.id);
        return out(claim);
      });
    },
    async listMyClaims() {
      return call(async (state) => {
        const me = requireUser(state);
        return out(state.claims.filter((c) => c.finderId === me.id || c.ownerId === me.id));
      });
    },
    async getClaim(claimId) {
      return call(async (state) => {
        const me = requireUser(state);
        return out(participantClaim(state, me, claimId));
      });
    },
    async answerClaim({ claimId, answer }) {
      return call(async (state) => {
        const me = requireUser(state);
        const claim = participantClaim(state, me, claimId);
        if (claim.ownerId !== me.id) throw new ServiceError(FORBIDDEN);
        if (claim.status !== "pending") throw new ServiceError("This question was already answered.");
        if (String(answer || "").trim().length < 2) throw new ServiceError("Write your answer first.");
        claim.answer = answer.trim();
        claim.status = "answered";
        claim.updatedAt = now();
        notify(state, claim.finderId, "The owner answered your question. Review their answer.", claim.id);
      });
    },
    async respondClaim({ claimId, accept }) {
      return call(async (state) => {
        const me = requireUser(state);
        const claim = participantClaim(state, me, claimId);
        if (claim.finderId !== me.id) throw new ServiceError(FORBIDDEN);
        if (claim.status !== "answered") throw new ServiceError("There is no answer to review yet.");
        claim.status = accept ? "accepted" : "rejected";
        claim.updatedAt = now();
        const match = state.matches.find((m) => m.id === claim.matchId);
        if (accept) {
          state.items.forEach((i) => {
            if (i.id === claim.lostItemId || i.id === claim.foundItemId) i.status = "matched";
          });
          notify(state, claim.ownerId, "Your answer was accepted. Get the contact details.", claim.id);
        } else {
          if (match) match.status = "suggested";
          notify(state, claim.ownerId, "The finder couldn't confirm the item. Your report is still open.", claim.id);
        }
        return { accepted: Boolean(accept) };
      });
    },
    async getContact({ claimId }) {
      return call(async (state) => {
        const me = requireUser(state);
        const claim = participantClaim(state, me, claimId);
        if (claim.status !== "accepted") {
          throw new ServiceError("Contact details unlock after the finder accepts the answer.");
        }
        const other = state.users.find((u) => u.id === (claim.finderId === me.id ? claim.ownerId : claim.finderId));
        return { phone: other?.phone || null, email: other?.contactEmail || other?.email || null };
      });
    },
    async markReturned({ claimId }) {
      return call(async (state) => {
        const me = requireUser(state);
        const claim = participantClaim(state, me, claimId);
        if (claim.finderId !== me.id) throw new ServiceError(FORBIDDEN);
        if (claim.status !== "accepted") throw new ServiceError("Accept the answer before marking it returned.");
        state.items.forEach((i) => {
          if (i.id === claim.lostItemId || i.id === claim.foundItemId) i.status = "returned";
        });
        const match = state.matches.find((m) => m.id === claim.matchId);
        if (match) match.status = "closed";
        notify(state, claim.ownerId, `Your ${categoryLabel(match?.lostPreview?.category).toLowerCase()} was marked as returned. Report closed.`, claim.id);
      });
    },

    // ---------- notifications ----------
    async listNotifications() {
      return call(async (state) => {
        const me = requireUser(state);
        return out(state.notifications.filter((n) => n.userId === me.id));
      });
    },
    async listUnreadNotifications() {
      return call(async (state) => {
        const me = requireUser(state);
        return out(state.notifications.filter((n) => n.userId === me.id && !n.read));
      });
    },
    async markNotificationRead(id) {
      return call(async (state) => {
        const me = requireUser(state);
        const n = state.notifications.find((x) => x.id === id && x.userId === me.id);
        if (n) n.read = true;
      });
    },
    async markAllNotificationsRead() {
      return call(async (state) => {
        const me = requireUser(state);
        state.notifications.forEach((n) => {
          if (n.userId === me.id) n.read = true;
        });
      });
    },
    async deleteNotification(id) {
      return call(async (state) => {
        const me = requireUser(state);
        state.notifications = state.notifications.filter((n) => !(n.id === id && n.userId === me.id));
      });
    },
  };
}

export { DEMO_PASSWORD };
