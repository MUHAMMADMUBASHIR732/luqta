// src/services/supabase/service.js
// Real backend. Same interface as the mock service. `sb` is a Supabase client (injected so it can be tested).
// Pages never import this file; they use `api` from src/lib/api.js.

import { ServiceError, toServiceError } from "./errors.js";
import {
  rowsOf, oneOf, extractId,
  normItem, normMatch, normClaim, normNotification, normProfile, normContact,
} from "./normalize.js";

const safeName = (name = "photo.jpg") =>
  name.normalize("NFKD").replace(/[^\w.\-]+/g, "_").slice(-80) || "photo.jpg";

const toIso = (v) => (v instanceof Date ? v : new Date(v)).toISOString();

const toUser = (u) =>
  u
    ? {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.name || (u.email ? u.email.split("@")[0] : "User"),
      }
    : null;

export function createSupabaseService(sb) {
  const analysisErrors = new Map();

  async function uid() {
    const { data } = await sb.auth.getSession();
    const id = data?.session?.user?.id;
    if (!id) throw new ServiceError("Please sign in again.");
    return id;
  }

  const unwrap = ({ data, error }) => {
    if (error) throw toServiceError(error);
    return data;
  };

  const rpc = async (name, args) => unwrap(await sb.rpc(name, args));

  async function fnError(error) {
    try {
      const res = error.context;
      if (res && typeof res.json === "function") {
        const body = await res.json();
        return toServiceError(body?.error || body?.message || error);
      }
    } catch {
      /* fall through to the generic mapping */
    }
    return toServiceError(error);
  }

  async function fn(name, body) {
    const { data, error } = await sb.functions.invoke(name, { body });
    if (error) throw await fnError(error);
    if (data && data.success === false) throw toServiceError(data.error || data.message);
    return data;
  }

  return {
    // ---------- auth ----------
    onAuth(cb) {
      let active = true;
      sb.auth.getSession().then(({ data }) => active && cb(toUser(data?.session?.user)));
      const { data } = sb.auth.onAuthStateChange((_event, session) => cb(toUser(session?.user)));
      return () => {
        active = false;
        data?.subscription?.unsubscribe();
      };
    },
    async currentUser() {
      const { data } = await sb.auth.getSession();
      return toUser(data?.session?.user);
    },
    async signIn(email, password) {
      const data = unwrap(await sb.auth.signInWithPassword({ email, password }));
      return toUser(data?.user);
    },
    async signUp(email, password, name) {
      const data = unwrap(await sb.auth.signUp({ email, password, options: { data: { name } } }));
      // No session means the project requires email confirmation first.
      return { user: toUser(data?.user), needsConfirmation: !data?.session };
    },
    async signOut() {
      unwrap(await sb.auth.signOut());
    },

    // ---------- profile and contact ----------
    async getProfile() {
      const user_id = await uid();
      const profile = normProfile(oneOf(await rpc("get_user_profile", { user_id })));
      // The backend returns an all-null row when the person has no row in `users` yet. Fall back to the sign-in data.
      if (profile && profile.id) return profile;
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      return { id: user_id, name: u?.user_metadata?.name || "", trustScore: 100, phone: null, email: u?.email || null, missingRow: true };
    },
    async updateProfile({ name, fcmToken } = {}) {
      const args = { user_id: await uid(), new_name: name };
      if (fcmToken) args.new_fcm_token = fcmToken;
      await rpc("update_user_profile", args);
    },
    async saveContact({ phone, email }) {
      await rpc("update_contact_info", {
        user_id: await uid(),
        new_phone: phone?.trim() || null,
        new_email: email?.trim() || null,
      });
    },

    // ---------- reports ----------
    async createReport({ type, file, declared = {}, location, dateTime, description }) {
      if (type === "found" && !file) throw new ServiceError("Add a photo of the item you found.");
      const userId = await uid();

      let imageUrl;
      if (file) {
        const path = `${userId}/${Date.now()}-${safeName(file.name)}`;
        unwrap(await sb.storage.from("items").upload(path, file, { contentType: file.type || undefined }));
        imageUrl = sb.storage.from("items").getPublicUrl(path).data.publicUrl;
      }

      const args = {
        p_user_id: userId,
        p_location: location,
        p_date_time: toIso(dateTime),
        p_description: description,
        p_declared: Object.fromEntries(Object.entries(declared).filter(([, v]) => v)),
      };
      if (imageUrl) args.p_image_url = imageUrl; // lost reports without a photo omit it

      const created = await rpc(type === "found" ? "create_found_item" : "create_lost_item", args);
      const id = extractId(created);
      if (!id) throw new ServiceError("Something went wrong. Please try again.", created);

      // Fire and forget: the Analyzing screen polls `analyzed`. Failures are kept for a Retry button.
      this.analyzeItem(id).catch(() => {});
      return { id };
    },
    async analyzeItem(itemId) {
      analysisErrors.delete(itemId);
      try {
        const data = await fn("analyze-item", { itemId });
        return { matchesCreated: Number(data?.matchesCreated) || 0 };
      } catch (e) {
        analysisErrors.set(itemId, e.userMessage);
        throw e;
      }
    },
    getAnalysisError(itemId) {
      return analysisErrors.get(itemId) || null;
    },
    async getItem(itemId) {
      return normItem(oneOf(await rpc("get_item_details", { p_item_id: itemId })));
    },
    async listMyItems(type) {
      const args = { p_user_id: await uid() };
      if (type) args.p_type = type;
      return rowsOf(await rpc("get_user_items", args)).map(normItem).filter(Boolean);
    },
    async setItemStatus(itemId, status) {
      await rpc("update_item_status", { p_item_id: itemId, p_status: status });
    },
    async deleteReport(itemId) {
      await rpc("delete_item", { p_item_id: itemId });
    },

    // ---------- matches (finder only) ----------
    async listAllMatchesForFinder() {
      const rows = await rpc("get_matches_for_finder", { p_finder_id: await uid() });
      return rowsOf(rows).map(normMatch).filter(Boolean);
    },
    async listMatchesForFinder(foundItemId) {
      const all = await this.listAllMatchesForFinder();
      return all
        .filter((m) => m.foundItemId === foundItemId)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    },

    // ---------- claims ----------
    async startClaim({ matchId, question }) {
      const data = await fn("start-claim", { matchId, question, userId: await uid() });
      return normClaim(data?.claim);
    },
    async listMyClaims() {
      return rowsOf(await rpc("get_claims_for_user", { p_user_id: await uid() })).map(normClaim).filter(Boolean);
    },
    async getClaim(claimId) {
      return normClaim(oneOf(await rpc("get_claim_details", { p_claim_id: claimId })));
    },
    async answerClaim({ claimId, answer }) {
      await fn("answer-claim", { claimId, answer, userId: await uid() });
    },
    async respondClaim({ claimId, accept }) {
      const data = await fn("respond-claim", { claimId, accept, userId: await uid() });
      return { accepted: Boolean(data?.accepted ?? accept) };
    },
    async getContact({ claimId }) {
      return normContact(oneOf(await fn("get-contact", { claimId, userId: await uid() })));
    },
    async markReturned({ claimId }) {
      await fn("mark-returned", { claimId, userId: await uid() });
    },

    // ---------- notifications ----------
    async listNotifications() {
      return rowsOf(await rpc("get_user_notifications", { p_user_id: await uid() })).map(normNotification).filter(Boolean);
    },
    async listUnreadNotifications() {
      return rowsOf(await rpc("get_unread_notifications", { p_user_id: await uid() })).map(normNotification).filter(Boolean);
    },
    async markNotificationRead(id) {
      await rpc("mark_notification_read", { p_notification_id: id });
    },
    async markAllNotificationsRead() {
      await rpc("mark_all_notifications_read", { p_user_id: await uid() });
    },
    async deleteNotification(id) {
      await rpc("delete_notification", { p_notification_id: id });
    },
  };
}
