# Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Supabase Setup

1. **Create Account & Project:**
   - Go to https://supabase.com
   - Sign up/login
   - Click "New Project"
   - Fill in:
     - Organization: Create new or select existing
     - Name: `thatjob` (or your choice)
     - Database Password: **Save this!**
     - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

2. **Run Migrations:**
   - In Supabase Dashboard → SQL Editor
   - Click "New query"
   - Copy/paste content from each migration file:
     - `001_initial_schema.sql`
     - `002_add_templates.sql`
     - `003_add_analytics.sql`
     - `004_add_queue.sql`
     - `005_add_preferences.sql`
     - `006_add_chat.sql`
   - Run each one (click "Run" or Cmd/Ctrl+Enter)
   - Verify all tables created (check Table Editor)

3. **Set up Storage:**
   - Go to Storage
   - Create bucket: `user-materials`
     - Public: **No**
     - File size limit: 10MB
   - Create bucket: `generated-documents`
     - Public: **No**
     - File size limit: 10MB
   - Create bucket: `templates`
     - Public: **Yes**
     - File size limit: 5MB

4. **Configure Auth Providers:**
   - Go to Authentication → Providers
   - **Email:** Already enabled (default)
   - **Google OAuth:**
     - Enable toggle
     - Get credentials from https://console.cloud.google.com
     - Create OAuth 2.0 Client ID
     - Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase
   - **GitHub OAuth:**
     - Enable toggle
     - Go to https://github.com/settings/developers
     - New OAuth App
     - Callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase

5. **Get API Keys:**
   - Go to Project Settings → API
   - Copy:
     - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2. GitHub Setup

1. **Initialize Git:**
```bash
cd "/Users/phktistakis/Devoloper Projects/ThatJob"
git init
git add .
git commit -m "Initial commit: ThatJob AI CV Generator"
```

2. **Create Repository:**
   - Go to https://github.com/new
   - Repository name: `thatjob`
   - Description: "AI-powered CV and cover letter generator"
   - Choose visibility
   - **Don't** initialize with README/license
   - Click "Create repository"

3. **Push Code:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/thatjob.git
git branch -M main
git push -u origin main
```

### 3. Vercel Setup

1. **Connect GitHub:**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "Add New..." → "Project"
   - Import `thatjob` repository
   - Vercel auto-detects Next.js

2. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables:**
   - Before deploying, add all env vars:
     - `NEXT_PUBLIC_SUPABASE_URL` = (from Supabase)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from Supabase)
     - `SUPABASE_SERVICE_ROLE_KEY` = (from Supabase)
     - `OPENAI_API_KEY` = (your key)
     - `GROQ_API_KEY` = (your key)
     - `OPENAI_MODEL` = `gpt-4-turbo-preview`
     - `GROQ_MODEL` = `llama-3.1-70b-versatile`
     - `NEXT_PUBLIC_APP_URL` = (will be your Vercel URL after first deploy)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build (2-5 minutes)
   - Your app will be at: `https://thatjob-xxxxx.vercel.app`

5. **Update App URL:**
   - After first deploy, copy your Vercel URL
   - Update `NEXT_PUBLIC_APP_URL` in Vercel env vars
   - Update Supabase Auth redirect URLs to include Vercel URL
   - Redeploy if needed

### 4. Post-Deployment

1. **Copy Templates:**
   - Upload `CV_HBK.pdf` and `cover_HBK.pdf` to Supabase Storage bucket `templates`
   - Or use Vercel file system (if using file-based storage)

2. **Test Everything:**
   - Sign up with email
   - Test OAuth login
   - Upload a material
   - Generate a CV/cover
   - Test chat interface
   - Test document sharing

3. **Custom Domain (Optional):**
   - In Vercel → Settings → Domains
   - Add your custom domain
   - Update DNS records
   - Update Supabase redirect URLs

## Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard  
**Vercel Dashboard:** https://vercel.com/dashboard  
**GitHub Repository:** https://github.com/YOUR_USERNAME/thatjob

**Important URLs to Update:**
- Supabase Auth redirect URLs
- Vercel environment variables
- OAuth app callback URLs

## Troubleshooting

**"Missing Supabase environment variables"**
- Check all env vars are set in Vercel
- Ensure no typos in variable names
- Redeploy after adding env vars

**"RLS policy violation"**
- Check RLS policies in Supabase
- Ensure user is authenticated
- Verify user_id matches in queries

**"OpenAI API error"**
- Check API key is valid
- Verify you have credits
- Groq will automatically fallback

**"OAuth not working"**
- Verify redirect URLs match exactly
- Check Client ID/Secret are correct
- Ensure OAuth app is not in development mode (if required)
