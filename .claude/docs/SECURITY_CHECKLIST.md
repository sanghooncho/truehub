# TrueHub Security Checklist

## Pre-Launch Security Review

### Authentication & Authorization

- [x] Admin login requires 2FA (TOTP)
- [x] Password hashing with bcrypt (cost factor 10)
- [x] JWT tokens with expiration
- [x] Separate auth flows for Tester, Advertiser, Admin
- [x] Social login (Kakao, Naver, Google) for testers
- [ ] Rate limiting on auth endpoints (TODO: implement)

### Data Protection

- [x] Database credentials in environment variables
- [x] Sensitive data not logged
- [x] Email addresses masked in API responses
- [x] User passwords never returned in responses
- [ ] Data encryption at rest (Supabase default)

### API Security

- [x] Input validation with Zod schemas
- [x] Authorization checks on all protected endpoints
- [x] CSRF protection via SameSite cookies
- [ ] Rate limiting on public APIs (TODO)
- [x] SQL injection prevention (Prisma ORM)

### File Upload Security

- [x] File type validation (images only)
- [x] Presigned URLs for direct S3 upload
- [x] File size limits enforced
- [x] Unique file names to prevent overwrites

### Fraud Prevention

- [x] Image hash (pHash + SHA256) for duplicate detection
- [x] Device fingerprinting
- [x] Rapid submission detection
- [x] Auto-rejection for high fraud scores (>=70)
- [x] Manual review queue for medium scores (40-69)

### Session Management

- [x] HTTP-only cookies for tokens
- [x] Secure flag in production
- [x] Token refresh mechanism
- [x] Logout invalidates session

### Infrastructure

- [ ] HTTPS enforced (Vercel automatic)
- [ ] Environment variables secured in Vercel
- [ ] Database connection pooling
- [ ] Supabase RLS policies (if needed)

### Monitoring & Logging

- [x] Audit logs for admin actions
- [ ] Sentry error tracking (TODO)
- [ ] Rate limit violation alerts (TODO)
- [x] Job queue monitoring via admin panel

### Sensitive Endpoints Checklist

| Endpoint                        | Auth   | Rate Limit | Notes                     |
| ------------------------------- | ------ | ---------- | ------------------------- |
| `/api/v1/auth/advertiser/login` | No     | TODO       | Password attempt tracking |
| `/api/v1/auth/operator/login`   | No     | TODO       | TOTP required             |
| `/api/v1/participations`        | Tester | TODO       | Daily limit enforced      |
| `/api/v1/admin/*`               | Admin  | No         | TOTP protected            |
| `/api/v1/uploads/presigned-url` | Tester | TODO       | File validation           |

## Production Environment Variables

```bash
# Database
DATABASE_URL=
DIRECT_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OAuth (Tester)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# External Services
OPENAI_API_KEY=
RESEND_API_KEY=

# Optional
CRON_SECRET=
SENTRY_DSN=
```

## Post-Launch Monitoring

1. Check audit logs daily for suspicious activity
2. Monitor job queue for failures
3. Review fraud detection statistics weekly
4. Check Sentry for runtime errors
5. Review Vercel analytics for performance
