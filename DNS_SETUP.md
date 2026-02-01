# DNS Setup for thatjob.6x7.gr

## Vercel Domain Configuration

### Main Production Domain
Use: **`that-job.vercel.app`**

This is your main production domain. The other domains are:
- `that-job-git-main-...` - Branch-specific (for preview deployments)
- `that-h0rd8kk6l-...` - Deployment-specific (temporary)

## Papaki DNS Configuration

### Step 1: Add Domain in Vercel

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `thatjob.6x7.gr`
4. Vercel will show you DNS records to add

### Step 2: Configure DNS in Papaki

Vercel will give you one of these options:

**Option A: CNAME Record (Recommended)**
- **Type:** CNAME
- **Name/Host:** `thatjob` (or `@` for root domain)
- **Value/Target:** `cname.vercel-dns.com`
- **TTL:** 3600 (or default)

**Option B: A Record (If CNAME not supported)**
- **Type:** A
- **Name/Host:** `thatjob` (or `@` for root domain)
- **Value/Target:** `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
- **TTL:** 3600 (or default)

### Step 3: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually works within 1-2 hours
- Check status in Vercel Dashboard → Domains

### Step 4: Update Environment Variables

Once DNS is configured and domain is active:

1. **Update `.env.local`:**
```env
NEXT_PUBLIC_APP_URL=https://thatjob.6x7.gr
```

2. **Update Vercel Environment Variables:**
   - Go to Vercel → Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` to: `https://thatjob.6x7.gr`
   - Redeploy

3. **Update Supabase Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add to Redirect URLs:
     - `https://thatjob.6x7.gr`
     - `https://thatjob.6x7.gr/dashboard`

## Current Status

**For NOW (before DNS is set up):**
- Use: `https://that-job.vercel.app` in `NEXT_PUBLIC_APP_URL`

**After DNS is configured:**
- Use: `https://thatjob.6x7.gr` in `NEXT_PUBLIC_APP_URL`

## Verification

After DNS setup, verify:
1. Visit `https://thatjob.6x7.gr` - should load your app
2. Check Vercel Dashboard → Domains - should show "Valid Configuration"
3. Test authentication - should redirect correctly
