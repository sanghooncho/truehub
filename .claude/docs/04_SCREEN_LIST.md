# Screen List — Reward App Experience/Feedback Platform

> Version: MVP 1.0  
> Date: 2026-01-20  
> Framework: Next.js (App Router)

---

## 1. Screen Overview

### 1.1 Total Screen Count

| Section | Count |
|---------|-------|
| Marketing (Public) | 4 |
| Tester | 8 |
| Advertiser | 12 |
| Admin (Operator) | 14 |
| **Total** | **38** |

### 1.2 Route Structure

```
/                           # Marketing landing
├── (marketing)/
│   ├── about/
│   ├── pricing/
│   └── contact/
│
├── tester/
│   ├── login/
│   ├── campaigns/
│   ├── campaigns/[id]/
│   ├── campaigns/[id]/submit/
│   ├── my/
│   ├── my/[id]/
│   ├── rewards/
│   └── settings/
│
├── advertiser/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── campaigns/
│   ├── campaigns/new/
│   ├── campaigns/[id]/
│   ├── campaigns/[id]/edit/
│   ├── campaigns/[id]/insights/
│   ├── campaigns/[id]/participations/
│   ├── credits/
│   ├── credits/topup/
│   └── settings/
│
└── admin/
    ├── login/
    ├── dashboard/
    ├── participations/
    ├── participations/[id]/
    ├── rewards/
    ├── topups/
    ├── campaigns/
    ├── campaigns/[id]/
    ├── users/
    ├── users/[id]/
    ├── advertisers/
    ├── jobs/
    ├── audit-logs/
    └── settings/
```

---

## 2. Marketing Screens (Public)

### 2.1 Landing Page
**Route:** `/`

**Components:**
- Navbar (logo, links, login buttons)
- Hero section with value proposition
- How it works (3 steps)
- For Testers section
- For Advertisers section
- CTA buttons
- Footer

---

### 2.2 About Page
**Route:** `/about`

---

### 2.3 Pricing Page
**Route:** `/pricing`

**Content:**
- Credit packages (50K / 100K / 300K)
- Cost per valid participation
- What's included

---

### 2.4 Contact Page
**Route:** `/contact`

---

## 3. Tester Screens

### 3.1 Tester Login
**Route:** `/tester/login`

**Components:**
- Logo
- "카카오로 시작하기" button
- "네이버로 시작하기" button
- "Google로 시작하기" button
- Terms acceptance checkbox

---

### 3.2 Campaign List
**Route:** `/tester/campaigns`

**Components:**
- Search/filter bar
- Sort dropdown (latest, reward, deadline)
- Campaign cards grid
- Pagination
- Empty state

---

### 3.3 Campaign Detail
**Route:** `/tester/campaigns/[id]`

**Components:**
- Campaign header
- Description section
- App download links
- Mission requirements
- Reward info
- Deadline countdown
- "참여하기" CTA button

---

### 3.4 Submit Participation
**Route:** `/tester/campaigns/[id]/submit`

**Components:**
- Progress indicator (1/3 → 2/3 → 3/3)
- Step 1: Answer questions
- Step 2: Upload screenshots (2 images)
- Step 3: Free feedback (min 30 chars)
- Submit button

---

### 3.5 My Participations List
**Route:** `/tester/my`

**Components:**
- Tab filters (All, Pending, Approved, Rejected, Paid)
- Participation cards
- Empty state

---

### 3.6 Participation Detail
**Route:** `/tester/my/[id]`

**Components:**
- Status badge
- Campaign info
- Submitted content (readonly)
- Timeline
- Reject reason (if rejected)

---

### 3.7 My Rewards
**Route:** `/tester/rewards`

**Components:**
- Summary cards (Total earned, Pending)
- Reward list
- Empty state

---

### 3.8 Tester Settings
**Route:** `/tester/settings`

**Components:**
- Profile info
- Logout button
- Account deletion request

---

## 4. Advertiser Screens

### 4.1 Advertiser Login
**Route:** `/advertiser/login`

**Components:**
- Email input
- Password input
- "로그인" button
- "회원가입" link

---

### 4.2 Advertiser Register
**Route:** `/advertiser/register`

**Components:**
- Email input
- Password input
- Company name input
- Business type select
- Contact info (optional)
- Terms acceptance
- "가입하기" button

---

### 4.3 Advertiser Dashboard
**Route:** `/advertiser/dashboard`

**Components:**
- Credit balance card
- Quick stats (Active campaigns, Participations, Pending)
- Recent campaigns list
- Recent activity feed

---

### 4.4 Campaign List (Advertiser)
**Route:** `/advertiser/campaigns`

**Components:**
- "새 캠페인" button
- Tab filters (Draft, Running, Paused, Completed)
- Campaign table/cards
- Empty state

---

### 4.5 Create Campaign
**Route:** `/advertiser/campaigns/new`

**Components:**
- Basic Info section (Title, Description)
- App Links section
- Target & Reward section
- Questions section (2 questions)
- Schedule section (End date)
- Cost preview calculator
- "저장" / "게시하기" buttons

---

### 4.6 Campaign Detail (Advertiser)
**Route:** `/advertiser/campaigns/[id]`

**Components:**
- Header with status badge
- Action buttons (Edit, Pause/Resume, Close)
- Stats cards (Submissions, Approved, Rejected, Pending)
- Campaign info display
- Quick links (Participations, AI Insights)

---

### 4.7 Edit Campaign
**Route:** `/advertiser/campaigns/[id]/edit`

**Components:**
- Same as Create Campaign form
- Pre-filled with existing data
- Only for DRAFT campaigns

---

### 4.8 Campaign Participations (Advertiser View)
**Route:** `/advertiser/campaigns/[id]/participations`

**Components:**
- Filter by status
- Participation cards (anonymized, no PII)
- Modal for full view

---

### 4.9 AI Insights
**Route:** `/advertiser/campaigns/[id]/insights`

**Components:**
- Report header with "재생성" button
- Summary card
- Pros card (top 3)
- Cons card (top 3)
- Onboarding issues card
- Keyword cloud/list
- Sentiment chart
- Themes list

---

### 4.10 Credit Management
**Route:** `/advertiser/credits`

**Components:**
- Balance card
- Stats (Total charged, Total used)
- Transaction history table
- Pagination

---

### 4.11 Credit Top-up
**Route:** `/advertiser/credits/topup`

**Components:**
- Amount selection (50K/100K/300K)
- Payment method selection
- Bank transfer info display
- Stripe redirect option
- Pending requests list

---

### 4.12 Advertiser Settings
**Route:** `/advertiser/settings`

**Components:**
- Company info (editable)
- Contact info (editable)
- Change password
- Logout button

---

## 5. Admin (Operator) Screens

### 5.1 Admin Login
**Route:** `/admin/login`

**Components:**
- Step 1: Email + Password
- Step 2: TOTP 6-digit code
- TOTP Setup (QR code) for first login

---

### 5.2 Admin Dashboard
**Route:** `/admin/dashboard`

**Components:**
- Summary cards (Users, Advertisers, Campaigns)
- Pending actions (Reviews, Top-ups, Rewards)
- Quick action buttons
- Recent activity feed
- System health (jobs queue)

---

### 5.3 Participation Review Queue
**Route:** `/admin/participations`

**Components:**
- Filters (Status, Fraud, Campaign, Date)
- Participation list/table
- Quick preview on hover
- Pagination

---

### 5.4 Participation Review Detail
**Route:** `/admin/participations/[id]`

**Components:**
- User info section
- Campaign info section
- Submission content (answers, images, feedback)
- Fraud analysis section (score, signals)
- "승인" / "반려" buttons
- Reject reason modal

---

### 5.5 Reward Queue
**Route:** `/admin/rewards`

**Components:**
- Filters (Status, Date)
- Reward list/table
- "지급 완료" / "지급 실패" buttons
- Proof modal (method, proof text/image)

---

### 5.6 Top-up Confirmations
**Route:** `/admin/topups`

**Components:**
- Filters (Status, Method, Date)
- Top-up list/table
- "입금 확인" / "취소" buttons
- Confirmation modal

---

### 5.7 Campaign Management (Admin)
**Route:** `/admin/campaigns`

**Components:**
- Filters (Status, Advertiser, Date)
- Campaign list/table
- View detail link

---

### 5.8 Campaign Detail (Admin)
**Route:** `/admin/campaigns/[id]`

**Components:**
- All campaign info
- Stats
- Advertiser info
- Admin actions (Force close)

---

### 5.9 User Management
**Route:** `/admin/users`

**Components:**
- Search by email/ID
- Filters (Provider, Ban status, Date)
- User list/table
- "정지" / "해제" buttons

---

### 5.10 User Detail (Admin)
**Route:** `/admin/users/[id]`

**Components:**
- User info
- Participation history
- Reward history
- Fraud signals history
- Ban/Unban action

---

### 5.11 Advertiser Management
**Route:** `/admin/advertisers`

**Components:**
- Search
- Advertiser list/table
- Actions (View detail)

---

### 5.12 Jobs Queue
**Route:** `/admin/jobs`

**Components:**
- Summary cards (Pending, Processing, Failed, Dead)
- Filters (Type, Status, Date)
- Jobs list/table
- "재시도" button

---

### 5.13 Audit Logs
**Route:** `/admin/audit-logs`

**Components:**
- Filters (Operator, Action, Target, Date)
- Logs list/table
- Expandable details
- Export button (CSV)

---

### 5.14 Admin Settings
**Route:** `/admin/settings`

**Components:**
- Profile info
- Change password
- Reset TOTP
- Logout

---

## 6. Shared Components

### 6.1 Layout Components

| Component | Description |
|-----------|-------------|
| `MarketingLayout` | Navbar + Footer for public pages |
| `TesterLayout` | Sidebar/bottom nav for testers |
| `AdvertiserLayout` | Sidebar nav for advertisers |
| `AdminLayout` | Sidebar nav for admin |

### 6.2 Common UI Components

| Component | Usage |
|-----------|-------|
| `Button` | Primary, Secondary, Danger variants |
| `Input` | Text, Email, Password, Number |
| `Textarea` | With character counter |
| `Select` | Dropdown select |
| `Modal` | Confirmation, Form modals |
| `Card` | Content container |
| `Badge` | Status indicators |
| `Table` | Data tables with sorting |
| `Pagination` | Page navigation |
| `Toast` | Success/Error notifications |
| `Skeleton` | Loading states |
| `EmptyState` | No data states |
| `ImageUpload` | Drag & drop image upload |
| `DatePicker` | Date selection |

---

## 7. Screen Priority for Development

### Phase 1 (Week 1-2): Core Flow

| # | Screen | Route |
|---|--------|-------|
| 1 | Tester Login | `/tester/login` |
| 2 | Campaign List | `/tester/campaigns` |
| 3 | Campaign Detail | `/tester/campaigns/[id]` |
| 4 | Submit Participation | `/tester/campaigns/[id]/submit` |
| 5 | Advertiser Login | `/advertiser/login` |
| 6 | Advertiser Register | `/advertiser/register` |
| 7 | Create Campaign | `/advertiser/campaigns/new` |
| 8 | Admin Login | `/admin/login` |

### Phase 2 (Week 3-4): Management

| # | Screen | Route |
|---|--------|-------|
| 9 | My Participations | `/tester/my` |
| 10 | Advertiser Dashboard | `/advertiser/dashboard` |
| 11 | Campaign List (Adv) | `/advertiser/campaigns` |
| 12 | Credit Management | `/advertiser/credits` |
| 13 | Credit Top-up | `/advertiser/credits/topup` |
| 14 | Admin Dashboard | `/admin/dashboard` |
| 15 | Participation Review | `/admin/participations` |
| 16 | Top-up Confirmations | `/admin/topups` |

### Phase 3 (Week 5-6): Polish

| # | Screen | Route |
|---|--------|-------|
| 17 | My Rewards | `/tester/rewards` |
| 18 | AI Insights | `/advertiser/campaigns/[id]/insights` |
| 19 | Reward Queue | `/admin/rewards` |
| 20 | User Management | `/admin/users` |
| 21 | Jobs Queue | `/admin/jobs` |
| 22 | Audit Logs | `/admin/audit-logs` |

---

*End of Screen List Document*
