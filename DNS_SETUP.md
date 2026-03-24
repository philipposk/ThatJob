# DNS Setup for a custom domain (example)

## Vercel domain configuration

### Main production domain

Use your Vercel default URL (for example **`https://that-job.vercel.app`**) until a custom domain is configured. You may also see branch and deployment-specific preview URLs in the Vercel dashboard.

## DNS provider configuration

### Step 1: Add domain in Vercel

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your hostname (for example `app.example.com`)
4. Vercel will show DNS records to add

### Step 2: Configure DNS at your registrar

Vercel will give you one of these options:

**Option A: CNAME record (recommended)**

- **Type:** CNAME
- **Name/Host:** subdomain (e.g. `app`) or `@` for apex if supported
- **Value/Target:** value shown in Vercel (often `cname.vercel-dns.com`)
- **TTL:** 3600 (or default)

**Option B: A record (if CNAME is not supported for apex)**

- **Type:** A
- **Name/Host:** `@` or as instructed by Vercel
- **Value/Target:** IP address shown in Vercel (verify current value in the dashboard)
- **TTL:** 3600 (or default)

### Step 3: Wait for DNS propagation

- DNS changes can take from minutes up to 48 hours
- Check status in Vercel → **Domains**

### Step 4: Update environment variables

Once the domain is active:

1. **Update `.env.local`:**

```env
NEXT_PUBLIC_APP_URL=https://app.example.com
```

2. **Update Vercel environment variables** with the same `NEXT_PUBLIC_APP_URL`
3. **Update Supabase redirect URLs** under Authentication → URL Configuration to include your production URL and `/dashboard` paths

## Verification

1. Visit your custom domain and confirm the app loads
2. Vercel → **Domains** should show valid configuration
3. Test sign-in and redirects end to end

Replace `app.example.com` with your real hostname everywhere you configure URLs.
