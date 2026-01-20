# Core Spec — Reward App Experience/Feedback Platform

> Version: MVP 1.0  
> Date: 2026-01-20  
> Purpose: Development stability — immutable rules that prevent scope creep and inconsistency

---

## 1. Permission Matrix

### 1.1 Role Definitions

| Role | Code | Description |
|------|------|-------------|
| Tester | `TESTER` | End user who participates in campaigns |
| Advertiser | `ADVERTISER` | Business user who creates campaigns |
| Advertiser Admin | `ADV_ADMIN` | Advertiser account owner (future) |
| Operator | `OPERATOR` | Platform admin with full access |

### 1.2 Access Control Matrix

| Resource / Action | TESTER | ADVERTISER | OPERATOR |
|-------------------|--------|------------|----------|
| **Campaign** |
| View public list | ✅ | ✅ | ✅ |
| View own campaigns | — | ✅ | ✅ |
| Create campaign | — | ✅ | ✅ |
| Edit draft campaign | — | ✅ (own) | ✅ |
| Pause/Resume campaign | — | ✅ (own) | ✅ |
| Delete campaign | — | — | ✅ |
| **Participation** |
| Submit participation | ✅ | — | — |
| View own participations | ✅ | — | ✅ |
| View campaign participations | — | ✅ (own campaign) | ✅ |
| Approve/Reject participation | — | — | ✅ |
| **Credits** |
| View own balance | — | ✅ | ✅ |
| Request top-up | — | ✅ | — |
| Confirm top-up (add credits) | — | — | ✅ |
| Adjust credits (refund/correction) | — | — | ✅ |
| **Rewards** |
| View own rewards | ✅ | — | ✅ |
| Mark reward as sent | — | — | ✅ |
| **AI Insights** |
| View campaign insights | — | ✅ (own campaign) | ✅ |
| Trigger report regeneration | — | ✅ (own campaign) | ✅ |
| **Admin Functions** |
| View all users | — | — | ✅ |
| Ban/Suspend user | — | — | ✅ |
| View audit logs | — | — | ✅ |
| Manage jobs queue | — | — | ✅ |

### 1.3 Authentication Requirements

| Role | Auth Method | 2FA | IP Restriction |
|------|-------------|-----|----------------|
| Tester | Social OAuth (Kakao/Naver/Google) | — | — |
| Advertiser | Email + Password | — | — |
| Operator | Email + Password + Whitelist | TOTP Required | Recommended |

---

## 2. State Machines

### 2.1 Campaign State Machine

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  DRAFT  │───▶│ RUNNING │───▶│ PAUSED  │───▶│ RUNNING │─┘
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │
     │              │              │
     │              ▼              │
     │         ┌─────────┐        │
     │         │ CLOSED  │◀───────┘
     │         └─────────┘
     │              │
     │              ▼
     │         ┌──────────┐
     │         │ SETTLING │ (7 days for review)
     │         └──────────┘
     │              │
     │              ▼
     │         ┌───────────┐
     └────────▶│ COMPLETED │
               └───────────┘
```

**Transitions:**

| From | To | Trigger | Condition |
|------|----|---------|-----------|
| DRAFT | RUNNING | Advertiser publishes | credit >= cost × target |
| RUNNING | PAUSED | Auto/Manual | credit < cost OR manual |
| PAUSED | RUNNING | Manual resume | credit >= remaining cost |
| RUNNING | CLOSED | Auto | target reached OR end_at passed |
| PAUSED | CLOSED | Manual | — |
| CLOSED | SETTLING | Auto | T+0 from close |
| SETTLING | COMPLETED | Auto | T+7 days |
| DRAFT | COMPLETED | Manual delete | — |

### 2.2 Participation State Machine

```
┌───────────┐
│ SUBMITTED │
└───────────┘
      │
      ├──────────────────────────┐
      │                          │
      ▼                          ▼
┌───────────────┐        ┌────────────────┐
│ AUTO_REJECTED │        │ PENDING_REVIEW │
└───────────────┘        └────────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             │             ▼
           ┌──────────┐       │       ┌──────────┐
           │ APPROVED │       │       │ REJECTED │
           └──────────┘       │       └──────────┘
                 │            │
                 ▼            │
           ┌──────────┐       │
           │   PAID   │       │
           └──────────┘       │
                              │
                              ▼
                    ┌─────────────────┐
                    │ MANUAL_REVIEW   │ (edge case)
                    └─────────────────┘
```

**Transitions:**

| From | To | Trigger | Actor |
|------|----|---------|-------|
| SUBMITTED | AUTO_REJECTED | Fraud score ≥ 70 | System |
| SUBMITTED | PENDING_REVIEW | Fraud score < 70 | System |
| PENDING_REVIEW | APPROVED | Operator approves | Operator |
| PENDING_REVIEW | REJECTED | Operator rejects | Operator |
| PENDING_REVIEW | MANUAL_REVIEW | Fraud 40-69 flag | System |
| MANUAL_REVIEW | APPROVED | Operator approves | Operator |
| MANUAL_REVIEW | REJECTED | Operator rejects | Operator |
| APPROVED | PAID | Reward sent | Operator |

### 2.3 Credit Transaction State Machine

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│  PENDING  │───▶│ CONFIRMED │    │  FAILED   │
└───────────┘    └───────────┘    └───────────┘
      │                                 ▲
      └─────────────────────────────────┘
```

### 2.4 Reward State Machine

```
┌───────────┐    ┌──────────┐    ┌──────────┐
│ REQUESTED │───▶│   SENT   │    │  FAILED  │
└───────────┘    └──────────┘    └──────────┘
      │                               ▲
      └───────────────────────────────┘
            (retry possible)
```

---

## 3. Fixed Business Rules (Immutable)

### Rule 1: Credit Deduction Timing
> **Credits are deducted ONLY when participation is APPROVED.**

- Rejection = no deduction
- Auto-rejection = no deduction
- Credit check happens at approval time
- If insufficient credit at approval → campaign auto-pauses

### Rule 2: Campaign Auto-Pause
> **Campaign pauses automatically when advertiser credit < single participation cost.**

- New submissions blocked
- Existing pending reviews can still be processed
- Resumes when credit is topped up

### Rule 3: Participation Limit
> **One user can participate in the same campaign only ONCE.**

- Same user + same campaign = blocked
- Same user + different campaign (same advertiser) = allowed
- Daily limit: 3 participations per user across all campaigns

### Rule 4: Submission Requirements
> **Every participation MUST include:**

- 2 screenshot images (required)
- 2 question answers (required)
- Free-form feedback (required, min 30 characters)

### Rule 5: Fraud Auto-Rejection Threshold
> **Fraud score ≥ 70 = automatic rejection**

- Score 0-39: PASS (normal review)
- Score 40-69: REVIEW (manual check required)
- Score 70-100: REJECT (auto-rejected)

### Rule 6: Image Duplicate Detection
> **pHash Hamming distance ≤ 6 = duplicate**

- ≤ 6: Auto-reject (FRAUD_DUP_IMAGE)
- 7-10: Flag for manual review
- > 10: Pass

### Rule 7: Campaign Closure Conditions
> **Campaign closes when EITHER condition is met:**

- target_count reached
- end_at datetime passed

Whichever comes first.

### Rule 8: AI Report Generation Triggers
> **AI insight report is generated when:**

- 10 approved participations accumulated (auto)
- Advertiser clicks "Regenerate" (cooldown: 10 minutes)
- Campaign status changes to COMPLETED (final report)

### Rule 9: Credit Top-up Minimum
> **Minimum top-up amount: 50,000 KRW**

- Options: 50,000 / 100,000 / 300,000 KRW
- Deposit code format: `AC{advertiserId}-{requestId}`
- Example: `AC12-1043`

### Rule 10: Reward Processing
> **Rewards are processed MANUALLY with evidence.**

- Operator marks reward as sent
- Evidence required: sent_at timestamp + proof (text/image)
- Status flow: REQUESTED → SENT / FAILED

---

## 4. Jobs Queue & Retry Policy

### 4.1 Job Types

| Job Type | Description | Priority | Timeout |
|----------|-------------|----------|---------|
| `FRAUD_CHECK` | Calculate fraud score | HIGH | 30s |
| `PHASH_CALC` | Calculate image pHash | HIGH | 60s |
| `TEXT_SIMILARITY` | Calculate text similarity | MEDIUM | 30s |
| `AI_REPORT` | Generate AI insight report | LOW | 300s |
| `SEND_EMAIL` | Send notification email | MEDIUM | 30s |

### 4.2 Job Status Flow

```
PENDING → PROCESSING → COMPLETED
              │
              └──────→ FAILED → (retry) → PENDING
                          │
                          └──────→ DEAD (max retries exceeded)
```

### 4.3 Retry Policy

| Job Type | Max Retries | Backoff | Dead Letter |
|----------|-------------|---------|-------------|
| FRAUD_CHECK | 3 | Exponential (1s, 2s, 4s) | Alert operator |
| PHASH_CALC | 3 | Exponential (2s, 4s, 8s) | Mark as manual review |
| TEXT_SIMILARITY | 3 | Exponential (1s, 2s, 4s) | Skip (use default score) |
| AI_REPORT | 2 | Fixed (60s) | Alert operator |
| SEND_EMAIL | 5 | Exponential (10s, 20s, 40s, 80s, 160s) | Log and skip |

### 4.4 Batch Execution Schedule

| Job Type | Schedule | Batch Size |
|----------|----------|------------|
| FRAUD_CHECK | Every 1 minute | 50 |
| PHASH_CALC | Every 1 minute | 20 |
| TEXT_SIMILARITY | Every 5 minutes | 100 |
| AI_REPORT | Every 10 minutes | 5 |
| SEND_EMAIL | Every 1 minute | 100 |

### 4.5 Job Table Schema

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  priority INT DEFAULT 0,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_at);
CREATE INDEX idx_jobs_type_status ON jobs(type, status);
```

---

## 5. Error Codes & Validation Rules

### 5.1 Error Code Structure

Format: `{DOMAIN}_{ERROR_TYPE}_{DETAIL}`

### 5.2 Authentication Errors (AUTH_*)

| Code | HTTP | Message |
|------|------|---------|
| AUTH_INVALID_TOKEN | 401 | Invalid or expired token |
| AUTH_INVALID_CREDENTIALS | 401 | Invalid email or password |
| AUTH_TOTP_REQUIRED | 403 | 2FA verification required |
| AUTH_TOTP_INVALID | 403 | Invalid 2FA code |
| AUTH_NOT_WHITELISTED | 403 | Account not authorized for admin access |
| AUTH_SESSION_EXPIRED | 401 | Session expired, please login again |

### 5.3 Campaign Errors (CAMP_*)

| Code | HTTP | Message |
|------|------|---------|
| CAMP_NOT_FOUND | 404 | Campaign not found |
| CAMP_ALREADY_CLOSED | 400 | Campaign is already closed |
| CAMP_INSUFFICIENT_CREDIT | 400 | Insufficient credit to publish campaign |
| CAMP_INVALID_STATUS | 400 | Invalid campaign status transition |
| CAMP_TARGET_REACHED | 400 | Campaign target already reached |
| CAMP_EXPIRED | 400 | Campaign has expired |

### 5.4 Participation Errors (PART_*)

| Code | HTTP | Message |
|------|------|---------|
| PART_NOT_FOUND | 404 | Participation not found |
| PART_ALREADY_SUBMITTED | 400 | Already participated in this campaign |
| PART_DAILY_LIMIT | 400 | Daily participation limit (3) reached |
| PART_CAMPAIGN_CLOSED | 400 | Campaign is not accepting submissions |
| PART_INVALID_IMAGE | 400 | Invalid image format or size |
| PART_MISSING_REQUIRED | 400 | Missing required submission fields |
| PART_TEXT_TOO_SHORT | 400 | Feedback must be at least 30 characters |

### 5.5 Credit Errors (CRED_*)

| Code | HTTP | Message |
|------|------|---------|
| CRED_INSUFFICIENT | 400 | Insufficient credit balance |
| CRED_INVALID_AMOUNT | 400 | Invalid top-up amount |
| CRED_TOPUP_NOT_FOUND | 404 | Top-up request not found |
| CRED_ALREADY_CONFIRMED | 400 | Top-up already confirmed |

### 5.6 Fraud Errors (FRAUD_*)

| Code | HTTP | Description |
|------|------|-------------|
| FRAUD_DUP_IMAGE | — | Duplicate image detected |
| FRAUD_DUP_TEXT | — | Duplicate text detected |
| FRAUD_DEVICE | — | Suspicious device fingerprint |
| FRAUD_IP | — | Suspicious IP pattern |
| FRAUD_VELOCITY | — | Too many submissions in short time |

### 5.7 Validation Rules

#### User Registration
| Field | Rule |
|-------|------|
| email | Valid email format, unique |
| provider | Enum: kakao, naver, google |
| profile_name | Optional, max 50 chars |

#### Campaign Creation
| Field | Rule |
|-------|------|
| title | Required, 5-100 chars |
| description | Required, 20-2000 chars |
| app_link_ios | Valid URL or null |
| app_link_android | Valid URL or null |
| target_count | Required, 10-10000 |
| reward_amount | Required, 1000-50000 KRW |
| credit_cost_per_valid | Required, ≥ reward_amount |
| end_at | Required, future date, max 90 days |
| questions | Required, exactly 2 questions |

#### Participation Submission
| Field | Rule |
|-------|------|
| images | Required, exactly 2, max 10MB each, jpg/png/webp |
| answers | Required, 2 answers matching campaign questions |
| feedback | Required, min 30 chars, max 2000 chars |

---

## 6. MVP Non-Goals (Explicitly Out of Scope)

### 6.1 Features NOT in MVP

| Feature | Reason | Target Version |
|---------|--------|----------------|
| App Store review solicitation | Policy violation | Never |
| Push notifications | Complexity | v1.1 |
| SMS notifications | Cost | v1.1 |
| Automated gifticon API | Integration time | v1.1 |
| Advertiser team management | Complexity | v1.1 |
| Operator invite system | seed is enough | v1.1 |
| Real-time fraud detection | Use batch instead | v1.1 |
| Video uploads | Storage cost | v1.2 |
| Multi-language support | Scope | v1.2 |
| Advertiser social login | Simplicity | v1.1 |
| Tax invoice auto-generation | Legal complexity | v1.1 |
| Refund automation | Manual is safer | v1.1 |

### 6.2 Technical Constraints for MVP

| Constraint | Limit | Reason |
|------------|-------|--------|
| Max campaigns per advertiser | 10 active | Resource control |
| Max participations per day (user) | 3 | Quality control |
| Max image size | 10MB | Storage cost |
| Max concurrent jobs | 100 | Supabase limits |
| AI report cooldown | 10 minutes | Cost control |
| Campaign duration max | 90 days | Scope control |

### 6.3 Operational Boundaries

- **No 24/7 support**: Business hours only (KST 9-18)
- **No SLA guarantee**: Best effort response
- **No automated refunds**: All refunds require operator approval
- **No real-time dashboards**: Data refreshes every 5 minutes
- **Single currency only**: KRW only for MVP

---

## Appendix: Quick Reference Card

### Status Values (Copy-Paste Ready)

```typescript
// Campaign Status
type CampaignStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'CLOSED' | 'SETTLING' | 'COMPLETED';

// Participation Status
type ParticipationStatus = 'SUBMITTED' | 'AUTO_REJECTED' | 'PENDING_REVIEW' | 'MANUAL_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';

// Credit Transaction Type
type CreditTxType = 'TOPUP' | 'CONSUME' | 'REFUND' | 'ADJUST';

// Job Status
type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD';

// Reward Status
type RewardStatus = 'REQUESTED' | 'SENT' | 'FAILED';

// Fraud Decision
type FraudDecision = 'PASS' | 'REVIEW' | 'REJECT';
```

### Key Numbers

| Item | Value |
|------|-------|
| Fraud auto-reject threshold | ≥ 70 |
| pHash duplicate threshold | ≤ 6 |
| Min feedback length | 30 chars |
| Daily participation limit | 3 |
| Min top-up amount | 50,000 KRW |
| AI report cooldown | 10 minutes |
| Campaign max duration | 90 days |
| Max images per submission | 2 |
| Max image size | 10MB |

---

*End of Core Spec Document*
