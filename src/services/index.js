import mock, { demoAccounts } from "./mock/index.js";
import supabaseService from "./supabase/index.js";
import { supabaseConfigured } from "./supabase/client.js";

const wantsReal = import.meta.env.VITE_USE_MOCK === "false";

/** True while the app runs on built-in demo data. */
export const isMock = !(wantsReal && supabaseConfigured && supabaseService);

/** Shown in the dev console only: real mode was requested but the keys are missing. */
export const configWarning =
  wantsReal && !supabaseConfigured
    ? "VITE_USE_MOCK is false but VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing, so demo data is used."
    : null;

export const accountsForDemo = isMock ? demoAccounts : [];

export default isMock ? mock : supabaseService;
