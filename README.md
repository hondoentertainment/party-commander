# Party Command Center

## Setup

### Supabase Auth (Google / Gmail & Magic Link)

1. **Create a Supabase project** at [supabase.com](https://supabase.com) and copy the project URL and anon key from Settings → API. Add them to `.env`:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Redirect URLs**: In Supabase Dashboard → Auth → URL Configuration, add:
   - `http://localhost:5173/auth/callback` (dev)
   - `http://127.0.0.1:5173/auth/callback` (alternate localhost)
   - Your production URL + `/auth/callback` (e.g. `https://mysite.com/auth/callback`)

3. **Enable Google / Gmail sign-in**:
   - In Supabase: Auth → Providers → Google → Enable the provider.
   - In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
     - Create an OAuth 2.0 Client ID (Web application).
     - Under **Authorized JavaScript origins**, add:
       - `http://localhost:5173` (and `http://127.0.0.1:5173` for dev)
       - Your production origin (e.g. `https://mysite.com`)
     - Under **Authorized redirect URIs**, add your Supabase callback URL (shown on the Supabase Google provider page, e.g. `https://xxxxxxxx.supabase.co/auth/v1/callback`).
   - In Google Cloud Console → APIs & Services → [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent), ensure:
     - `../auth/userinfo.email` (default)
     - `../auth/userinfo.profile` (default)
     - `openid` (add manually in OAuth consent screen → Scopes)
   - Copy Client ID and Client Secret into Supabase → Auth → Providers → Google.

4. **Profiles table**: Run the migration in `supabase/migrations/001_profiles.sql` via Supabase SQL Editor or CLI.

### Deployment (GitHub + Vercel)

1. **Push to GitHub** (if needed):
   ```powershell
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub.
   - Click **Add New** → **Project** and import `hondoentertainment/party-commander` (or your repo).
   - Vercel auto-detects Vite. Root directory, build command, and output are set via `vercel.json`.
   - Add environment variables under Project → Settings → Environment Variables:
     - `VITE_SUPABASE_URL` (Production + Preview)
     - `VITE_SUPABASE_ANON_KEY` (Production + Preview)
   - Deploy. Pushes to `main` deploy to production; other branches/PRs get preview URLs.

3. **Update Supabase redirect URLs**: Add your Vercel URL(s) in Supabase Auth → URL Configuration, e.g.:
   - `https://your-app.vercel.app/auth/callback`
   - `https://*.vercel.app/auth/callback` (for preview deployments, if your plan supports wildcards)

### Windows PowerShell

PowerShell 5.1 does not support `&&`. Use the setup script or run commands separately.

```
npm run setup
```

Or:

```
npm install;
npm install -D tailwindcss @tailwindcss/vite react-router-dom lucide-react date-fns uuid @types/uuid
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
