// src/services/supabase/errors.js
// Every error that leaves the service layer is a ServiceError with a plain-language message.
// The raw error is kept in `.raw` for the dev-only /_debug page. Never render `.raw` to users.

export class ServiceError extends Error {
  constructor(message, raw) {
    super(message);
    this.name = "ServiceError";
    this.userMessage = message;
    this.raw = raw;
  }
}

const RULES = [
  [/invalid login credentials/i, "Wrong email or password."],
  [/email not confirmed/i, "Please confirm your email first, then sign in."],
  [/already registered|already been registered|already exists/i, "That email already has an account. Try signing in."],
  [/password.*(at least|short|weak)|weak password/i, "Choose a longer password (at least 6 characters)."],
  [/rate limit|too many/i, "Too many attempts. Please wait a minute and try again."],
  [/jwt|not authenticated|authentication required|auth session missing|not logged in/i, "Please sign in again."],
  [/permission denied|row-level security|\brls\b|not allowed|forbidden|only the (finder|owner)/i, "You don't have access to that."],
  [/not found|no rows|does not exist/i, "We couldn't find that."],
  [/failed to fetch|network|timeout|load failed/i, "Connection problem. Check your internet and try again."],
];

export function friendlyMessage(raw) {
  const text = typeof raw === "string" ? raw : raw?.message || raw?.error || "";
  for (const [re, message] of RULES) if (re.test(text)) return message;
  return "Something went wrong. Please try again.";
}

export function toServiceError(raw) {
  return raw instanceof ServiceError ? raw : new ServiceError(friendlyMessage(raw), raw);
}
