# Supabase Setup Instructions

## Your Project
- **Dashboard:** https://supabase.com/dashboard/project/ghypcaqrdclhfppabgjs
- **Project ID:** `ghypcaqrdclhfppabgjs`

## Quick Setup (5 minutes)

### Step 1: Run Database Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ghypcaqrdclhfppabgjs
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `supabase/complete_setup.sql` from this project
5. Copy the **entire contents** and paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl+Enter)
7. Wait for "Success. No rows returned" message

**OR** run migrations individually:
- Run `supabase/migrations/001_initial_schema.sql`
- Run `supabase/migrations/002_add_templates.sql`
- Run `supabase/migrations/003_add_analytics.sql`
- Run `supabase/migrations/004_add_queue.sql`
- Run `supabase/migrations/005_add_preferences.sql`
- Run `supabase/migrations/006_add_chat.sql`
- Run `supabase/setup_storage.sql`

### Step 2: Verify Tables Created

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `user_profiles`
   - `user_materials`
   - `user_ai_profile`
   - `job_postings`
   - `generated_documents`
   - `document_templates`
   - `analytics_events`
   - `processing_queue`
   - `shared_documents`
   - `job_preferences`
   - `job_matching_scores`
   - `ai_chat_conversations`
   - `ai_chat_messages`
   - `chat_actions`

### Step 3: Verify Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. You should see 3 buckets:
   - `user-materials` (private)
   - `generated-documents` (private)
   - `templates` (public)

If buckets don't exist, run `supabase/setup_storage.sql` separately.

### Step 4: Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:

**For `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ghypcaqrdclhfppabgjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(copy from "Project API keys" → "anon" "public")
SUPABASE_SERVICE_ROLE_KEY=(copy from "Project API keys" → "service_role" "secret")
```

**⚠️ Keep service_role key SECRET - never commit to Git!**

### Step 5: Configure Authentication Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these **Site URL** and **Redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3000/dashboard`
   - `https://that-job.vercel.app` (or your Vercel URL)
   - `https://that-job.vercel.app/dashboard`

### Step 6: (Optional) Set Up OAuth

**Google OAuth:**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://ghypcaqrdclhfppabgjs.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret
5. In Supabase: **Authentication** → **Providers** → **Google** → Enable and paste credentials

**GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Callback URL: `https://ghypcaqrdclhfppabgjs.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret
5. In Supabase: **Authentication** → **Providers** → **GitHub** → Enable and paste credentials

## Update Environment Variables

Update your `.env.local` file with the Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ghypcaqrdclhfppabgjs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Verify Setup

Run this in SQL Editor to check everything:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check buckets
SELECT id, name, public 
FROM storage.buckets;

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Troubleshooting

**"relation already exists" errors:**
- Tables already exist - that's fine, the `IF NOT EXISTS` clauses handle this

**Storage buckets not showing:**
- Run `supabase/setup_storage.sql` separately
- Check Storage → Buckets manually

**RLS policy errors:**
- Policies might already exist - that's fine
- Use `CREATE POLICY IF NOT EXISTS` (already in complete_setup.sql)

**Can't access storage:**
- Verify RLS policies are created
- Check bucket permissions in Storage dashboard

## Next Steps

1. ✅ Database migrations - DONE
2. ✅ Storage buckets - DONE
3. ⏭️ Get API keys and add to `.env.local`
4. ⏭️ Configure Vercel environment variables
5. ⏭️ Deploy!
