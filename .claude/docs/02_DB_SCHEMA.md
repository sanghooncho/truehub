# Database Schema — Reward App Experience/Feedback Platform

> Version: MVP 1.0  
> Date: 2026-01-20  
> Database: PostgreSQL (Supabase)  
> ORM: Prisma (recommended) or raw SQL

---

## 1. Schema Overview

### 1.1 Entity Relationship Diagram (Simplified)

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    users    │       │   advertisers   │       │  operators  │
└─────────────┘       └─────────────────┘       └─────────────┘
      │                       │                       │
      │                       │                       │
      ▼                       ▼                       │
┌─────────────┐       ┌─────────────────┐            │
│participations│◀─────│    campaigns    │            │
└─────────────┘       └─────────────────┘            │
      │                       │                       │
      ▼                       │                       │
┌─────────────┐               │                       │
│participation│               │                       │
│   _assets   │               │                       │
└─────────────┘               │                       │
      │                       │                       │
      ▼                       ▼                       ▼
┌─────────────┐       ┌─────────────────┐    ┌─────────────┐
│   rewards   │       │  credit_wallets │    │ audit_logs  │
└─────────────┘       └─────────────────┘    └─────────────┘
                              │
                              ▼
                      ┌─────────────────┐
                      │credit_transactions│
                      └─────────────────┘
```

### 1.2 Table List

| # | Table | Description |
|---|-------|-------------|
| 1 | users | Testers (social login) |
| 2 | advertisers | Business accounts |
| 3 | operators | Admin accounts |
| 4 | campaigns | Campaign definitions |
| 5 | campaign_questions | Question sets for campaigns |
| 6 | participations | User submissions |
| 7 | participation_assets | Uploaded images |
| 8 | fraud_signals | Fraud detection data |
| 9 | credit_wallets | Advertiser credit balance |
| 10 | credit_transactions | Credit movement history |
| 11 | topup_requests | Credit top-up requests |
| 12 | rewards | Reward payment records |
| 13 | ai_insights | AI-generated reports |
| 14 | jobs | Background job queue |
| 15 | audit_logs | System audit trail |
| 16 | email_logs | Email send history |

---

## 2. Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum AuthProvider {
  KAKAO
  NAVER
  GOOGLE
}

enum CampaignStatus {
  DRAFT
  RUNNING
  PAUSED
  CLOSED
  SETTLING
  COMPLETED
}

enum ParticipationStatus {
  SUBMITTED
  AUTO_REJECTED
  PENDING_REVIEW
  MANUAL_REVIEW
  APPROVED
  REJECTED
  PAID
}

enum FraudDecision {
  PASS
  REVIEW
  REJECT
}

enum CreditTxType {
  TOPUP
  CONSUME
  REFUND
  ADJUST
}

enum TopupStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum TopupMethod {
  BANK_TRANSFER
  STRIPE
}

enum RewardStatus {
  REQUESTED
  SENT
  FAILED
}

enum JobType {
  FRAUD_CHECK
  PHASH_CALC
  TEXT_SIMILARITY
  AI_REPORT
  SEND_EMAIL
}

enum JobStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  DEAD
}

enum JobPriority {
  LOW
  MEDIUM
  HIGH
}

// ============================================
// USER & AUTH
// ============================================

model User {
  id                  String    @id @default(uuid())
  provider            AuthProvider
  providerUserId      String    @map("provider_user_id")
  email               String?
  profileName         String?   @map("profile_name")
  deviceFingerprint   String?   @map("device_fingerprint")
  isBanned            Boolean   @default(false) @map("is_banned")
  banReason           String?   @map("ban_reason")
  lastLoginAt         DateTime? @map("last_login_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  participations      Participation[]
  rewards             Reward[]

  @@unique([provider, providerUserId])
  @@map("users")
}

model Advertiser {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String    @map("password_hash")
  companyName         String    @map("company_name")
  businessType        String?   @map("business_type") // 개인/개인사업자/법인
  contactName         String?   @map("contact_name")
  contactPhone        String?   @map("contact_phone")
  isActive            Boolean   @default(true) @map("is_active")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  campaigns           Campaign[]
  creditWallet        CreditWallet?
  topupRequests       TopupRequest[]

  @@map("advertisers")
}

model Operator {
  id                  String    @id @default(uuid())
  email               String    @unique
  passwordHash        String    @map("password_hash")
  name                String
  totpSecret          String?   @map("totp_secret")
  totpEnabled         Boolean   @default(false) @map("totp_enabled")
  isActive            Boolean   @default(true) @map("is_active")
  lastLoginAt         DateTime? @map("last_login_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  approvedParticipations  Participation[] @relation("ApprovedBy")
  processedRewards        Reward[]        @relation("ProcessedBy")
  confirmedTopups         TopupRequest[]  @relation("ConfirmedBy")
  auditLogs               AuditLog[]

  @@map("operators")
}

// ============================================
// CAMPAIGN
// ============================================

model Campaign {
  id                  String          @id @default(uuid())
  advertiserId        String          @map("advertiser_id")
  title               String
  description         String
  appLinkIos          String?         @map("app_link_ios")
  appLinkAndroid      String?         @map("app_link_android")
  targetCount         Int             @map("target_count")
  currentCount        Int             @default(0) @map("current_count")
  rewardAmount        Int             @map("reward_amount") // KRW
  creditCostPerValid  Int             @map("credit_cost_per_valid") // KRW
  status              CampaignStatus  @default(DRAFT)
  startAt             DateTime?       @map("start_at")
  endAt               DateTime        @map("end_at")
  closedAt            DateTime?       @map("closed_at")
  completedAt         DateTime?       @map("completed_at")
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  advertiser          Advertiser      @relation(fields: [advertiserId], references: [id])
  questions           CampaignQuestion[]
  participations      Participation[]
  aiInsights          AiInsight[]

  @@index([advertiserId])
  @@index([status])
  @@index([endAt])
  @@map("campaigns")
}

model CampaignQuestion {
  id                  String    @id @default(uuid())
  campaignId          String    @map("campaign_id")
  questionOrder       Int       @map("question_order") // 1 or 2
  questionText        String    @map("question_text")
  createdAt           DateTime  @default(now()) @map("created_at")

  campaign            Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([campaignId, questionOrder])
  @@map("campaign_questions")
}

// ============================================
// PARTICIPATION
// ============================================

model Participation {
  id                  String              @id @default(uuid())
  campaignId          String              @map("campaign_id")
  userId              String              @map("user_id")
  answer1             String
  answer2             String
  feedback            String
  status              ParticipationStatus @default(SUBMITTED)
  fraudScore          Int?                @map("fraud_score")
  fraudDecision       FraudDecision?      @map("fraud_decision")
  fraudReasons        String[]            @map("fraud_reasons")
  reviewerId          String?             @map("reviewer_id")
  reviewedAt          DateTime?           @map("reviewed_at")
  rejectReason        String?             @map("reject_reason")
  submittedAt         DateTime            @default(now()) @map("submitted_at")
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")

  campaign            Campaign            @relation(fields: [campaignId], references: [id])
  user                User                @relation(fields: [userId], references: [id])
  reviewer            Operator?           @relation("ApprovedBy", fields: [reviewerId], references: [id])
  assets              ParticipationAsset[]
  fraudSignals        FraudSignal[]
  reward              Reward?

  @@unique([campaignId, userId])
  @@index([campaignId])
  @@index([userId])
  @@index([status])
  @@map("participations")
}

model ParticipationAsset {
  id                  String    @id @default(uuid())
  participationId     String    @map("participation_id")
  slot                Int       // 1 or 2
  storageKey          String    @map("storage_key")
  originalFilename    String?   @map("original_filename")
  mimeType            String?   @map("mime_type")
  fileSize            Int?      @map("file_size")
  phash               String?   // perceptual hash
  sha256              String?
  ocrText             String?   @map("ocr_text")
  createdAt           DateTime  @default(now()) @map("created_at")

  participation       Participation @relation(fields: [participationId], references: [id], onDelete: Cascade)

  @@unique([participationId, slot])
  @@index([phash])
  @@index([sha256])
  @@map("participation_assets")
}

model FraudSignal {
  id                  String    @id @default(uuid())
  participationId     String    @map("participation_id")
  signalType          String    @map("signal_type") // DUP_IMAGE, DUP_TEXT, DEVICE, IP, VELOCITY
  signalValue         String    @map("signal_value")
  score               Int       // contribution to fraud score
  details             Json?
  createdAt           DateTime  @default(now()) @map("created_at")

  participation       Participation @relation(fields: [participationId], references: [id], onDelete: Cascade)

  @@index([participationId])
  @@map("fraud_signals")
}

// ============================================
// CREDITS & BILLING
// ============================================

model CreditWallet {
  id                  String    @id @default(uuid())
  advertiserId        String    @unique @map("advertiser_id")
  balance             Int       @default(0) // KRW
  totalTopup          Int       @default(0) @map("total_topup")
  totalConsumed       Int       @default(0) @map("total_consumed")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  advertiser          Advertiser @relation(fields: [advertiserId], references: [id])
  transactions        CreditTransaction[]

  @@map("credit_wallets")
}

model CreditTransaction {
  id                  String        @id @default(uuid())
  walletId            String        @map("wallet_id")
  type                CreditTxType
  amount              Int           // positive for credit, negative for debit
  balanceAfter        Int           @map("balance_after")
  refType             String?       @map("ref_type") // campaign, participation, topup
  refId               String?       @map("ref_id")
  description         String?
  createdAt           DateTime      @default(now()) @map("created_at")

  wallet              CreditWallet  @relation(fields: [walletId], references: [id])

  @@index([walletId])
  @@index([refType, refId])
  @@map("credit_transactions")
}

model TopupRequest {
  id                  String        @id @default(uuid())
  advertiserId        String        @map("advertiser_id")
  amount              Int           // KRW
  method              TopupMethod
  depositCode         String        @unique @map("deposit_code") // AC{advertiserId}-{requestId}
  status              TopupStatus   @default(PENDING)
  stripePaymentId     String?       @map("stripe_payment_id")
  confirmedById       String?       @map("confirmed_by_id")
  confirmedAt         DateTime?     @map("confirmed_at")
  expiresAt           DateTime      @map("expires_at")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  advertiser          Advertiser    @relation(fields: [advertiserId], references: [id])
  confirmedBy         Operator?     @relation("ConfirmedBy", fields: [confirmedById], references: [id])

  @@index([advertiserId])
  @@index([depositCode])
  @@index([status])
  @@map("topup_requests")
}

// ============================================
// REWARDS
// ============================================

model Reward {
  id                  String        @id @default(uuid())
  participationId     String        @unique @map("participation_id")
  userId              String        @map("user_id")
  amount              Int           // KRW
  status              RewardStatus  @default(REQUESTED)
  method              String?       // manual, gifticon
  sentAt              DateTime?     @map("sent_at")
  proofText           String?       @map("proof_text")
  proofImageKey       String?       @map("proof_image_key")
  processedById       String?       @map("processed_by_id")
  failReason          String?       @map("fail_reason")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")

  participation       Participation @relation(fields: [participationId], references: [id])
  user                User          @relation(fields: [userId], references: [id])
  processedBy         Operator?     @relation("ProcessedBy", fields: [processedById], references: [id])

  @@index([userId])
  @@index([status])
  @@map("rewards")
}

// ============================================
// AI INSIGHTS
// ============================================

model AiInsight {
  id                  String    @id @default(uuid())
  campaignId          String    @map("campaign_id")
  version             Int       @default(1)
  participationCount  Int       @map("participation_count")
  summary             String?
  pros                Json?     // string[]
  cons                Json?     // string[]
  onboardingIssues    Json?     @map("onboarding_issues") // string[]
  keywords            Json?     // { keyword: string, count: number }[]
  sentiment           Json?     // { positive: number, neutral: number, negative: number }
  themes              Json?     // { theme: string, mentions: number }[]
  rawData             Json?     @map("raw_data")
  generatedAt         DateTime  @default(now()) @map("generated_at")
  createdAt           DateTime  @default(now()) @map("created_at")

  campaign            Campaign  @relation(fields: [campaignId], references: [id])

  @@index([campaignId])
  @@map("ai_insights")
}

// ============================================
// JOBS QUEUE
// ============================================

model Job {
  id                  String      @id @default(uuid())
  type                JobType
  payload             Json
  status              JobStatus   @default(PENDING)
  priority            JobPriority @default(MEDIUM)
  attempts            Int         @default(0)
  maxAttempts         Int         @default(3) @map("max_attempts")
  scheduledAt         DateTime    @default(now()) @map("scheduled_at")
  startedAt           DateTime?   @map("started_at")
  completedAt         DateTime?   @map("completed_at")
  failedAt            DateTime?   @map("failed_at")
  errorMessage        String?     @map("error_message")
  result              Json?
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")

  @@index([status, scheduledAt])
  @@index([type, status])
  @@map("jobs")
}

// ============================================
// AUDIT & LOGGING
// ============================================

model AuditLog {
  id                  String    @id @default(uuid())
  operatorId          String?   @map("operator_id")
  action              String    // APPROVE, REJECT, TOPUP_CONFIRM, BAN_USER, etc.
  targetType          String    @map("target_type") // participation, user, campaign, etc.
  targetId            String    @map("target_id")
  details             Json?
  ipAddress           String?   @map("ip_address")
  userAgent           String?   @map("user_agent")
  createdAt           DateTime  @default(now()) @map("created_at")

  operator            Operator? @relation(fields: [operatorId], references: [id])

  @@index([operatorId])
  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("audit_logs")
}

model EmailLog {
  id                  String    @id @default(uuid())
  recipientEmail      String    @map("recipient_email")
  recipientType       String    @map("recipient_type") // user, advertiser
  recipientId         String    @map("recipient_id")
  templateType        String    @map("template_type") // APPROVED, REJECTED, PAID, etc.
  subject             String
  status              String    // SENT, FAILED
  resendMessageId     String?   @map("resend_message_id")
  errorMessage        String?   @map("error_message")
  sentAt              DateTime? @map("sent_at")
  createdAt           DateTime  @default(now()) @map("created_at")

  @@index([recipientId])
  @@index([templateType])
  @@map("email_logs")
}
```

---

## 3. SQL Migration (Alternative)

For those preferring raw SQL over Prisma:

```sql
-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE auth_provider AS ENUM ('KAKAO', 'NAVER', 'GOOGLE');
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'CLOSED', 'SETTLING', 'COMPLETED');
CREATE TYPE participation_status AS ENUM ('SUBMITTED', 'AUTO_REJECTED', 'PENDING_REVIEW', 'MANUAL_REVIEW', 'APPROVED', 'REJECTED', 'PAID');
CREATE TYPE fraud_decision AS ENUM ('PASS', 'REVIEW', 'REJECT');
CREATE TYPE credit_tx_type AS ENUM ('TOPUP', 'CONSUME', 'REFUND', 'ADJUST');
CREATE TYPE topup_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE topup_method AS ENUM ('BANK_TRANSFER', 'STRIPE');
CREATE TYPE reward_status AS ENUM ('REQUESTED', 'SENT', 'FAILED');
CREATE TYPE job_type AS ENUM ('FRAUD_CHECK', 'PHASH_CALC', 'TEXT_SIMILARITY', 'AI_REPORT', 'SEND_EMAIL');
CREATE TYPE job_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD');
CREATE TYPE job_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider auth_provider NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  profile_name VARCHAR(100),
  device_fingerprint VARCHAR(255),
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE advertisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50),
  contact_name VARCHAR(100),
  contact_phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  totp_secret VARCHAR(255),
  totp_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGNS
-- ============================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES advertisers(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  app_link_ios VARCHAR(500),
  app_link_android VARCHAR(500),
  target_count INT NOT NULL,
  current_count INT DEFAULT 0,
  reward_amount INT NOT NULL,
  credit_cost_per_valid INT NOT NULL,
  status campaign_status DEFAULT 'DRAFT',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_end_at ON campaigns(end_at);

CREATE TABLE campaign_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  question_order INT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, question_order)
);

-- ============================================
-- PARTICIPATIONS
-- ============================================

CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  user_id UUID NOT NULL REFERENCES users(id),
  answer1 TEXT NOT NULL,
  answer2 TEXT NOT NULL,
  feedback TEXT NOT NULL,
  status participation_status DEFAULT 'SUBMITTED',
  fraud_score INT,
  fraud_decision fraud_decision,
  fraud_reasons TEXT[],
  reviewer_id UUID REFERENCES operators(id),
  reviewed_at TIMESTAMPTZ,
  reject_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

CREATE INDEX idx_participations_campaign ON participations(campaign_id);
CREATE INDEX idx_participations_user ON participations(user_id);
CREATE INDEX idx_participations_status ON participations(status);

CREATE TABLE participation_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  slot INT NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255),
  mime_type VARCHAR(100),
  file_size INT,
  phash VARCHAR(64),
  sha256 VARCHAR(64),
  ocr_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participation_id, slot)
);

CREATE INDEX idx_assets_phash ON participation_assets(phash);
CREATE INDEX idx_assets_sha256 ON participation_assets(sha256);

CREATE TABLE fraud_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  signal_type VARCHAR(50) NOT NULL,
  signal_value TEXT NOT NULL,
  score INT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_signals_participation ON fraud_signals(participation_id);

-- ============================================
-- CREDITS
-- ============================================

CREATE TABLE credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID UNIQUE NOT NULL REFERENCES advertisers(id),
  balance INT DEFAULT 0,
  total_topup INT DEFAULT 0,
  total_consumed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES credit_wallets(id),
  type credit_tx_type NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  ref_type VARCHAR(50),
  ref_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_wallet ON credit_transactions(wallet_id);
CREATE INDEX idx_credit_tx_ref ON credit_transactions(ref_type, ref_id);

CREATE TABLE topup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES advertisers(id),
  amount INT NOT NULL,
  method topup_method NOT NULL,
  deposit_code VARCHAR(50) UNIQUE NOT NULL,
  status topup_status DEFAULT 'PENDING',
  stripe_payment_id VARCHAR(255),
  confirmed_by_id UUID REFERENCES operators(id),
  confirmed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topup_advertiser ON topup_requests(advertiser_id);
CREATE INDEX idx_topup_deposit_code ON topup_requests(deposit_code);
CREATE INDEX idx_topup_status ON topup_requests(status);

-- ============================================
-- REWARDS
-- ============================================

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participation_id UUID UNIQUE NOT NULL REFERENCES participations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INT NOT NULL,
  status reward_status DEFAULT 'REQUESTED',
  method VARCHAR(50),
  sent_at TIMESTAMPTZ,
  proof_text TEXT,
  proof_image_key VARCHAR(500),
  processed_by_id UUID REFERENCES operators(id),
  fail_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rewards_user ON rewards(user_id);
CREATE INDEX idx_rewards_status ON rewards(status);

-- ============================================
-- AI INSIGHTS
-- ============================================

CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  version INT DEFAULT 1,
  participation_count INT NOT NULL,
  summary TEXT,
  pros JSONB,
  cons JSONB,
  onboarding_issues JSONB,
  keywords JSONB,
  sentiment JSONB,
  themes JSONB,
  raw_data JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_campaign ON ai_insights(campaign_id);

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type job_type NOT NULL,
  payload JSONB NOT NULL,
  status job_status DEFAULT 'PENDING',
  priority job_priority DEFAULT 'MEDIUM',
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status_scheduled ON jobs(status, scheduled_at);
CREATE INDEX idx_jobs_type_status ON jobs(type, status);

-- ============================================
-- AUDIT & LOGS
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_operator ON audit_logs(operator_id);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_type VARCHAR(50) NOT NULL,
  recipient_id UUID NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL,
  resend_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_recipient ON email_logs(recipient_id);
CREATE INDEX idx_email_template ON email_logs(template_type);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER advertisers_updated_at BEFORE UPDATE ON advertisers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER participations_updated_at BEFORE UPDATE ON participations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER credit_wallets_updated_at BEFORE UPDATE ON credit_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER topup_requests_updated_at BEFORE UPDATE ON topup_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 4. Seed Data

### 4.1 Operator Seed (Environment Variable Based)

```typescript
// scripts/seed-operator.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD required');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.operator.upsert({
    where: { email },
    update: { passwordHash, name },
    create: {
      email,
      passwordHash,
      name,
      totpEnabled: false,
    },
  });

  console.log(`Operator seeded: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 4.2 Sample Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://..."
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Platform Admin"
```

---

## 5. Index Strategy Summary

| Table | Index | Purpose |
|-------|-------|---------|
| users | (provider, provider_user_id) UNIQUE | Auth lookup |
| campaigns | advertiser_id | Advertiser dashboard |
| campaigns | status | Status filtering |
| campaigns | end_at | Expiration check |
| participations | (campaign_id, user_id) UNIQUE | Duplicate prevention |
| participations | status | Review queue |
| participation_assets | phash | Duplicate detection |
| participation_assets | sha256 | Exact match detection |
| jobs | (status, scheduled_at) | Job polling |
| audit_logs | created_at | Audit timeline |

---

## 6. Data Retention Policy (Future)

| Table | Retention | Notes |
|-------|-----------|-------|
| participations | 2 years | Legal requirement |
| participation_assets | 1 year | Storage cost |
| audit_logs | 3 years | Compliance |
| email_logs | 90 days | Debug only |
| jobs | 30 days | Completed jobs |

---

*End of Database Schema Document*
