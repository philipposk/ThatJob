# Vercel Setup Instructions

## Your Project
- **Dashboard:** https://vercel.com/filippos-projects-06f05211/that-job
- **Repository:** https://github.com/philipposk/ThatJob

## Quick Setup

### Step 1: Connect GitHub (if not already)

1. Go to https://vercel.com/filippos-projects-06f05211/that-job
2. If not connected, click **Connect Git**
3. Select **GitHub** → **philipposk/ThatJob**
4. Import the repository

### Step 2: Add Environment Variables

1. In Vercel project → **Settings** → **Environment Variables**
2. Add these variables (one by one):

```env
NEXT_PUBLIC_SUPABASE_URL=https://ghypcaqrdclhfppabgjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(get from Supabase Dashboard → Settings → API)
SUPABASE_SERVICE_ROLE_KEY=(get from Supabase Dashboard → Settings → API)
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
GROQ_MODEL=llama-3.1-70b-versatile
NEXT_PUBLIC_APP_URL=https://that-job.vercel.app
NODE_ENV=production
LOG_LEVEL=info
```

**Important:**
- Set each variable for **Production**, **Preview**, and **Development**
- After adding `NEXT_PUBLIC_APP_URL`, update it with your actual Vercel URL after first deploy

### Step 3: Deploy

1. Go to **Deployments** tab
2. If there's a failed deployment, click **Redeploy**
3. Or push a new commit to trigger deployment:
   ```bash
   git add .
   git commit -m "Setup complete"
   git push
   ```

### Step 4: Update Supabase Redirect URLs

After first successful deployment:

1. Get your Vercel URL (e.g., `https://that-job-xxxxx.vercel.app`)
2. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
3. Add to **Redirect URLs**:
   - `https://that-job-xxxxx.vercel.app`
   - `https://that-job-xxxxx.vercel.app/dashboard`
4. Update **Site URL** if needed

### Step 5: Update Vercel Environment Variable

1. In Vercel → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
3. Redeploy

## Build Settings

Vercel should auto-detect:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

If not, set these manually in **Settings** → **General**.

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs with custom domain

## Monitoring

- **Deployments:** See build logs and status
- **Analytics:** View traffic and performance
- **Logs:** Check function logs for errors
- **Speed Insights:** Performance monitoring

## Troubleshooting

**Build fails:**
- Check build logs for errors
- Verify all environment variables are set
- Ensure Node.js version is 18+ (set in **Settings** → **General**)

**Environment variables not working:**
- Make sure they're set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

**Supabase connection fails:**
- Verify API keys are correct
- Check Supabase project is active
- Verify RLS policies are set

**OpenAI/Groq errors:**
- Check API keys are valid
- Verify you have credits/quota
- Check rate limits

## Next Steps

1. ✅ Vercel project connected
2. ⏭️ Add environment variables
3. ⏭️ Deploy
4. ⏭️ Update Supabase redirect URLs
5. ⏭️ Test the app!
