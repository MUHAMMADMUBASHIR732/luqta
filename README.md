# Luqta (لقطة) — frontend

AI-powered lost-and-found. React + Vite, Tailwind v4, React Router, react-hook-form + zod, Supabase JS, motion, sonner.

## Run
```
npm install
npm run dev
```
Opens on built-in demo data (no backend needed). Demo accounts (password `demo1234`): **finder@luqta.demo** (Hamza) and **owner@luqta.demo** (Sana). Use "Switch account" in the menu, or open a second tab: each tab has its own signed-in user, data is shared.
Add `?reset=1` to any URL to reset demo data, `?chaos=1` to simulate slow/failing network.

## Demo script
1. Hamza → My reports → Found → review matches → "Ask the owner a question".
2. Sana (other tab) → "Answer now" → send answer.
3. Hamza → Review answer → Yes → Handover (contact details) → Mark as returned.
4. Sana opening Hamza's matches URL goes to /forbidden.

## Connect the real Supabase backend
1. Copy `.env.example` to `.env`; set `VITE_USE_MOCK=false`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
2. Run `npm run dev` and open `/_debug` (dev only) to sign in and see raw RPC JSON; compare with `src/services/supabase/normalize.js` (the only file that knows snake_case).
3. Pages only import `api` from `src/lib/api.js`; both services expose the same interface.

## Deploy
`npm run build` → deploy `dist/` (Vercel `vercel.json` and Netlify `_redirects` included for SPA routing).
