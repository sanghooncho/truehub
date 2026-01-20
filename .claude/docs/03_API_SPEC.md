# API Specification — Reward App Experience/Feedback Platform

> Version: MVP 1.0  
> Date: 2026-01-20  
> Base URL: `/api/v1`  
> Auth: JWT Bearer Token

---

## 1. API Overview

### 1.1 Authentication Methods

| Role | Method | Token Type |
|------|--------|------------|
| Tester | Social OAuth (Kakao/Naver/Google) | JWT |
| Advertiser | Email + Password | JWT |
| Operator | Email + Password + TOTP | JWT |

### 1.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "CAMP_NOT_FOUND",
    "message": "Campaign not found",
    "details": { ... }  // optional
  }
}

// Paginated Response
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 1.3 Common Headers

```
Authorization: Bearer <token>
Content-Type: application/json
X-Request-ID: <uuid>  // optional, for tracing
```

---

## 2. Authentication APIs

### 2.1 Tester Auth (Social OAuth)

#### POST `/api/v1/auth/tester/login`

Social login callback handler.

**Request:**
```typescript
{
  provider: 'KAKAO' | 'NAVER' | 'GOOGLE';
  code: string;           // OAuth authorization code
  redirectUri: string;    // OAuth redirect URI used
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      provider: string;
      email: string | null;
      profileName: string | null;
      createdAt: string;
    };
    isNewUser: boolean;
  };
}
```

---

#### POST `/api/v1/auth/tester/refresh`

Refresh access token.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    refreshToken: string;
  };
}
```

---

### 2.2 Advertiser Auth

#### POST `/api/v1/auth/advertiser/register`

Register new advertiser account.

**Request:**
```typescript
{
  email: string;
  password: string;       // min 8 chars, 1 uppercase, 1 number
  companyName: string;
  businessType?: 'INDIVIDUAL' | 'SOLE_PROPRIETOR' | 'CORPORATION';
  contactName?: string;
  contactPhone?: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    email: string;
    companyName: string;
    message: "Registration successful. Please login.";
  };
}
```

---

#### POST `/api/v1/auth/advertiser/login`

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    refreshToken: string;
    advertiser: {
      id: string;
      email: string;
      companyName: string;
      creditBalance: number;
    };
  };
}
```

---

### 2.3 Operator Auth

#### POST `/api/v1/auth/operator/login`

Step 1: Email + Password validation.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (TOTP enabled):**
```typescript
{
  success: true;
  data: {
    requiresTotp: true;
    tempToken: string;  // short-lived token for TOTP step
  };
}
```

**Response (TOTP not enabled - first login):**
```typescript
{
  success: true;
  data: {
    requiresTotp: false;
    requiresTotpSetup: true;
    tempToken: string;
    totpSecret: string;
    totpQrCode: string;  // base64 QR image
  };
}
```

---

#### POST `/api/v1/auth/operator/verify-totp`

Step 2: TOTP verification.

**Request:**
```typescript
{
  tempToken: string;
  totpCode: string;  // 6 digits
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    refreshToken: string;
    operator: {
      id: string;
      email: string;
      name: string;
    };
  };
}
```

---

#### POST `/api/v1/auth/operator/setup-totp`

Setup TOTP for first time.

**Request:**
```typescript
{
  tempToken: string;
  totpCode: string;  // verify the code works
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    token: string;
    refreshToken: string;
    message: "2FA setup complete";
  };
}
```

---

## 3. Campaign APIs

### 3.1 Public (Tester)

#### GET `/api/v1/campaigns`

List public campaigns for testers.

**Query Parameters:**
```typescript
{
  page?: number;          // default: 1
  limit?: number;         // default: 20, max: 50
  sort?: 'latest' | 'reward' | 'deadline';  // default: latest
  category?: string;      // optional filter
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    items: [{
      id: string;
      title: string;
      description: string;
      rewardAmount: number;
      targetCount: number;
      currentCount: number;
      remainingSlots: number;
      endAt: string;
      appLinkIos: string | null;
      appLinkAndroid: string | null;
      advertiserName: string;
    }];
    pagination: { ... };
  };
}
```

---

#### GET `/api/v1/campaigns/:id`

Get campaign detail.

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    title: string;
    description: string;
    rewardAmount: number;
    targetCount: number;
    currentCount: number;
    remainingSlots: number;
    endAt: string;
    appLinkIos: string | null;
    appLinkAndroid: string | null;
    questions: [{
      order: number;
      text: string;
    }];
    advertiserName: string;
    isParticipated: boolean;  // if logged in
  };
}
```

---

### 3.2 Advertiser

#### GET `/api/v1/advertiser/campaigns`

List advertiser's own campaigns.

**Auth:** Advertiser JWT

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: CampaignStatus;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    items: [{
      id: string;
      title: string;
      status: CampaignStatus;
      targetCount: number;
      currentCount: number;
      approvedCount: number;
      pendingCount: number;
      rewardAmount: number;
      creditCostPerValid: number;
      totalCost: number;
      endAt: string;
      createdAt: string;
    }];
    pagination: { ... };
  };
}
```

---

#### POST `/api/v1/advertiser/campaigns`

Create new campaign.

**Auth:** Advertiser JWT

**Request:**
```typescript
{
  title: string;                  // 5-100 chars
  description: string;            // 20-2000 chars
  appLinkIos?: string;
  appLinkAndroid?: string;
  targetCount: number;            // 10-10000
  rewardAmount: number;           // 1000-50000 KRW
  creditCostPerValid: number;     // >= rewardAmount
  endAt: string;                  // ISO date, future, max 90 days
  questions: [{
    order: 1 | 2;
    text: string;                 // 10-500 chars
  }];
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    status: 'DRAFT';
    message: "Campaign created. Publish when ready.";
  };
}
```

---

#### PATCH `/api/v1/advertiser/campaigns/:id`

Update draft campaign.

**Auth:** Advertiser JWT

**Request:**
```typescript
{
  title?: string;
  description?: string;
  appLinkIos?: string;
  appLinkAndroid?: string;
  targetCount?: number;
  rewardAmount?: number;
  creditCostPerValid?: number;
  endAt?: string;
  questions?: [{ order: number; text: string; }];
}
```

---

#### POST `/api/v1/advertiser/campaigns/:id/publish`

Publish campaign (DRAFT → RUNNING).

**Auth:** Advertiser JWT

**Response:**
```typescript
{
  success: true;
  data: {
    status: 'RUNNING';
    message: "Campaign is now live.";
  };
}
```

**Errors:**
- `CRED_INSUFFICIENT`: Not enough credits

---

#### POST `/api/v1/advertiser/campaigns/:id/pause`

Pause campaign.

**Auth:** Advertiser JWT

---

#### POST `/api/v1/advertiser/campaigns/:id/resume`

Resume paused campaign.

**Auth:** Advertiser JWT

---

#### POST `/api/v1/advertiser/campaigns/:id/close`

Manually close campaign.

**Auth:** Advertiser JWT

---

## 4. Participation APIs

### 4.1 Tester

#### POST `/api/v1/participations`

Submit participation.

**Auth:** Tester JWT

**Request (multipart/form-data):**
```
campaignId: string
answer1: string
answer2: string
feedback: string          // min 30 chars
image1: File             // max 10MB, jpg/png/webp
image2: File             // max 10MB, jpg/png/webp
deviceFingerprint: string  // client-generated hash
```

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    status: 'SUBMITTED';
    message: "Participation submitted. Review in progress.";
  };
}
```

**Errors:**
- `PART_ALREADY_SUBMITTED`: Already participated
- `PART_DAILY_LIMIT`: Daily limit reached
- `PART_CAMPAIGN_CLOSED`: Campaign not accepting
- `PART_TEXT_TOO_SHORT`: Feedback too short

---

#### GET `/api/v1/participations/my`

Get tester's participations.

**Auth:** Tester JWT

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: ParticipationStatus;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    items: [{
      id: string;
      campaign: {
        id: string;
        title: string;
        advertiserName: string;
      };
      status: ParticipationStatus;
      rewardAmount: number;
      submittedAt: string;
      reviewedAt: string | null;
      rejectReason: string | null;
    }];
    pagination: { ... };
  };
}
```

---

### 4.2 Advertiser (View Only)

#### GET `/api/v1/advertiser/campaigns/:campaignId/participations`

View campaign participations.

**Auth:** Advertiser JWT

**Response:**
```typescript
{
  success: true;
  data: {
    items: [{
      id: string;
      status: ParticipationStatus;
      answer1: string;
      answer2: string;
      feedback: string;
      images: [{
        slot: number;
        url: string;
      }];
      submittedAt: string;
      // No user PII exposed
    }];
    pagination: { ... };
  };
}
```

---

### 4.3 Operator

#### GET `/api/v1/admin/participations`

Get all participations for review.

**Auth:** Operator JWT

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  status?: ParticipationStatus;
  campaignId?: string;
  fraudDecision?: FraudDecision;
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    items: [{
      id: string;
      campaign: {
        id: string;
        title: string;
        advertiserName: string;
      };
      user: {
        id: string;
        provider: string;
        email: string | null;
      };
      status: ParticipationStatus;
      answer1: string;
      answer2: string;
      feedback: string;
      images: [{
        slot: number;
        url: string;
        phash: string | null;
      }];
      fraudScore: number | null;
      fraudDecision: FraudDecision | null;
      fraudReasons: string[];
      submittedAt: string;
    }];
    pagination: { ... };
  };
}
```

---

#### POST `/api/v1/admin/participations/:id/approve`

Approve participation.

**Auth:** Operator JWT

**Response:**
```typescript
{
  success: true;
  data: {
    status: 'APPROVED';
    creditDeducted: number;
    rewardCreated: true;
  };
}
```

---

#### POST `/api/v1/admin/participations/:id/reject`

Reject participation.

**Auth:** Operator JWT

**Request:**
```typescript
{
  reason: string;  // required
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    status: 'REJECTED';
    creditDeducted: false;
  };
}
```

---

## 5. Credit & Billing APIs

### 5.1 Advertiser

#### GET `/api/v1/advertiser/credits`

Get credit balance and history.

**Auth:** Advertiser JWT

**Response:**
```typescript
{
  success: true;
  data: {
    balance: number;
    totalTopup: number;
    totalConsumed: number;
    recentTransactions: [{
      id: string;
      type: CreditTxType;
      amount: number;
      balanceAfter: number;
      description: string | null;
      createdAt: string;
    }];
  };
}
```

---

#### POST `/api/v1/advertiser/credits/topup-request`

Request credit top-up.

**Auth:** Advertiser JWT

**Request:**
```typescript
{
  amount: 50000 | 100000 | 300000;
  method: 'BANK_TRANSFER' | 'STRIPE';
}
```

**Response (Bank Transfer):**
```typescript
{
  success: true;
  data: {
    requestId: string;
    depositCode: "AC12-1043";
    amount: 50000;
    bankInfo: {
      bankName: "신한은행";
      accountNumber: "110-123-456789";
      accountHolder: "주식회사 OOO";
    };
    expiresAt: string;  // 24 hours
    instructions: "입금 시 입금자명에 입금코드를 반드시 포함해주세요.";
  };
}
```

**Response (Stripe):**
```typescript
{
  success: true;
  data: {
    requestId: string;
    paymentUrl: "https://buy.stripe.com/...";
    amount: 50000;
    expiresAt: string;
  };
}
```

---

#### GET `/api/v1/advertiser/credits/topup-requests`

Get top-up request history.

**Auth:** Advertiser JWT

---

### 5.2 Operator

#### GET `/api/v1/admin/topup-requests`

Get pending top-up requests.

**Auth:** Operator JWT

**Query Parameters:**
```typescript
{
  status?: TopupStatus;
  page?: number;
  limit?: number;
}
```

---

#### POST `/api/v1/admin/topup-requests/:id/confirm`

Confirm bank transfer top-up.

**Auth:** Operator JWT

**Response:**
```typescript
{
  success: true;
  data: {
    status: 'CONFIRMED';
    creditsAdded: number;
    newBalance: number;
  };
}
```

---

#### POST `/api/v1/admin/topup-requests/:id/cancel`

Cancel top-up request.

**Auth:** Operator JWT

---

## 6. Reward APIs

### 6.1 Tester

#### GET `/api/v1/rewards/my`

Get tester's rewards.

**Auth:** Tester JWT

**Response:**
```typescript
{
  success: true;
  data: {
    items: [{
      id: string;
      campaign: {
        id: string;
        title: string;
      };
      amount: number;
      status: RewardStatus;
      sentAt: string | null;
      createdAt: string;
    }];
    totalEarned: number;
    totalPending: number;
  };
}
```

---

### 6.2 Operator

#### GET `/api/v1/admin/rewards`

Get rewards queue.

**Auth:** Operator JWT

**Query Parameters:**
```typescript
{
  status?: RewardStatus;
  page?: number;
  limit?: number;
}
```

---

#### POST `/api/v1/admin/rewards/:id/mark-sent`

Mark reward as sent.

**Auth:** Operator JWT

**Request:**
```typescript
{
  method: 'MANUAL' | 'GIFTICON';
  proofText?: string;
  proofImage?: File;  // optional evidence screenshot
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    status: 'SENT';
    sentAt: string;
  };
}
```

---

#### POST `/api/v1/admin/rewards/:id/mark-failed`

Mark reward as failed.

**Auth:** Operator JWT

**Request:**
```typescript
{
  reason: string;
}
```

---

## 7. AI Insight APIs

### 7.1 Advertiser

#### GET `/api/v1/advertiser/campaigns/:id/insights`

Get AI insights for campaign.

**Auth:** Advertiser JWT

**Response:**
```typescript
{
  success: true;
  data: {
    hasInsight: boolean;
    insight: {
      version: number;
      participationCount: number;
      generatedAt: string;
      summary: string;
      pros: string[];
      cons: string[];
      onboardingIssues: string[];
      keywords: [{
        keyword: string;
        count: number;
      }];
      sentiment: {
        positive: number;
        neutral: number;
        negative: number;
      };
      themes: [{
        theme: string;
        mentions: number;
      }];
    } | null;
    canRegenerate: boolean;
    regenerateCooldownUntil: string | null;
  };
}
```

---

#### POST `/api/v1/advertiser/campaigns/:id/insights/regenerate`

Request AI insight regeneration.

**Auth:** Advertiser JWT

**Response:**
```typescript
{
  success: true;
  data: {
    jobId: string;
    message: "Report generation queued. Check back in a few minutes.";
  };
}
```

**Errors:**
- `AI_COOLDOWN`: Must wait before regenerating

---

## 8. Admin APIs

### 8.1 User Management

#### GET `/api/v1/admin/users`

List all users.

**Auth:** Operator JWT

---

#### POST `/api/v1/admin/users/:id/ban`

Ban a user.

**Auth:** Operator JWT

**Request:**
```typescript
{
  reason: string;
}
```

---

#### POST `/api/v1/admin/users/:id/unban`

Unban a user.

**Auth:** Operator JWT

---

### 8.2 Dashboard

#### GET `/api/v1/admin/dashboard`

Get admin dashboard stats.

**Auth:** Operator JWT

**Response:**
```typescript
{
  success: true;
  data: {
    overview: {
      totalUsers: number;
      totalAdvertisers: number;
      totalCampaigns: number;
      activeCampaigns: number;
    };
    pendingActions: {
      participationsToReview: number;
      topupsToConfirm: number;
      rewardsToPay: number;
    };
    recentActivity: [{
      type: string;
      description: string;
      createdAt: string;
    }];
  };
}
```

---

### 8.3 Jobs Management

#### GET `/api/v1/admin/jobs`

Get jobs queue status.

**Auth:** Operator JWT

**Query Parameters:**
```typescript
{
  status?: JobStatus;
  type?: JobType;
  page?: number;
  limit?: number;
}
```

---

#### POST `/api/v1/admin/jobs/:id/retry`

Retry failed job.

**Auth:** Operator JWT

---

### 8.4 Audit Logs

#### GET `/api/v1/admin/audit-logs`

Get audit logs.

**Auth:** Operator JWT

**Query Parameters:**
```typescript
{
  operatorId?: string;
  action?: string;
  targetType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

---

## 9. Upload APIs

#### POST `/api/v1/uploads/presigned-url`

Get presigned URL for image upload.

**Auth:** Tester JWT

**Request:**
```typescript
{
  filename: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileSize: number;  // bytes, max 10MB
}
```

**Response:**
```typescript
{
  success: true;
  data: {
    uploadUrl: string;
    key: string;
    expiresAt: string;
  };
}
```

---

## 10. Webhook APIs (Internal)

#### POST `/api/v1/webhooks/stripe`

Stripe webhook handler.

**Headers:**
```
Stripe-Signature: ...
```

Handles:
- `checkout.session.completed` → Confirm STRIPE top-up

---

## Appendix: Error Code Reference

| Code | HTTP | Description |
|------|------|-------------|
| AUTH_INVALID_TOKEN | 401 | Invalid or expired token |
| AUTH_INVALID_CREDENTIALS | 401 | Wrong email/password |
| AUTH_TOTP_REQUIRED | 403 | 2FA code needed |
| AUTH_TOTP_INVALID | 403 | Wrong 2FA code |
| AUTH_NOT_WHITELISTED | 403 | Not authorized for admin |
| CAMP_NOT_FOUND | 404 | Campaign not found |
| CAMP_ALREADY_CLOSED | 400 | Campaign closed |
| CAMP_INSUFFICIENT_CREDIT | 400 | Not enough credit to publish |
| CAMP_INVALID_STATUS | 400 | Invalid status transition |
| PART_NOT_FOUND | 404 | Participation not found |
| PART_ALREADY_SUBMITTED | 400 | Duplicate participation |
| PART_DAILY_LIMIT | 400 | 3/day limit reached |
| PART_CAMPAIGN_CLOSED | 400 | Campaign not accepting |
| PART_TEXT_TOO_SHORT | 400 | Feedback < 30 chars |
| CRED_INSUFFICIENT | 400 | Not enough credits |
| CRED_INVALID_AMOUNT | 400 | Invalid top-up amount |
| AI_COOLDOWN | 429 | Regenerate cooldown active |
| VALIDATION_ERROR | 400 | Request validation failed |
| INTERNAL_ERROR | 500 | Server error |

---

*End of API Specification Document*
