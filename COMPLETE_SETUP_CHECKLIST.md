# Complete Setup Checklist

## ✅ What You Already Have

- [x] Supabase Project: https://supabase.com/dashboard/project/your-project-ref
- [x] GitHub Repository: https://github.com/your-username/ThatJob
- [x] Vercel Project: https://vercel.com/your-vercel-team/that-job

## 📋 What Needs to Be Done

### 1. Supabase Setup (5 minutes)

- [ ] **Run Database Migrations**
  - [ ] Go to https://supabase.com/dashboard/project/your-project-ref
  - [ ] Open SQL Editor
  - [ ] Run `supabase/complete_setup.sql` (or run migrations individually)
  - [ ] Verify all tables created in Table Editor

- [ ] **Verify Storage Buckets**
  - [ ] Check Storage → Buckets
  - [ ] Should see: `user-materials`, `generated-documents`, `templates`
  - [ ] If missing, run `supabase/setup_storage.sql`

- [ ] **Get API Keys**
  - [ ] Go to Project Settings → API
  - [ ] Copy `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Copy `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

- [ ] **Configure Auth Redirect URLs**
  - [ ] Go to Authentication → URL Configuration
  - [ ] Add: `http://localhost:3000`, `http://localhost:3000/dashboard`
  - [ ] Add your Vercel URL after first deploy

### 2. Local Environment (2 minutes)

- [ ] **Update `.env.local`**
  - [ ] Add Supabase URL and keys
  - [ ] OpenAI and Groq keys are already there ✅
  - [ ] Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

- [ ] **Test Locally**
  ```bash
  npm install
  npm run dev
  ```
  - [ ] Visit http://localhost:3000
  - [ ] Test signup/login
  - [ ] Test file upload

### 3. Vercel Setup (5 minutes)

- [ ] **Add Environment Variables**
  - [ ] Go to Vercel project → Settings → Environment Variables
  - [ ] Add all variables from `.env.local`
  - [ ] Set for Production, Preview, and Development

- [ ] **Deploy**
  - [ ] Push to GitHub or redeploy in Vercel
  - [ ] Wait for build to complete
  - [ ] Note your Vercel URL

- [ ] **Update Supabase Redirect URLs**
  - [ ] Add Vercel URL to Supabase Auth redirect URLs
  - [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel with actual URL
  - [ ] Redeploy

### 4. Final Steps (2 minutes)

- [ ] **Copy Template Files**
  - [ ] Upload `user_cv.pdf` to Supabase Storage → `templates` bucket
  - [ ] Upload `user_cover.pdf` to Supabase Storage → `templates` bucket
  - [ ] Or keep in `public/templates/` for file-based access

- [ ] **Test Production**
  - [ ] Visit your Vercel URL
  - [ ] Sign up with email
  - [ ] Upload a material
  - [ ] Generate a CV/cover
  - [ ] Test chat interface

## 🚀 Quick Commands

```bash
# Local development
npm install
npm run dev

# Check Supabase connection
# Visit http://localhost:3000 and try to sign up

# Deploy to Vercel
git add .
git commit -m "Setup complete"
git push
```

## 📚 Documentation Files

- `SUPABASE_SETUP.md` - Detailed Supabase instructions
- `VERCEL_SETUP.md` - Detailed Vercel instructions
- `SETUP_GUIDE.md` - General setup guide
- `DEPLOYMENT.md` - Full deployment guide

## 🆘 Need Help?

**Supabase Issues:**
- Check `SUPABASE_SETUP.md`
- Verify SQL ran successfully
- Check Table Editor for tables

**Vercel Issues:**
- Check `VERCEL_SETUP.md`
- Verify environment variables
- Check build logs

**Local Issues:**
- Check `.env.local` exists
- Verify all keys are set
- Check `npm run dev` output

## 🎯 Current Status

**Ready to Run:**
1. ✅ Code is complete
2. ✅ Dependencies installed
3. ✅ TypeScript compiles
4. ⏭️ Need Supabase migrations
5. ⏭️ Need environment variables
6. ⏭️ Need Vercel deployment

**Estimated Time to Full Setup:** 15 minutes
