# ThatJob Setup Guide

## Quick Start

### 1. Environment Variables

Create `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Primary)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview

# Groq (Backup)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Redis (Optional - for production)
REDIS_URL=

# Logging
LOG_LEVEL=info
```

### 2. Supabase Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and set project name
   - Set database password (save it!)
   - Choose region closest to you
   - Wait for project to be created

2. **Run Database Migrations:**
   - Go to Supabase Dashboard → SQL Editor
   - Run each migration file in order:
     - `supabase/migrations/001_initial_schema.sql`
     - `supabase/migrations/002_add_templates.sql`
     - `supabase/migrations/003_add_analytics.sql`
     - `supabase/migrations/004_add_queue.sql`
     - `supabase/migrations/005_add_preferences.sql`
     - `supabase/migrations/006_add_chat.sql`

3. **Set up Storage Buckets:**
   - Go to Storage in Supabase Dashboard
   - Create buckets:
     - `user-materials` (public: false)
     - `generated-documents` (public: false)
     - `templates` (public: true)
   - Set up RLS policies for each bucket

4. **Configure Authentication:**
   - Go to Authentication → Providers
   - Enable Email provider (default)
   - Enable Google OAuth:
     - Get Client ID and Secret from Google Cloud Console
     - Add to Supabase
   - Enable GitHub OAuth:
     - Get Client ID and Secret from GitHub
     - Add to Supabase
   - Set redirect URLs:
     - `http://localhost:3000/dashboard` (development)
     - `https://your-domain.vercel.app/dashboard` (production)

5. **Get API Keys:**
   - Go to Project Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. GitHub Setup

1. **Initialize Git Repository:**
```bash
cd "/Users/phktistakis/Devoloper Projects/ThatJob"
git init
git add .
git commit -m "Initial commit: ThatJob AI CV Generator"
```

2. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Repository name: `thatjob` (or your preferred name)
   - Description: "AI-powered CV and cover letter generator"
   - Choose public or private
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/thatjob.git
git branch -M main
git push -u origin main
```

### 4. Vercel Deployment

1. **Connect GitHub to Vercel:**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your `thatjob` repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables in Vercel:**
   - In project settings → Environment Variables
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
     - `GROQ_API_KEY`
     - `OPENAI_MODEL`
     - `GROQ_MODEL`
     - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL after first deploy)

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://thatjob.vercel.app` (or your custom domain)

4. **Update Supabase Redirect URLs:**
   - After deployment, update Supabase Auth redirect URLs to include your Vercel URL

### 5. Copy Template Files

```bash
cp CV_HBK.pdf public/templates/
cp cover_HBK.pdf public/templates/
```

### 6. Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Authentication Setup Details

### Email/Password (Already Implemented)
- Works out of the box with Supabase
- Email verification can be enabled in Supabase Dashboard

### OAuth Setup

**Google OAuth:**
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Application name: "ThatJob"
4. Homepage URL: Your Vercel URL
5. Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

## Testing Checklist

- [ ] Supabase project created
- [ ] All migrations run successfully
- [ ] Storage buckets created
- [ ] Environment variables set
- [ ] GitHub repository created and pushed
- [ ] Vercel project connected
- [ ] Vercel environment variables added
- [ ] First deployment successful
- [ ] Can sign up/login
- [ ] Can upload materials
- [ ] Can generate CV/cover
- [ ] Chat interface works
- [ ] OAuth login works (if configured)

## Troubleshooting

**Build fails:**
- Check all environment variables are set
- Ensure Node.js version is 18+
- Check for TypeScript errors

**Supabase connection fails:**
- Verify API keys are correct
- Check RLS policies are set
- Ensure storage buckets exist

**OpenAI errors:**
- Check API key is valid
- Verify you have credits
- Groq will automatically be used as fallback

**OAuth not working:**
- Verify redirect URLs match exactly
- Check Client ID/Secret are correct
- Ensure OAuth app is approved (if required)
