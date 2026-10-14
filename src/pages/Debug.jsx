import { useState } from "react";
import { supabase, supabaseConfigured } from "../services/supabase/client.js";
import Button from "../components/Button.jsx";
import Page from "../components/Page.jsx";

// Dev-only: talks to Supabase directly and prints raw JSON so you can compare it with src/services/supabase/normalize.js.
// Parameter names follow the backend README. Secrets (tokens) are removed from the output.
const uid = async () => (await supabase.auth.getUser()).data.user?.id;
const CALLS = [
  ["get_user_profile", async () => supabase.rpc("get_user_profile", { user_id: await uid() })],
  ["update_user_profile (name)", async () => supabase.rpc("update_user_profile", { user_id: await uid(), new_name: (await supabase.auth.getUser()).data.user?.user_metadata?.name || "User" })],
  ["update_contact_info (test)", async () => supabase.rpc("update_contact_info", { user_id: await uid(), new_phone: "+92 300 0000000", new_email: (await supabase.auth.getUser()).data.user?.email })],
  ["get_user_items", async () => supabase.rpc("get_user_items", { p_user_id: await uid() })],
  ["get_matches_for_finder", async () => supabase.rpc("get_matches_for_finder", { p_finder_id: await uid() })],
  ["get_claims_for_user", async () => supabase.rpc("get_claims_for_user", { p_user_id: await uid() })],
  ["get_user_notifications", async () => supabase.rpc("get_user_notifications", { p_user_id: await uid() })],
];

const scrub = (value) => JSON.parse(JSON.stringify(value, (k, v) => (k === "access_token" || k === "refresh_token" ? "[removed]" : v)));

export default function Debug() {
  const [out, setOut] = useState({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function run(name, fn) {
    try {
      const res = await fn();
      setOut((o) => ({ ...o, [name]: scrub(res) }));
    } catch (e) {
      setOut((o) => ({ ...o, [name]: { thrown: String(e?.message || e) } }));
    }
  }
  const copy = () => navigator.clipboard?.writeText(JSON.stringify(out, null, 2));

  if (!import.meta.env.DEV) return <Page title="Debug"><p>Not available.</p></Page>;
  if (!supabaseConfigured) return <Page title="Debug"><p className="text-muted">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env first.</p></Page>;

  return (
    <Page title="Debug" wide>
      <h1 className="text-2xl font-bold">Supabase debug</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <input className="rounded-xl border border-line px-3" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded-xl border border-line px-3" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button size="sm" onClick={() => run("signIn", () => supabase.auth.signInWithPassword({ email, password }))}>Sign in</Button>
        {CALLS.map(([n, f]) => <Button key={n} size="sm" variant="outline" onClick={() => run(n, f)}>{n}</Button>)}
        <Button size="sm" variant="dark" onClick={copy}>Copy all</Button>
      </div>
      <pre className="mt-4 max-h-[60dvh] overflow-auto rounded-xl bg-ink-950 p-4 text-xs text-cream">{JSON.stringify(out, null, 2)}</pre>
    </Page>
  );
}
