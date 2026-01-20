# TrueHub Deployment Guide

## Prerequisites

- Node.js 18+
- Vercel account
- Supabase project (database + storage)
- OAuth credentials (Kakao, Naver, Google)
- OpenAI API key
- Resend API key
- (Optional) Sentry account

---

## 1. Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select "Next.js" as framework preset
4. Click "Deploy" (initial deploy will fail - that's expected)

### Step 2: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# NextAuth
NEXTAUTH_URL=https://truehub.previewapp.co.kr
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]

# OAuth - Kakao
KAKAO_CLIENT_ID=[from developers.kakao.com]
KAKAO_CLIENT_SECRET=[from developers.kakao.com]

# OAuth - Naver
NAVER_CLIENT_ID=[from developers.naver.com]
NAVER_CLIENT_SECRET=[from developers.naver.com]

# OAuth - Google
GOOGLE_CLIENT_ID=[from console.cloud.google.com]
GOOGLE_CLIENT_SECRET=[from console.cloud.google.com]

# External Services
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@truehub.kr

# Security
FINGERPRINT_SALT=[random 32 chars]
FINGERPRINT_PEPPER=[random 32 chars]

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=[your-org]
SENTRY_PROJECT=[your-project]

# App
NEXT_PUBLIC_APP_URL=https://truehub.previewapp.co.kr
```

### Step 3: Configure Build Settings

In Vercel Dashboard → Project → Settings → General:

- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x or 20.x

### Step 4: Redeploy

Trigger a new deployment after adding environment variables.

---

## 2. Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to Project → Settings → Domains
2. Add `truehub.previewapp.co.kr`
3. Vercel will provide DNS records

### Step 2: Configure DNS

Add these records in your DNS provider:

| Type  | Name    | Value                |
| ----- | ------- | -------------------- |
| CNAME | truehub | cname.vercel-dns.com |

Or if using apex domain:
| Type | Name | Value |
|------|------|-----------------|
| A | @ | 76.76.21.21 |

### Step 3: SSL Certificate

Vercel automatically provisions SSL. Wait 5-10 minutes after DNS propagation.

---

## 3. Database Setup

### Prisma Migration

After first deploy, run migrations:

```bash
# Option 1: Local with production DATABASE_URL
DATABASE_URL="..." npx prisma migrate deploy

# Option 2: Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### Seed Admin User

```bash
# Set these in .env first
ADMIN_EMAIL=admin@truehub.kr
ADMIN_PASSWORD=secure-password
ADMIN_NAME=Admin

# Run seed
npx tsx scripts/seed-operator.ts
```

---

## 4. OAuth Callback URLs

Update callback URLs in each OAuth provider:

### Kakao

```
https://truehub.previewapp.co.kr/api/auth/callback/kakao
```

### Naver

```
https://truehub.previewapp.co.kr/api/auth/callback/naver
```

### Google

```
https://truehub.previewapp.co.kr/api/auth/callback/google
```

---

## 5. Supabase Storage Setup

### Create Buckets

1. Go to Supabase Dashboard → Storage
2. Create bucket: `participations` (public)
3. Create bucket: `campaigns` (public)

### Storage Policies

For `participations` bucket:

```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'participations');

-- Allow public read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'participations');
```

---

## 6. Cron Job Setup (Job Queue)

### Option 1: Vercel Cron (Recommended)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/v1/jobs/run",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Option 2: External Cron Service

Use cron-job.org or similar:

- URL: `https://truehub.previewapp.co.kr/api/v1/jobs/run`
- Method: POST
- Schedule: Every 5 minutes

---

## 7. Sentry Setup (Optional)

1. Create project at [sentry.io](https://sentry.io)
2. Get DSN from Project Settings → Client Keys
3. Add to Vercel environment variables
4. Errors will auto-report in production

---

## 8. Post-Deployment Checklist

- [ ] Visit landing page - loads correctly
- [ ] Test tester login with Kakao/Naver/Google
- [ ] Test advertiser registration and login
- [ ] Test admin login with TOTP
- [ ] Create and publish a test campaign
- [ ] Submit a test participation
- [ ] Verify job queue processes (check logs)
- [ ] Check Sentry receives test error

---

## Troubleshooting

### Build Fails

Check build logs in Vercel Dashboard → Deployments → [deployment] → Build Logs

Common issues:

- Missing environment variables
- Prisma client not generated (add `prisma generate` to build)

### Database Connection Issues

- Ensure `?pgbouncer=true` in DATABASE_URL for Supabase pooler
- Check IP allowlist in Supabase (should allow Vercel IPs)

### OAuth Redirect Errors

- Verify callback URLs exactly match in provider settings
- Check NEXTAUTH_URL matches your domain

### Storage Upload Fails

- Verify bucket exists and policies are set
- Check SUPABASE_SERVICE_ROLE_KEY is correct

---

## Monitoring

### Logs

- Vercel Dashboard → Project → Logs (real-time)
- Sentry → Issues (errors)

### Performance

- Vercel Analytics (auto-enabled)
- Sentry Performance (if configured)

### Uptime

Consider adding uptime monitoring:

- [UptimeRobot](https://uptimerobot.com)
- [Better Uptime](https://betteruptime.com)
