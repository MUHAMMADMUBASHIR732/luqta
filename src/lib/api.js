// The only door to the backend. Pages and hooks import { api } from here and never touch the Supabase client
// or snake_case field names.
import service, { isMock, accountsForDemo, configWarning } from "../services/index.js";

export const api = service;
export { isMock, configWarning };
export const demoAccounts = accountsForDemo;
export const DEMO_PASSWORD = "demo1234";
