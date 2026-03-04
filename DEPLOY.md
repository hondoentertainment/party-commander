# Deploy to GitHub Pages & Vercel

## Prerequisites

- GitHub repo: `https://github.com/hondoentertainment/party-commander`
- Supabase URL and anon key from your Supabase project

---

## 0. Supabase setup (required for "Create New Event")

If "Initialize New Event" fails, run the database migrations:

1. Go to **Supabase Dashboard** → your project → **SQL Editor**
2. Run the migration files in order:
   - `supabase/migrations/001_profiles.sql`
   - `supabase/migrations/002_party_profiles_and_parties.sql`
   - `supabase/migrations/003_party_collaborators.sql`
   - `supabase/migrations/004_party_events.sql`

Or use the Supabase CLI: `npx supabase db push` (with project linked).

Without migrations, events are saved **locally** in your browser and will sync once the database is set up.

---

## 1. GitHub Pages

### Configure repository secrets

1. Go to **GitHub** → **hondoentertainment/party-commander** → **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `VITE_SUPABASE_URL` – your Supabase project URL (e.g. `https://xxxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` – your Supabase anon/public key

### Enable GitHub Pages

1. **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**

### Deploy

- Push to `main`, or run the workflow manually:
  - **Actions** → **Deploy to GitHub Pages** → **Run workflow**

Live URL: `https://hondoentertainment.github.io/party-commander/`

---

## 2. Vercel

### Connect the repo

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub recommended)
2. **Add New** → **Project**
3. **Import** the `hondoentertainment/party-commander` repo
4. Vercel will detect Vite from `vercel.json`

### Set environment variables

In the import screen or **Project** → **Settings** → **Environment Variables**, add:

| Name                  | Value              | Environment   |
|-----------------------|--------------------|--------------|
| `VITE_SUPABASE_URL`   | Your Supabase URL  | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | Production, Preview |

Optional: `VITE_GEMINI_API_KEY`, `VITE_ADMIN_EMAILS`, `VITE_ALLOWED_EMAIL_DOMAINS`

### Add Supabase auth redirect URL

In **Supabase** → **Authentication** → **URL Configuration**, add your Vercel URL to **Redirect URLs**, e.g.:

- `https://your-project.vercel.app/auth/callback`
- `https://*.vercel.app/auth/callback` (for preview deploys)

### Deploy

- Deployments run automatically on push to `main`
- Use `npx vercel` for preview or `npx vercel --prod` for production

---

## Auth callback URLs

Add these to Supabase → Authentication → Redirect URLs:

- **GitHub Pages:** `https://hondoentertainment.github.io/party-commander/auth/callback`
- **GitHub Pages (password reset):** `https://hondoentertainment.github.io/party-commander/reset-password`
- **Vercel:** `https://YOUR_VERCEL_DOMAIN/auth/callback` and `https://*.vercel.app/auth/callback`
- **Vercel (password reset):** `https://YOUR_VERCEL_DOMAIN/reset-password` and `https://*.vercel.app/reset-password`
