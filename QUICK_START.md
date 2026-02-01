# Quick Start Guide

## 🚀 Get Running in 5 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Go to https://supabase.com → Create Project
2. Run all migrations from `supabase/migrations/` in SQL Editor
3. Create storage buckets: `user-materials`, `generated-documents`, `templates`
4. Copy API keys to `.env.local`

### 3. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
OPENAI_API_KEY=sk-proj-...
GROQ_API_KEY=gsk_...
```

### 4. Copy Templates
```bash
cp CV_HBK.pdf public/templates/
cp cover_HBK.pdf public/templates/
```

### 5. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## 📦 Deploy to Production

### GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/thatjob.git
git push -u origin main
```

### Vercel
1. Go to https://vercel.com
2. Import GitHub repository
3. Add all environment variables
4. Deploy!

See `DEPLOYMENT.md` for detailed instructions.

## 🔑 Authentication Options

**Email/Password:** Already configured in Supabase

**OAuth (Google/GitHub):**
1. Get OAuth credentials
2. Add to Supabase Dashboard → Authentication → Providers
3. Set redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## 🆘 Need Help?

- **Setup Issues:** See `SETUP_GUIDE.md`
- **Deployment:** See `DEPLOYMENT.md`
- **API Keys:** Check Supabase Dashboard → Settings → API
