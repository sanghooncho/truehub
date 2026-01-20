# TrueHub - 리워드 앱 체험/피드백 플랫폼

실사용자 피드백으로 앱을 성장시키는 AI 기반 피드백 분석 플랫폼

## 🚀 Features

### For Advertisers

- 캠페인 생성 및 관리
- AI 기반 피드백 인사이트 분석 (GPT-4o-mini)
- 크레딧 기반 결제 시스템
- 실시간 참여 현황 대시보드

### For Testers

- 다양한 앱 체험 캠페인
- 소셜 로그인 (카카오, 네이버, 구글)
- 스크린샷 + 피드백 제출
- 포인트 리워드 지급

### For Admins

- 참여 심사 및 승인/반려
- 리워드 지급 관리
- 사기 탐지 시스템 (pHash, 행동 분석)
- 충전 요청 승인
- 감사 로그

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **Auth**: NextAuth.js + TOTP (Admin)
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4o-mini
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/your-org/truehub.git
cd truehub

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## 🔧 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
NAVER_CLIENT_ID=""
NAVER_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# External Services
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing page
│   ├── admin/           # Admin dashboard
│   ├── advertiser/      # Advertiser portal
│   ├── tester/          # Tester mobile web
│   └── api/v1/          # API routes
├── components/
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── jobs/            # Background job handlers
│   └── auth/            # Auth utilities
└── infra/
    └── db/              # Prisma client
```

## 🔐 User Roles

| Role             | Auth Method           | Access         |
| ---------------- | --------------------- | -------------- |
| Tester           | Social OAuth          | /tester/\*     |
| Advertiser       | Email/Password        | /advertiser/\* |
| Admin (Operator) | Email/Password + TOTP | /admin/\*      |

## 📊 Job Queue

Background jobs are processed via `/api/v1/jobs/run`:

- `PHASH_CALC` - Image perceptual hash calculation
- `FRAUD_CHECK` - Fraud score calculation
- `AI_REPORT` - AI insight generation
- `SEND_EMAIL` - Email notifications

Trigger manually or via cron:

```bash
curl -X POST http://localhost:3000/api/v1/jobs/run
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables
3. Deploy

### Manual Build

```bash
npm run build
npm start
```

## 📝 API Documentation

See `.claude/docs/03_API_CONTRACTS.md` for full API documentation.

### Key Endpoints

| Method | Endpoint                                 | Description           |
| ------ | ---------------------------------------- | --------------------- |
| GET    | /api/v1/campaigns                        | List public campaigns |
| POST   | /api/v1/participations                   | Submit participation  |
| POST   | /api/v1/advertiser/campaigns             | Create campaign       |
| POST   | /api/v1/admin/participations/:id/approve | Approve participation |

## 🔒 Security

- TOTP 2FA for admin access
- pHash + SHA256 image duplicate detection
- Fraud scoring with auto-rejection
- Audit logging for all admin actions
- Input validation with Zod

See `.claude/docs/SECURITY_CHECKLIST.md` for full security review.

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ by TrueHub Team
