# Project Structure — Reward App Experience/Feedback Platform

> Version: MVP 1.0  
> Date: 2026-01-20  
> Purpose: Implementation guide connecting Core Spec, DB Schema, and API Spec to actual code structure

---

## 1. Folder Structure Standard (Nest-ready)

### 1.1 Root Directory Structure

```
reward-platform/
├── src/
│   ├── app/                    # Next.js App Router (UI + thin API routes)
│   ├── server/                 # Domain logic (migration target)
│   ├── infra/                  # Infrastructure adapters (swappable)
│   └── shared/                 # Cross-cutting utilities
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── seed-operator.ts
├── public/
├── .env.local
├── .env.example
└── package.json
```

### 1.2 App Directory (Next.js UI + Thin Routes)

```
src/app/
├── (marketing)/
│   ├── page.tsx                # Landing page
│   ├── about/page.tsx
│   ├── pricing/page.tsx
│   └── contact/page.tsx
│
├── tester/
│   ├── login/page.tsx
│   ├── campaigns/
│   │   ├── page.tsx            # Campaign list
│   │   └── [id]/
│   │       ├── page.tsx        # Campaign detail
│   │       └── submit/page.tsx # Submit participation
│   ├── my/
│   │   ├── page.tsx            # My participations
│   │   └── [id]/page.tsx       # Participation detail
│   ├── rewards/page.tsx
│   └── settings/page.tsx
│
├── advertiser/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── campaigns/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       ├── insights/page.tsx
│   │       └── participations/page.tsx
│   ├── credits/
│   │   ├── page.tsx
│   │   └── topup/page.tsx
│   └── settings/page.tsx
│
├── admin/
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── participations/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── rewards/page.tsx
│   ├── topups/page.tsx
│   ├── campaigns/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── users/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── advertisers/page.tsx
│   ├── jobs/page.tsx
│   ├── audit-logs/page.tsx
│   └── settings/page.tsx
│
├── api/
│   └── v1/
│       ├── auth/
│       │   ├── tester/
│       │   │   ├── login/route.ts
│       │   │   └── refresh/route.ts
│       │   ├── advertiser/
│       │   │   ├── register/route.ts
│       │   │   └── login/route.ts
│       │   └── operator/
│       │       ├── login/route.ts
│       │       ├── verify-totp/route.ts
│       │       └── setup-totp/route.ts
│       ├── campaigns/
│       │   ├── route.ts                    # GET list
│       │   └── [id]/route.ts               # GET detail
│       ├── participations/
│       │   ├── route.ts                    # POST submit
│       │   └── my/route.ts                 # GET my list
│       ├── advertiser/
│       │   ├── campaigns/
│       │   │   ├── route.ts                # GET list, POST create
│       │   │   └── [id]/
│       │   │       ├── route.ts            # GET, PATCH
│       │   │       ├── publish/route.ts
│       │   │       ├── pause/route.ts
│       │   │       ├── resume/route.ts
│       │   │       ├── insights/route.ts
│       │   │       └── participations/route.ts
│       │   └── credits/
│       │       ├── route.ts                # GET balance
│       │       └── topup-request/route.ts  # POST request
│       ├── admin/
│       │   ├── dashboard/route.ts
│       │   ├── participations/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── route.ts
│       │   │       ├── approve/route.ts
│       │   │       └── reject/route.ts
│       │   ├── rewards/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── mark-sent/route.ts
│       │   │       └── mark-failed/route.ts
│       │   ├── topup-requests/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── confirm/route.ts
│       │   │       └── cancel/route.ts
│       │   ├── users/
│       │   │   ├── route.ts
│       │   │   └── [id]/
│       │   │       ├── ban/route.ts
│       │   │       └── unban/route.ts
│       │   ├── jobs/
│       │   │   ├── route.ts
│       │   │   └── [id]/retry/route.ts
│       │   └── audit-logs/route.ts
│       ├── uploads/
│       │   └── presigned-url/route.ts
│       └── webhooks/
│           └── stripe/route.ts
│
└── layout.tsx
```

### 1.3 Server Directory (Domain Logic — Migration Target)

```
src/server/
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── tester-auth.service.ts
│   │   ├── advertiser-auth.service.ts
│   │   ├── operator-auth.service.ts
│   │   ├── totp.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── totp.dto.ts
│   │   ├── validators/
│   │   │   └── auth.validators.ts
│   │   └── index.ts
│   │
│   ├── campaigns/
│   │   ├── campaign.service.ts
│   │   ├── campaign.repo.ts
│   │   ├── dto/
│   │   │   ├── create-campaign.dto.ts
│   │   │   ├── update-campaign.dto.ts
│   │   │   └── campaign-response.dto.ts
│   │   ├── validators/
│   │   │   └── campaign.validators.ts
│   │   ├── policies/
│   │   │   └── campaign.policies.ts      # Status transitions, publish rules
│   │   └── index.ts
│   │
│   ├── participations/
│   │   ├── participation.service.ts
│   │   ├── participation.repo.ts
│   │   ├── dto/
│   │   │   ├── submit-participation.dto.ts
│   │   │   └── participation-response.dto.ts
│   │   ├── validators/
│   │   │   └── participation.validators.ts
│   │   ├── policies/
│   │   │   ├── duplicate-check.policy.ts
│   │   │   └── daily-limit.policy.ts
│   │   └── index.ts
│   │
│   ├── credits/
│   │   ├── credit.service.ts
│   │   ├── wallet.repo.ts
│   │   ├── transaction.repo.ts
│   │   ├── topup.service.ts
│   │   ├── dto/
│   │   │   ├── topup-request.dto.ts
│   │   │   └── credit-response.dto.ts
│   │   ├── policies/
│   │   │   └── credit.policies.ts        # Deduction rules, balance checks
│   │   └── index.ts
│   │
│   ├── rewards/
│   │   ├── reward.service.ts
│   │   ├── reward.repo.ts
│   │   ├── dto/
│   │   │   ├── mark-sent.dto.ts
│   │   │   └── reward-response.dto.ts
│   │   └── index.ts
│   │
│   ├── fraud/
│   │   ├── fraud.service.ts
│   │   ├── fraud-signal.repo.ts
│   │   ├── fingerprint.service.ts
│   │   ├── phash.service.ts
│   │   ├── text-similarity.service.ts
│   │   ├── dto/
│   │   │   └── fraud-result.dto.ts
│   │   ├── policies/
│   │   │   ├── scoring.policy.ts         # Score calculation rules
│   │   │   └── auto-reject.policy.ts     # Score >= 70 rejection
│   │   └── index.ts
│   │
│   ├── ai/
│   │   ├── ai-insight.service.ts
│   │   ├── ai-insight.repo.ts
│   │   ├── prompt-builder.ts
│   │   ├── dto/
│   │   │   └── insight-response.dto.ts
│   │   ├── policies/
│   │   │   └── regeneration.policy.ts    # Cooldown, trigger conditions
│   │   └── index.ts
│   │
│   ├── jobs/
│   │   ├── job.service.ts
│   │   ├── job.repo.ts
│   │   ├── job-runner.ts
│   │   ├── handlers/
│   │   │   ├── fraud-check.handler.ts
│   │   │   ├── phash-calc.handler.ts
│   │   │   ├── text-similarity.handler.ts
│   │   │   ├── ai-report.handler.ts
│   │   │   └── send-email.handler.ts
│   │   ├── dto/
│   │   │   └── job.dto.ts
│   │   └── index.ts
│   │
│   └── admin/
│       ├── admin.service.ts
│       ├── audit-log.service.ts
│       ├── audit-log.repo.ts
│       ├── user-management.service.ts
│       ├── dto/
│       │   └── admin-response.dto.ts
│       └── index.ts
│
└── shared/
    ├── errors/
    │   ├── app-error.ts
    │   ├── error-codes.ts
    │   └── error-handler.ts
    ├── validators/
    │   └── common.validators.ts
    ├── types/
    │   ├── auth.types.ts
    │   ├── pagination.types.ts
    │   └── response.types.ts
    └── utils/
        ├── pagination.ts
        └── date.ts
```

### 1.4 Infra Directory (Swappable Adapters)

```
src/infra/
├── db/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── transaction.ts            # Transaction helper
│   └── repositories/
│       └── base.repo.ts          # Base repository pattern
│
├── storage/
│   ├── storage.interface.ts      # Interface for swappability
│   ├── supabase-storage.ts       # Current: Supabase Storage
│   └── s3-storage.ts             # Future: S3/R2 (same interface)
│
├── email/
│   ├── email.interface.ts        # Interface for swappability
│   ├── resend.adapter.ts         # Current: Resend
│   ├── templates/
│   │   ├── template.registry.ts
│   │   ├── tester-approved.ts
│   │   ├── tester-rejected.ts
│   │   ├── tester-paid.ts
│   │   ├── advertiser-target-reached.ts
│   │   └── advertiser-credit-low.ts
│   └── index.ts
│
├── ai/
│   ├── ai.interface.ts           # Interface for swappability
│   ├── openai.adapter.ts         # Current: OpenAI
│   └── index.ts
│
├── security/
│   ├── jwt.ts
│   ├── totp.ts
│   ├── password.ts
│   ├── rate-limiter.ts
│   └── index.ts
│
├── queue/
│   ├── queue.interface.ts        # Interface for swappability
│   ├── db-queue.ts               # Current: DB-based queue
│   └── index.ts
│
└── external/
    ├── stripe.ts                 # Stripe webhook handler
    └── social-oauth/
        ├── kakao.ts
        ├── naver.ts
        └── google.ts
```

---

## 2. API Route vs Service Boundary Rules

### 2.1 The Golden Rule

> **API Route = Input validation + Auth check + Service call + Response formatting**  
> **Service = All business logic, NO HTTP concerns**

### 2.2 What API Routes DO

```typescript
// ✅ CORRECT: API Route Handler
// src/app/api/v1/participations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { participationService } from '@/server/modules/participations';
import { submitParticipationSchema } from '@/server/modules/participations/validators';
import { handleApiError } from '@/server/shared/errors';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_INVALID_TOKEN', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    // 2. Parse & validate input
    const body = await req.json();
    const validated = submitParticipationSchema.parse(body);

    // 3. Call service (ALL logic is here)
    const result = await participationService.submit({
      userId: session.user.id,
      ...validated
    });

    // 4. Format response
    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    return handleApiError(error);
  }
}
```

### 2.3 What API Routes DO NOT DO

```typescript
// ❌ WRONG: Logic in API Route
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // ❌ DON'T: Check duplicates in route
  const existing = await prisma.participation.findFirst({
    where: { campaignId: body.campaignId, userId: session.user.id }
  });
  if (existing) {
    return NextResponse.json({ error: 'Already participated' }, { status: 400 });
  }

  // ❌ DON'T: Check daily limit in route
  const todayCount = await prisma.participation.count({
    where: { userId: session.user.id, createdAt: { gte: startOfDay } }
  });
  if (todayCount >= 3) {
    return NextResponse.json({ error: 'Daily limit' }, { status: 400 });
  }

  // ❌ DON'T: Create records directly
  const participation = await prisma.participation.create({ ... });
  
  // ❌ DON'T: Enqueue jobs directly
  await prisma.job.create({ type: 'FRAUD_CHECK', ... });
}
```

### 2.4 What Services DO

```typescript
// ✅ CORRECT: Service with all business logic
// src/server/modules/participations/participation.service.ts

import { participationRepo } from './participation.repo';
import { duplicateCheckPolicy, dailyLimitPolicy } from './policies';
import { jobService } from '../jobs';
import { AppError, ErrorCodes } from '@/server/shared/errors';

interface SubmitInput {
  userId: string;
  campaignId: string;
  answer1: string;
  answer2: string;
  feedback: string;
  imageKeys: string[];
  deviceFingerprint: string;
}

export const participationService = {
  async submit(input: SubmitInput) {
    // Business rule: Check duplicate
    const isDuplicate = await duplicateCheckPolicy.check(input.userId, input.campaignId);
    if (isDuplicate) {
      throw new AppError(ErrorCodes.PART_ALREADY_SUBMITTED);
    }

    // Business rule: Check daily limit
    const isLimitReached = await dailyLimitPolicy.check(input.userId);
    if (isLimitReached) {
      throw new AppError(ErrorCodes.PART_DAILY_LIMIT);
    }

    // Business rule: Check campaign status
    const campaign = await campaignRepo.findById(input.campaignId);
    if (campaign.status !== 'RUNNING') {
      throw new AppError(ErrorCodes.PART_CAMPAIGN_CLOSED);
    }

    // Create participation
    const participation = await participationRepo.create({
      ...input,
      status: 'SUBMITTED'
    });

    // Enqueue fraud check job
    await jobService.enqueue({
      type: 'FRAUD_CHECK',
      payload: { participationId: participation.id }
    });

    return {
      id: participation.id,
      status: participation.status
    };
  }
};
```

### 2.5 Boundary Summary Table

| Concern | API Route | Service |
|---------|-----------|---------|
| Parse request body | ✅ | ❌ |
| Validate input schema | ✅ | ❌ |
| Check authentication | ✅ | ❌ |
| Check authorization (role) | ✅ | ❌ |
| Format HTTP response | ✅ | ❌ |
| Handle HTTP errors | ✅ | ❌ |
| Business rule validation | ❌ | ✅ |
| Database operations | ❌ | ✅ |
| Call other services | ❌ | ✅ |
| Enqueue jobs | ❌ | ✅ |
| Send notifications | ❌ | ✅ |
| State transitions | ❌ | ✅ |

---

## 3. Migration Strategy (MVP → v1.1)

### 3.1 What Changes in v1.1

| Component | MVP | v1.1 |
|-----------|-----|------|
| API Framework | Next.js Route Handlers | NestJS Controllers |
| Job Runner | Supabase Scheduled Functions | Dedicated Worker Container |
| Storage | Supabase Storage | Cloudflare R2 / AWS S3 |
| Email | Resend | Same (or SendGrid) |
| Database | Supabase Postgres | Same (or RDS) |
| Fraud Detection | Basic (pHash, velocity) | Advanced (ML model) |
| Rewards | Manual | Gifticon API Integration |

### 3.2 What NEVER Changes

| Item | Reason |
|------|--------|
| API Contracts (DTOs) | Versioned API, clients depend on it |
| Database Schema | Data is persistent |
| State Machines | Core business logic |
| Error Codes | Client error handling |
| Job Payload Schemas | Queue compatibility |

### 3.3 Migration Steps

#### Step 1: Extract NestJS Controllers

```typescript
// BEFORE (Next.js Route Handler)
// src/app/api/v1/participations/route.ts
export async function POST(req: NextRequest) {
  const validated = schema.parse(await req.json());
  const result = await participationService.submit(validated);
  return NextResponse.json({ success: true, data: result });
}

// AFTER (NestJS Controller)
// src/controllers/participation.controller.ts
@Controller('api/v1/participations')
export class ParticipationController {
  constructor(private participationService: ParticipationService) {}

  @Post()
  async submit(@Body() dto: SubmitParticipationDto) {
    const result = await this.participationService.submit(dto);
    return { success: true, data: result };
  }
}

// Service stays EXACTLY THE SAME
// Just move src/server/modules/participations → src/modules/participations
```

#### Step 2: Extract Job Runner

```typescript
// BEFORE (Supabase Scheduled Function)
// supabase/functions/job-runner/index.ts
import { jobRunner } from '@/server/modules/jobs';
Deno.serve(async () => {
  await jobRunner.processJobs();
  return new Response('OK');
});

// AFTER (Standalone Worker)
// worker/src/index.ts
import { jobRunner } from './modules/jobs';
async function main() {
  while (true) {
    await jobRunner.processJobs();
    await sleep(10000); // 10 seconds
  }
}
main();
```

#### Step 3: Swap Infra Adapters

```typescript
// Storage swap example
// BEFORE
import { supabaseStorage } from '@/infra/storage/supabase-storage';
export const storage = supabaseStorage;

// AFTER (just change the import)
import { s3Storage } from '@/infra/storage/s3-storage';
export const storage = s3Storage;

// Interface stays the same
interface StorageAdapter {
  getPresignedUrl(key: string, contentType: string): Promise<string>;
  getPublicUrl(key: string): string;
  delete(key: string): Promise<void>;
}
```

### 3.4 File Movement Map

| MVP Location | v1.1 Location | Change |
|--------------|---------------|--------|
| `src/server/modules/*` | `src/modules/*` | Copy as-is |
| `src/server/shared/*` | `src/shared/*` | Copy as-is |
| `src/infra/*` | `src/infra/*` | Copy as-is |
| `src/app/api/v1/*` | `src/controllers/*` | Rewrite to NestJS |
| `prisma/schema.prisma` | Same | No change |

### 3.5 API Versioning Strategy

```
# MVP
/api/v1/participations     # Current

# v1.1 (breaking changes)
/api/v2/participations     # New version
/api/v1/participations     # Deprecated but maintained for 6 months
```

---

## 4. Device Fingerprint Specification

### 4.1 Collected Data Points

| Category | Field | Source | Required |
|----------|-------|--------|----------|
| Browser | userAgent | navigator.userAgent | ✅ |
| Browser | language | navigator.language | ✅ |
| Browser | languages | navigator.languages | ✅ |
| Browser | cookieEnabled | navigator.cookieEnabled | ✅ |
| Browser | doNotTrack | navigator.doNotTrack | ✅ |
| Screen | width | screen.width | ✅ |
| Screen | height | screen.height | ✅ |
| Screen | colorDepth | screen.colorDepth | ✅ |
| Screen | pixelRatio | window.devicePixelRatio | ✅ |
| System | platform | navigator.platform | ✅ |
| System | timezone | Intl.DateTimeFormat().resolvedOptions().timeZone | ✅ |
| System | timezoneOffset | new Date().getTimezoneOffset() | ✅ |
| Canvas | hash | Canvas fingerprint | ⚠️ Optional |
| WebGL | hash | WebGL renderer/vendor | ⚠️ Optional |
| Audio | hash | AudioContext fingerprint | ⚠️ Optional |

### 4.2 Client-Side Collection

```typescript
// src/lib/fingerprint.ts

interface FingerprintData {
  userAgent: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  doNotTrack: string | null;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  platform: string;
  timezone: string;
  timezoneOffset: number;
  canvasHash?: string;
  webglHash?: string;
}

export async function collectFingerprint(): Promise<string> {
  const data: FingerprintData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: [...navigator.languages],
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
  };

  // Optional: Canvas fingerprint
  try {
    data.canvasHash = await generateCanvasHash();
  } catch {}

  // Optional: WebGL fingerprint
  try {
    data.webglHash = await generateWebGLHash();
  } catch {}

  return hashFingerprint(data);
}

async function hashFingerprint(data: FingerprintData): Promise<string> {
  const str = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 4.3 Hashing Strategy

```typescript
// Server-side: Add salt before storing
// src/server/modules/fraud/fingerprint.service.ts

import { createHash } from 'crypto';

const FINGERPRINT_SALT = process.env.FINGERPRINT_SALT!; // Rotate every 30 days
const FINGERPRINT_PEPPER = process.env.FINGERPRINT_PEPPER!; // Never rotate

export function hashForStorage(clientHash: string): string {
  return createHash('sha256')
    .update(FINGERPRINT_PEPPER)
    .update(clientHash)
    .update(FINGERPRINT_SALT)
    .digest('hex');
}

// For comparison: hash incoming fingerprint the same way
export function compareFingerprint(
  clientHash: string,
  storedHash: string
): boolean {
  const incomingHashed = hashForStorage(clientHash);
  return incomingHashed === storedHash;
}
```

### 4.4 Storage Rules

| Rule | Implementation |
|------|----------------|
| Never store raw fingerprint | Only store hashed version |
| Salt rotation | Rotate `FINGERPRINT_SALT` every 30 days |
| Pepper protection | `FINGERPRINT_PEPPER` in secure vault, never in code |
| Old hash handling | Keep both old and new salt for 7-day transition |
| Deletion | Fingerprints deleted when user account deleted |

### 4.5 Security Considerations

```typescript
// Environment variables required
FINGERPRINT_SALT=<random-32-bytes>      # Rotates monthly
FINGERPRINT_PEPPER=<random-32-bytes>    # Never rotates, kept in vault
FINGERPRINT_SALT_OLD=<previous-salt>    # For transition period
```

### 4.6 Fraud Detection Integration

```typescript
// src/server/modules/fraud/policies/scoring.policy.ts

interface FingerprintFraudCheck {
  // Same fingerprint submitted multiple times today
  sameDeviceTodayCount: number;
  
  // Same fingerprint across different user accounts
  crossAccountCount: number;
  
  // Rapid submissions from same fingerprint
  velocityInLastHour: number;
}

export function calculateFingerprintScore(check: FingerprintFraudCheck): number {
  let score = 0;

  // Same device, same day
  if (check.sameDeviceTodayCount > 3) {
    score += 20; // Signal: FRAUD_DEVICE_VELOCITY
  }

  // Cross-account usage
  if (check.crossAccountCount > 1) {
    score += 30; // Signal: FRAUD_DEVICE_MULTI_ACCOUNT
  }

  // Velocity check
  if (check.velocityInLastHour > 5) {
    score += 25; // Signal: FRAUD_VELOCITY
  }

  return score;
}
```

### 4.7 Fingerprint Validation Rules (Connected to Core Spec)

| Signal Code | Condition | Score |
|-------------|-----------|-------|
| FRAUD_DEVICE_VELOCITY | Same device > 3 submissions/day | +20 |
| FRAUD_DEVICE_MULTI_ACCOUNT | Same device, different accounts | +30 |
| FRAUD_VELOCITY | > 5 submissions in 1 hour | +25 |

---

## 5. Advertiser Email Notifications (2 Types)

### 5.1 Email Event Definitions

#### Event 1: Campaign Target Reached

| Attribute | Value |
|-----------|-------|
| Event Name | `ADVERTISER_TARGET_REACHED` |
| Trigger | Campaign status → CLOSED (target_count reached OR end_at passed) |
| Recipient | Advertiser email |
| Template | `advertiser-target-reached` |
| Priority | MEDIUM |

**Trigger Conditions:**
```typescript
// In campaign.service.ts
async function checkAndCloseCampaign(campaignId: string) {
  const campaign = await campaignRepo.findById(campaignId);
  
  const shouldClose = 
    campaign.currentCount >= campaign.targetCount ||
    new Date() >= campaign.endAt;

  if (shouldClose && campaign.status === 'RUNNING') {
    await campaignRepo.updateStatus(campaignId, 'CLOSED');
    
    // Enqueue email
    await jobService.enqueue({
      type: 'SEND_EMAIL',
      payload: {
        templateType: 'ADVERTISER_TARGET_REACHED',
        recipientType: 'advertiser',
        recipientId: campaign.advertiserId,
        data: {
          campaignTitle: campaign.title,
          finalCount: campaign.currentCount,
          targetCount: campaign.targetCount,
          reason: campaign.currentCount >= campaign.targetCount 
            ? 'target_reached' 
            : 'deadline_passed'
        }
      }
    });
  }
}
```

#### Event 2: Credit Low (Campaign Auto-Pause)

| Attribute | Value |
|-----------|-------|
| Event Name | `ADVERTISER_CREDIT_LOW` |
| Trigger | Approval attempt when credit < creditCostPerValid → Campaign auto-paused |
| Recipient | Advertiser email |
| Template | `advertiser-credit-low` |
| Priority | HIGH |

**Trigger Conditions:**
```typescript
// In participation.service.ts (approve flow)
async function approveParticipation(participationId: string, operatorId: string) {
  const participation = await participationRepo.findById(participationId);
  const campaign = await campaignRepo.findById(participation.campaignId);
  const wallet = await walletRepo.findByAdvertiserId(campaign.advertiserId);

  // Check credit
  if (wallet.balance < campaign.creditCostPerValid) {
    // Auto-pause campaign
    await campaignRepo.updateStatus(campaign.id, 'PAUSED');
    
    // Enqueue email
    await jobService.enqueue({
      type: 'SEND_EMAIL',
      payload: {
        templateType: 'ADVERTISER_CREDIT_LOW',
        recipientType: 'advertiser',
        recipientId: campaign.advertiserId,
        data: {
          campaignTitle: campaign.title,
          currentBalance: wallet.balance,
          requiredAmount: campaign.creditCostPerValid,
          shortfall: campaign.creditCostPerValid - wallet.balance
        }
      }
    });

    throw new AppError(ErrorCodes.CRED_INSUFFICIENT);
  }

  // ... proceed with approval
}
```

### 5.2 Email Template Specifications

#### Template: advertiser-target-reached

```typescript
// src/infra/email/templates/advertiser-target-reached.ts

export const advertiserTargetReached = {
  subject: (data: TargetReachedData) => 
    `[캠페인 종료] "${data.campaignTitle}" 캠페인이 종료되었습니다`,
  
  body: (data: TargetReachedData) => `
    안녕하세요,

    "${data.campaignTitle}" 캠페인이 종료되었습니다.

    ■ 종료 사유
    ${data.reason === 'target_reached' 
      ? `목표 인원(${data.targetCount}명)에 도달했습니다.`
      : `마감일이 지났습니다.`}

    ■ 최종 참여 현황
    - 최종 참여: ${data.finalCount}명 / 목표 ${data.targetCount}명

    ■ 다음 단계
    - 7일간의 정산 기간(SETTLING) 후 최종 리포트가 생성됩니다.
    - AI 인사이트 리포트는 대시보드에서 확인하실 수 있습니다.

    감사합니다.
    리워드 플랫폼 팀
  `
};

interface TargetReachedData {
  campaignTitle: string;
  finalCount: number;
  targetCount: number;
  reason: 'target_reached' | 'deadline_passed';
}
```

#### Template: advertiser-credit-low

```typescript
// src/infra/email/templates/advertiser-credit-low.ts

export const advertiserCreditLow = {
  subject: (data: CreditLowData) => 
    `[긴급] 크레딧 부족으로 "${data.campaignTitle}" 캠페인이 일시정지되었습니다`,
  
  body: (data: CreditLowData) => `
    안녕하세요,

    크레딧 잔액 부족으로 "${data.campaignTitle}" 캠페인이 자동 일시정지되었습니다.

    ■ 현재 상태
    - 잔여 크레딧: ${data.currentBalance.toLocaleString()}원
    - 참여 1건당 필요 크레딧: ${data.requiredAmount.toLocaleString()}원
    - 부족 금액: ${data.shortfall.toLocaleString()}원

    ■ 조치 방법
    크레딧을 충전하시면 캠페인이 자동으로 재개됩니다.

    [크레딧 충전하기]
    ${process.env.NEXT_PUBLIC_APP_URL}/advertiser/credits/topup

    ■ 참고
    - 일시정지 상태에서는 새로운 참여 접수가 중단됩니다.
    - 기존에 접수된 참여는 정상적으로 검토됩니다.

    감사합니다.
    리워드 플랫폼 팀
  `
};

interface CreditLowData {
  campaignTitle: string;
  currentBalance: number;
  requiredAmount: number;
  shortfall: number;
}
```

### 5.3 Email Job Handler

```typescript
// src/server/modules/jobs/handlers/send-email.handler.ts

import { resendAdapter } from '@/infra/email/resend.adapter';
import { templateRegistry } from '@/infra/email/templates/template.registry';
import { emailLogRepo } from '@/server/modules/admin/email-log.repo';

interface SendEmailPayload {
  templateType: string;
  recipientType: 'user' | 'advertiser';
  recipientId: string;
  data: Record<string, any>;
}

export async function handleSendEmail(payload: SendEmailPayload) {
  // Get recipient email
  const recipientEmail = await getRecipientEmail(
    payload.recipientType, 
    payload.recipientId
  );

  // Get template
  const template = templateRegistry.get(payload.templateType);
  if (!template) {
    throw new Error(`Template not found: ${payload.templateType}`);
  }

  // Generate email content
  const subject = template.subject(payload.data);
  const body = template.body(payload.data);

  // Send via Resend
  const result = await resendAdapter.send({
    to: recipientEmail,
    subject,
    text: body,
    // html: template.html?.(payload.data) // If HTML version exists
  });

  // Log email
  await emailLogRepo.create({
    recipientEmail,
    recipientType: payload.recipientType,
    recipientId: payload.recipientId,
    templateType: payload.templateType,
    subject,
    status: result.success ? 'SENT' : 'FAILED',
    resendMessageId: result.messageId,
    errorMessage: result.error,
    sentAt: result.success ? new Date() : null
  });

  if (!result.success) {
    throw new Error(result.error);
  }
}
```

### 5.4 Retry Policy for Email Jobs

| Attribute | Value |
|-----------|-------|
| Max Retries | 5 |
| Backoff | Exponential: 10s, 20s, 40s, 80s, 160s |
| Dead Letter Action | Log and skip (don't block other jobs) |
| Total Max Time | ~5 minutes |

```typescript
// In job-runner.ts
const EMAIL_RETRY_CONFIG = {
  maxAttempts: 5,
  backoffMs: (attempt: number) => Math.pow(2, attempt) * 10000, // 10s, 20s, 40s, 80s, 160s
  onDead: async (job: Job) => {
    // Log failure, don't retry further
    console.error(`Email job ${job.id} failed permanently`);
    await auditLogService.log({
      action: 'EMAIL_SEND_FAILED',
      targetType: 'job',
      targetId: job.id,
      details: { payload: job.payload, error: job.errorMessage }
    });
  }
};
```

### 5.5 Template Registry

```typescript
// src/infra/email/templates/template.registry.ts

import { testerApproved } from './tester-approved';
import { testerRejected } from './tester-rejected';
import { testerPaid } from './tester-paid';
import { advertiserTargetReached } from './advertiser-target-reached';
import { advertiserCreditLow } from './advertiser-credit-low';

export const templateRegistry = new Map([
  // Tester emails (3 types)
  ['TESTER_APPROVED', testerApproved],
  ['TESTER_REJECTED', testerRejected],
  ['TESTER_PAID', testerPaid],
  
  // Advertiser emails (2 types)
  ['ADVERTISER_TARGET_REACHED', advertiserTargetReached],
  ['ADVERTISER_CREDIT_LOW', advertiserCreditLow],
]);
```

### 5.6 Email Types Summary (Connected to Core Spec)

| Type | Recipient | Trigger | Template |
|------|-----------|---------|----------|
| TESTER_APPROVED | Tester | Participation approved | tester-approved |
| TESTER_REJECTED | Tester | Participation rejected | tester-rejected |
| TESTER_PAID | Tester | Reward sent | tester-paid |
| ADVERTISER_TARGET_REACHED | Advertiser | Campaign closed | advertiser-target-reached |
| ADVERTISER_CREDIT_LOW | Advertiser | Campaign auto-paused | advertiser-credit-low |

---

## 6. Quick Reference: Document Connections

| This Document Section | Connected To |
|-----------------------|--------------|
| 2. API Route vs Service | 03_API_SPEC.md (endpoint implementations) |
| 3. Migration Strategy | 05_SPRINT_BACKLOG.md (v1.1 backlog) |
| 4. Device Fingerprint | 01_CORE_SPEC.md (FRAUD_VELOCITY, FRAUD_DEVICE) |
| 5. Advertiser Emails | 01_CORE_SPEC.md (Rule 2, 7), 02_DB_SCHEMA.md (email_logs) |

---

*End of Project Structure Document*
