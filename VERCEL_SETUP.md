# Vercel setup instructions

## Your project

- **Dashboard:** `https://vercel.com/<your-team>/<your-project>`
- **Repository:** `https://github.com/<your-username>/ThatJob`

## Quick setup

### Step 1: Connect GitHub (if not already)

1. Open your project in the Vercel dashboard
2. If not connected, click **Connect Git**
3. Select **GitHub** → your `ThatJob` repository
4. Import the repository

### Step 2: Add environment variables

1. In the Vercel project → **Settings** → **Environment Variables**
2. Add these variables (values from your own Supabase / OpenAI / Groq accounts):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=(from Supabase Dashboard → Settings → API)
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
GROQ_MODEL=llama-3.1-70b-versatile
NEXT_PUBLIC_APP_URL=https://your-deployment.vercel.app
NODE_ENV=production
LOG_LEVEL=info
```

**Important:**

- Set each variable for **Production**, **Preview**, and **Development** as needed
- After first deploy, set `NEXT_PUBLIC_APP_URL` to your real Vercel or custom domain URL

### Step 3: Deploy

1. Go to the **Deployments** tab
2. Redeploy or push a new commit to trigger a build

### Step 4: Update Supabase redirect URLs

After the first successful deployment:

1. Copy your Vercel URL (e.g. `https://that-job-xxxxx.vercel.app`)
2. Supabase Dashboard → **Authentication** → **URL Configuration**
3. Add to **Redirect URLs** your app origin and `/dashboard` routes as needed
4. Adjust **Site URL** if required

### Step 5: Sync `NEXT_PUBLIC_APP_URL`

1. Vercel → **Settings** → **Environment Variables**
2. Set `NEXT_PUBLIC_APP_URL` to the URL users actually use
3. Redeploy

## Build settings

Vercel should auto-detect Next.js. If not:

- **Build command:** `npm run build`
- **Output:** Next.js default (`.next`)
- **Install:** `npm install`

## Custom domain (optional)

1. **Settings** → **Domains**
2. Add your domain and follow DNS instructions (see `DNS_SETUP.md`)
3. Update Supabase redirect URLs for the new domain

## Troubleshooting

- **Build fails:** check build logs, env vars, and Node 18+
- **Env vars missing:** redeploy after changes; names are case-sensitive
- **Supabase / OpenAI / Groq errors:** verify keys, quotas, and project status

## Next steps

1. Connect repo and deploy
2. Configure environment variables
3. Update Supabase auth URLs
4. Smoke-test signup, upload, and generation flows
